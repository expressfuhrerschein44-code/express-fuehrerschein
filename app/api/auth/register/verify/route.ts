import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  REGISTRATION_ROUTES,
} from "@/data/registration";

import {
  getClientIp,
} from "@/lib/server/client-ip";

import {
  RegistrationServiceError,
  verifyRegistration,
} from "@/lib/server/registration-service";

import {
  REGISTRATION_SESSION_COOKIE,
} from "@/lib/server/registration-session";

import type {
  RegistrationApiErrorResponse,
  RegistrationVerifyResponse,
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
    case "CODE_INVALID":
      return 400;

    case "SESSION_INVALID":
      return 401;

    case "VERIFICATION_NOT_FOUND":
    case "USER_NOT_FOUND":
      return 404;

    case "CODE_EXPIRED":
      return 410;

    case "TOO_MANY_ATTEMPTS":
    case "RATE_LIMITED":
      return 429;

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
   POST /api/auth/register/verify
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

  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    body = {};
  }

  const code =
    typeof body === "object" &&
    body !== null &&
    !Array.isArray(body) &&
    typeof (
      body as {
        code?: unknown;
      }
    ).code === "string"
      ? (
          body as {
            code: string;
          }
        ).code
      : "";

  const {
    ip,
  } =
    getClientIp(
      request.headers,
    );

  try {
    const result =
      await verifyRegistration(
        sessionToken,
        code,
        ip,
      );

    const response:
      RegistrationVerifyResponse = {
      ok: true,

      data: {
        verified:
          result.verified,

        nextPath:
          REGISTRATION_ROUTES
            .success,
      },
    };

    /**
     * Keep the short-lived registration cookie until the success page
     * confirms that the user is active. It expires automatically.
     */
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
      "[Express-Führerschein] registration verification failed",
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
            "Der Bestätigungscode konnte nicht geprüft werden. Bitte versuche es erneut.",
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
