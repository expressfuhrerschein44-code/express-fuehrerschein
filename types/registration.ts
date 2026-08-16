/**
 * Express-Führerschein
 * Registration domain types.
 *
 * Shared contracts used by:
 * - registration pages;
 * - registration UI components;
 * - API routes;
 * - server services;
 * - country / phone selection;
 * - e-mail verification flow.
 */

import type {
  SupportedCountryCode,
  SupportedLocale,
} from "@/types/country";

/* ==========================================================================
   REGISTRATION FLOW
   ========================================================================== */

export type RegistrationStepId =
  | "account"
  | "verification"
  | "success";

export type RegistrationStepNumber =
  | 1
  | 2
  | 3;

export interface RegistrationStep {
  id: RegistrationStepId;
  number: RegistrationStepNumber;
  label: string;
  href: string;
}

/* ==========================================================================
   COUNTRY / PHONE
   ========================================================================== */

export interface RegistrationCountry {
  /**
   * ISO country code supported by Express-Führerschein.
   */
  code: SupportedCountryCode;

  /**
   * Default German public country name.
   *
   * Localized labels can later come from messages/*.json.
   */
  name: string;

  /**
   * Country flag used by the registration UI.
   */
  flag: string;

  /**
   * International telephone prefix.
   *
   * Examples:
   * DE → +49
   * AT → +43
   */
  dialCode: string;

  /**
   * Public country landing page.
   */
  href: string;

  /**
   * Main/default market.
   */
  primary: boolean;

  /**
   * Allows a country to remain configured
   * while temporarily unavailable for registration.
   */
  enabled: boolean;

  /**
   * Display order in country selectors.
   */
  sortOrder: number;
}

/* ==========================================================================
   COUNTRY DETECTION
   ========================================================================== */

export type CountryDetectionMethod =
  | "ip"
  | "manual"
  | "default";

export interface RegistrationCountryDetection {
  countryCode:
    SupportedCountryCode;

  method:
    CountryDetectionMethod;

  /**
   * Explicit signal used by the UI
   * to display "IP-basiert erkannt".
   */
  detectedByIp: boolean;
}

/* ==========================================================================
   REGISTRATION FORM
   ========================================================================== */

export interface RegistrationFormValues {
  firstName: string;
  lastName: string;

  countryCode:
    SupportedCountryCode;

  /**
   * User-entered telephone number.
   *
   * The server converts this to E.164.
   */
  phone: string;

  email: string;

  /**
   * Plaintext password exists only during form submission.
   * It must never be persisted in plaintext.
   */
  password: string;

  acceptedTerms: boolean;
}

/**
 * Every editable registration field.
 */
export type RegistrationFormField =
  keyof RegistrationFormValues;

/**
 * Client-side / API field errors.
 */
export type RegistrationFieldErrors =
  Partial<
    Record<
      RegistrationFormField,
      string
    >
  >;

export interface RegistrationFormState {
  values:
    RegistrationFormValues;

  errors:
    RegistrationFieldErrors;

  submitting:
    boolean;

  submitError:
    string | null;
}

/* ==========================================================================
   REGISTRATION SUBMIT PAYLOAD
   ========================================================================== */

export interface RegistrationSubmitPayload {
  firstName: string;
  lastName: string;

  countryCode:
    SupportedCountryCode;

  /**
   * May initially be a national number.
   *
   * The server normalizes it into E.164 format.
   */
  phone: string;

  email: string;
  password: string;

  /**
   * The API request is only valid
   * when the terms were accepted.
   */
  acceptedTerms: true;
}

/* ==========================================================================
   PASSWORD
   ========================================================================== */

export type PasswordRequirementId =
  | "minLength"
  | "uppercase"
  | "number"
  | "specialCharacter";

export interface PasswordRequirement {
  id:
    PasswordRequirementId;

  label:
    string;
}

export type PasswordRequirementState =
  Record<
    PasswordRequirementId,
    boolean
  >;

/* ==========================================================================
   REGISTRATION SIDE-PANEL BENEFITS
   ========================================================================== */

export interface RegistrationBenefit {
  id:
    | "security"
    | "program"
    | "devices"
    | "support";

  title:
    string;

  description:
    string;

  /**
   * Semantic icon name resolved by the UI component.
   */
  icon:
    | "shield"
    | "timer"
    | "monitor"
    | "headphones";
}

/* ==========================================================================
   TRUST / CERTIFICATIONS
   ========================================================================== */

export interface RegistrationTrustItem {
  id:
    | "dekra"
    | "tuev"
    | "kba"
    | "ssl"
    | "gdpr";

  name:
    string;

  label:
    string;

  /**
   * Optional public asset.
   *
   * Example:
   * /images/home/partners/dekra.webp
   */
  logoSrc?:
    string;

  /**
   * Used when no external logo asset is needed.
   */
  icon?:
    | "lock"
    | "shield";
}

/* ==========================================================================
   PAGE COPY
   ========================================================================== */

export interface RegistrationPageCopy {
  sidePanel: {
    titleLine1:
      string;

    titleHighlight:
      string;

    titleLine2:
      string;

    description:
      string;
  };

