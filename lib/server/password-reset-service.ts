/**
 * Express-Führerschein
 * Password reset service.
 *
 * Responsibilities:
 * - privacy-safe reset start;
 * - secure 6-digit code generation;
 * - HMAC-SHA256 code hashing;
 * - code expiration;
 * - attempt limits;
 * - resend cooldown / limits;
 * - code verification;
 * - new password hashing;
 * - optional session revocation hook.
 *
 * E-mail delivery is injected through PasswordResetCodeDelivery so this
 * service stays independent from the concrete Resend adapter.
 */

import {
  createHmac,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

import {
  PASSWORD_RESET_SETTINGS,
} from "@/data/password-reset";

import {
  hashPassword,
  verifyPassword,
} from "@/lib/server/password";

import {
  passwordResetRepository,
} from "@/lib/server/repositories/password-reset-repository";

import {
  userRepository,
} from "@/lib/server/repositories/user-repository";

import {
  validatePasswordResetCompleteInput,
  validatePasswordResetStartInput,
  validatePasswordResetVerifyInput,
} from "@/lib/validation/password-reset";

import type {
  PasswordResetApiErrorCode,
  PasswordResetCodeDelivery,
  PasswordResetCompleteDependencies,
  PasswordResetCompleteServiceResult,
  PasswordResetFieldErrors,
  PasswordResetRequestRecord,
  PasswordResetResendServiceResult,
  PasswordResetStartServiceResult,
  PasswordResetVerifyServiceResult,
} from "@/types/password-reset";

/* ==========================================================================
   SERVICE ERROR
   ========================================================================== */

export class PasswordResetServiceError extends Error {
  readonly code:
    PasswordResetApiErrorCode;

  readonly fields?:
    PasswordResetFieldErrors;

  readonly retryAfterSeconds?:
    number;

  constructor(
    code: PasswordResetApiErrorCode,
    message: string,
    options?: {
      fields?: PasswordResetFieldErrors;
      retryAfterSeconds?: number;
    },
  ) {
    super(
      message,
    );

    this.name =
      "PasswordResetServiceError";

    this.code =
      code;

    this.fields =
      options?.fields;

    this.retryAfterSeconds =
      options?.retryAfterSeconds;
  }
}

/* ==========================================================================
   CONFIG
   ========================================================================== */

function getPasswordResetSecret(): string {
  const secret =
    process.env
      .PASSWORD_RESET_SECRET
      ?.trim();

  if (
    !secret ||
    secret.length < 32
  ) {
    throw new Error(
      "[Express-Führerschein] PASSWORD_RESET_SECRET fehlt oder ist zu kurz.",
    );
  }

  return secret;
}

function getCodeTtlMinutes(): number {
  const raw =
    process.env
      .PASSWORD_RESET_CODE_TTL_MINUTES
      ?.trim();

  const parsed =
    raw
      ? Number(raw)
      : NaN;

  if (
    !Number.isInteger(parsed) ||
    parsed < 1 ||
    parsed > 60
  ) {
    return PASSWORD_RESET_SETTINGS
      .codeTtlMinutes;
  }

  return parsed;
}

function getMaxAttempts(): number {
  const raw =
    process.env
      .PASSWORD_RESET_CODE_MAX_ATTEMPTS
      ?.trim();

  const parsed =
    raw
      ? Number(raw)
      : NaN;

  if (
    !Number.isInteger(parsed) ||
    parsed < 1 ||
    parsed > 20
  ) {
    return PASSWORD_RESET_SETTINGS
      .maxAttempts;
  }

  return parsed;
}

function getResendCooldownSeconds(): number {
  const raw =
    process.env
      .PASSWORD_RESET_RESEND_COOLDOWN_SECONDS
      ?.trim();

  const parsed =
    raw
      ? Number(raw)
      : NaN;

  if (
    !Number.isInteger(parsed) ||
    parsed < 0 ||
    parsed > 60 * 60
  ) {
    return PASSWORD_RESET_SETTINGS
      .resendCooldownSeconds;
  }

  return parsed;
}

function getMaxResends(): number {
  const raw =
    process.env
      .PASSWORD_RESET_MAX_RESENDS
      ?.trim();

  const parsed =
    raw
      ? Number(raw)
      : NaN;

  if (
    !Number.isInteger(parsed) ||
    parsed < 0 ||
    parsed > 20
  ) {
    return PASSWORD_RESET_SETTINGS
      .maxResends;
  }

  return parsed;
}

function getVerifiedCompletionTtlSeconds(): number {
  const raw =
    process.env
      .PASSWORD_RESET_SESSION_TTL_SECONDS
      ?.trim();

  const parsed =
    raw
      ? Number(raw)
      : NaN;

  if (
    !Number.isInteger(parsed) ||
    parsed < 60 ||
    parsed > 60 * 60
  ) {
    return PASSWORD_RESET_SETTINGS
      .sessionTtlSeconds;
  }

  return parsed;
}

/* ==========================================================================
   CODE HELPERS
   ========================================================================== */

function generatePasswordResetCode(): string {
  const maximum =
    10 **
    PASSWORD_RESET_SETTINGS.codeLength;

  const value =
    randomInt(
      0,
      maximum,
    );

  return String(value)
    .padStart(
      PASSWORD_RESET_SETTINGS.codeLength,
      "0",
    );
}

function hashPasswordResetCode(
  userId: string,
  code: string,
): string {
  return createHmac(
    "sha256",
    getPasswordResetSecret(),
  )
    .update(
      `password-reset-code:${userId}:${code}`,
      "utf8",
    )
    .digest(
      "hex",
    );
}

function codeHashMatches(
  actualHex: string,
  expectedHex: string,
): boolean {
  try {
    const actual =
      Buffer.from(
        actualHex,
        "hex",
      );

    const expected =
      Buffer.from(
        expectedHex,
        "hex",
      );

    return (
      actual.length ===
        expected.length &&
      actual.length > 0 &&
      timingSafeEqual(
        actual,
        expected,
      )
    );
  } catch {
    return false;
  }
}

function createCodeExpiration(): string {
  const expiresAt =
    Date.now() +
    getCodeTtlMinutes() *
      60 *
      1000;

  return new Date(
    expiresAt,
  ).toISOString();
}

/* ==========================================================================
   REQUEST HELPERS
   ========================================================================== */

function isExpired(
  request: PasswordResetRequestRecord,
): boolean {
  return (
    Date.parse(
      request.expiresAt,
    ) <= Date.now()
  );
}

function isClosed(
  request: PasswordResetRequestRecord,
): boolean {
  return (
    request.completedAt !==
      null ||
    request.invalidatedAt !==
      null
  );
}

async function getOpenRequest(
  requestId: string,
): Promise<PasswordResetRequestRecord> {
  const normalizedRequestId =
    requestId.trim();

  if (!normalizedRequestId) {
    throw new PasswordResetServiceError(
      "INVALID_OR_EXPIRED_REQUEST",
      "Die Passwort-Zurücksetzung ist ungültig oder abgelaufen.",
    );
  }

  const request =
    await passwordResetRepository
      .findById(
        normalizedRequestId,
      );

  if (
    !request ||
    isClosed(request)
  ) {
    throw new PasswordResetServiceError(
      "INVALID_OR_EXPIRED_REQUEST",
      "Die Passwort-Zurücksetzung ist ungültig oder abgelaufen.",
    );
  }

  return request;
}

async function requireEligibleUser(
  userId: string,
) {
  const user =
    await userRepository
      .findById(
        userId,
      );

  if (
    !user ||
    user.status !== "active" ||
    !user.emailVerifiedAt
  ) {
    throw new PasswordResetServiceError(
      "ACCOUNT_UNAVAILABLE",
      "Dieses Konto kann derzeit nicht zurückgesetzt werden.",
    );
  }

  return user;
}

/* ==========================================================================
   START
   ========================================================================== */

export async function startPasswordReset(
  input: unknown,
  delivery: PasswordResetCodeDelivery,
): Promise<PasswordResetStartServiceResult> {
  const validation =
    validatePasswordResetStartInput(
      input,
    );

  if (!validation.success) {
    throw new PasswordResetServiceError(
      "VALIDATION_ERROR",
      "Bitte überprüfe deine Eingabe.",
      {
        fields:
          validation.errors,
      },
    );
  }

  const user =
    await userRepository
      .findByEmail(
        validation.data.email,
      );

  /**
   * Privacy / anti-enumeration:
   * Always accept the public request even if no eligible account exists.
   */
  if (
    !user ||
    user.status !== "active" ||
    !user.emailVerifiedAt
  ) {
    return {
      accepted:
        true,

      session:
        null,
    };
  }

  await passwordResetRepository
    .invalidateActiveForUser(
      user.id,
    );

  const code =
    generatePasswordResetCode();

  const request =
    await passwordResetRepository
      .create({
        userId:
          user.id,

        codeHash:
          hashPasswordResetCode(
            user.id,
            code,
          ),

        expiresAt:
          createCodeExpiration(),
      });

  try {
    await delivery.sendCode({
      to:
        user.email,

      firstName:
        user.firstName ||
        null,

      code,

      expiresInMinutes:
        getCodeTtlMinutes(),
    });
  } catch {
    await passwordResetRepository
      .invalidate(
        request.id,
      );

    throw new PasswordResetServiceError(
      "DELIVERY_FAILED",
      "Der Sicherheitscode konnte derzeit nicht gesendet werden.",
      undefined,
    );
  }

  return {
    accepted:
      true,

    session: {
      requestId:
        request.id,
    },
  };
}

/* ==========================================================================
   VERIFY
   ========================================================================== */

export async function verifyPasswordResetCode(
  requestId: string,
  input: unknown,
): Promise<PasswordResetVerifyServiceResult> {
  const validation =
    validatePasswordResetVerifyInput(
      input,
    );

  if (!validation.success) {
    throw new PasswordResetServiceError(
      "VALIDATION_ERROR",
      "Bitte überprüfe den Sicherheitscode.",
      {
        fields:
          validation.errors,
      },
    );
  }

  const request =
    await getOpenRequest(
      requestId,
    );

  if (
    request.verifiedAt
  ) {
    return {
      verified:
        true,

      requestId:
        request.id,
    };
  }

  if (
    isExpired(request)
  ) {
    await passwordResetRepository
      .invalidate(
        request.id,
      );

    throw new PasswordResetServiceError(
      "INVALID_OR_EXPIRED_REQUEST",
      "Der Sicherheitscode ist abgelaufen. Bitte fordere einen neuen Code an.",
    );
  }

  const maxAttempts =
    getMaxAttempts();

  if (
    request.attempts >=
    maxAttempts
  ) {
    await passwordResetRepository
      .invalidate(
        request.id,
      );

    throw new PasswordResetServiceError(
      "TOO_MANY_ATTEMPTS",
      "Zu viele Fehlversuche. Bitte starte die Passwort-Zurücksetzung erneut.",
    );
  }

  const candidateHash =
    hashPasswordResetCode(
      request.userId,
      validation.data.code,
    );

  if (
    !codeHashMatches(
      candidateHash,
      request.codeHash,
    )
  ) {
    const updated =
      await passwordResetRepository
        .incrementAttempts(
          request.id,
        );

    if (
      updated &&
      updated.attempts >=
        maxAttempts
    ) {
      await passwordResetRepository
        .invalidate(
          request.id,
        );

      throw new PasswordResetServiceError(
        "TOO_MANY_ATTEMPTS",
        "Zu viele Fehlversuche. Bitte starte die Passwort-Zurücksetzung erneut.",
      );
    }

    throw new PasswordResetServiceError(
      "INVALID_CODE",
      "Der Sicherheitscode ist nicht korrekt.",
    );
  }

  await requireEligibleUser(
    request.userId,
  );

  const verified =
    await passwordResetRepository
      .markVerified(
        request.id,
      );

  if (!verified) {
    throw new PasswordResetServiceError(
      "INVALID_OR_EXPIRED_REQUEST",
      "Die Passwort-Zurücksetzung ist nicht mehr gültig.",
    );
  }

  return {
    verified:
      true,

    requestId:
      verified.id,
  };
}

/* ==========================================================================
   RESEND
   ========================================================================== */

export async function resendPasswordResetCode(
  requestId: string,
  delivery: PasswordResetCodeDelivery,
): Promise<PasswordResetResendServiceResult> {
  const request =
    await getOpenRequest(
      requestId,
    );

  if (
    request.verifiedAt
  ) {
    throw new PasswordResetServiceError(
      "REQUEST_NOT_VERIFIED",
      "Der Sicherheitscode wurde bereits bestätigt.",
    );
  }

  const maxResends =
    getMaxResends();

  if (
    request.resendCount >=
    maxResends
  ) {
    throw new PasswordResetServiceError(
      "TOO_MANY_RESENDS",
      "Der Sicherheitscode wurde zu oft erneut angefordert. Bitte starte den Vorgang neu.",
    );
  }

  const cooldown =
    getResendCooldownSeconds();

  const secondsSinceLastSend =
    Math.floor(
      (
        Date.now() -
        Date.parse(
          request.lastSentAt,
        )
      ) /
      1000,
    );

  const retryAfterSeconds =
    Math.max(
      0,
      cooldown -
        secondsSinceLastSend,
    );

  if (
    retryAfterSeconds > 0
  ) {
    throw new PasswordResetServiceError(
      "RESEND_TOO_SOON",
      "Bitte warte kurz, bevor du einen neuen Code anforderst.",
      {
        retryAfterSeconds,
      },
    );
  }

  const user =
    await requireEligibleUser(
      request.userId,
    );

  const code =
    generatePasswordResetCode();

  const updated =
    await passwordResetRepository
      .replaceCode(
        request.id,
        {
          codeHash:
            hashPasswordResetCode(
              request.userId,
              code,
            ),

          expiresAt:
            createCodeExpiration(),
        },
      );

  if (!updated) {
    throw new PasswordResetServiceError(
      "INVALID_OR_EXPIRED_REQUEST",
      "Die Passwort-Zurücksetzung ist nicht mehr gültig.",
    );
  }

  try {
    await delivery.sendCode({
      to:
        user.email,

      firstName:
        user.firstName ||
        null,

      code,

      expiresInMinutes:
        getCodeTtlMinutes(),
    });
  } catch {
    /**
     * Fail closed: the stored code changed but delivery failed.
     * Invalidate the request so an undelivered code can never become usable.
     */
    await passwordResetRepository
      .invalidate(
        updated.id,
      );

    throw new PasswordResetServiceError(
      "DELIVERY_FAILED",
      "Der Sicherheitscode konnte derzeit nicht gesendet werden.",
      undefined,
    );
  }

  return {
    sent:
      true,

    requestId:
      updated.id,

    retryAfterSeconds:
      cooldown,
  };
}

/* ==========================================================================
   COMPLETE
   ========================================================================== */

export async function completePasswordReset(
  requestId: string,
  input: unknown,
  dependencies: PasswordResetCompleteDependencies = {},
): Promise<PasswordResetCompleteServiceResult> {
  const validation =
    validatePasswordResetCompleteInput(
      input,
    );

  if (!validation.success) {
    throw new PasswordResetServiceError(
      "VALIDATION_ERROR",
      "Bitte überprüfe dein neues Passwort.",
      {
        fields:
          validation.errors,
      },
    );
  }

  const request =
    await getOpenRequest(
      requestId,
    );

  if (!request.verifiedAt) {
    throw new PasswordResetServiceError(
      "REQUEST_NOT_VERIFIED",
      "Bitte bestätige zuerst den Sicherheitscode.",
    );
  }

  const verifiedAt =
    Date.parse(
      request.verifiedAt,
    );

  const completionDeadline =
    verifiedAt +
    getVerifiedCompletionTtlSeconds() *
      1000;

  if (
    !Number.isFinite(
      verifiedAt,
    ) ||
    completionDeadline <=
      Date.now()
  ) {
    await passwordResetRepository
      .invalidate(
        request.id,
      );

    throw new PasswordResetServiceError(
      "INVALID_OR_EXPIRED_REQUEST",
      "Die Passwort-Zurücksetzung ist abgelaufen. Bitte starte den Vorgang erneut.",
    );
  }

  const user =
    await requireEligibleUser(
      request.userId,
    );

  const samePassword =
    await verifyPassword(
      validation.data.newPassword,
      user.passwordHash,
    );

  if (samePassword) {
    throw new PasswordResetServiceError(
      "SAME_PASSWORD",
      "Bitte wähle ein Passwort, das sich von deinem bisherigen Passwort unterscheidet.",
      {
        fields: {
          newPassword:
            "Das neue Passwort darf nicht mit dem bisherigen Passwort identisch sein.",
        },
      },
    );
  }

  const passwordHash =
    await hashPassword(
      validation.data.newPassword,
    );

  const updatedUser =
    await userRepository
      .updatePasswordHash(
        user.id,
        passwordHash,
      );

  if (!updatedUser) {
    throw new PasswordResetServiceError(
      "ACCOUNT_UNAVAILABLE",
      "Das Passwort konnte nicht aktualisiert werden.",
    );
  }

  const completed =
    await passwordResetRepository
      .markCompleted(
        request.id,
      );

  if (!completed) {
    /**
     * The password has already been replaced at this point.
     * Fail closed and invalidate the reset request to prevent reuse.
     */
    await passwordResetRepository
      .invalidate(
        request.id,
      );

    throw new PasswordResetServiceError(
      "INTERNAL_ERROR",
      "Das Passwort wurde aktualisiert, aber der Reset-Vorgang konnte nicht abgeschlossen werden.",
    );
  }

  /**
   * Security hook: revoke all existing login sessions after the reset
   * request has been consumed. Even if the external revocation adapter
   * fails, this reset request itself can no longer be reused.
   */
  if (
    dependencies.revokeUserSessions
  ) {
    try {
      await dependencies
        .revokeUserSessions(
          updatedUser.id,
        );
    } catch {
      throw new PasswordResetServiceError(
        "INTERNAL_ERROR",
        "Das Passwort wurde geändert, aber bestehende Sitzungen konnten nicht vollständig beendet werden.",
      );
    }
  }

  return {
    completed:
      true,

    userId:
      updatedUser.id,
  };
}
