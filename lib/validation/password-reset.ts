/**
 * Express-Führerschein
 * Password reset input validation.
 *
 * Validation is intentionally framework-independent so it can be reused by:
 * - client forms;
 * - route handlers;
 * - server services.
 */

import {
  PASSWORD_RESET_SETTINGS,
} from "@/data/password-reset";

import type {
  PasswordResetCompleteRequest,
  PasswordResetNewPasswordFormValues,
  PasswordResetStartFormValues,
  PasswordResetValidationResult,
  PasswordResetVerifyFormValues,
} from "@/types/password-reset";

/* ==========================================================================
   INTERNAL HELPERS
   ========================================================================== */

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function readString(
  value: unknown,
): string {
  return typeof value === "string"
    ? value
    : "";
}

export function normalizePasswordResetEmail(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase();
}

export function normalizePasswordResetCode(
  value: string,
): string {
  return value
    .replace(/\D/g, "")
    .slice(
      0,
      PASSWORD_RESET_SETTINGS.codeLength,
    );
}

function isValidEmail(
  email: string,
): boolean {
  if (
    !email ||
    email.length >
      PASSWORD_RESET_SETTINGS.emailMaxLength
  ) {
    return false;
  }

  /**
   * Intentionally pragmatic e-mail validation.
   * Full RFC mailbox validation belongs to the mail provider, not the form.
   */
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}

/* ==========================================================================
   START
   ========================================================================== */

export function validatePasswordResetStartInput(
  input: unknown,
): PasswordResetValidationResult<PasswordResetStartFormValues> {
  const email =
    normalizePasswordResetEmail(
      isRecord(input)
        ? readString(input.email)
        : "",
    );

  const errors: {
    email?: string;
  } = {};

  if (!email) {
    errors.email =
      "Bitte gib deine E-Mail-Adresse ein.";
  } else if (!isValidEmail(email)) {
    errors.email =
      "Bitte gib eine gültige E-Mail-Adresse ein.";
  }

  if (errors.email) {
    return {
      success:
        false,
      errors,
    };
  }

  return {
    success:
      true,
    data: {
      email,
    },
  };
}

/* ==========================================================================
   VERIFY CODE
   ========================================================================== */

export function validatePasswordResetVerifyInput(
  input: unknown,
): PasswordResetValidationResult<PasswordResetVerifyFormValues> {
  const code =
    normalizePasswordResetCode(
      isRecord(input)
        ? readString(input.code)
        : "",
    );

  if (
    code.length !==
      PASSWORD_RESET_SETTINGS.codeLength ||
    !/^\d+$/.test(code)
  ) {
    return {
      success:
        false,
      errors: {
        code:
          "Bitte gib den vollständigen 6-stelligen Sicherheitscode ein.",
      },
    };
  }

  return {
    success:
      true,
    data: {
      code,
    },
  };
}

/* ==========================================================================
   NEW PASSWORD
   ========================================================================== */

export function validatePasswordResetCompleteInput(
  input: unknown,
): PasswordResetValidationResult<PasswordResetCompleteRequest> {
  const newPassword =
    isRecord(input)
      ? readString(
          input.newPassword,
        )
      : "";

  const confirmPassword =
    isRecord(input)
      ? readString(
          input.confirmPassword,
        )
      : "";

  const errors: {
    newPassword?: string;
    confirmPassword?: string;
  } = {};

  if (!newPassword) {
    errors.newPassword =
      "Bitte gib ein neues Passwort ein.";
  } else if (
    newPassword.length <
      PASSWORD_RESET_SETTINGS.passwordMinLength
  ) {
    errors.newPassword =
      `Das Passwort muss mindestens ${PASSWORD_RESET_SETTINGS.passwordMinLength} Zeichen lang sein.`;
  } else if (
    newPassword.length >
      PASSWORD_RESET_SETTINGS.passwordMaxLength
  ) {
    errors.newPassword =
      `Das Passwort darf höchstens ${PASSWORD_RESET_SETTINGS.passwordMaxLength} Zeichen lang sein.`;
  }

  if (!confirmPassword) {
    errors.confirmPassword =
      "Bitte bestätige dein neues Passwort.";
  } else if (
    newPassword !==
    confirmPassword
  ) {
    errors.confirmPassword =
      "Die Passwörter stimmen nicht überein.";
  }

  if (
    errors.newPassword ||
    errors.confirmPassword
  ) {
    return {
      success:
        false,
      errors,
    };
  }

  return {
    success:
      true,
    data: {
      newPassword,
      confirmPassword,
    },
  };
}

/**
 * Convenience alias for UI code.
 */
export function validatePasswordResetNewPasswordForm(
  input: unknown,
): PasswordResetValidationResult<PasswordResetNewPasswordFormValues> {
  return validatePasswordResetCompleteInput(
    input,
  );
}
