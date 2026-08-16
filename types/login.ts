/**
 * Express-Führerschein
 * Login domain types.
 *
 * Shared contracts used by:
 * - /anmelden;
 * - login UI components;
 * - credential-login API routes;
 * - session endpoints;
 * - Google / Apple OAuth entry points;
 * - account security UI.
 *
 * IMPORTANT:
 * This file contains types only.
 * It must not import client components or server-only modules.
 */

import type {
  SupportedCountryCode,
  SupportedLocale,
} from "@/types/country";

/* ==========================================================================
   LOGIN IDENTIFIER
   ========================================================================== */

export type LoginIdentifierKind =
  | "email"
  | "phone";

export interface LoginEmailIdentifier {
  kind: "email";
  value: string;
}

export interface LoginPhoneIdentifier {
  kind: "phone";
  value: string;
  countryCode:
    SupportedCountryCode;
}

export type LoginIdentifier =
  | LoginEmailIdentifier
  | LoginPhoneIdentifier;

/* ==========================================================================
   LOGIN FORM
   ========================================================================== */

export interface LoginFormValues {
  /**
   * E-mail address or telephone number.
   */
  identifier: string;

  password: string;

  /**
   * Used to normalize a national telephone number.
   * Country and interface language remain independent.
   */
  countryCode:
    SupportedCountryCode;
}

export type LoginFormField =
  keyof LoginFormValues;

export type LoginFieldErrors =
  Partial<
    Record<
      LoginFormField,
      string
    >
  >;

export interface LoginFormState {
  values:
    LoginFormValues;

  errors:
    LoginFieldErrors;

  submitting:
    boolean;

  submitError:
    string | null;
}

export interface LoginSubmitPayload {
  identifier: string;
  password: string;
  countryCode?:
    SupportedCountryCode;
}

/* ==========================================================================
   LOGIN BENEFITS
   ========================================================================== */

export type LoginBenefitId =
  | "learning-plan"
  | "online"
  | "verified-content"
  | "support";

export type LoginBenefitIcon =
  | "graduation-cap"
  | "timer"
  | "shield"
  | "headphones";

export interface LoginBenefit {
  id:
    LoginBenefitId;

  title:
    string;

  description:
    string;

  icon:
    LoginBenefitIcon;
}

/* ==========================================================================
   TRUST
   ========================================================================== */

export type LoginTrustItemId =
  | "dekra"
  | "tuev"
  | "kba"
  | "ssl"
  | "gdpr";

export interface LoginTrustItem {
  id:
    LoginTrustItemId;

  name:
    string;

  label:
    string;

  logoSrc?:
    string;

  icon?:
    | "lock"
    | "shield";
}

/* ==========================================================================
   SOCIAL LOGIN
   ========================================================================== */

export type LoginOAuthProvider =
  | "google"
  | "apple";

export interface SocialLoginProvider {
  id:
    LoginOAuthProvider;

  label:
    string;

  startHref:
    string;

  icon:
    LoginOAuthProvider;

  enabled:
    boolean;
}

/* ==========================================================================
   PAGE COPY
   ========================================================================== */

export interface LoginPageCopy {
  sidePanel: {
    titleLine1:
      string;

    titleLine2:
      string;

    titleHighlight:
      string;

    description:
      string;
  };

  card: {
    title:
      string;

    subtitle:
      string;
  };

  form: {
    identifierLabel:
      string;

    identifierPlaceholder:
      string;

    passwordLabel:
      string;

    passwordPlaceholder:
      string;

    showPassword:
      string;

    hidePassword:
      string;

    forgotPassword:
      string;

    submitLabel:
      string;

    submittingLabel:
      string;

    separator:
      string;

    noAccountPrompt:
      string;

    registerLabel:
      string;
  };

  security: {
    title:
      string;

    description:
      string;
  };
}

/* ==========================================================================
   LOGIN ROUTES
   ========================================================================== */

export interface LoginRoutes {
  login:
    string;

