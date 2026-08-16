import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  renderPasswordResetCodeEmailHtml,
} from "@/emails/password-reset-code-email";

import {
  getAuthPublicOrigin,
} from "@/lib/server/auth-origin";

import {
  PasswordResetServiceError,
  resendPasswordResetCode,
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
              "Neuer Sicherheitscode zum Zurücksetzen deines Passworts",

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
      `[Express-Führerschein] Resend-Fehler beim Password-Reset-Resend: ${detail}`,
    );
  }

  if (!payload?.id) {
    throw new Error(
      "[Express-Führerschein] Resend hat keine E-Mail-ID für den neuen Password-Reset-Code zurückgegeben.",
    );
  }
}

const passwordResetDelivery:
  PasswordResetCodeDelivery = {
  sendCode:
    sendPasswordResetEmail,
};

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
      "TOO_MANY_RESENDS" ||
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
   POST /api/auth/password-reset/resend
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
      "challenge"
  ) {
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

  try {
    const result =
      await resendPasswordResetCode(
        session.requestId,
        passwordResetDelivery,
      );

    const response =
      NextResponse.json<PasswordResetApiResponse>(
        {
          ok:
            true,

          message:
            "Ein neuer Sicherheitscode wurde gesendet.",

          retryAfterSeconds:
            result.retryAfterSeconds,
        },
        {
          status:
            200,

          headers:
            NO_STORE_HEADERS,
        },
      );

    /**
     * A successfully resent code gets a fresh signed browser session,
     * aligned with the new code lifetime.
     */
    issuePasswordResetSession(
      response,
      result.requestId,
      "challenge",
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
      "[Express-Führerschein] password reset resend failed",
      error,
    );

    return errorResponse(
      "INTERNAL_ERROR",
      "Der Sicherheitscode konnte nicht erneut gesendet werden. Bitte versuche es später noch einmal.",
    );
  }
}
