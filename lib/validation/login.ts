/**
 * Express-Führerschein
 * Login payload validation.
 */

import type { SupportedCountryCode } from "@/types/country";

export interface LoginInput {
  identifier: string;
  password: string;
  countryCode?: SupportedCountryCode;
}

export type LoginField = "identifier" | "password";

export interface LoginValidationError {
  field: LoginField;
  code: string;
  message: string;
}

export type LoginValidationResult =
  | { success: true; data: LoginInput; errors: [] }
  | { success: false; data: null; errors: LoginValidationError[] };

const SUPPORTED_COUNTRIES = new Set<SupportedCountryCode>([
  "DE",
  "AT",
  "CH",
  "BE",
  "ES",
]);

function asRecord(input: unknown): Record<string, unknown> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  return input as Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeCountryCode(value: unknown): SupportedCountryCode | undefined {
  const code = asString(value).trim().toUpperCase();
  return SUPPORTED_COUNTRIES.has(code as SupportedCountryCode)
    ? (code as SupportedCountryCode)
    : undefined;
}

export function validateLoginInput(input: unknown): LoginValidationResult {
  const record = asRecord(input);

  if (!record) {
    return {
      success: false,
      data: null,
      errors: [
        {
          field: "identifier",
          code: "invalid_payload",
          message: "Die Anmeldedaten sind ungültig.",
        },
      ],
    };
  }

  const identifier = asString(record.identifier).trim();
  const password = asString(record.password);
  const countryCode = normalizeCountryCode(record.countryCode);
  const errors: LoginValidationError[] = [];

  if (identifier.length < 3 || identifier.length > 254) {
    errors.push({
      field: "identifier",
      code: "invalid_identifier",
      message: "Bitte gib deine E-Mail-Adresse oder Telefonnummer ein.",
    });
  }

  if (password.length < 1 || password.length > 128) {
    errors.push({
      field: "password",
      code: "invalid_password",
      message: "Bitte gib dein Passwort ein.",
    });
  }

  if (errors.length > 0) {
    return { success: false, data: null, errors };
  }

  return {
    success: true,
    data: { identifier, password, countryCode },
    errors: [],
  };
}
