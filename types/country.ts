/**
 * Express-Führerschein
 * Country and locale types
 *
 * Country of training and interface language are intentionally separated.
 */

export type SupportedCountryCode = "DE" | "AT" | "CH" | "BE" | "ES";

export type SupportedLocale = "de" | "fr" | "nl" | "es" | "it" | "en";

export const SUPPORTED_COUNTRY_CODES = [
  "DE",
  "AT",
  "CH",
  "BE",
  "ES",
] as const satisfies readonly SupportedCountryCode[];

export const SUPPORTED_LOCALES = [
  "de",
  "fr",
  "nl",
  "es",
  "it",
  "en",
] as const satisfies readonly SupportedLocale[];

export const DEFAULT_COUNTRY_CODE: SupportedCountryCode = "DE";
export const DEFAULT_LOCALE: SupportedLocale = "de";

export type CountryStatus =
  | "active"
  | "coming-soon"
  | "inactive";

export interface Country {
  /**
   * Stable ISO-style country code used by the platform.
   */
  code: SupportedCountryCode;

  /**
   * Localized public country name.
   */
  name: string;

  /**
   * Emoji flag used only as a lightweight visual.
   */
  flag: string;

  /**
   * Whether this country is the main market.
   */
  primary: boolean;

  /**
   * Availability on the platform.
   */
  status: CountryStatus;

  /**
   * Public route slug if needed.
   * Example: "deutschland".
   */
  slug?: string;

  /**
   * Languages available for the interface in this market.
   * This does not determine the legal/regulatory language of source content.
   */
  availableLocales?: readonly SupportedLocale[];

  /**
   * CMS/admin sort order.
   */
  sortOrder?: number;

  /**
   * Optional public landing-page link.
   */
  href?: string;
}

export interface LanguageOption {
  locale: SupportedLocale;
  label: string;
  nativeLabel: string;
  shortLabel: Uppercase<SupportedLocale>;
  enabled: boolean;
}

/**
 * User-facing market selection.
 * Keeps training country and UI language independent.
 */
export interface MarketPreference {
  countryCode: SupportedCountryCode;
  locale: SupportedLocale;
}
