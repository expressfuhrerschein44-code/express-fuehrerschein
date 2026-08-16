/**
 * Express-Führerschein
 * Profile repository.
 *
 * Prisma compatibility:
 * - no Prisma.sql dependency;
 * - no generic type arguments on raw-query methods;
 * - no implicitly-any interactive transaction callback;
 * - all raw SQL values use PostgreSQL placeholders.
 *
 * Migration compatibility:
 * optional Profile columns are detected at runtime, so /profil keeps working
 * before the additive Profile migration is applied.
 */

import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  ProfileCountryCode,
  ProfileLocale,
} from "@/types/profile";

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface ProfileRepositoryRecord {
  id:
    string;

  firstName:
    string;

  lastName:
    string;

  email:
    string;

  phoneE164:
    string;

  countryCode:
    ProfileCountryCode;

  passwordHash:
    string;

  emailVerifiedAt:
    Date | null;

  status:
    string;

  createdAt:
    Date;

  preferredLocale:
    ProfileLocale;

  timezone:
    string;

  avatarPath:
    string | null;

  city:
    string | null;

  postalCode:
    string | null;

  addressLine1:
    string | null;

  birthDate:
    Date | null;

  birthPlace:
    string | null;

  drivingLicenseNumber:
    string | null;
}

export interface UpdateProfileRepositoryInput {
  firstName:
    string;

  lastName:
    string;

  phoneE164:
    string;

  countryCode:
    ProfileCountryCode;

  preferredLocale:
    ProfileLocale;

  timezone:
    string;

  city:
    string | null;

  postalCode:
    string | null;

  addressLine1:
    string | null;

  birthDate:
    Date | null;

  birthPlace:
    string | null;

  drivingLicenseNumber:
    string | null;
}

interface InformationSchemaColumnRow {
  column_name:
    string;
}

interface ExtendedProfileRow {
  city:
    string | null;

  postal_code:
    string | null;

  address_line1:
    string | null;

  birth_date:
    Date | null;

  birth_place:
    string | null;

  driving_license_number:
    string | null;
}

/* ==========================================================================
   OPTIONAL PROFILE COLUMNS
   ========================================================================== */

let extendedColumnsCache:
  boolean | null =
  null;

async function hasExtendedProfileColumns():
  Promise<boolean> {
  if (
    extendedColumnsCache !==
    null
  ) {
    return extendedColumnsCache;
  }

  const rows =
    (
      await prisma
        .$queryRawUnsafe(
          `
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'user_profiles'
              AND column_name IN (
                'city',
                'postal_code',
                'address_line1',
                'birth_date',
                'birth_place',
                'driving_license_number'
              )
          `,
        )
    ) as
      InformationSchemaColumnRow[];

  const names =
    new Set(
      rows.map(
        (
          row,
        ) =>
          row.column_name,
      ),
    );

  extendedColumnsCache =
    [
      "city",
      "postal_code",
      "address_line1",
      "birth_date",
      "birth_place",
      "driving_license_number",
    ].every(
      (
        name,
      ) =>
        names.has(
          name,
        ),
    );

  return extendedColumnsCache;
}

async function readExtendedProfile(
  userId:
    string,
): Promise<{
  city:
    string | null;

  postalCode:
    string | null;

  addressLine1:
    string | null;

  birthDate:
    Date | null;

  birthPlace:
    string | null;

  drivingLicenseNumber:
    string | null;
}> {
  if (
    !await hasExtendedProfileColumns()
  ) {
    return {
      city:
        null,

      postalCode:
        null,

      addressLine1:
        null,

      birthDate:
        null,

      birthPlace:
        null,

      drivingLicenseNumber:
        null,
    };
  }

  const rows =
    (
      await prisma
        .$queryRawUnsafe(
          `
            SELECT
              city,
              postal_code,
              address_line1,
              birth_date,
              birth_place,
              driving_license_number
            FROM user_profiles
            WHERE user_id = $1::uuid
            LIMIT 1
          `,
          userId,
        )
    ) as
      ExtendedProfileRow[];

  const row =
    rows[0];

  return {
    city:
      row?.city ??
      null,

    postalCode:
      row?.postal_code ??
      null,

    addressLine1:
      row?.address_line1 ??
      null,

    birthDate:
      row?.birth_date ??
      null,

    birthPlace:
      row?.birth_place ??
      null,

    drivingLicenseNumber:
      row?.driving_license_number ??
      null,
  };
}

