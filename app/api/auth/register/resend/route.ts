import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getClientIp,
} from "@/lib/server/client-ip";

import {
  RegistrationServiceError,
  resendVerificationCode,
} from "@/lib/server/registration-service";

import {
  REGISTRATION_SESSION_COOKIE,
} from "@/lib/server/registration-session";

import type {
  RegistrationApiErrorResponse,
  RegistrationResendResponse,
} from "@/types/registration";

/* ==========================================================================
   ROUTE CONFIG
   ========================================================================== */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control":
    "no-store, max-age=0",
  Pragma:
    "no-cache",
} as const;

/* ==========================================================================
   ERROR HANDLING
   ========================================================================== */

function statusForError(
  code:
    RegistrationServiceError["code"],
): number {
  switch (code) {
    case "SESSION_INVALID":
      return 401;

    case "VERIFICATION_NOT_FOUND":
    case "USER_NOT_FOUND":
      return 404;

    case "RESEND_TOO_SOON":
    case "RESEND_LIMIT_REACHED":
    case "RATE_LIMITED":
      return 429;

    case "EMAIL_DELIVERY_FAILED":
      return 503;

    default:
      return 500;
  }
}

function readRetryAfter(
  details: unknown,
): number | undefined {
  if (
    typeof details !== "object" ||
    details === null ||
    Array.isArray(details)
  ) {
    return undefined;
  }

  const value =
    (
      details as {
        retryAfterSeconds?: unknown;
      }
    ).retryAfterSeconds;

  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  )
    ? Math.ceil(value)
    : undefined;
}

function serviceErrorResponse(
  error: RegistrationServiceError,
): NextResponse<RegistrationApiErrorResponse> {
  const retryAfterSeconds =
    readRetryAfter(
      error.details,
    );

  const headers:
    Record<string, string> = {
    ...NO_STORE_HEADERS,
  };

  if (retryAfterSeconds) {
    headers["Retry-After"] =
      String(
        retryAfterSeconds,
      );
  }

  return NextResponse.json(
    {
      ok: false,

      error: {
        code:
          error.code,

        message:
          error.message,

        retryAfterSeconds,
      },
    },

    {
      status:
        statusForError(
          error.code,
        ),

      headers,
    },
  );
}

/* ==========================================================================
   POST /api/auth/register/resend
   ========================================================================== */

export async function POST(
  request: NextRequest,
) {
  const sessionToken =
    request.cookies.get(
      REGISTRATION_SESSION_COOKIE,
    )?.value;

  if (!sessionToken) {
    return NextResponse.json<
      RegistrationApiErrorResponse
    >(
      {
        ok: false,

        error: {
          code:
            "SESSION_INVALID",

          message:
            "Die Registrierungssitzung ist ungültig oder abgelaufen.",
        },
      },

      {
        status: 401,
        headers:
          NO_STORE_HEADERS,
      },
    );
  }

  const {
    ip,
  } =
    getClientIp(
      request.headers,
    );

  try {
    const result =
      await resendVerificationCode(
        sessionToken,
        ip,
      );

    const response:
      RegistrationResendResponse = {
      ok: true,

      data: {
        emailMasked:
          result.emailMasked,

        cooldownSeconds:
          result.cooldownSeconds,
      },
    };

    return NextResponse.json(
      response,
      {
        status: 200,
        headers:
          NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    if (
      error instanceof
        RegistrationServiceError
    ) {
      return serviceErrorResponse(
        error,
      );
    }

    console.error(
      "[Express-Führerschein] registration resend failed",
      error,
    );

    return NextResponse.json<
      RegistrationApiErrorResponse
    >(
      {
        ok: false,

        error: {
          code:
            "INTERNAL_ERROR",

          message:
            "Der Bestätigungscode konnte nicht erneut gesendet werden. Bitte versuche es erneut.",
        },
      },

      {
        status: 500,
        headers:
          NO_STORE_HEADERS,
      },
    );
  }
}
