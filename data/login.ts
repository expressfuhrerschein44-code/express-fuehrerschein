/**
 * Express-Führerschein
 * Login page static data.
 *
 * Default public language: German.
 *
 * Dynamic information such as:
 * - authenticated user;
 * - login errors;
 * - session state;
 * - detected IP;
 * - detected country;
 * - OAuth callback state;
 *
 * does NOT belong in this file.
 *
 * CURRENT AUTHENTICATION MODE:
 *
 * - E-Mail + Passwort       ✅
 * - Telefonnummer + Passwort ✅
 * - Google OAuth            ⏸ disabled
 * - Apple OAuth             ⏸ disabled
 *
 * OAuth infrastructure remains available in the codebase
 * and can be enabled later without rebuilding the login architecture.
 */

import {
  ASSETS,
  DEFAULT_LOCALE,
  ROUTES,
} from "@/lib/constants";

import type {
  SupportedCountryCode,
} from "@/types/country";

import type {
  LoginAssets,
  LoginBenefit,
  LoginFormValues,
  LoginPageCopy,
  LoginRoutes,
  LoginSettings,
  LoginTrustItem,
  SocialLoginProvider,
} from "@/types/login";

/* ==========================================================================
   ROUTES
   ========================================================================== */

export const LOGIN_ROUTES = {
  /* ------------------------------------------------------------------------
     Public pages
     ------------------------------------------------------------------------ */

  login:
    ROUTES.login,

  register:
    ROUTES.register,

  forgotPassword:
    ROUTES.forgotPassword,

  /**
   * Destination after successful authentication.
   */
  afterLogin:
    ROUTES.dashboard,

  /* ------------------------------------------------------------------------
     Internal authentication API
     ------------------------------------------------------------------------ */

  api: {
    login:
      "/api/auth/login",

    logout:
      "/api/auth/logout",

    session:
      "/api/auth/session",

    /**
     * OAuth routes remain registered for future use.
     *
     * They are currently not exposed through the Login UI because
     * Google and Apple authentication are disabled below.
     */
    oauth: {
      googleStart:
        "/api/auth/oauth/google/start",

      googleCallback:
        "/api/auth/oauth/google/callback",

      appleStart:
        "/api/auth/oauth/apple/start",

      appleCallback:
        "/api/auth/oauth/apple/callback",
    },
  },
} as const satisfies LoginRoutes;

/* ==========================================================================
   DEFAULT COUNTRY
   ========================================================================== */

/**
 * Germany is the primary Express-Führerschein market.
 *
 * The Login page may nevertheless receive another country
 * from server-side country/IP detection.
 */
export const DEFAULT_LOGIN_COUNTRY_CODE:
  SupportedCountryCode =
  "DE";

/* ==========================================================================
   DEFAULT FORM VALUES
   ========================================================================== */

export const DEFAULT_LOGIN_FORM_VALUES:
  LoginFormValues = {
  identifier:
    "",

  password:
    "",

  countryCode:
    DEFAULT_LOGIN_COUNTRY_CODE,
};

/* ==========================================================================
   SIDE-PANEL BENEFITS
   ========================================================================== */

export const LOGIN_BENEFITS = [
  {
    id:
      "learning-plan",

    title:
      "Strukturierter Lernplan",

    description:
      "In 21 Tagen zum Erfolg.",

    icon:
      "graduation-cap",
  },

  {
    id:
      "online",

    title:
      "100% Online",

    description:
      "Lerne flexibel von überall.",

    icon:
      "timer",
  },

  {
    id:
      "verified-content",

    title:
      "Geprüfte Inhalte",

    description:
      "Aktuelle Fragen und Prüfungswissen.",

    icon:
      "shield",
  },

  {
    id:
      "support",

    title:
      "Persönlicher Support",

    description:
      "Wir sind für dich da.",

    icon:
      "headphones",
  },
] as const satisfies
  readonly LoginBenefit[];

/* ==========================================================================
   TRUST
   ========================================================================== */

export const LOGIN_TRUST_ITEMS = [
  {
    id:
      "dekra",

    name:
      "DEKRA",

    label:
      "Geprüfte Qualität",

    logoSrc:
      ASSETS.partners.dekra,
  },

  {
    id:
      "tuev",

    name:
      "TÜV",

    label:
      "Geprüfte Standards",

    logoSrc:
      ASSETS.partners.tuev,
  },

  {
    id:
      "kba",

    name:
      "KBA",

    label:
      "Anerkannt",

    logoSrc:
      ASSETS.partners.kba,
  },

  {
    id:
      "ssl",

    name:
      "SSL",

    label:
      "Verschlüsselt",

    icon:
      "lock",
  },

  {
    id:
      "gdpr",

    name:
      "DSGVO",

    label:
      "Konform",

    icon:
      "shield",
  },
] as const satisfies
  readonly LoginTrustItem[];

/* ==========================================================================
   SOCIAL LOGIN
   ========================================================================== */