  register:
    string;

  forgotPassword:
    string;

  afterLogin:
    string;

  api: {
    login:
      string;

    logout:
      string;

    session:
      string;

    oauth: {
      googleStart:
        string;

      googleCallback:
        string;

      appleStart:
        string;

      appleCallback:
        string;
    };
  };
}

/* ==========================================================================
   LOGIN ASSETS
   ========================================================================== */

export interface LoginAssets {
  sidePanel:
    string;
}

/* ==========================================================================
   LOGIN SETTINGS
   ========================================================================== */

export interface LoginSettings {
  defaultLocale:
    SupportedLocale;

  defaultCountryCode:
    SupportedCountryCode;

  identifierMaxLength:
    number;

  passwordMaxLength:
    number;

  sessionTtlSeconds:
    number;

  maxAttempts:
    number;

  attemptWindowMinutes:
    number;
}

/* ==========================================================================
   API — LOGIN
   ========================================================================== */

export type LoginRequest =
  LoginSubmitPayload;

export interface LoginUserSummary {
  id:
    string;

  firstName:
    string;

  lastName:
    string;

  email:
    string;

  countryCode:
    SupportedCountryCode;
}

export interface LoginSuccessResponse {
  ok: true;

  data: {
    user:
      LoginUserSummary;

    nextPath:
      string;
  };
}

export interface LoginApiFieldError {
  field?:
    LoginFormField;

  code:
    string;

  message:
    string;
}

export interface LoginApiErrorResponse {
  ok: false;

  error: {
    code:
      string;

    message:
      string;

    details?:
      readonly LoginApiFieldError[];

    retryAfterSeconds?:
      number;

    /**
     * Optional route for states such as unverified e-mail.
     */
    nextPath?:
      string;
  };
}

export type LoginResponse =
  | LoginSuccessResponse
  | LoginApiErrorResponse;

/* ==========================================================================
   API — SESSION
   ========================================================================== */

export interface LoginSessionUser {
  id:
    string;

  firstName:
    string;

  lastName:
    string;

  email:
    string;

  countryCode:
    SupportedCountryCode;
}

export interface LoginSessionSuccessResponse {
  ok: true;

  data: {
    authenticated:
      true;

    user:
      LoginSessionUser;
  };
}

export interface LoginSessionAnonymousResponse {
  ok: true;

  data: {
    authenticated:
      false;
  };
}

export type LoginSessionResponse =
  | LoginSessionSuccessResponse
  | LoginSessionAnonymousResponse
  | LoginApiErrorResponse;

/* ==========================================================================
   API — LOGOUT
   ========================================================================== */

export interface LogoutSuccessResponse {
  ok: true;

  data: {
    loggedOut:
      true;

    nextPath:
      string;
  };
}

export type LogoutResponse =
  | LogoutSuccessResponse
  | LoginApiErrorResponse;

/* ==========================================================================
   OAUTH
   ========================================================================== */

export interface OAuthStartContext {
  provider:
    LoginOAuthProvider;

  returnTo:
    string;
}

export interface OAuthCallbackError {
  provider:
    LoginOAuthProvider;

  code:
    string;

  message:
    string;
}

export type OAuthResolutionStatus =
  | "authenticated"
  | "profile_required";

export interface OAuthProfileRequiredContext {
  provider:
    LoginOAuthProvider;

  providerAccountId:
    string;

  email:
    string;
}

/* ==========================================================================
   COMPLETE STATIC PAGE MODEL
   ========================================================================== */

export interface LoginPageData {
  locale:
    SupportedLocale;

  routes:
    LoginRoutes;

  copy:
    LoginPageCopy;

  benefits:
    readonly LoginBenefit[];

  trustItems:
    readonly LoginTrustItem[];

  socialProviders:
    readonly SocialLoginProvider[];

  assets:
    LoginAssets;

  settings:
    LoginSettings;

  defaultFormValues:
    LoginFormValues;
}
