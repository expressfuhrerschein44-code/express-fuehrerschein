/**
 * Express-Führerschein
 * Login identifier normalization: e-mail or telephone.
 */

import {
  PHONE_COUNTRIES,
  normalizePhoneNumber,
} from "@/lib/server/phone-country";
import type { SupportedCountryCode } from "@/types/country";

export type NormalizedLoginIdentifier =
  | { kind: "email"; value: string }
  | { kind: "phone"; value: string; countryCode: SupportedCountryCode };

export class LoginIdentifierError extends Error {
  constructor(message = "Ungültige E-Mail-Adresse oder Telefonnummer.") {
    super(message);
    this.name = "LoginIdentifierError";
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function normalizeEmail(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (normalized.length > 254 || !EMAIL_PATTERN.test(normalized)) {
    return null;
  }
  return normalized;
}

function findCountryByDialCode(input: string): SupportedCountryCode | null {
  const digits = input.replace(/\D/g, "");
  const countries = Object.values(PHONE_COUNTRIES).sort(
    (a, b) => b.dialCode.length - a.dialCode.length,
  );

  for (const country of countries) {
    const dialDigits = country.dialCode.replace(/\D/g, "");
    if (digits.startsWith(dialDigits)) {
      return country.countryCode;
    }
  }

  return null;
}

function normalizePhone(
  value: string,
  fallbackCountryCode?: SupportedCountryCode,
): NormalizedLoginIdentifier | null {
  const trimmed = value.trim();
  const countryCode = trimmed.startsWith("+")
    ? findCountryByDialCode(trimmed)
    : fallbackCountryCode ?? null;

  if (!countryCode) {
    return null;
  }

  const normalized = normalizePhoneNumber(trimmed, countryCode);
  if (!normalized) {
    return null;
  }

  return {
    kind: "phone",
    value: normalized.e164,
    countryCode,
  };
}

export function normalizeLoginIdentifier(
  rawIdentifier: string,
  countryCode?: SupportedCountryCode,
): NormalizedLoginIdentifier {
  const value = rawIdentifier.trim();

  if (!value) {
    throw new LoginIdentifierError();
  }

  if (value.includes("@")) {
    const email = normalizeEmail(value);
    if (!email) {
      throw new LoginIdentifierError("Bitte gib eine gültige E-Mail-Adresse ein.");
    }
    return { kind: "email", value: email };
  }

  const phone = normalizePhone(value, countryCode);
  if (!phone) {
    throw new LoginIdentifierError("Bitte gib eine gültige Telefonnummer ein.");
  }

  return phone;
}
