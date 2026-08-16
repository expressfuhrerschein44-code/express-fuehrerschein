/**
 * Express-Führerschein
 * POST /api/profile/email/change/verify
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
  prisma,
} from "@/lib/server/prisma";

import {
  verifyAndCompleteProfileEmailChange,
} from "@/lib/server/profile/profile-email-change-service";

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

function statusForProfileError(
  code:
    ProfileServiceError["code"],
): number {
  switch (
    code
  ) {
    case "VALIDATION_ERROR":
    case "SAME_PASSWORD":
    case "INVALID_CODE":
    case "TWO_FACTOR_INVALID_CODE":
      return 400;

    case "UNAUTHENTICATED":
    case "INVALID_CURRENT_PASSWORD":
      return 401;

    case "ACCOUNT_UNAVAILABLE":
    case "EMAIL_CHANGE_NOT_FOUND":
      return 404;

    case "EMAIL_ALREADY_IN_USE":
      return 409;

    case "EMAIL_CHANGE_EXPIRED":
      return 410;

    case "AVATAR_TOO_LARGE":
      return 413;

    case "AVATAR_INVALID_TYPE":
      return 415;

    case "TOO_MANY_ATTEMPTS":
      return 429;

    case "EMAIL_CHANGE_NOT_READY":
    case "TWO_FACTOR_NOT_READY":
    case "AVATAR_STORAGE_NOT_CONFIGURED":
    case "DATABASE_ERROR":
      return 503;

    case "INTERNAL_ERROR":
    default:
      return 500;
  }
}

function profileServiceErrorResponse(
  error:
    ProfileServiceError,
) {
  return NextResponse.json(
    {
      ok:
        false,

      code:
        error.code,

      message:
        error.message,

      fields:
        (
          typeof error.details ===
            "object" &&
          error.details !==
            null &&
          !Array.isArray(
            error.details,
          )
        )
          ? error.details
          : undefined,
    },
    {
      status:
        statusForProfileError(
          error.code,
        ),

      headers:
        NO_STORE_HEADERS,
    },
  );
}

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

export async function POST(
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

  let body:
    unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        ok:
          false,

        code:
          "VALIDATION_ERROR",

        message:
          "Die Anfrage enthält keine gültigen Daten.",
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

    const result =
      await verifyAndCompleteProfileEmailChange(
        userId,
        body,
      );

    /**
     * Ownership of the new address has just been proven with the e-mail code.
     * Refresh the verification timestamp to represent the new address.
     */
    await prisma
      .users
      .update({
        where: {
          id:
            userId,
        },

        data: {
          email_verified_at:
            new Date(),

          updated_at:
            new Date(),
        },
      });

    return NextResponse.json(
      {
        ok:
          true,

        message:
          "Deine E-Mail-Adresse wurde erfolgreich geändert.",

        data:
          result,
      },
      {
        status:
          200,

        headers:
          NO_STORE_HEADERS,
      },
    );
  } catch (
    error:
      unknown
  ) {
    if (
      error instanceof
      ProfileServiceError
    ) {
      return profileServiceErrorResponse(
        error,
      );
    }

    console.error(
      "[PROFILE_EMAIL_CHANGE_VERIFY_ROUTE_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        code:
          "INTERNAL_ERROR",

        message:
          "Die E-Mail-Adresse konnte gerade nicht geändert werden.",
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
