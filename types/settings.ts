export type SettingsLocale =
  | "de"
  | "fr"
  | "nl"
  | "es"
  | "it"
  | "en";

export interface SettingsPreferencesView {
  preferredLocale: SettingsLocale;
  timezone: string;
}

export interface SettingsAccountView {
  firstName: string;
  lastName: string;
  email: string;
  phoneE164: string;
  countryCode: string;
}

export interface SettingsPageData {
  preferences: SettingsPreferencesView;
  account: SettingsAccountView;
}

export interface UpdateSettingsInput {
  preferredLocale: SettingsLocale;
  timezone: string;
}

export interface UpdateSettingsResult {
  preferences: SettingsPreferencesView;
}
