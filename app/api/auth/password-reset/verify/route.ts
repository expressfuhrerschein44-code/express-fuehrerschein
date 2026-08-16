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
  PasswordResetServiceError,
  verifyPasswordResetCode,
} from "@/lib/server/password-reset-service";

import {
  clearPasswordResetSession,
  issuePasswordResetSession,
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

  const response =
    NextResponse.json<PasswordResetApiResponse>(
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

  return response;
}

function shouldClearSession(
  code:
    PasswordResetApiErrorCode,
): boolean {
  return (
    code ===
      "INVALID_OR_EXPIRED_REQUEST" ||
    code ===
      "TOO_MANY_ATTEMPTS" ||
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
   POST /api/auth/password-reset/verify
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

  if (!session) {
    const response =
      errorResponse(
        "INVALID_OR_EXPIRED_REQUEST",
        "Die Passwort-Zurücksetzung ist ungültig oder abgelaufen.",
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

  /**
   * Idempotent behavior for a browser that submits twice after verification.
   */
  if (
    session.stage ===
    "verified"
  ) {
    const response =
      NextResponse.json<PasswordResetApiResponse>(
        {
          ok:
            true,

          message:
            "Der Sicherheitscode wurde bereits bestätigt.",

          nextPath:
            PASSWORD_RESET_ROUTES
              .newPassword,
        },
        {
          status:
            200,

          headers:
            NO_STORE_HEADERS,
        },
      );

    issuePasswordResetSession(
      response,
      session.requestId,
      "verified",
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
    const result =
      await verifyPasswordResetCode(
        session.requestId,
        body,
      );

    const response =
      NextResponse.json<PasswordResetApiResponse>(
        {
          ok:
            true,

          message:
            "Der Sicherheitscode wurde erfolgreich bestätigt.",

          nextPath:
            PASSWORD_RESET_ROUTES
              .newPassword,
        },
        {
          status:
            200,

          headers:
            NO_STORE_HEADERS,
        },
      );

    issuePasswordResetSession(
      response,
      result.requestId,
      "verified",
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
      "[Express-Führerschein] password reset verification failed",
      error,
    );

    return errorResponse(
      "INTERNAL_ERROR",
      "Der Sicherheitscode konnte nicht geprüft werden. Bitte versuche es erneut.",
    );
  }
}
