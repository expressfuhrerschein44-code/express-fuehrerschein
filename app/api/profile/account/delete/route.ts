/**
 * Express-Führerschein
 * DELETE /api/profile/account/delete
 *
 * Destructive workflow:
 * - same-origin request;
 * - authenticated session;
 * - exact confirmation word;
 * - current-password verification;
 * - best-effort avatar cleanup;
 * - user deletion through the existing repository;
 * - ef_session cookie expiration.
 */

import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

import {
  getAuthPublicOrigin,
} from "@/lib/server/auth-origin";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  verifyPassword,
} from "@/lib/server/password";

import {
  deleteProfileAvatar,
} from "@/lib/server/profile/profile-avatar-storage";

import {
  findProfileByUserId,
} from "@/lib/server/profile/profile-repository";

import {
  sessionRepository,
} from "@/lib/server/repositories/session-repository";

import {
  userRepository,
} from "@/lib/server/repositories/user-repository";

import {
  ProfileServiceError,
} from "@/types/profile";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;



/* ==========================================================================
   REQUEST ORIGIN
   ========================================================================== */

/**
 * Uses the same origin validation pattern already used by the project's
 * password-reset route.
 *
 * getAuthPublicOrigin() is the existing export from lib/server/auth-origin.ts.
 */
function requestOriginAllowed(
  request:
    NextRequest,
): boolean {
  const origin =
    request.headers.get(
      "origin",
    );

  /**
   * Some same-origin/server-originated requests may not include Origin.
   * This mirrors the existing authentication route behavior.
   */
  if (
    !origin
  ) {
    return true;
  }

  try {
    return (
      new URL(
        origin,
      ).origin ===
      getAuthPublicOrigin(
        request,
      )
    );
  } catch {
    return false;
  }
}

const NO_STORE_HEADERS = {
  "Cache-Control":
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma:
    "no-cache",
  Expires:
    "0",
} as const;

async function requireProfileUserId():
  Promise<string> {
  try {
    const session =
      await requireClientSession();

    return session
      .user
      .id;
  } catch {
    throw new ProfileServiceError(
      "UNAUTHENTICATED",

      "Bitte melde dich erneut an.",
    );
  }
}

function clearAuthenticationCookie(
  response:
    NextResponse,
) {
  response.cookies.set({
    name:
      "ef_session",

    value:
      "",

    httpOnly:
      true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite:
      "lax",

    path:
      "/",

    maxAge:
      0,
  });
}

export async function DELETE(
  request:
    NextRequest,
) {
  if (
    !requestOriginAllowed(
      request,
    )
  ) {
    return NextResponse.json(
      {
        ok:
          false,

        code:
          "UNAUTHENTICATED",

        message:
          "Die Anfrage stammt von einer nicht erlaubten Quelle.",
      },
      {
        status:
          403,

        headers:
          NO_STORE_HEADERS,
      },
    );
  }

  let currentPassword:
    string;

  let confirmation:
    string;

  try {
    const body =
      await request.json() as
        Record<string, unknown>;

    currentPassword =
      typeof body.currentPassword ===
        "string"
        ? body.currentPassword
        : "";

    confirmation =
      typeof body.confirmation ===
        "string"
        ? body.confirmation
            .trim()
        : "";
  } catch {
    currentPassword =
      "";

    confirmation =
      "";
  }

  if (
    confirmation !==
      "LÖSCHEN" ||
    !currentPassword
  ) {
    return NextResponse.json(
      {
        ok:
          false,

        code:
          "VALIDATION_ERROR",

        message:
          "Bitte bestätige die Kontolöschung vollständig.",
      },
      {
        status:
          400,

        headers:
          NO_STORE_HEADERS,
      },
    );
  }

  try {
    const userId =
      await requireProfileUserId();

    const profile =
      await findProfileByUserId(
        userId,
      );

    if (
      !profile
    ) {
      throw new ProfileServiceError(
        "ACCOUNT_UNAVAILABLE",

        "Das Konto konnte nicht gefunden werden.",
      );
    }

    const passwordValid =
      await verifyPassword(
        currentPassword,
        profile.passwordHash,
      );

    if (
      !passwordValid
    ) {
      throw new ProfileServiceError(
        "INVALID_CURRENT_PASSWORD",

        "Das aktuelle Passwort ist nicht korrekt.",
      );
    }

    /**
     * Explicitly revoke sessions first. The users FK cascade will also remove
     * them, but revocation makes the intent clear before destructive deletion.
     */
    await sessionRepository
      .revokeAllForUser(
        userId,
      );

    await userRepository
      .deleteById(
        userId,
      );

    if (
      profile.avatarPath
    ) {
      await deleteProfileAvatar(
        profile.avatarPath,
      )
        .catch(
          (
            error:
              unknown,
          ) => {
            console.error(
              "[PROFILE_ACCOUNT_DELETE_AVATAR_CLEANUP_ERROR]",
              error,
            );
          },
        );
    }

    const response =
      NextResponse.json(
        {
          ok:
            true,

          message:
            "Dein Konto wurde gelöscht.",
        },
        {
          status:
            200,

          headers:
            NO_STORE_HEADERS,
        },
      );

    clearAuthenticationCookie(
      response,
    );

    return response;
  } catch (
    error:
      unknown
  ) {
    if (
      error instanceof
      ProfileServiceError
    ) {
      const status =
        error.code ===
          "UNAUTHENTICATED"
          ? 401
          : error.code ===
              "INVALID_CURRENT_PASSWORD"
            ? 401
            : error.code ===
                "ACCOUNT_UNAVAILABLE"
              ? 404
              : 500;

      return NextResponse.json(
        {
          ok:
            false,

          code:
            error.code,

          message:
            error.message,
        },
        {
          status,

          headers:
            NO_STORE_HEADERS,
        },
      );
    }

    console.error(
      "[PROFILE_ACCOUNT_DELETE_ROUTE_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        code:
          "INTERNAL_ERROR",

        message:
          "Das Konto konnte gerade nicht gelöscht werden.",
      },
      {
        status:
          500,

        headers:
          NO_STORE_HEADERS,
      },
    );
  }
}
