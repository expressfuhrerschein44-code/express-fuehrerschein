/**
 * Express-Führerschein
 * POST /api/profile/avatar/upload
 */

import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

import {
  PROFILE_AVATAR_MIME_TYPES,
  PROFILE_LIMITS,
} from "@/data/profile";

import {
  getAuthPublicOrigin,
} from "@/lib/server/auth-origin";

import {
  uploadCurrentProfileAvatar,
} from "@/lib/server/profile/profile-service";

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

  try {
    const formData =
      await request.formData();

    const file =
      formData.get(
        "file",
      );

    if (
      !(file instanceof File)
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            "VALIDATION_ERROR",

          message:
            "Bitte wähle ein Profilbild aus.",
        },
        {
          status:
            400,

          headers:
            NO_STORE_HEADERS,
        },
      );
    }

    if (
      file.size >
      PROFILE_LIMITS
        .avatarMaxBytes
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            "AVATAR_TOO_LARGE",

          message:
            "Das Profilbild darf maximal 8 MB groß sein.",
        },
        {
          status:
            413,

          headers:
            NO_STORE_HEADERS,
        },
      );
    }

    if (
      !PROFILE_AVATAR_MIME_TYPES
        .includes(
          file.type as
            typeof PROFILE_AVATAR_MIME_TYPES[number],
        )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            "AVATAR_INVALID_TYPE",

          message:
            "Bitte verwende JPG, PNG oder WEBP.",
        },
        {
          status:
            415,

          headers:
            NO_STORE_HEADERS,
        },
      );
    }

    const bytes =
      new Uint8Array(
        await file.arrayBuffer(),
      );

    const result =
      await uploadCurrentProfileAvatar({
        bytes,

        mimeType:
          file.type,

        originalFilename:
          file.name,
      });

    return NextResponse.json(
      {
        ok:
          true,

        message:
          "Dein Profilbild wurde aktualisiert.",

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
      "[PROFILE_AVATAR_UPLOAD_ROUTE_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        code:
          "INTERNAL_ERROR",

        message:
          "Das Profilbild konnte gerade nicht hochgeladen werden.",
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
