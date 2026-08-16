import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  PASSWORD_RESET_ROUTES,
} from "@/data/password-reset";

import {
  getAuthPublicOrigin,
} from "@/lib/server/auth-origin";

import {
  AUTH_SESSION_COOKIE,
  revokeAllUserSessions,
} from "@/lib/server/auth-session";

import {
  completePasswordReset,
  PasswordResetServiceError,
} from "@/lib/server/password-reset-service";

import {
  clearPasswordResetSession,
  readPasswordResetSession,
} from "@/lib/server/password-reset-session";

import type {
  PasswordResetApiErrorCode,
  PasswordResetApiErrorResponse,
  PasswordResetApiResponse,
} from "@/types/password-reset";

/* ==========================================================================
   ROUTE CONFIG
   ========================================================================== */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

const NO_STORE_HEADERS = {
  "Cache-Control":
    "no-store, max-age=0",

  Pragma:
    "no-cache",
} as const;

/* ==========================================================================
   SECURITY
   ========================================================================== */

function requestOriginAllowed(
  request: NextRequest,
): boolean {
  const origin =
    request.headers.get(
      "origin",
    );

  if (!origin) {
    return true;
  }

  try {
    return (
      new URL(origin).origin ===
      getAuthPublicOrigin(
        request,
      )
    );
  } catch {
    return false;
  }
}

function clearAuthCookie(
  response: NextResponse,
): void {
  response.cookies.set(
    AUTH_SESSION_COOKIE,
    "",
    {
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
    },
  );
}

/* ==========================================================================
   RESPONSES
   ========================================================================== */

function statusForError(
  code:
    PasswordResetApiErrorCode,
): number {
  switch (code) {
    case "INVALID_ORIGIN":
      return 403;

    case "VALIDATION_ERROR":
    case "INVALID_CODE":
      return 400;

    case "INVALID_OR_EXPIRED_REQUEST":
      return 410;

    case "REQUEST_NOT_VERIFIED":
      return 409;

    case "ACCOUNT_UNAVAILABLE":
      return 403;

    case "SAME_PASSWORD":
      return 409;

    case "TOO_MANY_ATTEMPTS":
    case "RESEND_TOO_SOON":
    case "TOO_MANY_RESENDS":
    case "RATE_LIMITED":
      return 429;

    case "DELIVERY_FAILED":
      return 503;

    case "INTERNAL_ERROR":
    default:
      return 500;
  }
}

function errorResponse(
  code: PasswordResetApiErrorCode,
  message: string,
  options?: {
    status?: number;
    fields?: PasswordResetApiErrorResponse["fields"];
    retryAfterSeconds?: number;
  },
): NextResponse<PasswordResetApiResponse> {
  const headers:
    Record<string, string> = {
    ...NO_STORE_HEADERS,
  };

  if (
    options?.retryAfterSeconds &&
    options.retryAfterSeconds > 0
  ) {
    headers["Retry-After"] =
      String(
        Math.ceil(
          options.retryAfterSeconds,
        ),
      );
  }

  return NextResponse.json<PasswordResetApiResponse>(
    {
      ok:
        false,

      code,

      message,

      fields:
        options?.fields,

      retryAfterSeconds:
        options?.retryAfterSeconds,
    },
    {
      status:
        options?.status ??
        statusForError(
          code,
        ),

      headers,
    },
  );
}

function shouldClearSession(
  code:
    PasswordResetApiErrorCode,
): boolean {
  return (
    code ===
      "INVALID_OR_EXPIRED_REQUEST" ||
    code ===
      "REQUEST_NOT_VERIFIED" ||
    code ===
      "ACCOUNT_UNAVAILABLE"
  );
}

function serviceErrorResponse(
  error: PasswordResetServiceError,
): NextResponse<PasswordResetApiResponse> {
  const response =
    errorResponse(
      error.code,
      error.message,
      {
        fields:
          error.fields,

        retryAfterSeconds:
          error.retryAfterSeconds,
      },
    );

  if (
    shouldClearSession(
      error.code,
    )
  ) {
    clearPasswordResetSession(
      response,
    );
  }

  return response;
}

/* ==========================================================================
   POST /api/auth/password-reset/complete
   ========================================================================== */

export async function POST(
  request: NextRequest,
) {
  if (
    !requestOriginAllowed(
      request,
    )
  ) {
    return errorResponse(
      "INVALID_ORIGIN",
      "Die Anfrage stammt von einer nicht erlaubten Quelle.",
      {
        status:
          403,
      },
    );
  }

  const session =
    readPasswordResetSession(
      request,
    );

  if (
    !session ||
    session.stage !==
      "verified"
  ) {
    const response =
      errorResponse(
        "REQUEST_NOT_VERIFIED",
        "Bitte bestätige zuerst den Sicherheitscode.",
        {
          status:
            401,
        },
      );

    clearPasswordResetSession(
      response,
    );

    return response;
  }

  let body:
    unknown;

  try {
    body =
      await request.json();
  } catch {
    body =
      {};
  }

  try {
    await completePasswordReset(
      session.requestId,
      body,
      {
        revokeUserSessions:
          async (
            userId,
          ) => {
            await revokeAllUserSessions(
              userId,
            );
          },
      },
    );

    const response =
      NextResponse.json<PasswordResetApiResponse>(
        {
          ok:
            true,

          message:
            "Dein Passwort wurde erfolgreich geändert.",

          nextPath:
            PASSWORD_RESET_ROUTES
              .success,
        },
        {
          status:
            200,

          headers:
            NO_STORE_HEADERS,
        },
      );

    /**
     * The reset token is one-time use.
     * Existing login sessions have already been revoked in the service hook.
     * Clear both browser cookies so the next login always uses the new password.
     */
    clearPasswordResetSession(
      response,
    );

    clearAuthCookie(
      response,
    );

    return response;
  } catch (error) {
    if (
      error instanceof
      PasswordResetServiceError
    ) {
      return serviceErrorResponse(
        error,
      );
    }

    console.error(
      "[Express-Führerschein] password reset completion failed",
      error,
    );

    return errorResponse(
      "INTERNAL_ERROR",
      "Das neue Passwort konnte nicht gespeichert werden. Bitte versuche es erneut.",
    );
  }
}
