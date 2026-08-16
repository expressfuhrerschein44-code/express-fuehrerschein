/**
 * Express-Führerschein
 * Password reset shared types.
 *
 * Central shared contracts for the complete
 * password-reset authentication flow.
 *
 * This file must remain environment-independent.
 *
 * It must NOT access:
 *
 * - environment variables;
 * - cookies;
 * - database connections;
 * - Node.js crypto;
 * - Resend;
 * - server-only modules.
 *
 * It can safely be imported by:
 *
 * - client components;
 * - server components;
 * - API routes;
 * - validation;
 * - repositories;
 * - authentication services.
 */

/* ==========================================================================
   FLOW / SESSION
   ========================================================================== */

/**
 * Current stage of the temporary password-reset session.
 *
 * challenge:
 * The user still has to verify the temporary code.
 *
 * verified:
 * The verification code has been accepted and the user
 * is allowed to choose a new password.
 */
export type PasswordResetStage =
  | "challenge"
  | "verified";

/**
 * Serializable payload stored inside the signed
 * password-reset HttpOnly session.
 */
export interface PasswordResetSessionPayload {
  /**
   * Session payload schema version.
   *
   * Allows future changes without silently accepting
   * incompatible old cookies.
   */
  version: 1;

  /**
   * Password reset request identifier.
   */
  requestId: string;

  /**
   * Current password reset flow stage.
   */
  stage:
    PasswordResetStage;

  /**
   * Unix timestamp in seconds.
   */
  issuedAt: number;

  /**
   * Unix timestamp in seconds.
   */
  expiresAt: number;
}

/* ==========================================================================
   FORM VALUES
   ========================================================================== */

/**
 * Step 1:
 * Request a password-reset code.
 */
export interface PasswordResetStartFormValues {
  email: string;
}

/**
 * Step 2:
 * Verify the six-digit security code.
 */
export interface PasswordResetVerifyFormValues {
  code: string;
}

/**
 * Step 3:
 * Choose the new password.
 */
export interface PasswordResetNewPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

/* ==========================================================================
   FORM ERRORS
   ========================================================================== */

/**
 * Shared field errors used by:
 *
 * - validation functions;
 * - API responses;
 * - React forms.
 */
export interface PasswordResetFieldErrors {
  email?: string;

  code?: string;

  newPassword?: string;

  confirmPassword?: string;

  /**
   * Non-field-specific error.
   */
  form?: string;
}

/* ==========================================================================
   VALIDATION
   ========================================================================== */

export type PasswordResetValidationSuccess<T> = {
  success: true;

  data: T;
};

export type PasswordResetValidationFailure = {
  success: false;

  errors:
    PasswordResetFieldErrors;
};

export type PasswordResetValidationResult<T> =
  | PasswordResetValidationSuccess<T>
  | PasswordResetValidationFailure;

/* ==========================================================================
   API REQUESTS
   ========================================================================== */

/**
 * POST /api/auth/password-reset/start
 */
export interface PasswordResetStartRequest {
  email: string;
}

/**
 * POST /api/auth/password-reset/verify
 */
export interface PasswordResetVerifyRequest {
  code: string;
}

/**
 * POST /api/auth/password-reset/complete
 */
export interface PasswordResetCompleteRequest {
  newPassword: string;

  confirmPassword: string;
}

/* ==========================================================================
   API ERROR CODES
   ========================================================================== */

/**
 * Public password-reset API error codes.
 *
 * Keep these centralized so:
 *
 * - service;
 * - API routes;
 * - forms;
 * - future translations;
 *
 * all use exactly the same contract.
 */
export type PasswordResetApiErrorCode =
  /**
   * Invalid request body or invalid form values.
   */
  | "VALIDATION_ERROR"

  /**
   * Request came from an unexpected Origin.
   *
   * Used as CSRF / same-origin protection
   * by password-reset API routes.
   */
  | "INVALID_ORIGIN"

  /**
   * Temporary password-reset request or session
   * no longer exists, is invalidated or expired.
   */
  | "INVALID_OR_EXPIRED_REQUEST"

  /**
   * Verification code is incorrect.
   */
  | "INVALID_CODE"

  /**
   * Maximum verification attempts reached.
   */
  | "TOO_MANY_ATTEMPTS"

  /**
   * The user requested another code too quickly.
   */
  | "RESEND_TOO_SOON"

  /**
   * Maximum number of resend operations reached.
   */
  | "TOO_MANY_RESENDS"

  /**
   * User tries to complete the reset without
   * successfully verifying the code first.
   */
  | "REQUEST_NOT_VERIFIED"

  /**
   * Account cannot currently complete
   * a password-reset operation.
   */
  | "ACCOUNT_UNAVAILABLE"

  /**
   * New password matches the current password.
   */
  | "SAME_PASSWORD"

  /**
   * Security e-mail could not be delivered.
   */
  | "DELIVERY_FAILED"

  /**
   * Request rejected by rate limiting.
   */
  | "RATE_LIMITED"

  /**
   * Unexpected server failure.
   */
  | "INTERNAL_ERROR";

