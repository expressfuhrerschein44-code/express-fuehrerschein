import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

export interface SettingsRepositoryRecord {
  account: {
    firstName: string;
    lastName: string;
    email: string;
    phoneE164: string;
    countryCode: string;
  };
  preferences: {
    preferredLocale: string;
    timezone: string;
  };
}

export async function getSettingsRepositoryRecord(
  userId: string,
): Promise<SettingsRepositoryRecord> {
  const user =
    await prisma.users.findUnique({
      where: {
        id:
          userId,
      },
      select: {
        first_name:
          true,
        last_name:
          true,
        email:
          true,
        phone_e164:
          true,
        country_code:
          true,
        user_profile: {
          select: {
            preferred_locale:
              true,
            timezone:
              true,
          },
        },
      },
    });

  if (!user) {
    throw new Error(
      "[Express-Führerschein] Benutzer wurde nicht gefunden.",
    );
  }

  return {
    account: {
      firstName:
        user.first_name,
      lastName:
        user.last_name,
      email:
        user.email,
      phoneE164:
        user.phone_e164,
      countryCode:
        user.country_code,
    },
    preferences: {
      preferredLocale:
        user.user_profile
          ?.preferred_locale
          ?.trim() ||
        "de",
      timezone:
        user.user_profile
          ?.timezone
          ?.trim() ||
        "Europe/Berlin",
    },
  };
}

export async function saveSettingsPreferences(
  input: {
    userId: string;
    preferredLocale: string;
    timezone: string;
  },
): Promise<{
  preferredLocale: string;
  timezone: string;
}> {
  const existingUser =
    await prisma.users.findUnique({
      where: {
        id:
          input.userId,
      },
      select: {
        id:
          true,
      },
    });

  if (!existingUser) {
    throw new Error(
      "[Express-Führerschein] Benutzer wurde nicht gefunden.",
    );
  }

  const profile =
    await prisma.user_profiles.upsert({
      where: {
        user_id:
          input.userId,
      },
      create: {
        user_id:
          input.userId,
        preferred_locale:
          input.preferredLocale,
        timezone:
          input.timezone,
      },
      update: {
        preferred_locale:
          input.preferredLocale,
        timezone:
          input.timezone,
      },
      select: {
        preferred_locale:
          true,
        timezone:
          true,
      },
    });

  return {
    preferredLocale:
      profile.preferred_locale,
    timezone:
      profile.timezone,
  };
}
