/**
 * Express-Führerschein
 * Registration page data.
 *
 * Default public language: German.
 *
 * Dynamic information such as:
 * - detected IP;
 * - detected country;
 * - current user input;
 * - verification state;
 * - account status;
 *
 * does NOT belong in this file.
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
  PasswordRequirement,
  RegistrationBenefit,
  RegistrationCountry,
  RegistrationFormValues,
  RegistrationPageCopy,
  RegistrationRoutes,
  RegistrationStep,
  RegistrationTrustItem,
} from "@/types/registration";

/* ==========================================================================
   ROUTES
   ========================================================================== */

export const REGISTRATION_ROUTES = {
  account:
    ROUTES.register,

  verification:
    `${ROUTES.register}/verifizieren`,

  success:
    `${ROUTES.register}/erfolg`,

  login:
    ROUTES.login,

  api: {
    start:
      "/api/auth/register/start",

    verify:
      "/api/auth/register/verify",

    resend:
      "/api/auth/register/resend",
  },
} as const satisfies RegistrationRoutes;

/* ==========================================================================
   STEPS
   ========================================================================== */

export const REGISTRATION_STEPS = [
  {
    id: "account",
    number: 1,
    label: "Konto erstellen",
    href:
      REGISTRATION_ROUTES.account,
  },

  {
    id: "verification",
    number: 2,
    label: "Verifizieren",
    href:
      REGISTRATION_ROUTES.verification,
  },

  {
    id: "success",
    number: 3,
    label: "Los geht’s!",
    href:
      REGISTRATION_ROUTES.success,
  },
] as const satisfies readonly RegistrationStep[];

/* ==========================================================================
   COUNTRIES
   ========================================================================== */

export const REGISTRATION_COUNTRIES = [
  {
    code: "DE",
    name: "Deutschland",
    flag: "🇩🇪",
    dialCode: "+49",
    href:
      "/laender/deutschland",
    primary: true,
    enabled: true,
    sortOrder: 10,
  },

  {
    code: "AT",
    name: "Österreich",
    flag: "🇦🇹",
    dialCode: "+43",
    href:
      "/laender/oesterreich",
    primary: false,
    enabled: true,
    sortOrder: 20,
  },

  {
    code: "CH",
    name: "Schweiz",
    flag: "🇨🇭",
    dialCode: "+41",
    href:
      "/laender/schweiz",
    primary: false,
    enabled: true,
    sortOrder: 30,
  },

  {
    code: "BE",
    name: "Belgien",
    flag: "🇧🇪",
    dialCode: "+32",
    href:
      "/laender/belgien",
    primary: false,
    enabled: true,
    sortOrder: 40,
  },

  {
    code: "ES",
    name: "Spanien",
    flag: "🇪🇸",
    dialCode: "+34",
    href:
      "/laender/spanien",
    primary: false,
    enabled: true,
    sortOrder: 50,
  },
] as const satisfies readonly RegistrationCountry[];

export const DEFAULT_REGISTRATION_COUNTRY_CODE:
  SupportedCountryCode =
  "DE";

export function getRegistrationCountry(
  countryCode: SupportedCountryCode,
): RegistrationCountry {
  return (
    REGISTRATION_COUNTRIES.find(
      (country) =>
        country.code ===
        countryCode,
    ) ??
    REGISTRATION_COUNTRIES[0]
  );
}

/* ==========================================================================
   DEFAULT FORM
   ========================================================================== */

export const DEFAULT_REGISTRATION_FORM_VALUES:
  RegistrationFormValues = {
  firstName: "",
  lastName: "",

  countryCode:
    DEFAULT_REGISTRATION_COUNTRY_CODE,

  phone: "",
  email: "",
  password: "",

  acceptedTerms: false,
};

/* ==========================================================================
   PASSWORD REQUIREMENTS
   ========================================================================== */

export const REGISTRATION_PASSWORD_REQUIREMENTS = [
  {
    id: "minLength",
    label: "Mind. 8 Zeichen",
  },

  {
    id: "uppercase",
    label: "1 Großbuchstabe",
  },

  {
    id: "number",
    label: "1 Zahl",
  },

  {
    id: "specialCharacter",
    label: "1 Sonderzeichen",
  },
] as const satisfies readonly PasswordRequirement[];

/* ==========================================================================
   SIDE BENEFITS
   ========================================================================== */

export const REGISTRATION_BENEFITS = [
  {
    id: "security",

    title:
      "100% Sicher",

    description:
      "Deine Daten sind bei uns sicher.",

    icon: "shield",
  },

  {
    id: "program",

    title:
      "In 21 Tagen vorbereitet",

    description:
      "Strukturierter Lernplan für deinen Erfolg.",

    icon: "timer",
  },

  {
    id: "devices",

    title:
      "Lerne überall",

    description:
      "Auf allen Geräten – jederzeit und überall.",

    icon: "monitor",
  },

  {
    id: "support",

    title:
      "Persönlicher Support",

    description:
      "Wir sind für dich da.",

    icon: "headphones",
  },
] as const satisfies readonly RegistrationBenefit[];

/* ==========================================================================
   TRUST
   ========================================================================== */

