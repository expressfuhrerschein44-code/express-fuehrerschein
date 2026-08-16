/**
 * Express-Führerschein
 * Registration application service.
 *
 * Coordinates:
 * - server validation;
 * - country/phone normalization;
 * - password hashing;
 * - pending user creation;
 * - 6-digit email verification;
 * - signed registration session;
 * - rate limiting;
 * - Resend delivery.
 */

import { randomUUID } from "node:crypto";

import {
  normalizeEmail,
  validateRegistrationInput,
} from "@/lib/validation/registration";

import { normalizePhoneNumber } from "@/lib/server/phone-country";
import { hashPassword } from "@/lib/server/password";
import { consumeRateLimit } from "@/lib/server/rate-limit";

import {
  createRegistrationSessionToken,
  verifyRegistrationSessionToken,
} from "@/lib/server/registration-session";

import {
  generateVerificationCode,
  hashVerificationCode,
  isVerificationCodeFormatValid,
  verifyCodeHash,
} from "@/lib/server/verification-code";

import {
  sendRegistrationVerificationEmail,
} from "@/lib/server/resend";

import {
  userRepository,
} from "@/lib/server/repositories/user-repository";

import {
  verificationRepository,
} from "@/lib/server/repositories/verification-repository";

export type RegistrationServiceErrorCode =
  | "VALIDATION_ERROR"
  | "EMAIL_ALREADY_EXISTS"
  | "INVALID_PHONE"
  | "RATE_LIMITED"
  | "SESSION_INVALID"
  | "VERIFICATION_NOT_FOUND"
  | "CODE_INVALID"
  | "CODE_EXPIRED"
  | "TOO_MANY_ATTEMPTS"
  | "RESEND_TOO_SOON"
  | "RESEND_LIMIT_REACHED"
  | "EMAIL_DELIVERY_FAILED"
  | "USER_NOT_FOUND";

export class RegistrationServiceError extends Error {
  constructor(
    public readonly code: RegistrationServiceErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "RegistrationServiceError";
  }
}

const DEFAULT_CODE_TTL_MINUTES = 10;
const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_RESEND_COOLDOWN_SECONDS = 60;
const DEFAULT_MAX_RESENDS = 5;

function envInt(
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = Number(process.env[name]);

  if (
    Number.isInteger(raw) &&
    raw >= min &&
    raw <= max
  ) {
    return raw;
  }

  return fallback;
}

function codeTtlMinutes(): number {
  return envInt(
    "REGISTRATION_CODE_TTL_MINUTES",
    DEFAULT_CODE_TTL_MINUTES,
    5,
    30,
  );
}

function maxAttempts(): number {
  return envInt(
    "REGISTRATION_CODE_MAX_ATTEMPTS",
    DEFAULT_MAX_ATTEMPTS,
    3,
    10,
  );
}

function resendCooldownSeconds(): number {
  return envInt(
    "REGISTRATION_RESEND_COOLDOWN_SECONDS",
    DEFAULT_RESEND_COOLDOWN_SECONDS,
    30,
    300,
  );
}

function maxResends(): number {
  return envInt(
    "REGISTRATION_MAX_RESENDS",
    DEFAULT_MAX_RESENDS,
    1,
    10,
  );
}