/* ==========================================================================
   READ
   ========================================================================== */

export async function findProfileByUserId(
  userId:
    string,
): Promise<ProfileRepositoryRecord | null> {
  const user =
    await prisma
      .users
      .findUnique({
        where: {
          id:
            userId,
        },

        select: {
          id:
            true,

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

          password_hash:
            true,

          email_verified_at:
            true,

          status:
            true,

          created_at:
            true,

          user_profile: {
            select: {
              preferred_locale:
                true,

              timezone:
                true,

              avatar_path:
                true,
            },
          },
        },
      });

  if (
    !user
  ) {
    return null;
  }

  const extended =
    await readExtendedProfile(
      user.id,
    );

  return {
    id:
      user.id,

    firstName:
      user.first_name,

    lastName:
      user.last_name,

    email:
      user.email,

    phoneE164:
      user.phone_e164,

    countryCode:
      user.country_code as
        ProfileCountryCode,

    passwordHash:
      user.password_hash,

    emailVerifiedAt:
      user.email_verified_at,

    status:
      user.status,

    createdAt:
      user.created_at,

    preferredLocale:
      (
        user
          .user_profile
          ?.preferred_locale ??
        "de"
      ) as
        ProfileLocale,

    timezone:
      user
        .user_profile
        ?.timezone ??
      "Europe/Berlin",

    avatarPath:
      user
        .user_profile
        ?.avatar_path ??
      null,

    ...extended,
  };
}

/* ==========================================================================
   UPDATE
   ========================================================================== */

export async function updateProfileByUserId(
  userId:
    string,

  input:
    UpdateProfileRepositoryInput,
): Promise<void> {
  /**
   * Array transaction avoids an untyped interactive-transaction callback.
   */
  await prisma
    .$transaction([
      prisma
        .users
        .update({
          where: {
            id:
              userId,
          },

          data: {
            first_name:
              input.firstName,

            last_name:
              input.lastName,

            phone_e164:
              input.phoneE164,

            country_code:
              input.countryCode,

            updated_at:
              new Date(),
          },
        }),

      prisma
        .user_profiles
        .upsert({
          where: {
            user_id:
              userId,
          },

          create: {
            user_id:
              userId,

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
        }),
    ]);

  if (
    await hasExtendedProfileColumns()
  ) {
    await prisma
      .$executeRawUnsafe(
        `
          UPDATE user_profiles
          SET
            city = $1,
            postal_code = $2,
            address_line1 = $3,
            birth_date = $4,
            birth_place = $5,
            driving_license_number = $6,
            updated_at = NOW()
          WHERE user_id = $7::uuid
        `,
        input.city,
        input.postalCode,
        input.addressLine1,
        input.birthDate,
        input.birthPlace,
        input.drivingLicenseNumber,
        userId,
      );
  }
}

export async function updateProfileAvatarPath(
  userId:
    string,

  avatarPath:
    string | null,
): Promise<void> {
  await prisma
    .user_profiles
    .upsert({
      where: {
        user_id:
          userId,
      },

      create: {
        user_id:
          userId,

        avatar_path:
          avatarPath,
      },

      update: {
        avatar_path:
          avatarPath,
      },
    });
}

/* ==========================================================================
   EMAIL
   ========================================================================== */

export async function emailBelongsToAnotherUser(
  email:
    string,

  currentUserId:
    string,
): Promise<boolean> {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase();

  const row =
    await prisma
      .users
      .findFirst({
        where: {
          id: {
            not:
              currentUserId,
          },

          email:
            normalizedEmail,
        },

        select: {
          id:
            true,
        },
      });

  return Boolean(
    row,
  );
}