export const REGISTRATION_TRUST_ITEMS = [
  {
    id: "dekra",
    name: "DEKRA",
    label: "Geprüfte Qualität",
    logoSrc:
      ASSETS.partners.dekra,
  },

  {
    id: "tuev",
    name: "TÜV",
    label: "Geprüfte Standards",
    logoSrc:
      ASSETS.partners.tuev,
  },

  {
    id: "kba",
    name: "KBA",
    label: "Anerkannt",
    logoSrc:
      ASSETS.partners.kba,
  },

  {
    id: "ssl",
    name: "SSL",
    label: "Verschlüsselt",
    icon: "lock",
  },

  {
    id: "gdpr",
    name: "DSGVO",
    label: "Konform",
    icon: "shield",
  },
] as const satisfies readonly RegistrationTrustItem[];

/* ==========================================================================
   COPY
   ========================================================================== */

export const REGISTRATION_COPY = {
  sidePanel: {
    titleLine1:
      "Dein Weg zum",

    titleHighlight:
      "Führerschein",

    titleLine2:
      "beginnt hier.",

    description:
      "Erstelle dein Konto und starte deine Vorbereitung schnell, sicher und strukturiert.",
  },

  account: {
    title:
      "Konto erstellen",

    subtitle:
      "Erstelle dein Konto in wenigen Schritten",

    submitLabel:
      "Konto erstellen",

    loginPrompt:
      "Du hast bereits ein Konto?",

    loginLabel:
      "Jetzt anmelden",
  },

  verification: {
    title:
      "E-Mail verifizieren",

    subtitle:
      "Gib den 6-stelligen Code ein, den wir dir per E-Mail gesendet haben.",

    codeLabel:
      "Bestätigungscode",

    verifyLabel:
      "Code bestätigen",

    resendPrompt:
      "Keinen Code erhalten?",

    resendLabel:
      "Code erneut senden",
  },

  success: {
    title:
      "Konto erfolgreich erstellt",

    subtitle:
      "Dein Konto wurde erfolgreich verifiziert. Du kannst jetzt mit deiner Vorbereitung starten.",

    ctaLabel:
      "Jetzt starten",
  },
} as const satisfies RegistrationPageCopy;

/* ==========================================================================
   COUNTRY DETECTION NOTICE
   ========================================================================== */

export const COUNTRY_DETECTION_COPY = {
  detected:
    "Wir haben dein Land anhand deiner IP-Adresse erkannt. Du kannst es bei Bedarf ändern.",

  detectedLabel:
    "IP-basiert erkannt",

  defaultLabel:
    "Standardauswahl",

  manualLabel:
    "Manuell ausgewählt",
} as const;

/* ==========================================================================
   PHONE
   ========================================================================== */

export const REGISTRATION_PHONE_COPY = {
  label:
    "Telefonnummer",

  placeholder:
    "Deine Telefonnummer",

  smsNotice:
    "Wir senden dir einen Bestätigungscode per SMS.",
} as const;

/**
 * Current registration verification is done by e-mail.
 *
 * The SMS text is retained as a future-ready UI string only.
 * Do not send an SMS unless an SMS provider is connected.
 */
export const REGISTRATION_EMAIL_COPY = {
  label:
    "E-Mail",

  placeholder:
    "Deine E-Mail-Adresse",
} as const;

/* ==========================================================================
   FORM LABELS
   ========================================================================== */

export const REGISTRATION_FORM_COPY = {
  firstName: {
    label:
      "Vorname",

    placeholder:
      "Vorname",
  },

  lastName: {
    label:
      "Nachname",

    placeholder:
      "Nachname",
  },

  country: {
    label:
      "Land",
  },

  password: {
    label:
      "Passwort",

    placeholder:
      "Mindestens 8 Zeichen",

    show:
      "Passwort anzeigen",

    hide:
      "Passwort ausblenden",
  },

  terms: {
    prefix:
      "Ich akzeptiere die",

    termsLabel:
      "AGB",

    termsHref:
      ROUTES.terms,

    conjunction:
      "und die",

    privacyLabel:
      "Datenschutzrichtlinie",

    privacyHref:
      ROUTES.privacy,
  },
} as const;

/* ==========================================================================
   REGISTRATION IMAGE
   ========================================================================== */

export const REGISTRATION_ASSETS = {
  sidePanel:
    "/images/registration/registration-berlin-car.webp",
} as const;

/* ==========================================================================
   DEFAULT SETTINGS
   ========================================================================== */

export const REGISTRATION_SETTINGS = {
  defaultLocale:
    DEFAULT_LOCALE,

  verificationCodeLength:
    6,

  verificationCodeTtlMinutes:
    10,

  resendCooldownSeconds:
    60,

  maxVerificationAttempts:
    5,

  maxResends:
    5,
} as const;

/* ==========================================================================
   COMPLETE STATIC MODEL
   ========================================================================== */

export const REGISTRATION_DATA = {
  routes:
    REGISTRATION_ROUTES,

  steps:
    REGISTRATION_STEPS,

  countries:
    REGISTRATION_COUNTRIES,

  defaultFormValues:
    DEFAULT_REGISTRATION_FORM_VALUES,

  passwordRequirements:
    REGISTRATION_PASSWORD_REQUIREMENTS,

  benefits:
    REGISTRATION_BENEFITS,

  trustItems:
    REGISTRATION_TRUST_ITEMS,

  copy:
    REGISTRATION_COPY,

  countryDetectionCopy:
    COUNTRY_DETECTION_COPY,

  phoneCopy:
    REGISTRATION_PHONE_COPY,

  emailCopy:
    REGISTRATION_EMAIL_COPY,

  formCopy:
    REGISTRATION_FORM_COPY,

  assets:
    REGISTRATION_ASSETS,

  settings:
    REGISTRATION_SETTINGS,
} as const;

export type RegistrationData =
  typeof REGISTRATION_DATA;
