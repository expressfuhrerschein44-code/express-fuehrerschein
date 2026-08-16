/**
 * Express-Führerschein
 * Country detection from trusted edge/CDN headers.
 *
 * No external geolocation API is called here.
 */

import {
  DEFAULT_COUNTRY_CODE,
  type SupportedCountryCode,
} from "@/types/country";

export type CountryDetectionSource =
  | "cloudflare"
  | "vercel"
  | "proxy"
  | "default";

export interface DetectedCountry {
  countryCode: SupportedCountryCode;
  detectedByIp: boolean;
  source: CountryDetectionSource;
}

const SUPPORTED = new Set<SupportedCountryCode>([
  "DE",
  "AT",
  "CH",
  "BE",
  "ES",
]);

function normalizeCountryCode(value: string | null): SupportedCountryCode | null {
  if (!value) return null;

  const code = value.trim().toUpperCase();

  return SUPPORTED.has(code as SupportedCountryCode)
    ? (code as SupportedCountryCode)
    : null;
}

export function detectCountryFromHeaders(headers: Headers): DetectedCountry {
  const cloudflare = normalizeCountryCode(headers.get("cf-ipcountry"));
  if (cloudflare) {
    return { countryCode: cloudflare, detectedByIp: true, source: "cloudflare" };
  }

  const vercel = normalizeCountryCode(headers.get("x-vercel-ip-country"));
  if (vercel) {
    return { countryCode: vercel, detectedByIp: true, source: "vercel" };
  }

  for (const headerName of [
    "x-country-code",
    "x-geo-country",
    "x-client-country",
  ] as const) {
    const country = normalizeCountryCode(headers.get(headerName));

    if (country) {
      return { countryCode: country, detectedByIp: true, source: "proxy" };
    }
  }

  return {
    countryCode: DEFAULT_COUNTRY_CODE,
    detectedByIp: false,
    source: "default",
  };
}