  account: {
    title:
      string;

    subtitle:
      string;

    submitLabel:
      string;

    loginPrompt:
      string;

    loginLabel:
      string;
  };

  verification: {
    title:
      string;

    subtitle:
      string;

    codeLabel:
      string;

    verifyLabel:
      string;

    resendPrompt:
      string;

    resendLabel:
      string;
  };

  success: {
    title:
      string;

    subtitle:
      string;

    ctaLabel:
      string;
  };
}

/* ==========================================================================
   API — START REGISTRATION
   ========================================================================== */

/**
 * RegistrationStartRequest is intentionally a type alias.
 *
 * Do NOT use:
 *
 * interface RegistrationStartRequest
 *   extends RegistrationSubmitPayload {}
 *
 * An empty interface extending another type triggers:
 * @typescript-eslint/no-empty-object-type.
 */
export type RegistrationStartRequest =
  RegistrationSubmitPayload;

export interface RegistrationStartSuccessData {
  /**
   * Masked address displayed on the verification screen.
   *
   * Example:
   * jo***@gmail.com
   */
  emailMasked:
    string;

  /**
   * Verification-code lifetime.
   */
  expiresInMinutes:
    number;

  /**
   * Route the frontend should open next.
   *
   * The signed registration session itself
   * remains in an HttpOnly cookie.
   */
  nextPath:
    string;
}

export interface RegistrationStartSuccessResponse {
  ok: true;

  data:
    RegistrationStartSuccessData;
}

/* ==========================================================================
   API — ERRORS
   ========================================================================== */

export interface RegistrationApiFieldError {
  /**
   * Optional field associated with the error.
   *
   * Some errors such as rate limiting
   * are global and therefore have no field.
   */
  field?:
    RegistrationFormField;

  code:
    string;

  message:
    string;
}

export interface RegistrationApiErrorResponse {
  ok: false;

  error: {
    code:
      string;

    message:
      string;

    /**
     * Validation errors for individual form fields.
     */
    details?:
      readonly RegistrationApiFieldError[];

    /**
     * Used for HTTP 429 / cooldown states.
     */
    retryAfterSeconds?:
      number;
  };
}

export type RegistrationStartResponse =
  | RegistrationStartSuccessResponse
  | RegistrationApiErrorResponse;

/* ==========================================================================
   API — VERIFY EMAIL
   ========================================================================== */

export interface RegistrationVerifyRequest {
  /**
   * Six-digit e-mail verification code.
   */
  code:
    string;
}

export interface RegistrationVerifySuccessResponse {
  ok: true;

  data: {
    verified:
      true;

    nextPath:
      string;
  };
}

export type RegistrationVerifyResponse =
  | RegistrationVerifySuccessResponse
  | RegistrationApiErrorResponse;

/* ==========================================================================
   API — RESEND VERIFICATION CODE
   ========================================================================== */

export interface RegistrationResendRequest {
  /**
   * Currently empty because the server identifies
   * the registration through the HttpOnly cookie.
   *
   * Kept as an explicit API contract for future extension.
   */
  readonly _registrationResendRequestBrand?:
    never;
}

export interface RegistrationResendSuccessResponse {
  ok: true;

  data: {
    /**
     * Masked destination address.
     */
    emailMasked:
      string;

    /**
     * Number of seconds before another resend is allowed.
     */
    cooldownSeconds:
      number;
  };
}

export type RegistrationResendResponse =
  | RegistrationResendSuccessResponse
  | RegistrationApiErrorResponse;

/* ==========================================================================
   VERIFICATION UI STATE
   ========================================================================== */

export interface VerificationCodeState {
  value:
    string;

  submitting:
    boolean;

  error:
    string | null;
}

export interface RegistrationVerificationContext {
  /**
   * Masked user e-mail.
   */
  emailMasked:
    string;

  /**
   * Remaining/initial validity of the code.
   */
  expiresInMinutes:
    number;

  /**
   * Current resend cooldown.
   */
  resendCooldownSeconds:
    number;
}

/* ==========================================================================
   REGISTRATION ROUTES
   ========================================================================== */

export interface RegistrationRoutes {
  /**
   * Step 1.
   */
  account:
    string;

  /**
   * Step 2.
   */
  verification:
    string;

  /**
   * Step 3.
   */
  success:
    string;

  /**
   * Existing-account login page.
   */
  login:
    string;

  api: {
    start:
      string;

    verify:
      string;

    resend:
      string;
  };
}

/* ==========================================================================
   INITIAL REGISTRATION PAGE DATA
   ========================================================================== */

export interface RegistrationInitialData {
  /**
   * Interface language.
   *
   * Country and locale remain independent.
   */
  locale:
    SupportedLocale;

  /**
   * Detection result received from the server.
   */
  detectedCountry:
    RegistrationCountryDetection;

  /**
   * Country currently selected in the form.
   */
  selectedCountry:
    RegistrationCountry;

  countries:
    readonly RegistrationCountry[];

  steps:
    readonly RegistrationStep[];

  benefits:
    readonly RegistrationBenefit[];

  trustItems:
    readonly RegistrationTrustItem[];

  passwordRequirements:
    readonly PasswordRequirement[];

  copy:
    RegistrationPageCopy;

  routes:
    RegistrationRoutes;
}