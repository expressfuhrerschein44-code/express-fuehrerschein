/**
 * Express-Führerschein
 * Profile application service.
 */

import "server-only";

import { requireClientSession } from "@/lib/server/client-session";
import { normalizePhoneNumber } from "@/lib/server/phone-country";

import {
  createProfileAvatarSignedUrl,
  deleteProfileAvatar,
  uploadProfileAvatar,
} from "@/lib/server/profile/profile-avatar-storage";

import {
  findProfileByUserId,
  updateProfileAvatarPath,
  updateProfileByUserId,
} from "@/lib/server/profile/profile-repository";

import {
  getProfileSecurityState,
} from "@/lib/server/profile/profile-security-service";

import { validateUpdateProfileInput } from "@/lib/validation/profile";

import type {
  ProfileAvatarUploadInput,
  ProfileData,
} from "@/types/profile";

import { ProfileServiceError } from "@/types/profile";

async function currentUserId(): Promise<string> {
  try {
    const session = await requireClientSession();
    return session.user.id;
  } catch {
    throw new ProfileServiceError(
      "UNAUTHENTICATED",
      "Bitte melde dich an, um dein Profil zu öffnen.",
    );
  }
}

export async function getProfileData(): Promise<ProfileData> {
  const userId = await currentUserId();

  try {
    const [profile, security] = await Promise.all([
      findProfileByUserId(userId),
      getProfileSecurityState(userId),
    ]);

    if (!profile) {
      throw new ProfileServiceError(
        "ACCOUNT_UNAVAILABLE",
        "Das Profil konnte nicht gefunden werden.",
      );
    }

    return {
      generatedAt: new Date().toISOString(),

      identity: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        displayName: [profile.firstName, profile.lastName]
          .filter(Boolean)
          .join(" "),
        email: profile.email,
        phoneE164: profile.phoneE164,
        countryCode: profile.countryCode,
        emailVerified: Boolean(profile.emailVerifiedAt),
        accountStatus: profile.status,
        memberSince: profile.createdAt.toISOString(),
      },

      preferences: {
        preferredLocale: profile.preferredLocale,
        timezone: profile.timezone,
      },

      address: {
        city: profile.city,
        postalCode: profile.postalCode,
        addressLine1: profile.addressLine1,
      },

      additional: {
        birthDate:
          profile.birthDate?.toISOString().slice(0, 10) ?? null,
        birthPlace: profile.birthPlace,
        drivingLicenseNumber: profile.drivingLicenseNumber,
      },

      avatar: {
        path: profile.avatarPath,
        url: profile.avatarPath
          ? await createProfileAvatarSignedUrl(profile.avatarPath)
          : null,
      },

      security,
    };
  } catch (error) {
    if (error instanceof ProfileServiceError) throw error;

    console.error(
      "[PROFILE_SERVICE_READ_ERROR]",
      error instanceof Error ? error.message : error,
    );

    throw new ProfileServiceError(
      "DATABASE_ERROR",
      "Dein Profil konnte gerade nicht geladen werden.",
    );
  }
}

export async function updateCurrentProfile(
  rawInput: unknown,
): Promise<void> {
  const userId = await currentUserId();
  const validation = validateUpdateProfileInput(rawInput);

  if (!validation.success) {
    throw new ProfileServiceError(
      "VALIDATION_ERROR",
      "Die Profildaten sind ungültig.",
      validation.errors,
    );
  }

  const input = validation.data;

  const phone = normalizePhoneNumber(
    input.phone,
    input.countryCode,
  );

  if (!phone) {
    throw new ProfileServiceError(
      "VALIDATION_ERROR",
      "Die Telefonnummer ist für das ausgewählte Land ungültig.",
      {
        phone: "Bitte gib eine gültige Telefonnummer ein.",
      },
    );
  }

  try {
    await updateProfileByUserId(userId, {
      firstName: input.firstName,
      lastName: input.lastName,
      phoneE164: phone.e164,
      countryCode: input.countryCode,
      preferredLocale: input.preferredLocale,
      timezone: input.timezone,
      city: input.city ?? null,
      postalCode: input.postalCode ?? null,
      addressLine1: input.addressLine1 ?? null,
      birthDate: input.birthDate
        ? new Date(`${input.birthDate}T00:00:00.000Z`)
        : null,
      birthPlace: input.birthPlace ?? null,
      drivingLicenseNumber: input.drivingLicenseNumber ?? null,
    });
  } catch (error) {
    console.error(
      "[PROFILE_SERVICE_UPDATE_ERROR]",
      error instanceof Error ? error.message : error,
    );

    throw new ProfileServiceError(
      "DATABASE_ERROR",
      "Deine Profildaten konnten nicht gespeichert werden.",
    );
  }
}

export async function uploadCurrentProfileAvatar(
  input: Omit<ProfileAvatarUploadInput, "userId">,
): Promise<{ path: string; url: string | null }> {
  const userId = await currentUserId();
  const current = await findProfileByUserId(userId);

  if (!current) {
    throw new ProfileServiceError(
      "ACCOUNT_UNAVAILABLE",
      "Das Profil konnte nicht gefunden werden.",
    );
  }

  const uploaded = await uploadProfileAvatar({
    ...input,
    userId,
  });

  try {
    await updateProfileAvatarPath(userId, uploaded.path);
  } catch (error) {
    await deleteProfileAvatar(uploaded.path).catch(() => undefined);
    throw error;
  }

  if (current.avatarPath && current.avatarPath !== uploaded.path) {
    await deleteProfileAvatar(current.avatarPath).catch((error) => {
      console.error(
        "[PROFILE_AVATAR_OLD_DELETE_ERROR]",
        error instanceof Error ? error.message : error,
      );
    });
  }

  return uploaded;
}

export async function removeCurrentProfileAvatar(): Promise<void> {
  const userId = await currentUserId();
  const current = await findProfileByUserId(userId);

  if (!current) {
    throw new ProfileServiceError(
      "ACCOUNT_UNAVAILABLE",
      "Das Profil konnte nicht gefunden werden.",
    );
  }

  await updateProfileAvatarPath(userId, null);

  if (current.avatarPath) {
    await deleteProfileAvatar(current.avatarPath).catch((error) => {
      console.error(
        "[PROFILE_AVATAR_DELETE_ERROR]",
        error instanceof Error ? error.message : error,
      );
    });
  }
}