/**
 * Google and Apple authentication are intentionally disabled for now.
 *
 * IMPORTANT:
 *
 * We keep their configuration objects instead of deleting the architecture.
 *
 * Benefits:
 * - no Google credentials required;
 * - no Apple credentials required;
 * - no social-login button displayed;
 * - no impact on normal credential login;
 * - easy reactivation later.
 *
 * To enable a provider later:
 *
 * enabled: true
 *
 * and configure the corresponding server environment variables.
 */
export const LOGIN_SOCIAL_PROVIDERS = [
  {
    id:
      "google",

    label:
      "Mit Google anmelden",

    startHref:
      LOGIN_ROUTES
        .api
        .oauth
        .googleStart,

    icon:
      "google",

    enabled:
      false,
  },

  {
    id:
      "apple",

    label:
      "Mit Apple anmelden",

    startHref:
      LOGIN_ROUTES
        .api
        .oauth
        .appleStart,

    icon:
      "apple",

    enabled:
      false,
  },
] as const satisfies
  readonly SocialLoginProvider[];

/* ==========================================================================
   COPY
   ========================================================================== */

export const LOGIN_COPY = {
  /* ------------------------------------------------------------------------
     Desktop side panel
     ------------------------------------------------------------------------ */

  sidePanel: {
    titleLine1:
      "Willkommen zurück!",

    titleLine2:
      "Dein Führerschein.",

    titleHighlight:
      "Unser Ziel.",

    description:
      "Melde dich an und setze deine Vorbereitung genau dort fort, wo du aufgehört hast.",
  },

  /* ------------------------------------------------------------------------
     Login card
     ------------------------------------------------------------------------ */

  card: {
    title:
      "Anmelden",

    subtitle:
      "Schön, dass du wieder da bist!",
  },

  /* ------------------------------------------------------------------------
     Form
     ------------------------------------------------------------------------ */

  form: {
    identifierLabel:
      "E-Mail oder Telefonnummer",

    identifierPlaceholder:
      "Deine E-Mail-Adresse oder Telefonnummer",

    passwordLabel:
      "Passwort",

    passwordPlaceholder:
      "Dein Passwort",

    showPassword:
      "Passwort anzeigen",

    hidePassword:
      "Passwort ausblenden",

    forgotPassword:
      "Passwort vergessen?",

    submitLabel:
      "Anmelden",

    submittingLabel:
      "Anmeldung läuft...",

    /**
     * Kept for future OAuth/social-login activation.
     */
    separator:
      "oder",

    noAccountPrompt:
      "Noch kein Konto?",

    registerLabel:
      "Jetzt registrieren",
  },

  /* ------------------------------------------------------------------------
     Security notice
     ------------------------------------------------------------------------ */

  security: {
    title:
      "Deine Daten sind bei uns sicher und werden vertraulich behandelt.",

    description:
      "Wir verwenden modernste Sicherheitsstandards.",
  },
} as const satisfies
  LoginPageCopy;

/* ==========================================================================
   ASSETS
   ========================================================================== */

export const LOGIN_ASSETS = {
  sidePanel:
    ASSETS.login.sidePanel,
} as const satisfies
  LoginAssets;

/* ==========================================================================
   SETTINGS
   ========================================================================== */

export const LOGIN_SETTINGS = {
  /* ------------------------------------------------------------------------
     Locale
     ------------------------------------------------------------------------ */

  defaultLocale:
    DEFAULT_LOCALE,

  /* ------------------------------------------------------------------------
     Country
     ------------------------------------------------------------------------ */

  defaultCountryCode:
    DEFAULT_LOGIN_COUNTRY_CODE,

  /* ------------------------------------------------------------------------
     Input limits
     ------------------------------------------------------------------------ */

  identifierMaxLength:
    254,

  passwordMaxLength:
    128,

  /* ------------------------------------------------------------------------
     Session
     ------------------------------------------------------------------------ */

  /**
   * Default UI/reference duration:
   *
   * 7 days.
   *
   * AUTH_SESSION_TTL_SECONDS on the server remains
   * the production source of truth.
   */
  sessionTtlSeconds:
    60 *
    60 *
    24 *
    7,

  /* ------------------------------------------------------------------------
     Login protection
     ------------------------------------------------------------------------ */

  maxAttempts:
    8,

  attemptWindowMinutes:
    15,
} as const satisfies
  LoginSettings;

/* ==========================================================================
   COMPLETE LOGIN DATA
   ========================================================================== */

export const LOGIN_DATA = {
  routes:
    LOGIN_ROUTES,

  copy:
    LOGIN_COPY,

  benefits:
    LOGIN_BENEFITS,

  trustItems:
    LOGIN_TRUST_ITEMS,

  socialProviders:
    LOGIN_SOCIAL_PROVIDERS,

  assets:
    LOGIN_ASSETS,

  settings:
    LOGIN_SETTINGS,

  defaultFormValues:
    DEFAULT_LOGIN_FORM_VALUES,
} as const;

/* ==========================================================================
   TYPES
   ========================================================================== */

/**
 * Immutable static Login data type.
 */
export type LoginData =
  typeof LOGIN_DATA;