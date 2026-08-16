/**
 * Express-Führerschein
 * Secure profile e-mail change workflow.
 *
 * Prisma compatibility:
 * - no Prisma.sql;
 * - no generic raw-query type arguments;
 * - no implicitly-any interactive transaction callback;
 * - raw SQL values remain parameterized ($1, $2, ...).
 */

import "server-only";

import {
  createHmac,
  randomInt,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

import {
  PROFILE_EMAIL_CHANGE,
} from "@/data/profile";

import {
  verifyPassword,
} from "@/lib/server/password";

import {
  prisma,
} from "@/lib/server/prisma";

import {
  emailBelongsToAnotherUser,
  findProfileByUserId,
} from "@/lib/server/profile/profile-repository";

import {
  validateStartProfileEmailChangeInput,
  validateVerifyProfileEmailChangeInput,
} from "@/lib/validation/profile";

import {
  ProfileServiceError,
} from "@/types/profile";

/* ==========================================================================
   DELIVERY
   ========================================================================== */

export interface ProfileEmailChangeDeliveryInput {
  to:
    string;

  firstName:
    string;

  code:
    string;

  expiresInMinutes:
    number;
}

export interface ProfileEmailChangeDelivery {
  sendCode(
    input:
      ProfileEmailChangeDeliveryInput,
  ):
    Promise<void>;
}

/* ==========================================================================
   RAW TYPES
   ========================================================================== */

interface TableReadyRow {
  exists:
    boolean;
}

interface EmailChangeRequestRow {
  id:
    string;

  new_email:
    string;

  code_hash:
    string;

  expires_at:
    Date;

  attempts:
    number;

  completed_at:
    Date | null;

  invalidated_at:
    Date | null;
}

/* ==========================================================================
   READINESS
   ========================================================================== */

async function emailChangeTableReady():
  Promise<boolean> {
  const rows =
    (
      await prisma
        .$queryRawUnsafe(
          `
            SELECT
              to_regclass('public.email_change_requests') IS NOT NULL
                AS "exists"
          `,
        )
    ) as
      TableReadyRow[];

  return rows[0]
    ?.exists ===
    true;
}

async function assertReady():
  Promise<void> {
  if (
    !await emailChangeTableReady()
  ) {
    throw new ProfileServiceError(
      "EMAIL_CHANGE_NOT_READY",

      "Die sichere E-Mail-Änderung ist noch nicht in der Datenbank aktiviert.",
    );
  }
}

/* ==========================================================================
   CODE
   ========================================================================== */

function emailChangeSecret():
  string {
  const value =
    (
      process.env
        .PROFILE_EMAIL_CHANGE_SECRET ??
      process.env
        .REGISTRATION_SESSION_SECRET
    )
      ?.trim();

  if (
    !value
  ) {
    throw new ProfileServiceError(
      "EMAIL_CHANGE_NOT_READY",

      "Die sichere E-Mail-Änderung ist noch nicht vollständig konfiguriert.",
    );
  }

  return value;
}

function generateCode():
  string {
  return randomInt(
    0,
    1_000_000,
  )
    .toString()
    .padStart(
      6,
      "0",
    );
}

function hashCode(
  requestId:
    string,

  code:
    string,
): string {
  return createHmac(
    "sha256",
    emailChangeSecret(),
  )
    .update(
      `${requestId}:${code}`,
      "utf8",
    )
    .digest(
      "hex",
    );
}

function codeMatches(
  requestId:
    string,

  code:
    string,

  expectedHash:
    string,
): boolean {
  const actual =
    Buffer.from(
      hashCode(
        requestId,
        code,
      ),
      "hex",
    );

  const expected =
    Buffer.from(
      expectedHash,
      "hex",
    );

  return (
    actual.length ===
      expected.length &&
    timingSafeEqual(
      actual,
      expected,
    )
  );
}

/* ==========================================================================
   START
   ========================================================================== */

export async function startProfileEmailChange(
  userId:
    string,

  rawInput:
    unknown,

  delivery:
    ProfileEmailChangeDelivery,
): Promise<{
  requestId:
    string;

  expiresInMinutes:
    number;
}> {
  await assertReady();

  const validation =
    validateStartProfileEmailChangeInput(
      rawInput,
    );

  if (
    !validation.success
  ) {
    throw new ProfileServiceError(
      "VALIDATION_ERROR",

      "Die Angaben für die E-Mail-Änderung sind ungültig.",

      validation.errors,
    );
  }

  const user =
    await findProfileByUserId(
      userId,
    );

  if (
    !user
  ) {
    throw new ProfileServiceError(
      "ACCOUNT_UNAVAILABLE",

      "Das Konto konnte nicht gefunden werden.",
    );
  }

  const passwordValid =
    await verifyPassword(
      validation
        .data
        .currentPassword,

      user.passwordHash,
    );

  if (
    !passwordValid
  ) {
    throw new ProfileServiceError(
      "INVALID_CURRENT_PASSWORD",

      "Das aktuelle Passwort ist nicht korrekt.",
    );
  }

  if (
    user.email
      .toLowerCase() ===
      validation
        .data
        .newEmail
        .toLowerCase() ||
    (
      await emailBelongsToAnotherUser(
        validation
          .data
          .newEmail,

        userId,
      )
    )
  ) {
    throw new ProfileServiceError(
      "EMAIL_ALREADY_IN_USE",

      "Diese E-Mail-Adresse wird bereits verwendet.",
    );
  }

  const requestId =
    randomUUID();

  const code =
    generateCode();

  const codeHash =
    hashCode(
      requestId,
      code,
    );

  const expiresAt =
    new Date(
      Date.now() +
      PROFILE_EMAIL_CHANGE
        .codeTtlMinutes *
        60_000,
    );

  await prisma
    .$transaction([
      prisma
        .$executeRawUnsafe(
          `
            UPDATE email_change_requests
            SET
              invalidated_at = NOW(),
              updated_at = NOW()
            WHERE user_id = $1::uuid
              AND completed_at IS NULL
              AND invalidated_at IS NULL
          `,
          userId,
        ),

      prisma
        .$executeRawUnsafe(
          `
            INSERT INTO email_change_requests (
              id,
              user_id,
              new_email,
              code_hash,
              expires_at,
              attempts,
              resend_count,
              last_sent_at,
              verified_at,
              completed_at,
              invalidated_at,
              created_at,
              updated_at
            )
            VALUES (
              $1::uuid,
              $2::uuid,
              $3,
              $4,
              $5,
              0,
              0,
              NOW(),
              NULL,
              NULL,
              NULL,
              NOW(),
              NOW()
            )
          `,
          requestId,
          userId,
          validation
            .data
            .newEmail,
          codeHash,
          expiresAt,
        ),
    ]);

  try {
    await delivery
      .sendCode({
        to:
          validation
            .data
            .newEmail,

        firstName:
          user.firstName,

        code,

        expiresInMinutes:
          PROFILE_EMAIL_CHANGE
            .codeTtlMinutes,
      });
  } catch (
    error:
      unknown
  ) {
    await prisma
      .$executeRawUnsafe(
        `
          UPDATE email_change_requests
          SET
            invalidated_at = NOW(),
            updated_at = NOW()
          WHERE id = $1::uuid
        `,
        requestId,
      );

    throw error;
  }

  return {
    requestId,

    expiresInMinutes:
      PROFILE_EMAIL_CHANGE
        .codeTtlMinutes,
  };
}

/* ==========================================================================
   VERIFY + COMPLETE
   ========================================================================== */

export async function verifyAndCompleteProfileEmailChange(
  userId:
    string,

  rawInput:
    unknown,
): Promise<{
  email:
    string;
}> {
  await assertReady();

  const validation =
    validateVerifyProfileEmailChangeInput(
      rawInput,
    );

  if (
    !validation.success
  ) {
    throw new ProfileServiceError(
      "VALIDATION_ERROR",

      "Der Sicherheitscode ist ungültig.",

      validation.errors,
    );
  }

  const rows =
    (
      await prisma
        .$queryRawUnsafe(
          `
            SELECT
              id,
              new_email,
              code_hash,
              expires_at,
              attempts,
              completed_at,
              invalidated_at
            FROM email_change_requests
            WHERE id = $1::uuid
              AND user_id = $2::uuid
            LIMIT 1
          `,
          validation
            .data
            .requestId,
          userId,
        )
    ) as
      EmailChangeRequestRow[];

  const request =
    rows[0];

  if (
    !request ||
    request.completed_at ||
    request.invalidated_at
  ) {
    throw new ProfileServiceError(
      "EMAIL_CHANGE_NOT_FOUND",

      "Die E-Mail-Änderungsanfrage wurde nicht gefunden oder ist nicht mehr aktiv.",
    );
  }

  if (
    request.attempts >=
    PROFILE_EMAIL_CHANGE
      .maxAttempts
  ) {
    throw new ProfileServiceError(
      "TOO_MANY_ATTEMPTS",

      "Zu viele falsche Code-Eingaben.",
    );
  }

  if (
    request
      .expires_at
      .getTime() <=
    Date.now()
  ) {
    throw new ProfileServiceError(
      "EMAIL_CHANGE_EXPIRED",

      "Der Sicherheitscode ist abgelaufen.",
    );
  }

  if (
    !codeMatches(
      request.id,

      validation
        .data
        .code,

      request.code_hash,
    )
  ) {
    await prisma
      .$executeRawUnsafe(
        `
          UPDATE email_change_requests
          SET
            attempts = attempts + 1,
            updated_at = NOW()
          WHERE id = $1::uuid
            AND completed_at IS NULL
            AND invalidated_at IS NULL
        `,
        request.id,
      );

    throw new ProfileServiceError(
      "INVALID_CODE",

      "Der Sicherheitscode ist nicht korrekt.",
    );
  }

  if (
    await emailBelongsToAnotherUser(
      request.new_email,
      userId,
    )
  ) {
    throw new ProfileServiceError(
      "EMAIL_ALREADY_IN_USE",

      "Diese E-Mail-Adresse wird bereits verwendet.",
    );
  }

  await prisma
    .$transaction([
      prisma
        .users
        .update({
          where: {
            id:
              userId,
          },

          data: {
            email:
              request.new_email,

            updated_at:
              new Date(),
          },
        }),

      prisma
        .$executeRawUnsafe(
          `
            UPDATE email_change_requests
            SET
              verified_at = NOW(),
              completed_at = NOW(),
              updated_at = NOW()
            WHERE id = $1::uuid
              AND user_id = $2::uuid
              AND completed_at IS NULL
              AND invalidated_at IS NULL
          `,
          request.id,
          userId,
        ),
    ]);

  return {
    email:
      request.new_email,
  };
}
