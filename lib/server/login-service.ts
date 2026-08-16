/**
 * Express-Führerschein
 * Credential-login service.
 *
 * Responsibilities:
 * - validate incoming login data;
 * - normalize e-mail / telephone identifiers;
 * - apply rate limiting;
 * - find the user;
 * - verify the password;
 * - verify account state;
 * - return a safe authenticated-user representation.
 *
 * Session creation is intentionally handled separately by:
 *
 * lib/server/auth-session.ts
 */

import {
  validateLoginInput,
} from "@/lib/validation/login";

import {
  LoginIdentifierError,
  normalizeLoginIdentifier,
} from "@/lib/server/login-identifier";

import {
  verifyPassword,
} from "@/lib/server/password";

import {
  consumeRateLimit,
} from "@/lib/server/rate-limit";

import {
  userRepository,
} from "@/lib/server/repositories/user-repository";

import type {
  UserRecord,
} from "@/lib/server/repositories/user-repository";

/* ==========================================================================
   TYPES
   ========================================================================== */

export type LoginServiceErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_IDENTIFIER"
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_VERIFIED"
  | "ACCOUNT_DISABLED"
  | "RATE_LIMITED";

/**
 * Safe authenticated-user representation.
 *
 * passwordHash and other internal fields are never returned.
 */
export interface AuthenticatedUser {
  id:
    string;

  firstName:
    string;

  lastName:
    string;

  email:
    string;

  phoneE164:
    string;

  countryCode:
    UserRecord["countryCode"];
}

/* ==========================================================================
   SERVICE ERROR
   ========================================================================== */

export class LoginServiceError
  extends Error {
  constructor(
    public readonly code:
      LoginServiceErrorCode,

    message:
      string,

    public readonly details?:
      unknown,
  ) {
    super(
      message,
    );

    this.name =
      "LoginServiceError";
  }
}

/* ==========================================================================
   RATE LIMIT
   ========================================================================== */

/**
 * Creates a rate-limit bucket from:
 *
 * - login scope;
 * - client IP;
 * - normalized identifier.
 *
 * This protects one identifier without globally
 * blocking every user behind the same IP.
 */
function createLoginRateLimitKey(
  clientIp:
    | string
    | null
    | undefined,

  identifier:
    string,
): string {
  const normalizedIp =
    clientIp?.trim() ||
    "unknown-ip";

  const normalizedIdentifier =
    identifier
      .trim()
      .toLowerCase();

  return [
    "auth",
    "login",
    normalizedIp,
    normalizedIdentifier,
  ].join(
    ":",
  );
}

/* ==========================================================================
   USER LOOKUP
   ========================================================================== */

async function findUserByIdentifier(
  identifier:
    ReturnType<
      typeof normalizeLoginIdentifier
    >,
): Promise<UserRecord | null> {
  /* ------------------------------------------------------------------------
     E-MAIL
     ------------------------------------------------------------------------ */

  if (
    identifier.kind ===
    "email"
  ) {
    return userRepository
      .findByEmail(
        identifier.value,
      );
  }

  /* ------------------------------------------------------------------------
     TELEPHONE
     ------------------------------------------------------------------------ */

  /**
   * findByPhoneE164() is now an official,
   * mandatory part of UserRepository.
   *
   * No temporary interface/cast is required anymore.
   */
  return userRepository
    .findByPhoneE164(
      identifier.value,
    );
}

/* ==========================================================================
   ACCOUNT STATE
   ========================================================================== */

function assertUserCanLogin(
  user:
    UserRecord,
): void {
  /* ------------------------------------------------------------------------
     Disabled account
     ------------------------------------------------------------------------ */

  if (
    user.status ===
    "disabled"
  ) {
    throw new LoginServiceError(
      "ACCOUNT_DISABLED",

      "Dieses Konto ist derzeit deaktiviert.",
    );
  }

  /* ------------------------------------------------------------------------
     Pending / unverified account
     ------------------------------------------------------------------------ */

  if (
    user.status !==
      "active" ||
    !user.emailVerifiedAt
  ) {
    throw new LoginServiceError(
      "EMAIL_NOT_VERIFIED",

      "Bitte bestätige zuerst deine E-Mail-Adresse.",
    );
  }
}

