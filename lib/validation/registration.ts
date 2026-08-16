/**
 * Express-Führerschein
 * Registration input validation.
 *
 * Client validation improves UX; this server-safe validation is authoritative.
 * No external validation package is required.
 */

import type { SupportedCountryCode } from "@/types/country";

export interface RegistrationInput {
  firstName: string;
  lastName: string;
  countryCode: SupportedCountryCode;
  phone: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}

export type RegistrationField =
  | "firstName"
  | "lastName"
  | "countryCode"
  | "phone"
  | "email"
  | "password"
  | "acceptedTerms";

export interface RegistrationValidationError {
  field: RegistrationField;
  code: string;
  message: string;
}

export type RegistrationValidationResult =
  | { success: true; data: RegistrationInput; errors: [] }
  | { success: false; data: null; errors: RegistrationValidationError[] };

const ALLOWED_COUNTRIES = new Set<SupportedCountryCode>([
  "DE",
  "AT",
  "CH",
  "BE",
  "ES",
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const NAME_PATTERN = /^[\p{L}\p{M}'’\-\s.]+$/u;
const PHONE_ALLOWED_PATTERN = /^[+\d\s()./-]+$/;

export const REGISTRATION_LIMITS = {
  firstNameMin: 2,
  firstNameMax: 80,
  lastNameMin: 2,
  lastNameMax: 80,
  emailMax: 254,
  phoneMinDigits: 6,
  phoneMaxDigits: 15,
  passwordMin: 8,
  passwordMax: 128,
} as const;

export interface PasswordRuleResult {
  minLength: boolean;
  uppercase: boolean;
  number: boolean;
  specialCharacter: boolean;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePersonName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function getPasswordRuleResult(password: string): PasswordRuleResult {
  return {
    minLength: password.length >= REGISTRATION_LIMITS.passwordMin,
    uppercase: /\p{Lu}/u.test(password),
    number: /\d/.test(password),
    specialCharacter: /[^\p{L}\p{N}\s]/u.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const rules = getPasswordRuleResult(password);

  return (
    password.length <= REGISTRATION_LIMITS.passwordMax &&
    rules.minLength &&
    rules.uppercase &&
    rules.number &&
    rules.specialCharacter
  );
}

function asRecord(input: unknown): Record<string, unknown> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }

  return input as Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function validateRegistrationInput(
  input: unknown,
): RegistrationValidationResult {
  const record = asRecord(input);

  if (!record) {
    return {
      success: false,
      data: null,
      errors: [
        {
          field: "email",
          code: "invalid_payload",
          message: "Die Registrierungsdaten sind ungültig.",
        },
      ],
    };
  }

  const firstName = normalizePersonName(asString(record.firstName));
  const lastName = normalizePersonName(asString(record.lastName));
  const countryCode = asString(record.countryCode).toUpperCase() as SupportedCountryCode;
  const phone = asString(record.phone).trim();
  const email = normalizeEmail(asString(record.email));
  const password = asString(record.password);
  const acceptedTerms = record.acceptedTerms === true;

  const errors: RegistrationValidationError[] = [];

  if (
    firstName.length < REGISTRATION_LIMITS.firstNameMin ||
    firstName.length > REGISTRATION_LIMITS.firstNameMax ||
    !NAME_PATTERN.test(firstName)
  ) {
    errors.push({
      field: "firstName",
      code: "invalid_first_name",
      message: "Bitte gib einen gültigen Vornamen ein.",
    });
  }

  if (
    lastName.length < REGISTRATION_LIMITS.lastNameMin ||
    lastName.length > REGISTRATION_LIMITS.lastNameMax ||
    !NAME_PATTERN.test(lastName)
  ) {
    errors.push({
      field: "lastName",
      code: "invalid_last_name",
      message: "Bitte gib einen gültigen Nachnamen ein.",
    });
  }

  if (!ALLOWED_COUNTRIES.has(countryCode)) {
    errors.push({
      field: "countryCode",
      code: "unsupported_country",
      message: "Dieses Land wird derzeit nicht unterstützt.",
    });
  }

  const phoneDigits = phone.replace(/\D/g, "");

  if (
    !PHONE_ALLOWED_PATTERN.test(phone) ||
    phoneDigits.length < REGISTRATION_LIMITS.phoneMinDigits ||
    phoneDigits.length > REGISTRATION_LIMITS.phoneMaxDigits
  ) {
    errors.push({
      field: "phone",
      code: "invalid_phone",
      message: "Bitte gib eine gültige Telefonnummer ein.",
    });
  }

  if (
    email.length === 0 ||
    email.length > REGISTRATION_LIMITS.emailMax ||
    !EMAIL_PATTERN.test(email)
  ) {
    errors.push({
      field: "email",
      code: "invalid_email",
      message: "Bitte gib eine gültige E-Mail-Adresse ein.",
    });
  }

  if (!isPasswordValid(password)) {
    errors.push({
      field: "password",
      code: "weak_password",
      message: "Das Passwort erfüllt nicht alle Sicherheitsanforderungen.",
    });
  }

  if (!acceptedTerms) {
    errors.push({
      field: "acceptedTerms",
      code: "terms_required",
      message: "Bitte akzeptiere die AGB und die Datenschutzrichtlinie.",
    });
  }

  if (errors.length > 0) {
    return { success: false, data: null, errors };
  }

  return {
    success: true,
    data: {
      firstName,
      lastName,
      countryCode,
      phone,
      email,
      password,
      acceptedTerms,
    },
    errors: [],
  };
}
