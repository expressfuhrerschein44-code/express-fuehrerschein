/**
 * Express-Führerschein
 * Password reset static data.
 *
 * Default public language: German.
 *
 * Dynamic information such as request state, verification status,
 * detected IP, e-mail delivery results and cookies does not belong here.
 */

import {
  ROUTES,
} from "@/lib/constants";

import type {
  PasswordResetPageCopy,
  PasswordResetRoutes,
  PasswordResetSettings,
  PasswordResetStartFormValues,
  PasswordResetVerifyFormValues,
  PasswordResetNewPasswordFormValues,
} from "@/types/password-reset";

/* ==========================================================================
   ROUTES
   ========================================================================== */

const PASSWORD_RESET_BASE_ROUTE =
  ROUTES.forgotPassword;

export const PASSWORD_RESET_ROUTES = {
  start:
    PASSWORD_RESET_BASE_ROUTE,

  verify:
    `${PASSWORD_RESET_BASE_ROUTE}/verifizieren`,

  newPassword:
    `${PASSWORD_RESET_BASE_ROUTE}/neues-passwort`,

  success:
    `${PASSWORD_RESET_BASE_ROUTE}/erfolg`,

  login:
    ROUTES.login,

  api: {
    start:
      "/api/auth/password-reset/start",

    verify:
      "/api/auth/password-reset/verify",

    resend:
      "/api/auth/password-reset/resend",

    complete:
      "/api/auth/password-reset/complete",
  },
} as const satisfies PasswordResetRoutes;

/* ==========================================================================
   SETTINGS
   ========================================================================== */

export const PASSWORD_RESET_SETTINGS = {
  codeLength:
    6,

  codeTtlMinutes:
    10,

  maxAttempts:
    5,

  resendCooldownSeconds:
    60,

  maxResends:
    5,

  /**
   * Temporary HttpOnly reset-session lifetime.
   *
   * This gives the user enough time to enter the code and choose
   * a new password without turning the reset session into a long-lived token.
   */
  sessionTtlSeconds:
    15 * 60,

  emailMaxLength:
    254,

  passwordMinLength:
    8,

  passwordMaxLength:
    128,
} as const satisfies PasswordResetSettings;

/* ==========================================================================
   DEFAULT FORM VALUES
   ========================================================================== */

export const DEFAULT_PASSWORD_RESET_START_FORM:
  PasswordResetStartFormValues = {
  email:
    "",
};

export const DEFAULT_PASSWORD_RESET_VERIFY_FORM:
  PasswordResetVerifyFormValues = {
  code:
    "",
};

export const DEFAULT_PASSWORD_RESET_NEW_PASSWORD_FORM:
  PasswordResetNewPasswordFormValues = {
  newPassword:
    "",

  confirmPassword:
    "",
};

/* ==========================================================================
   COPY
   ========================================================================== */

export const PASSWORD_RESET_COPY = {
  start: {
    title:
      "Passwort vergessen?",

    subtitle:
      "Kein Problem. Gib deine E-Mail-Adresse ein und wir senden dir einen Sicherheitscode.",

    emailLabel:
      "E-Mail-Adresse",

    emailPlaceholder:
      "deine@email.de",

    submitLabel:
      "Sicherheitscode senden",

    submittingLabel:
      "Code wird gesendet...",

    backToLogin:
      "Zurück zur Anmeldung",

    genericSuccess:
      "Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir einen Sicherheitscode gesendet.",
  },

  verify: {
    title:
      "Sicherheitscode eingeben",

    subtitle:
      "Gib den 6-stelligen Code aus unserer E-Mail ein.",

    codeLabel:
      "Sicherheitscode",

    codePlaceholder:
      "000000",

    submitLabel:
      "Code bestätigen",

    submittingLabel:
      "Code wird geprüft...",

    resendLabel:
      "Code erneut senden",

    resendingLabel:
      "Code wird erneut gesendet...",

    codeSentNotice:
      "Der Code ist 10 Minuten gültig.",
  },

  newPassword: {
    title:
      "Neues Passwort festlegen",

    subtitle:
      "Wähle ein neues Passwort für dein Express-Führerschein-Konto.",

    passwordLabel:
      "Neues Passwort",

    passwordPlaceholder:
      "Mindestens 8 Zeichen",

    confirmPasswordLabel:
      "Passwort bestätigen",

    confirmPasswordPlaceholder:
      "Neues Passwort wiederholen",

    submitLabel:
      "Passwort speichern",

    submittingLabel:
      "Passwort wird gespeichert...",
  },

  success: {
    title:
      "Passwort erfolgreich geändert",

    description:
      "Dein Passwort wurde sicher aktualisiert. Du kannst dich jetzt mit deinem neuen Passwort anmelden.",

    loginLabel:
      "Zur Anmeldung",
  },

  security: {
    title:
      "Deine Daten sind geschützt.",

    description:
      "Sicherheitscodes sind zeitlich begrenzt und können nach erfolgreicher Verwendung nicht erneut benutzt werden.",
  },
} as const satisfies PasswordResetPageCopy;

/* ==========================================================================
   COMPLETE STATIC MODEL
   ========================================================================== */

export const PASSWORD_RESET_DATA = {
  routes:
    PASSWORD_RESET_ROUTES,

  settings:
    PASSWORD_RESET_SETTINGS,

  copy:
    PASSWORD_RESET_COPY,

  defaultForms: {
    start:
      DEFAULT_PASSWORD_RESET_START_FORM,

    verify:
      DEFAULT_PASSWORD_RESET_VERIFY_FORM,

    newPassword:
      DEFAULT_PASSWORD_RESET_NEW_PASSWORD_FORM,
  },
} as const;

export type PasswordResetData =
  typeof PASSWORD_RESET_DATA;