/* ==========================================================================
   API SUCCESS RESPONSE
   ========================================================================== */

/**
 * Successful public API response.
 *
 * Used by:
 *
 * - start;
 * - verify;
 * - resend;
 * - complete.
 */
export interface PasswordResetApiSuccessResponse {
  ok: true;

  /**
   * User-facing success message.
   */
  message: string;

  /**
   * Optional next application route.
   *
   * Examples:
   *
   * /passwort-vergessen/verifizieren
   * /passwort-vergessen/neues-passwort
   * /passwort-vergessen/erfolg
   */
  nextPath?: string;

  /**
   * Optional cooldown communicated by the server.
   *
   * Mainly returned by:
   *
   * POST /api/auth/password-reset/resend
   *
   * This allows the frontend to display:
   *
   * "Erneut senden in 60s"
   *
   * without duplicating the server result.
   */
  retryAfterSeconds?: number;
}

/* ==========================================================================
   API ERROR RESPONSE
   ========================================================================== */

export interface PasswordResetApiErrorResponse {
  ok: false;

  /**
   * Stable programmatic error code.
   */
  code:
    PasswordResetApiErrorCode;

  /**
   * User-facing error message.
   */
  message: string;

  /**
   * Optional individual field errors.
   */
  fields?:
    PasswordResetFieldErrors;

  /**
   * Optional retry delay in seconds.
   *
   * Used mainly by:
   *
   * - rate limiting;
   * - resend cooldown.
   */
  retryAfterSeconds?: number;
}

/* ==========================================================================
   API RESPONSE UNION
   ========================================================================== */

export type PasswordResetApiResponse =
  | PasswordResetApiSuccessResponse
  | PasswordResetApiErrorResponse;

/* ==========================================================================
   REPOSITORY RECORDS
   ========================================================================== */

/**
 * Internal password-reset request.
 *
 * Current development repository may use
 * in-memory storage.
 *
 * Production PostgreSQL representation is provided by:
 *
 * database/migrations/003_password_reset.sql
 */
export interface PasswordResetRequestRecord {
  /**
   * Reset request UUID.
   */
  id: string;

  /**
   * Associated user UUID.
   */
  userId: string;

  /**
   * Secure hash of the temporary code.
   *
   * The plaintext code must never be stored.
   */
  codeHash: string;

  /**
   * ISO expiration timestamp.
   */
  expiresAt: string;

  /**
   * Number of unsuccessful verification attempts.
   */
  attempts: number;

  /**
   * Number of resend operations.
   */
  resendCount: number;

  /**
   * ISO timestamp of last code delivery.
   */
  lastSentAt: string;

  /**
   * ISO timestamp when the code was verified.
   */
  verifiedAt:
    string | null;

  /**
   * ISO timestamp when the password was replaced.
   */
  completedAt:
    string | null;

  /**
   * ISO timestamp when the request was invalidated.
   */
  invalidatedAt:
    string | null;

  createdAt: string;

  updatedAt: string;
}

/* ==========================================================================
   REPOSITORY INPUTS
   ========================================================================== */

/**
 * Input used when creating a new password-reset request.
 */
export interface CreatePasswordResetRequestInput {
  userId: string;

  codeHash: string;

  expiresAt: string;
}

/**
 * Input used when replacing an expired/resend code.
 */
export interface ReplacePasswordResetCodeInput {
  codeHash: string;

  expiresAt: string;
}

/* ==========================================================================
   E-MAIL DELIVERY
   ========================================================================== */

/**
 * Input passed from the password-reset service
 * to the e-mail delivery adapter.
 */
export interface PasswordResetDeliveryInput {
  /**
   * Destination e-mail.
   */
  to: string;

  /**
   * Optional user first name.
   */
  firstName:
    string | null;

  /**
   * Plaintext temporary code.
   *
   * This exists only during the delivery operation.
   * It must never be persisted.
   */
  code: string;

  /**
   * Code validity duration displayed in the e-mail.
   */
  expiresInMinutes: number;
}

/**
 * Abstraction between password-reset logic
 * and the concrete mail provider.
 *
 * Current provider:
 * Resend.
 */