/* ==========================================================================
   AUTHENTICATE CREDENTIALS
   ========================================================================== */

export async function authenticateCredentials(
  rawInput:
    unknown,

  clientIp?:
    | string
    | null,
): Promise<AuthenticatedUser> {
  /* ------------------------------------------------------------------------
     1. Validate request payload
     ------------------------------------------------------------------------ */

  const validation =
    validateLoginInput(
      rawInput,
    );

  if (
    !validation.success
  ) {
    throw new LoginServiceError(
      "VALIDATION_ERROR",

      "Die Anmeldedaten sind ungültig.",

      validation.errors,
    );
  }

  /* ------------------------------------------------------------------------
     2. Normalize identifier
     ------------------------------------------------------------------------ */

  let identifier:
    ReturnType<
      typeof normalizeLoginIdentifier
    >;

  try {
    identifier =
      normalizeLoginIdentifier(
        validation.data
          .identifier,

        validation.data
          .countryCode,
      );
  } catch (
    error:
      unknown
  ) {
    if (
      error instanceof
        LoginIdentifierError
    ) {
      throw new LoginServiceError(
        "INVALID_IDENTIFIER",

        error.message,
      );
    }

    throw error;
  }

  /* ------------------------------------------------------------------------
     3. Rate limit
     ------------------------------------------------------------------------ */

  /**
   * consumeRateLimit() is PostgreSQL-backed and therefore asynchronous.
   * Awaiting it keeps the login flow compatible with the shared,
   * multi-instance rate limiter.
   */
  const rateLimit =
    await consumeRateLimit({
      key:
        createLoginRateLimitKey(
          clientIp,
          identifier.value,
        ),

      limit:
        8,

      windowMs:
        15 *
        60_000,
    });

  if (
    !rateLimit.allowed
  ) {
    throw new LoginServiceError(
      "RATE_LIMITED",

      "Zu viele Anmeldeversuche. Bitte versuche es später erneut.",

      {
        retryAfterSeconds:
          rateLimit
            .retryAfterSeconds,
      },
    );
  }

  /* ------------------------------------------------------------------------
     4. Find user
     ------------------------------------------------------------------------ */

  const user =
    await findUserByIdentifier(
      identifier,
    );

  /**
   * Use the same public error whether:
   *
   * - the account does not exist;
   * - the password is incorrect.
   *
   * This limits account enumeration.
   */
  if (
    !user
  ) {
    throw new LoginServiceError(
      "INVALID_CREDENTIALS",

      "E-Mail/Telefonnummer oder Passwort ist nicht korrekt.",
    );
  }

  /* ------------------------------------------------------------------------
     5. Verify password
     ------------------------------------------------------------------------ */

  const passwordValid =
    await verifyPassword(
      validation.data
        .password,

      user.passwordHash,
    );

  if (
    !passwordValid
  ) {
    throw new LoginServiceError(
      "INVALID_CREDENTIALS",

      "E-Mail/Telefonnummer oder Passwort ist nicht korrekt.",
    );
  }

  /* ------------------------------------------------------------------------
     6. Account state
     ------------------------------------------------------------------------ */

  /**
   * We verify the password first.
   *
   * This avoids exposing:
   *
   * pending_verification
   * disabled
   *
   * to someone who does not know
   * the account password.
   */
  assertUserCanLogin(
    user,
  );

  /* ------------------------------------------------------------------------
     7. Return safe authenticated user
     ------------------------------------------------------------------------ */

  return {
    id:
      user.id,

    firstName:
      user.firstName,

    lastName:
      user.lastName,

    email:
      user.email,

    phoneE164:
      user.phoneE164,

    countryCode:
      user.countryCode,
  };
}
