/**
 * Express-Führerschein
 * Email-verification repository.
 *
 * Persistence:
 * Prisma 6.19.x -> PostgreSQL -> Supabase.
 *
 * IMPORTANT:
 * The public VerificationRepository contract is intentionally kept stable so
 * registration-service.ts does not need to change.
 *
 * Security:
 * - only the HMAC-SHA256 code digest is persisted;
 * - plaintext verification codes are never stored;
 * - timestamps remain server-generated;
 * - resend / attempt counters are updated atomically in PostgreSQL.
 */

import "server-only";

import {
  randomUUID,
} from "node:crypto";

import {
  prisma,
} from "@/lib/server/prisma";

/* ==========================================================================
   RECORD
   ========================================================================== */

export interface VerificationRecord {
  /**
   * Internal verification identifier.
   */
  id:
    string;

  /**
   * User owning this verification.
   */
  userId:
    string;

  /**
   * Normalized e-mail address.
   */
  email:
    string;

  /**
   * HMAC-SHA256 digest of the 6-digit verification code.
   *
   * Never store the plaintext code here.
   */
  codeHash:
    string;

  /**
   * ISO expiration timestamp.
   */
  expiresAt:
    string;

  /**
   * Number of failed verification attempts.
   */
  attempts:
    number;

  /**
   * Number of code resends.
   */
  resendCount:
    number;

  /**
   * Last time a verification email was sent.
   */
  lastSentAt:
    string;

  /**
   * Set once the code has been successfully used.
   */
  usedAt:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
}

/* ==========================================================================
   CREATE INPUT
   ========================================================================== */

export interface CreateVerificationInput {
  /**
   * Optional pre-generated identifier.
   *
   * registration-service.ts can generate the ID first so the code hash
   * can be bound to the exact verification record ID.
   */
  id?:
    string;

  userId:
    string;

  email:
    string;

  codeHash:
    string;

  expiresAt:
    string;
}

/* ==========================================================================
   CODE REPLACEMENT INPUT
   ========================================================================== */

export interface ReplaceVerificationCodeInput {
  codeHash:
    string;

  expiresAt:
    string;
}

/* ==========================================================================
   REPOSITORY CONTRACT
   ========================================================================== */

export interface VerificationRepository {
  /**
   * Return the latest unused verification record for a user.
   *
   * Expiration is intentionally NOT filtered here because the registration
   * service already owns the expiry/business-rule decision.
   */
  findActiveByUserId(
    userId:
      string,
  ): Promise<VerificationRecord | null>;

  /**
   * Create a new verification record.
   */
  create(
    input:
      CreateVerificationInput,
  ): Promise<VerificationRecord>;

  /**
   * Increment the failed-attempt counter.
   */
  incrementAttempts(
    id:
      string,
  ): Promise<VerificationRecord | null>;

  /**
   * Replace the verification code after a resend.
   *
   * This:
   * - resets attempts;
   * - increments resendCount;
   * - updates lastSentAt;
   * - updates expiresAt.
   */
  replaceCode(
    id:
      string,

    input:
      ReplaceVerificationCodeInput,
  ): Promise<VerificationRecord | null>;

  /**
   * Mark a verification record as successfully used.
   */
  markUsed(
    id:
      string,
  ): Promise<VerificationRecord | null>;

  /**
   * Delete all verification records for one user.
   */
  deleteByUserId(
    userId:
      string,
  ): Promise<void>;
}

/* ==========================================================================
   PRISMA SHAPE
   ========================================================================== */

interface PrismaVerificationShape {
  id:
    string;

  user_id:
    string;

  email:
    string;

  code_hash:
    string;

  expires_at:
    Date;

  attempts:
    number;

  resend_count:
    number;

  last_sent_at:
    Date;

  used_at:
    Date | null;

  created_at:
    Date;

  updated_at:
    Date;
}

/* ==========================================================================
   NORMALIZATION HELPERS
   ========================================================================== */

function normalizeId(
  value:
    string,
): string {
  return value.trim();
}

function normalizeEmail(
  email:
    string,
): string {
  return email
    .trim()
    .toLowerCase();
}

function normalizeCodeHash(
  codeHash:
    string,
): string {
  return codeHash
    .trim()
    .toLowerCase();
}

