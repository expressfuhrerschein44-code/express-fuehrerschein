/**
 * Express-Führerschein
 * Static Profile configuration. No user-specific data belongs here.
 */

import type {
  ProfileCountryCode,
  ProfileLocale,
} from "@/types/profile";

export const PROFILE_ROUTES = {
  profile: "/profil",
  support: "/hilfe-support",
  login: "/login",
} as const;

export interface ProfileCountryOption {
  code: ProfileCountryCode;
  label: string;
  flag: string;
}

export const PROFILE_COUNTRIES: readonly ProfileCountryOption[] = [
  { code: "DE", label: "Deutschland", flag: "🇩🇪" },
  { code: "AT", label: "Österreich", flag: "🇦🇹" },
  { code: "CH", label: "Schweiz", flag: "🇨🇭" },
  { code: "BE", label: "Belgien", flag: "🇧🇪" },
  { code: "ES", label: "Spanien", flag: "🇪🇸" },
];

export interface ProfileLocaleOption {
  code: ProfileLocale;
  label: string;
}

export const PROFILE_LOCALES: readonly ProfileLocaleOption[] = [
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "nl", label: "Nederlands" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "en", label: "English" },
];

export const PROFILE_LIMITS = {
  firstName: 80,
  lastName: 80,
  city: 120,
  birthPlace: 120,
  postalCode: 20,
  addressLine1: 255,
  drivingLicenseNumber: 64,
  timezone: 64,
  avatarMaxBytes: 8 * 1024 * 1024,
} as const;

export const PROFILE_AVATAR_BUCKET = "profile-avatars";

export const PROFILE_AVATAR_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const PROFILE_EMAIL_CHANGE = {
  codeTtlMinutes: 10,
  maxAttempts: 5,
  resendCooldownSeconds: 60,
} as const;

export const PROFILE_COPY = {
  verified: "Verifiziert",
  notSpecified: "Nicht angegeben",
  updateSuccess: "Deine Profildaten wurden aktualisiert.",
  passwordChanged: "Dein Passwort wurde erfolgreich geändert.",
  emailCodeSent:
    "Wir haben einen Sicherheitscode an deine neue E-Mail-Adresse gesendet.",
  emailChanged: "Deine E-Mail-Adresse wurde erfolgreich geändert.",
  avatarUpdated: "Dein Profilbild wurde aktualisiert.",
  avatarRemoved: "Dein Profilbild wurde entfernt.",
} as const;
