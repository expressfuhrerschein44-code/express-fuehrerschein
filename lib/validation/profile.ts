/**
 * Express-Führerschein
 * Dependency-free Profile validation.
 */

import {
  PROFILE_COUNTRIES,
  PROFILE_LIMITS,
  PROFILE_LOCALES,
} from "@/data/profile";

import { normalizeEmail } from "@/lib/validation/registration";

import type {
  ChangeProfilePasswordInput,
  ProfileApiFieldErrors,
  ProfileCountryCode,
  ProfileLocale,
  StartProfileEmailChangeInput,
  UpdateProfileInput,
  VerifyProfileEmailChangeInput,
} from "@/types/profile";

export type ProfileValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ProfileApiFieldErrors };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: unknown): string | null {
  const valueText = text(value);
  return valueText || null;
}

function isCountry(value: string): value is ProfileCountryCode {
  return PROFILE_COUNTRIES.some((country) => country.code === value);
}

function isLocale(value: string): value is ProfileLocale {
  return PROFILE_LOCALES.some((locale) => locale.code === value);
}

function isDateOnly(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function isTimezone(value: string): boolean {
  if (!value || value.length > PROFILE_LIMITS.timezone) return false;

  try {
    new Intl.DateTimeFormat("de-DE", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export function validateUpdateProfileInput(
  raw: unknown,
): ProfileValidationResult<UpdateProfileInput> {
  if (!isRecord(raw)) {
    return {
      success: false,
      errors: { firstName: "Ungültige Profildaten." },
    };
  }

  const firstName = text(raw.firstName);
  const lastName = text(raw.lastName);
  const phone = text(raw.phone);
  const countryCode = text(raw.countryCode).toUpperCase();
  const city = nullableText(raw.city);
  const postalCode = nullableText(raw.postalCode);
  const addressLine1 = nullableText(raw.addressLine1);
  const birthDate = nullableText(raw.birthDate);
  const birthPlace = nullableText(raw.birthPlace);
  const drivingLicenseNumber = nullableText(raw.drivingLicenseNumber);
  const preferredLocale = text(raw.preferredLocale).toLowerCase();
  const timezone = text(raw.timezone);

  const errors: ProfileApiFieldErrors = {};

  if (!firstName || firstName.length > PROFILE_LIMITS.firstName) {
    errors.firstName = "Bitte gib einen gültigen Vornamen ein.";
  }

  if (!lastName || lastName.length > PROFILE_LIMITS.lastName) {
    errors.lastName = "Bitte gib einen gültigen Nachnamen ein.";
  }

  if (phone.length < 5 || phone.length > 32) {
    errors.phone = "Bitte gib eine gültige Telefonnummer ein.";
  }

  if (!isCountry(countryCode)) {
    errors.countryCode = "Bitte wähle ein unterstütztes Land aus.";
  }

  if (city && city.length > PROFILE_LIMITS.city) {
    errors.city = "Die Stadtangabe ist zu lang.";
  }

  if (postalCode && postalCode.length > PROFILE_LIMITS.postalCode) {
    errors.postalCode = "Die Postleitzahl ist zu lang.";
  }

  if (addressLine1 && addressLine1.length > PROFILE_LIMITS.addressLine1) {
    errors.addressLine1 = "Die Adresse ist zu lang.";
  }

  if (birthDate && !isDateOnly(birthDate)) {
    errors.birthDate = "Bitte gib ein gültiges Geburtsdatum ein.";
  } else if (
    birthDate &&
    new Date(`${birthDate}T00:00:00.000Z`).getTime() > Date.now()
  ) {
    errors.birthDate = "Das Geburtsdatum darf nicht in der Zukunft liegen.";
  }

  if (birthPlace && birthPlace.length > PROFILE_LIMITS.birthPlace) {
    errors.birthPlace = "Der Geburtsort ist zu lang.";
  }

  if (
    drivingLicenseNumber &&
    drivingLicenseNumber.length > PROFILE_LIMITS.drivingLicenseNumber
  ) {
    errors.drivingLicenseNumber = "Die Führerscheinnummer ist zu lang.";
  }

  if (!isLocale(preferredLocale)) {
    errors.preferredLocale = "Bitte wähle eine unterstützte Sprache aus.";
  }

  if (!isTimezone(timezone)) {
    errors.timezone = "Bitte gib eine gültige Zeitzone an.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      firstName,
      lastName,
      phone,
      countryCode: countryCode as ProfileCountryCode,
      city,
      postalCode,
      addressLine1,
      birthDate,
      birthPlace,
      drivingLicenseNumber,
      preferredLocale: preferredLocale as ProfileLocale,
      timezone,
    },
  };
}

export function validateChangeProfilePasswordInput(
  raw: unknown,
): ProfileValidationResult<ChangeProfilePasswordInput> {
  if (!isRecord(raw)) {
    return {
      success: false,
      errors: { currentPassword: "Ungültige Anfrage." },
    };
  }

  const currentPassword =
    typeof raw.currentPassword === "string" ? raw.currentPassword : "";
  const newPassword =
    typeof raw.newPassword === "string" ? raw.newPassword : "";
  const confirmPassword =
    typeof raw.confirmPassword === "string" ? raw.confirmPassword : "";

  const errors: ProfileApiFieldErrors = {};

  if (!currentPassword) {
    errors.currentPassword = "Bitte gib dein aktuelles Passwort ein.";
  }

  if (newPassword.length < 10 || newPassword.length > 128) {
    errors.newPassword =
      "Das neue Passwort muss zwischen 10 und 128 Zeichen lang sein.";
  }

  if (newPassword !== confirmPassword) {
    errors.confirmPassword = "Die Passwörter stimmen nicht überein.";
  }

  if (currentPassword && currentPassword === newPassword) {
    errors.newPassword =
      "Das neue Passwort muss sich vom aktuellen Passwort unterscheiden.";
  }

  return Object.keys(errors).length
    ? { success: false, errors }
    : {
        success: true,
        data: { currentPassword, newPassword, confirmPassword },
      };
}

export function validateStartProfileEmailChangeInput(
  raw: unknown,
): ProfileValidationResult<StartProfileEmailChangeInput> {
  if (!isRecord(raw)) {
    return {
      success: false,
      errors: { newEmail: "Ungültige Anfrage." },
    };
  }

  const newEmail = normalizeEmail(text(raw.newEmail));
  const currentPassword =
    typeof raw.currentPassword === "string" ? raw.currentPassword : "";

  const errors: ProfileApiFieldErrors = {};

  if (
    !newEmail ||
    newEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)
  ) {
    errors.newEmail = "Bitte gib eine gültige E-Mail-Adresse ein.";
  }

  if (!currentPassword) {
    errors.currentPassword = "Bitte bestätige dein aktuelles Passwort.";
  }

  return Object.keys(errors).length
    ? { success: false, errors }
    : {
        success: true,
        data: { newEmail, currentPassword },
      };
}

export function validateVerifyProfileEmailChangeInput(
  raw: unknown,
): ProfileValidationResult<VerifyProfileEmailChangeInput> {
  if (!isRecord(raw)) {
    return {
      success: false,
      errors: { code: "Ungültige Anfrage." },
    };
  }

  const requestId = text(raw.requestId);
  const code = text(raw.code);
  const errors: ProfileApiFieldErrors = {};

  if (!/^[0-9a-fA-F-]{36}$/.test(requestId)) {
    errors.code = "Die E-Mail-Änderungsanfrage ist ungültig.";
  }

  if (!/^\d{6}$/.test(code)) {
    errors.code = "Bitte gib den sechsstelligen Sicherheitscode ein.";
  }

  return Object.keys(errors).length
    ? { success: false, errors }
    : { success: true, data: { requestId, code } };
}
