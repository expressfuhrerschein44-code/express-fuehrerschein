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
  startRegistration,
} from "@/lib/server/registration-service";

import {
  setRegistrationSessionCookie,
} from "@/lib/server/registration-session";

import type {
  RegistrationApiErrorResponse,
  RegistrationApiFieldError,
  RegistrationStartSuccessResponse,
} from "@/types/registration";

/* ==========================================================================
   ROUTE CONFIG
   ========================================================================== */

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* ==========================================================================
   RESPONSE HELPERS
   ========================================================================== */

const NO_STORE_HEADERS = {
  "Cache-Control":
    "no-store, max-age=0",
  Pragma:
    "no-cache",
} as const;

function statusForError(
  code:
    RegistrationServiceError["code"],
): number {
  switch (code) {
    case "VALIDATION_ERROR":
    case "INVALID_PHONE":
      return 400;

    case "EMAIL_ALREADY_EXISTS":
      return 409;

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

function validationDetails(
  details: unknown,
): readonly RegistrationApiFieldError[] | undefined {
  if (!Array.isArray(details)) {
    return undefined;
  }

  const result:
    RegistrationApiFieldError[] = [];

  for (
    const detail
    of details
  ) {
    if (
      typeof detail !== "object" ||
      detail === null
    ) {
      continue;
    }

    const candidate =
      detail as {
        field?: unknown;
        code?: unknown;
        message?: unknown;
      };

    if (
      typeof candidate.code !==
        "string" ||
      typeof candidate.message !==
        "string"
    ) {
      continue;
    }

    result.push({
      field:
        typeof candidate.field ===
          "string"
          ? (
              candidate.field as
                RegistrationApiFieldError["field"]
            )
          : undefined,

      code:
        candidate.code,

      message:
        candidate.message,
    });
  }

  return result.length > 0
    ? result
    : undefined;
}

function serviceErrorResponse(
  error: RegistrationServiceError,
): NextResponse<RegistrationApiErrorResponse> {
  const status =
    statusForError(
      error.code,
    );

  const retryAfterSeconds =
    readRetryAfter(
      error.details,
    );

  const details =
    error.code ===
      "VALIDATION_ERROR"
      ? validationDetails(
          error.details,
        )
      : undefined;

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

        details,

        retryAfterSeconds,
      },
    },

    {
      status,
      headers,
    },
  );
}

/* ==========================================================================
   POST /api/auth/register/start
   ========================================================================== */

export async function POST(
  request: NextRequest,
) {
  let body: unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json<
      RegistrationApiErrorResponse
    >(
      {
        ok: false,

        error: {
          code:
            "INVALID_JSON",

          message:
            "Die Anfrage enthält keine gültigen Registrierungsdaten.",
        },
      },

      {
        status: 400,
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
      await startRegistration(
        body,
        ip,
      );

    /**
     * Keep the signed registration token server-side in an HttpOnly cookie.
     * It is intentionally NOT exposed in the JSON response.
     */
    await setRegistrationSessionCookie(
      result.sessionToken,
    );

    const response:
      RegistrationStartSuccessResponse = {
      ok: true,

      data: {
        emailMasked:
          result.emailMasked,

        expiresInMinutes:
          result.expiresInMinutes,

        nextPath:
          REGISTRATION_ROUTES
            .verification,
      },
    };

    return NextResponse.json(
      response,
      {
        status: 201,
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
      "[Express-Führerschein] registration start failed",
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
            "Die Registrierung konnte nicht gestartet werden. Bitte versuche es erneut.",
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