export interface PasswordResetCodeDelivery {
  sendCode(
    input:
      PasswordResetDeliveryInput,
  ): Promise<void>;
}

/* ==========================================================================
   START SERVICE RESULT
   ========================================================================== */

export interface PasswordResetStartServiceResult {
  accepted: true;

  /**
   * Present only when a real eligible account exists.
   *
   * IMPORTANT:
   *
   * API routes must never expose to the public whether
   * the supplied e-mail address belongs to an account.
   *
   * A generic public response must always be returned.
   *
   * This value exists only so the API layer can create
   * the HttpOnly password-reset session when appropriate.
   */
  session:
    | {
        requestId: string;
      }
    | null;
}

/* ==========================================================================
   VERIFY SERVICE RESULT
   ========================================================================== */

export interface PasswordResetVerifyServiceResult {
  verified: true;

  requestId: string;
}

/* ==========================================================================
   RESEND SERVICE RESULT
   ========================================================================== */

export interface PasswordResetResendServiceResult {
  sent: true;

  requestId: string;

  /**
   * Number of seconds before another resend
   * operation may be requested.
   */
  retryAfterSeconds: number;
}

/* ==========================================================================
   COMPLETE SERVICE RESULT
   ========================================================================== */

export interface PasswordResetCompleteServiceResult {
  completed: true;

  /**
   * Account whose password was replaced.
   */
  userId: string;
}

/* ==========================================================================
   COMPLETE SERVICE DEPENDENCIES
   ========================================================================== */

export interface PasswordResetCompleteDependencies {
  /**
   * Optional integration hook used after a successful
   * password replacement.
   *
   * Production use:
   *
   * revoke every previous authenticated session for
   * this user so stolen/old sessions cannot remain active.
   */
  revokeUserSessions?: (
    userId: string,
  ) => Promise<void>;
}

/* ==========================================================================
   ROUTES
   ========================================================================== */

export interface PasswordResetRoutes {
  /**
   * Public pages.
   */
  start: string;

  verify: string;

  newPassword: string;

  success: string;

  login: string;

  /**
   * Internal API endpoints.
   */
  api: {
    start: string;

    verify: string;

    resend: string;

    complete: string;
  };
}

/* ==========================================================================
   SETTINGS
   ========================================================================== */

export interface PasswordResetSettings {
  /**
   * Verification code length.
   */
  codeLength: number;

  /**
   * Verification code lifetime.
   */
  codeTtlMinutes: number;

  /**
   * Maximum invalid verification attempts.
   */
  maxAttempts: number;

  /**
   * Minimum delay between resend operations.
   */
  resendCooldownSeconds: number;

  /**
   * Maximum resend operations per reset request.
   */
  maxResends: number;

  /**
   * Temporary reset session lifetime.
   */
  sessionTtlSeconds: number;

  /**
   * Maximum accepted e-mail length.
   */
  emailMaxLength: number;

  /**
   * Password limits.
   */
  passwordMinLength: number;

  passwordMaxLength: number;
}

/* ==========================================================================
   PAGE COPY
   ========================================================================== */

export interface PasswordResetPageCopy {
  /* ------------------------------------------------------------------------
     Start
     ------------------------------------------------------------------------ */

  start: {
    title: string;

    subtitle: string;

    emailLabel: string;

    emailPlaceholder: string;

    submitLabel: string;

    submittingLabel: string;

    backToLogin: string;

    /**
     * Generic response intentionally prevents
     * account enumeration.
     */
    genericSuccess: string;
  };

  /* ------------------------------------------------------------------------
     Verify
     ------------------------------------------------------------------------ */

  verify: {
    title: string;

    subtitle: string;

    codeLabel: string;

    codePlaceholder: string;

    submitLabel: string;

    submittingLabel: string;

    resendLabel: string;

    resendingLabel: string;

    codeSentNotice: string;
  };

  /* ------------------------------------------------------------------------
     New password
     ------------------------------------------------------------------------ */

  newPassword: {
    title: string;

    subtitle: string;

    passwordLabel: string;

    passwordPlaceholder: string;

    confirmPasswordLabel: string;

    confirmPasswordPlaceholder: string;

    submitLabel: string;

    submittingLabel: string;
  };

  /* ------------------------------------------------------------------------
     Success
     ------------------------------------------------------------------------ */

  success: {
    title: string;

    description: string;

    loginLabel: string;
  };

  /* ------------------------------------------------------------------------
     Security notice
     ------------------------------------------------------------------------ */

  security: {
    title: string;

    description: string;
  };
}