/**
 * Express-Führerschein
 * Client application-shell service.
 *
 * Server-side source of truth for:
 * - authenticated user summary;
 * - preferred language;
 * - main driving-license class;
 * - navigation badges;
 * - desktop/mobile navigation data;
 * - private profile-avatar URL resolution.
 */

import "server-only";

import {
  CLIENT_BOTTOM_NAVIGATION,
  CLIENT_NAVIGATION,
} from "@/data/client-navigation";

import {
  ClientSessionError,
  requireClientSession,
} from "@/lib/server/client-session";

import {
  prisma,
} from "@/lib/server/prisma";

import {
  createProfileAvatarSignedUrl,
} from "@/lib/server/profile/profile-avatar-storage";

import {
  ClientShellServiceError,
} from "@/types/client-shell";

import type {
  ClientNavigationBadgeValues,
  ClientNavigationItem,
  ResolvedClientNavigationItem,
} from "@/types/client-navigation";

import type {
  ClientShellData,
  ClientShellLocale,
  ClientShellPrimaryLicenseClass,
  ClientShellUser,
} from "@/types/client-shell";

/* ==========================================================================
   HELPERS
   ========================================================================== */

function createInitials(
  firstName:
    string,

  lastName:
    string,
): string {
  const first =
    firstName
      .trim()
      .charAt(
        0,
      );

  const last =
    lastName
      .trim()
      .charAt(
        0,
      );

  const initials =
    `${first}${last}`
      .toUpperCase();

  return (
    initials ||
    "EF"
  );
}

function createDisplayName(
  firstName:
    string,

  lastName:
    string,
): string {
  return [
    firstName.trim(),
    lastName.trim(),
  ]
    .filter(
      Boolean,
    )
    .join(
      " ",
    );
}

function resolveBadgeCount(
  item:
    ClientNavigationItem,

  badges:
    ClientNavigationBadgeValues,
): number | null {
  if (
    !item.badgeKey
  ) {
    return null;
  }

  const value =
    badges[
      item.badgeKey
    ];

  return Math.max(
    0,
    value,
  );
}

function resolveNavigation(
  items:
    readonly ClientNavigationItem[],

  badges:
    ClientNavigationBadgeValues,
): readonly ResolvedClientNavigationItem[] {
  return items.map(
    (
      item,
    ) => ({
      ...item,

      badgeCount:
        resolveBadgeCount(
          item,
          badges,
        ),
    }),
  );
}

function normalizeLocale(
  value:
    string,
): ClientShellLocale {
  switch (
    value
      .trim()
      .toLowerCase()
  ) {
    case "de":
    case "fr":
    case "nl":
    case "es":
    case "it":
    case "en":
      return value
        .trim()
        .toLowerCase() as
        ClientShellLocale;

    default:
      return "de";
  }
}

/**
 * Converts the persisted avatar reference into a browser-renderable URL.
 *
 * Database:
 *   user_profiles.avatar_path
 *   = user-id/file.png
 *
 * Browser:
 *   user.avatarPath
 *   = short-lived signed Supabase Storage URL
 *
 * We intentionally keep the existing ClientShellUser field name
 * `avatarPath` to preserve the public contract and avoid breaking
 * the shell components/types.
 */
async function resolveClientAvatarUrl(
  value:
    string | null | undefined,
): Promise<string | null> {
  const normalized =
    value
      ?.trim();

  if (
    !normalized
  ) {
    return null;
  }

  /**
   * Preserve a local application path if an older profile record uses one.
   */
  if (
    normalized.startsWith(
      "/",
    )
  ) {
    return normalized;
  }

  /**
   * Preserve an already-resolved absolute URL.
   */
  try {
    const url =
      new URL(
        normalized,
      );

    if (
      url.protocol ===
        "https:" ||
      url.protocol ===
        "http:"
    ) {
      return url.toString();
    }
  } catch {
    /**
     * Expected for a normal private Storage object path.
     */
  }

  /**
   * createProfileAvatarSignedUrl() is intentionally best-effort.
   * It returns null if Storage is temporarily unavailable or not configured,
   * allowing the shell to fall back to initials instead of crashing.
   */
  return createProfileAvatarSignedUrl(
    normalized,
  );
}