function parseIsoDate(
  value:
    string,
): Date | null {
  const date =
    new Date(
      value,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date;
}

/* ==========================================================================
   DATABASE MAPPING
   ========================================================================== */

function mapVerification(
  record:
    PrismaVerificationShape,
): VerificationRecord {
  return {
    id:
      record.id,

    userId:
      record.user_id,

    email:
      record.email,

    codeHash:
      record.code_hash,

    expiresAt:
      record
        .expires_at
        .toISOString(),

    attempts:
      record.attempts,

    resendCount:
      record.resend_count,

    lastSentAt:
      record
        .last_sent_at
        .toISOString(),

    usedAt:
      record
        .used_at
        ?.toISOString() ??
      null,

    createdAt:
      record
        .created_at
        .toISOString(),

    updatedAt:
      record
        .updated_at
        .toISOString(),
  };
}

/* ==========================================================================
   REPOSITORY
   ========================================================================== */

export const verificationRepository:
  VerificationRepository = {
  /* ------------------------------------------------------------------------
     FIND ACTIVE BY USER
     ------------------------------------------------------------------------ */

  async findActiveByUserId(
    userId,
  ) {
    const normalizedUserId =
      normalizeId(
        userId,
      );

    if (
      !normalizedUserId
    ) {
      return null;
    }

    /**
     * Preserve the original repository behaviour exactly:
     * latest record where used_at IS NULL.
     *
     * Expiry validation remains in registration-service.ts.
     */
    const record =
      await prisma
        .email_verifications
        .findFirst({
          where: {
            user_id:
              normalizedUserId,

            used_at:
              null,
          },

          orderBy: {
            created_at:
              "desc",
          },
        });

    return record
      ? mapVerification(
          record,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     CREATE
     ------------------------------------------------------------------------ */

  async create(
    input,
  ) {
    const id =
      input
        .id
        ?.trim() ||
      randomUUID();

    const userId =
      normalizeId(
        input.userId,
      );

    const email =
      normalizeEmail(
        input.email,
      );

    const codeHash =
      normalizeCodeHash(
        input.codeHash,
      );

    const expiresAt =
      parseIsoDate(
        input.expiresAt,
      );

    if (
      !id ||
      !userId ||
      !email ||
      !codeHash ||
      !expiresAt
    ) {
      throw new Error(
        "[Express-Führerschein] Ungültige Daten für verificationRepository.create().",
      );
    }

    const now =
      new Date();

    const record =
      await prisma
        .email_verifications
        .create({
          data: {
            id,

            user_id:
              userId,

            email,

            code_hash:
              codeHash,

            expires_at:
              expiresAt,

            attempts:
              0,

            resend_count:
              0,

            last_sent_at:
              now,

            used_at:
              null,

            created_at:
              now,

            updated_at:
              now,
          },
        });

    return mapVerification(
      record,
    );
  },

  /* ------------------------------------------------------------------------
     INCREMENT ATTEMPTS
     ------------------------------------------------------------------------ */

  async incrementAttempts(
    id,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    if (
      !normalizedId
    ) {
      return null;
    }

    const current =
      await prisma
        .email_verifications
        .findUnique({
          where: {
            id:
              normalizedId,
          },

          select: {
            id:
              true,
          },
        });

    if (
      !current
    ) {
      return null;
    }

    /**
     * PostgreSQL performs the counter increment atomically.
     */
    const updated =
      await prisma
        .email_verifications
        .update({
          where: {
            id:
              normalizedId,
          },

          data: {
            attempts: {
              increment:
                1,
            },

            updated_at:
              new Date(),
          },
        });

    return mapVerification(
      updated,
    );
  },

  /* ------------------------------------------------------------------------
     REPLACE CODE
     ------------------------------------------------------------------------ */

  async replaceCode(
    id,
    input,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    const codeHash =
      normalizeCodeHash(
        input.codeHash,
      );

    const expiresAt =
      parseIsoDate(
        input.expiresAt,
      );

    if (
      !normalizedId ||
      !codeHash ||
      !expiresAt
    ) {
      return null;
    }

    const now =
      new Date();

    /**
     * The used_at predicate keeps the "already consumed" rule enforced in
     * the same database operation and avoids replacing a code after a
     * concurrent successful verification.
     */
    const result =
      await prisma
        .email_verifications
        .updateMany({
          where: {
            id:
              normalizedId,

            used_at:
              null,
          },

          data: {
            code_hash:
              codeHash,

            expires_at:
              expiresAt,

            attempts:
              0,

            resend_count: {
              increment:
                1,
            },

            last_sent_at:
              now,

            updated_at:
              now,
          },
        });

    if (
      result.count ===
      0
    ) {
      return null;
    }

    const updated =
      await prisma
        .email_verifications
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    return updated
      ? mapVerification(
          updated,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     MARK USED
     ------------------------------------------------------------------------ */

  async markUsed(
    id,
  ) {
    const normalizedId =
      normalizeId(
        id,
      );

    if (
      !normalizedId
    ) {
      return null;
    }

    const current =
      await prisma
        .email_verifications
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    if (
      !current
    ) {
      return null;
    }

    /**
     * Preserve idempotency from the previous in-memory repository.
     */
    if (
      current.used_at
    ) {
      return mapVerification(
        current,
      );
    }

    const now =
      new Date();

    /**
     * Conditional update protects against a concurrent consumer.
     */
    await prisma
      .email_verifications
      .updateMany({
        where: {
          id:
            normalizedId,

          used_at:
            null,
        },

        data: {
          used_at:
            now,

          updated_at:
            now,
        },
      });

    const updated =
      await prisma
        .email_verifications
        .findUnique({
          where: {
            id:
              normalizedId,
          },
        });

    return updated
      ? mapVerification(
          updated,
        )
      : null;
  },

  /* ------------------------------------------------------------------------
     DELETE BY USER
     ------------------------------------------------------------------------ */

  async deleteByUserId(
    userId,
  ) {
    const normalizedUserId =
      normalizeId(
        userId,
      );

    if (
      !normalizedUserId
    ) {
      return;
    }

    await prisma
      .email_verifications
      .deleteMany({
        where: {
          user_id:
            normalizedUserId,
        },
      });
  },
};
