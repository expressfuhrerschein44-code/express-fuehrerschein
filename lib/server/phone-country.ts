/**
 * Express-Führerschein
 * Supported-country telephone metadata and E.164-style normalization.
 */

import type { SupportedCountryCode } from "@/types/country";

export interface PhoneCountry {
  countryCode: SupportedCountryCode;
  countryName: string;
  flag: string;
  dialCode: string;
  minNationalDigits: number;
  maxNationalDigits: number;
}

export const PHONE_COUNTRIES: Readonly<
  Record<SupportedCountryCode, PhoneCountry>
> = {
  DE: {
    countryCode: "DE",
    countryName: "Deutschland",
    flag: "🇩🇪",
    dialCode: "+49",
    minNationalDigits: 7,
    maxNationalDigits: 12,
  },
  AT: {
    countryCode: "AT",
    countryName: "Österreich",
    flag: "🇦🇹",
    dialCode: "+43",
    minNationalDigits: 7,
    maxNationalDigits: 12,
  },
  CH: {
    countryCode: "CH",
    countryName: "Schweiz",
    flag: "🇨🇭",
    dialCode: "+41",
    minNationalDigits: 9,
    maxNationalDigits: 9,
  },
  BE: {
    countryCode: "BE",
    countryName: "Belgien",
    flag: "🇧🇪",
    dialCode: "+32",
    minNationalDigits: 8,
    maxNationalDigits: 9,
  },
  ES: {
    countryCode: "ES",
    countryName: "Spanien",
    flag: "🇪🇸",
    dialCode: "+34",
    minNationalDigits: 9,
    maxNationalDigits: 9,
  },
};

export interface NormalizedPhone {
  countryCode: SupportedCountryCode;
  dialCode: string;
  nationalNumber: string;
  e164: string;
}

export function getPhoneCountry(
  countryCode: SupportedCountryCode,
): PhoneCountry {
  return PHONE_COUNTRIES[countryCode];
}

export function normalizePhoneNumber(
  value: string,
  countryCode: SupportedCountryCode,
): NormalizedPhone | null {
  const metadata = getPhoneCountry(countryCode);

  let digits = value.replace(/\D/g, "");
  const dialDigits = metadata.dialCode.replace(/\D/g, "");

  if (digits.startsWith(dialDigits)) {
    digits = digits.slice(dialDigits.length);
  }

  while (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (
    digits.length < metadata.minNationalDigits ||
    digits.length > metadata.maxNationalDigits
  ) {
    return null;
  }

  const e164 = `${metadata.dialCode}${digits}`;

  if (e164.replace(/\D/g, "").length > 15) {
    return null;
  }

  return {
    countryCode,
    dialCode: metadata.dialCode,
    nationalNumber: digits,
    e164,
  };
}
