/**
 * Express-Führerschein
 * Password reset shared types.
 *
 * This file contains only serializable/shared contracts.
 * It must not access:
 * - environment variables;
 * - cookies;
 * - the database;
 * - Node.js crypto;
 * - Resend.
 */

/* ==========================================================================
   FLOW / SESSION
   ========================================================================== */

export type PasswordResetStage =
  | "challenge"
  | "verified";

export interface PasswordResetSessionPayload {
  version: 1;
  requestId: string;
  stage: PasswordResetStage;
  issuedAt: number;
  expiresAt: number;
}

/* ==========================================================================
   FORMS
   ========================================================================== */

export interface PasswordResetStartFormValues {
  email: string;
}

export interface PasswordResetVerifyFormValues {
  code: string;
}

export interface PasswordResetNewPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetFieldErrors {
  email?: string;
  code?: string;
  newPassword?: string;
  confirmPassword?: string;
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
  errors: PasswordResetFieldErrors;
};

export type PasswordResetValidationResult<T> =
  | PasswordResetValidationSuccess<T>
  | PasswordResetValidationFailure;

/* ==========================================================================
   API REQUESTS
   ========================================================================== */

export interface PasswordResetStartRequest {
  email: string;
}

export interface PasswordResetVerifyRequest {
  code: string;
}

export interface PasswordResetCompleteRequest {
  newPassword: string;
  confirmPassword: string;
}

/* ==========================================================================
   API RESPONSES
   ========================================================================== */

export type PasswordResetApiErrorCode =
  | "VALIDATION_ERROR"
  | "INVALID_ORIGIN"
  | "INVALID_OR_EXPIRED_REQUEST"
  | "INVALID_CODE"
  | "TOO_MANY_ATTEMPTS"
  | "RESEND_TOO_SOON"
  | "TOO_MANY_RESENDS"
  | "REQUEST_NOT_VERIFIED"
  | "ACCOUNT_UNAVAILABLE"
  | "SAME_PASSWORD"
  | "DELIVERY_FAILED"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface PasswordResetApiSuccessResponse {
  ok: true;
  message: string;
  nextPath?: string;

  /**
   * Optional cooldown returned after a successful resend.
   * The verification UI uses this value to disable the resend button.
   */
  retryAfterSeconds?: number;
}

export interface PasswordResetApiErrorResponse {
  ok: false;
  code: PasswordResetApiErrorCode;
  message: string;
  fields?: PasswordResetFieldErrors;
  retryAfterSeconds?: number;
}

export type PasswordResetApiResponse =
  | PasswordResetApiSuccessResponse
  | PasswordResetApiErrorResponse;

/* ==========================================================================
   REPOSITORY RECORDS
   ========================================================================== */

export interface PasswordResetRequestRecord {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
  resendCount: number;
  lastSentAt: string;
  verifiedAt: string | null;
  completedAt: string | null;
  invalidatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePasswordResetRequestInput {
  userId: string;
  codeHash: string;
  expiresAt: string;
}

export interface ReplacePasswordResetCodeInput {
  codeHash: string;
  expiresAt: string;
}

/* ==========================================================================
   SERVICE CONTRACTS
   ========================================================================== */

export interface PasswordResetDeliveryInput {
  to: string;
  firstName: string | null;
  code: string;
  expiresInMinutes: number;
}

export interface PasswordResetCodeDelivery {
  sendCode(
    input: PasswordResetDeliveryInput,
  ): Promise<void>;
}

export interface PasswordResetStartServiceResult {
  accepted: true;

  /**
   * Present only when a real eligible account exists.
   *
   * API routes must never expose this distinction in their public message.
   * The value is intended only for issuing the HttpOnly reset session cookie.
   */
  session:
    | {
        requestId: string;
      }
    | null;
}

export interface PasswordResetVerifyServiceResult {
  verified: true;
  requestId: string;
}

export interface PasswordResetResendServiceResult {
  sent: true;
  requestId: string;
  retryAfterSeconds: number;
}

export interface PasswordResetCompleteServiceResult {
  completed: true;
  userId: string;
}

export interface PasswordResetCompleteDependencies {
  /**
   * Optional integration hook used by the API layer to revoke
   * all pre-existing login sessions after a password change.
   */
  revokeUserSessions?: (
    userId: string,
  ) => Promise<void>;
}

/* ==========================================================================
   STATIC PAGE DATA
   ========================================================================== */

export interface PasswordResetRoutes {
  start: string;
  verify: string;
  newPassword: string;
  success: string;
  login: string;

  api: {
    start: string;
    verify: string;
    resend: string;
    complete: string;
  };
}

export interface PasswordResetSettings {
  codeLength: number;
  codeTtlMinutes: number;
  maxAttempts: number;
  resendCooldownSeconds: number;
  maxResends: number;
  sessionTtlSeconds: number;
  emailMaxLength: number;
  passwordMinLength: number;
  passwordMaxLength: number;
}

export interface PasswordResetPageCopy {
  start: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    submitLabel: string;
    submittingLabel: string;
    backToLogin: string;
    genericSuccess: string;
  };

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

  success: {
    title: string;
    description: string;
    loginLabel: string;
  };

  security: {
    title: string;
    description: string;
  };
}
