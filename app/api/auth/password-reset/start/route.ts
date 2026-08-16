import {
  createHash,
} from "node:crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  PASSWORD_RESET_COPY,
  PASSWORD_RESET_ROUTES,
} from "@/data/password-reset";

import {
  renderPasswordResetCodeEmailHtml,
} from "@/emails/password-reset-code-email";

import {
  getAuthPublicOrigin,
} from "@/lib/server/auth-origin";

import {
  getClientIp,
} from "@/lib/server/client-ip";

import {
  consumeRateLimit,
} from "@/lib/server/rate-limit";

import {
  PasswordResetServiceError,
  startPasswordReset,
} from "@/lib/server/password-reset-service";

import {
  clearPasswordResetSession,
  issuePasswordResetSession,
} from "@/lib/server/password-reset-session";

import type {
  PasswordResetApiErrorCode,
  PasswordResetApiErrorResponse,
  PasswordResetApiResponse,
  PasswordResetCodeDelivery,
  PasswordResetDeliveryInput,
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

const RESEND_API_URL =
  "https://api.resend.com/emails";

const START_RATE_LIMIT_WINDOW_MS =
  15 * 60 * 1000;

const START_RATE_LIMIT_PER_EMAIL =
  5;

const START_RATE_LIMIT_PER_IP =
  20;

/* ==========================================================================
   SECURITY HELPERS
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

function normalizedEmailFromBody(
  body: unknown,
): string {
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return "";
  }

  const email =
    (
      body as {
        email?: unknown;
      }
    ).email;

  return typeof email === "string"
    ? email
        .trim()
        .toLowerCase()
    : "";
}

function hashRateLimitValue(
  value: string,
): string {
  return createHash(
    "sha256",
  )
    .update(
      value,
      "utf8",
    )
    .digest(
      "hex",
    );
}

async function consumeStartRateLimits(
  request: NextRequest,
  body: unknown,
): Promise<number | null> {
  const {
    ip,
  } = getClientIp(
    request.headers,
  );

  const ipKey =
    ip ??
    "unknown";

  const email =
    normalizedEmailFromBody(
      body,
    );

  const ipLimit =
    await consumeRateLimit({
      key:
        `password-reset:start:ip:${ipKey}`,

      limit:
        START_RATE_LIMIT_PER_IP,

      windowMs:
        START_RATE_LIMIT_WINDOW_MS,
    });

  if (!ipLimit.allowed) {
    return ipLimit
      .retryAfterSeconds;
  }

  const emailLimit =
    await consumeRateLimit({
      key:
        `password-reset:start:email:${ipKey}:${hashRateLimitValue(email || "invalid")}`,

      limit:
        START_RATE_LIMIT_PER_EMAIL,

      windowMs:
        START_RATE_LIMIT_WINDOW_MS,
    });

  return emailLimit.allowed
    ? null
    : emailLimit
        .retryAfterSeconds;
}

/* ==========================================================================
   RESEND DELIVERY
   ========================================================================== */

function getResendApiKey(): string {
  const value =
    process.env
      .RESEND_API_KEY
      ?.trim();

  if (!value) {
    throw new Error(
      "[Express-Führerschein] RESEND_API_KEY fehlt.",
    );
  }

  return value;
}

function getFromEmail(): string {
  return (
    process.env
      .RESEND_FROM_EMAIL
      ?.trim() ||
    "Express-Führerschein <noreply@express-fuhrerscheine.de>"
  );
}

async function sendPasswordResetEmail(
  input: PasswordResetDeliveryInput,
): Promise<void> {
  const html =
    renderPasswordResetCodeEmailHtml({
      firstName:
        input.firstName,

      code:
        input.code,

      expiresInMinutes:
        input.expiresInMinutes,
    });

  const response =
    await fetch(
      RESEND_API_URL,
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${getResendApiKey()}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            from:
              getFromEmail(),

            to: [
              input.to,
            ],

            subject:
              "Sicherheitscode zum Zurücksetzen deines Passworts",

            html,
          }),

        cache:
          "no-store",
      },
    );

  const payload =
    await response
      .json()
      .catch(
        () => null,
      ) as
      | {
          id?: string;
          message?: string;
          name?: string;
        }
      | null;

  if (!response.ok) {
    const detail =
      payload?.message ??
      payload?.name ??
      `HTTP ${response.status}`;

    throw new Error(
      `[Express-Führerschein] Resend-Fehler beim Password-Reset: ${detail}`,
    );
  }

  if (!payload?.id) {
    throw new Error(
      "[Express-Führerschein] Resend hat keine E-Mail-ID für den Password-Reset zurückgegeben.",
    );
  }
}

const passwordResetDelivery:
  PasswordResetCodeDelivery = {
  sendCode:
    sendPasswordResetEmail,
};

/* ==========================================================================
   RESPONSE HELPERS
   ========================================================================== */

function statusForError(
  code:
    PasswordResetApiErrorCode,
): number {
  switch (code) {
    case "INVALID_ORIGIN":
      return 403;

    case "VALIDATION_ERROR":
      return 400;

    case "INVALID_OR_EXPIRED_REQUEST":
      return 410;

    case "INVALID_CODE":
      return 400;

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

function serviceErrorResponse(
  error: PasswordResetServiceError,
): NextResponse<PasswordResetApiResponse> {
  return errorResponse(
    error.code,
    error.message,
    {
      fields:
        error.fields,

      retryAfterSeconds:
        error.retryAfterSeconds,
    },
  );
}

/* ==========================================================================
   POST /api/auth/password-reset/start
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

  let body:
    unknown;

  try {
    body =
      await request.json();
  } catch {
    return errorResponse(
      "VALIDATION_ERROR",
      "Die Anfrage enthält keine gültigen Daten.",
      {
        status:
          400,
      },
    );
  }

  const retryAfterSeconds =
    await consumeStartRateLimits(
      request,
      body,
    );

  if (
    retryAfterSeconds !==
    null
  ) {
    return errorResponse(
      "RATE_LIMITED",
      "Zu viele Anfragen. Bitte warte kurz und versuche es erneut.",
      {
        retryAfterSeconds,
      },
    );
  }

  try {
    const result =
      await startPasswordReset(
        body,
        passwordResetDelivery,
      );

    const response =
      NextResponse.json<PasswordResetApiResponse>(
        {
          ok:
            true,

          message:
            PASSWORD_RESET_COPY
              .start
              .genericSuccess,

          nextPath:
            PASSWORD_RESET_ROUTES
              .verify,
        },
        {
          status:
            200,

          headers:
            NO_STORE_HEADERS,
        },
      );

    /**
     * Starting a new reset invalidates the browser's previous reset cookie.
     * A fresh cookie is issued only when an eligible account actually exists.
     */
    clearPasswordResetSession(
      response,
    );

    if (
      result.session
    ) {
      issuePasswordResetSession(
        response,
        result.session.requestId,
        "challenge",
      );
    }

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
      "[Express-Führerschein] password reset start failed",
      error,
    );

    return errorResponse(
      "INTERNAL_ERROR",
      "Die Passwort-Zurücksetzung konnte nicht gestartet werden. Bitte versuche es erneut.",
    );
  }
}