function expiresAtIso(): string {
  return new Date(
    Date.now() +
      codeTtlMinutes() *
        60_000,
  ).toISOString();
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");

  if (!local || !domain) {
    return email;
  }

  if (local.length <= 2) {
    return `${local[0] ?? "*"}***@${domain}`;
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

function rateLimitKey(
  scope: string,
  ip: string | null | undefined,
  identity: string,
): string {
  return [
    "registration",
    scope,
    ip || "unknown-ip",
    identity.toLowerCase(),
  ].join(":");
}

export interface StartRegistrationResult {
  userId: string;
  emailMasked: string;
  sessionToken: string;
  expiresInMinutes: number;
}

export async function startRegistration(
  rawInput: unknown,
  clientIp?: string | null,
): Promise<StartRegistrationResult> {
  const validation =
    validateRegistrationInput(rawInput);

  if (!validation.success) {
    throw new RegistrationServiceError(
      "VALIDATION_ERROR",
      "Die Registrierungsdaten sind ungültig.",
      validation.errors,
    );
  }

  const input = validation.data;
  const email = normalizeEmail(input.email);

  const limit =
    await consumeRateLimit({
      key: rateLimitKey(
        "start",
        clientIp,
        email,
      ),
    limit: 5,
    windowMs: 15 * 60_000,
  });

  if (!limit.allowed) {
    throw new RegistrationServiceError(
      "RATE_LIMITED",
      "Zu viele Registrierungsversuche. Bitte versuche es später erneut.",
      {
        retryAfterSeconds:
          limit.retryAfterSeconds,
      },
    );
  }

  const existing =
    await userRepository.findByEmail(
      email,
    );

  if (
    existing &&
    existing.status === "active"
  ) {
    throw new RegistrationServiceError(
      "EMAIL_ALREADY_EXISTS",
      "Für diese E-Mail-Adresse besteht bereits ein Konto.",
    );
  }

  /**
   * In local development, a stale pending registration can be restarted.
   * The production database adapter can replace this with an atomic upsert.
   */
  if (existing) {
    await verificationRepository
      .deleteByUserId(
        existing.id,
      );

    await userRepository
      .deleteById(
        existing.id,
      );
  }

  const phone =
    normalizePhoneNumber(
      input.phone,
      input.countryCode,
    );

  if (!phone) {
    throw new RegistrationServiceError(
      "INVALID_PHONE",
      "Die Telefonnummer ist für das ausgewählte Land ungültig.",
    );
  }

  const passwordHash =
    await hashPassword(
      input.password,
    );

  const user =
    await userRepository
      .createPending({
        firstName:
          input.firstName,
        lastName:
          input.lastName,
        email,
        phoneE164:
          phone.e164,
        countryCode:
          input.countryCode,
        passwordHash,
      });

  const verificationId =
    randomUUID();

  const code =
    generateVerificationCode();

  await verificationRepository
    .create({
      id:
        verificationId,
      userId:
        user.id,
      email:
        user.email,
      codeHash:
        hashVerificationCode(
          code,
          verificationId,
        ),
      expiresAt:
        expiresAtIso(),
    });

  try {
    await sendRegistrationVerificationEmail({
      to:
        user.email,
      firstName:
        user.firstName,
      code,
      expiresInMinutes:
        codeTtlMinutes(),
    });
  } catch (error) {
    await verificationRepository
      .deleteByUserId(
        user.id,
      );

    await userRepository
      .deleteById(
        user.id,
      );

    throw new RegistrationServiceError(
      "EMAIL_DELIVERY_FAILED",
      "Die Bestätigungs-E-Mail konnte nicht gesendet werden.",
      error instanceof Error
        ? error.message
        : undefined,
    );
  }

  return {
    userId:
      user.id,
    emailMasked:
      maskEmail(
        user.email,
      ),
    sessionToken:
      createRegistrationSessionToken(
        user.id,
        user.email,
      ),
    expiresInMinutes:
      codeTtlMinutes(),
  };
}

export interface VerifyRegistrationResult {
  userId: string;
  email: string;
  verified: true;
}

export async function verifyRegistration(
  sessionToken: string,
  code: string,
  clientIp?: string | null,
): Promise<VerifyRegistrationResult> {
  const session =
    verifyRegistrationSessionToken(
      sessionToken,
    );

  if (!session) {
    throw new RegistrationServiceError(
      "SESSION_INVALID",
      "Die Registrierungssitzung ist ungültig oder abgelaufen.",
    );
  }

  const limit =
    await consumeRateLimit({
      key:
        rateLimitKey(
          "verify",
          clientIp,
          session.userId,
        ),
      limit: 10,
      windowMs:
        10 * 60_000,
    });

  if (!limit.allowed) {
    throw new RegistrationServiceError(
      "RATE_LIMITED",
      "Zu viele Verifizierungsversuche.",
      {
        retryAfterSeconds:
          limit.retryAfterSeconds,
      },
    );
  }

  if (
    !isVerificationCodeFormatValid(
      code,
    )
  ) {
    throw new RegistrationServiceError(
      "CODE_INVALID",
      "Der Bestätigungscode ist ungültig.",
    );
  }

  const user =
    await userRepository
      .findById(
        session.userId,
      );

  if (!user) {
    throw new RegistrationServiceError(
      "USER_NOT_FOUND",
      "Das Registrierungskonto wurde nicht gefunden.",
    );
  }

  if (
    user.email !==
      session.email
        .trim()
        .toLowerCase()
  ) {
    throw new RegistrationServiceError(
      "SESSION_INVALID",
      "Die Registrierungssitzung passt nicht zum Konto.",
    );
  }

  const verification =
    await verificationRepository
      .findActiveByUserId(
        user.id,
      );

  if (!verification) {
    throw new RegistrationServiceError(
      "VERIFICATION_NOT_FOUND",
      "Keine aktive E-Mail-Verifizierung gefunden.",
    );
  }

  if (
    verification.attempts >=
      maxAttempts()
  ) {
    throw new RegistrationServiceError(
      "TOO_MANY_ATTEMPTS",
      "Zu viele falsche Code-Eingaben. Bitte fordere einen neuen Code an.",
    );
  }

  if (
    new Date(
      verification.expiresAt,
    ).getTime() <= Date.now()
  ) {
    throw new RegistrationServiceError(
      "CODE_EXPIRED",
      "Der Bestätigungscode ist abgelaufen.",
    );
  }

  const valid =
    verifyCodeHash(
      code,
      verification.id,
      verification.codeHash,
    );

  if (!valid) {
    await verificationRepository
      .incrementAttempts(
        verification.id,
      );

    throw new RegistrationServiceError(
      "CODE_INVALID",
      "Der Bestätigungscode ist nicht korrekt.",
    );
  }

  await verificationRepository
    .markUsed(
      verification.id,
    );

  const activated =
    await userRepository
      .activate(
        user.id,
      );

  if (!activated) {
    throw new RegistrationServiceError(
      "USER_NOT_FOUND",
      "Das Konto konnte nicht aktiviert werden.",
    );
  }

  return {
    userId:
      activated.id,
    email:
      activated.email,
    verified: true,
  };
}

export interface ResendVerificationResult {
  emailMasked: string;
  cooldownSeconds: number;
}

export async function resendVerificationCode(
  sessionToken: string,
  clientIp?: string | null,
): Promise<ResendVerificationResult> {
  const session =
    verifyRegistrationSessionToken(
      sessionToken,
    );

  if (!session) {
    throw new RegistrationServiceError(
      "SESSION_INVALID",
      "Die Registrierungssitzung ist ungültig oder abgelaufen.",
    );
  }

  const globalLimit =
    await consumeRateLimit({
      key:
        rateLimitKey(
          "resend",
          clientIp,
          session.userId,
        ),
      limit: 6,
      windowMs:
        60 * 60_000,
    });

  if (!globalLimit.allowed) {
    throw new RegistrationServiceError(
      "RATE_LIMITED",
      "Zu viele neue Codes angefordert.",
      {
        retryAfterSeconds:
          globalLimit.retryAfterSeconds,
      },
    );
  }

  const user =
    await userRepository
      .findById(
        session.userId,
      );

  if (!user) {
    throw new RegistrationServiceError(
      "USER_NOT_FOUND",
      "Das Registrierungskonto wurde nicht gefunden.",
    );
  }

  const verification =
    await verificationRepository
      .findActiveByUserId(
        user.id,
      );

  if (!verification) {
    throw new RegistrationServiceError(
      "VERIFICATION_NOT_FOUND",
      "Keine aktive E-Mail-Verifizierung gefunden.",
    );
  }

  if (
    verification.resendCount >=
      maxResends()
  ) {
    throw new RegistrationServiceError(
      "RESEND_LIMIT_REACHED",
      "Die maximale Anzahl neuer Codes wurde erreicht.",
    );
  }

  const secondsSinceLastSend =
    Math.floor(
      (
        Date.now() -
        new Date(
          verification.lastSentAt,
        ).getTime()
      ) / 1000,
    );

  const cooldown =
    resendCooldownSeconds();

  if (
    secondsSinceLastSend <
      cooldown
  ) {
    throw new RegistrationServiceError(
      "RESEND_TOO_SOON",
      "Bitte warte, bevor du einen neuen Code anforderst.",
      {
        retryAfterSeconds:
          cooldown -
          secondsSinceLastSend,
      },
    );
  }

  const code =
    generateVerificationCode();

  /**
   * Send first; update stored code only after Resend accepts the email.
   * This preserves the previous valid code if delivery fails.
   */
  try {
    await sendRegistrationVerificationEmail({
      to:
        user.email,
      firstName:
        user.firstName,
      code,
      expiresInMinutes:
        codeTtlMinutes(),
    });
  } catch (error) {
    throw new RegistrationServiceError(
      "EMAIL_DELIVERY_FAILED",
      "Die neue Bestätigungs-E-Mail konnte nicht gesendet werden.",
      error instanceof Error
        ? error.message
        : undefined,
    );
  }

  const updated =
    await verificationRepository
      .replaceCode(
        verification.id,
        {
          codeHash:
            hashVerificationCode(
              code,
              verification.id,
            ),
          expiresAt:
            expiresAtIso(),
        },
      );

  if (!updated) {
    throw new RegistrationServiceError(
      "VERIFICATION_NOT_FOUND",
      "Die E-Mail-Verifizierung konnte nicht aktualisiert werden.",
    );
  }

  return {
    emailMasked:
      maskEmail(
        user.email,
      ),
    cooldownSeconds:
      cooldown,
  };
}