/* ==========================================================================
   SERVICE
   ========================================================================== */

export async function getClientShellData():
  Promise<ClientShellData> {
  let session;

  try {
    session =
      await requireClientSession();
  } catch (
    error:
      unknown
  ) {
    if (
      error instanceof
      ClientSessionError
    ) {
      const code =
        error.reason ===
        "ACCOUNT_NOT_ACTIVE"
          ? "ACCOUNT_UNAVAILABLE"
          : "UNAUTHENTICATED";

      throw new ClientShellServiceError(
        code,

        "Bitte melde dich an, um deinen persönlichen Bereich zu öffnen.",
      );
    }

    throw error;
  }

  const userId =
    session.user.id;

  try {
    const [
      primaryLicenseClass,
      unreadNotifications,
      avatarUrl,
    ] =
      await Promise.all([
        prisma
          .user_license_classes
          .findFirst({
            where: {
              user_id:
                userId,

              status: {
                not:
                  "archived",
              },
            },

            orderBy: [
              {
                is_primary:
                  "desc",
              },

              {
                created_at:
                  "asc",
              },
            ],

            select: {
              id:
                true,

              license_class_code:
                true,

              status:
                true,

              is_primary:
                true,

              target_exam_date:
                true,
            },
          }),

        prisma
          .user_notifications
          .count({
            where: {
              user_id:
                userId,

              read_at:
                null,
            },
          }),

        resolveClientAvatarUrl(
          session
            .user
            .avatarPath,
        ),
      ]);

    /**
     * Messages will receive their own persistence model later.
     * Until then, keep the badge at zero rather than displaying
     * a fake count from the reference mockup.
     */
    const unreadMessages =
      0;

    const badges:
      ClientNavigationBadgeValues = {
      unreadMessages,

      unreadNotifications,
    };

    const user:
      ClientShellUser = {
      id:
        session.user.id,

      firstName:
        session
          .user
          .firstName,

      lastName:
        session
          .user
          .lastName,

      displayName:
        createDisplayName(
          session
            .user
            .firstName,

          session
            .user
            .lastName,
        ),

      initials:
        createInitials(
          session
            .user
            .firstName,

          session
            .user
            .lastName,
        ),

      email:
        session.user.email,

      countryCode:
        session
          .user
          .countryCode,

      preferredLocale:
        normalizeLocale(
          session
            .user
            .preferredLocale,
        ),

      timezone:
        session
          .user
          .timezone,

      /**
       * Public shell contract remains named `avatarPath`, but the value sent
       * to client components is now a renderable URL, never the raw private
       * Storage object path.
       */
      avatarPath:
        avatarUrl,
    };

    const resolvedPrimaryLicenseClass:
      ClientShellPrimaryLicenseClass | null =
      primaryLicenseClass
        ? {
            id:
              primaryLicenseClass.id,

            code:
              primaryLicenseClass
                .license_class_code,

            status:
              primaryLicenseClass.status,

            isPrimary:
              primaryLicenseClass
                .is_primary,

            targetExamDate:
              primaryLicenseClass
                .target_exam_date
                ?.toISOString()
                .slice(
                  0,
                  10,
                ) ??
              null,
          }
        : null;

    return {
      user,

      primaryLicenseClass:
        resolvedPrimaryLicenseClass,

      notifications: {
        unreadMessages,

        unreadNotifications,
      },

      navigation:
        resolveNavigation(
          CLIENT_NAVIGATION,
          badges,
        ),

      bottomNavigation:
        resolveNavigation(
          CLIENT_BOTTOM_NAVIGATION,
          badges,
        ),
    };
  } catch (
    error:
      unknown
  ) {
    if (
      error instanceof
      ClientShellServiceError
    ) {
      throw error;
    }

    console.error(
      "[CLIENT_SHELL_SERVICE_DATABASE_ERROR]",
      error instanceof Error
        ? error.message
        : error,
    );

    throw new ClientShellServiceError(
      "DATABASE_ERROR",

      "Der persönliche Bereich konnte gerade nicht geladen werden.",
    );
  }
}
