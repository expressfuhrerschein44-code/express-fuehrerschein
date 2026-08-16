/**
 * Express-Führerschein
 * Serializable contracts for the protected Profile area.
 */

import type { ClientShellLocale } from "@/types/client-shell";

export type ProfileCountryCode = "DE" | "AT" | "CH" | "BE" | "ES";
export type ProfileLocale = ClientShellLocale;
export type ProfileTwoFactorMethod = "totp";

export interface ProfileIdentity {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phoneE164: string;
  countryCode: ProfileCountryCode;
  emailVerified: boolean;
  accountStatus: string;
  memberSince: string;
}

export interface ProfilePreferences {
  preferredLocale: ProfileLocale;
  timezone: string;
}

export interface ProfileAddress {
  city: string | null;
  postalCode: string | null;
  addressLine1: string | null;
}

export interface ProfileAdditionalInformation {
  birthDate: string | null;
  birthPlace: string | null;
  drivingLicenseNumber: string | null;
}

export interface ProfileAvatar {
  path: string | null;
  url: string | null;
}

export interface ProfileSecurity {
  twoFactorEnabled: boolean;
  twoFactorMethod: ProfileTwoFactorMethod | null;
}

export interface ProfileData {
  generatedAt: string;
  identity: ProfileIdentity;
  preferences: ProfilePreferences;
  address: ProfileAddress;
  additional: ProfileAdditionalInformation;
  avatar: ProfileAvatar;
  security: ProfileSecurity;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: ProfileCountryCode;
  city?: string | null;
  postalCode?: string | null;
  addressLine1?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  drivingLicenseNumber?: string | null;
  preferredLocale: ProfileLocale;
  timezone: string;
}

export interface ChangeProfilePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface StartProfileEmailChangeInput {
  newEmail: string;
  currentPassword: string;
}

export interface VerifyProfileEmailChangeInput {
  requestId: string;
  code: string;
}

export interface ProfileAvatarUploadInput {
  userId: string;
  bytes: Uint8Array;
  mimeType: string;
  originalFilename: string;
}

export interface ProfileAvatarUploadResult {
  path: string;
  url: string | null;
}

export interface ProfileTwoFactorSetup {
  method: "totp";
  secret: string;
  otpauthUri: string;
}

export type ProfileApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "ACCOUNT_UNAVAILABLE"
  | "INVALID_CURRENT_PASSWORD"
  | "SAME_PASSWORD"
  | "EMAIL_ALREADY_IN_USE"
  | "EMAIL_CHANGE_NOT_READY"
  | "EMAIL_CHANGE_NOT_FOUND"
  | "EMAIL_CHANGE_EXPIRED"
  | "INVALID_CODE"
  | "TOO_MANY_ATTEMPTS"
  | "TWO_FACTOR_NOT_READY"
  | "TWO_FACTOR_INVALID_CODE"
  | "AVATAR_STORAGE_NOT_CONFIGURED"
  | "AVATAR_INVALID_TYPE"
  | "AVATAR_TOO_LARGE"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR";

export interface ProfileApiFieldErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  countryCode?: string;
  city?: string;
  postalCode?: string;
  addressLine1?: string;
  birthDate?: string;
  birthPlace?: string;
  drivingLicenseNumber?: string;
  preferredLocale?: string;
  timezone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  newEmail?: string;
  code?: string;
}

export interface ProfileApiSuccessResponse<T = undefined> {
  ok: true;
  message: string;
  data?: T;
}

export interface ProfileApiErrorResponse {
  ok: false;
  code: ProfileApiErrorCode;
  message: string;
  fields?: ProfileApiFieldErrors;
  retryAfterSeconds?: number;
}

export type ProfileApiResponse<T = undefined> =
  | ProfileApiSuccessResponse<T>
  | ProfileApiErrorResponse;

export class ProfileServiceError extends Error {
  constructor(
    public readonly code: ProfileApiErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ProfileServiceError";
  }
}
