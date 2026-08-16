/**
 * Express-Führerschein
 * POST /api/profile/email/change/start
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
  startProfileEmailChange,
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

function escapeHtml(
  value:
    string,
): string {
  return value
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#039;",
    );
}

async function sendEmailChangeCode(
  input: {
    to:
      string;

    firstName:
      string;

    code:
      string;

    expiresInMinutes:
      number;
  },
): Promise<void> {
  const apiKey =
    process.env
      .RESEND_API_KEY
      ?.trim();

  const from =
    process.env
      .RESEND_FROM_EMAIL
      ?.trim();

  if (
    !apiKey ||
    !from
  ) {
    throw new Error(
      "Resend is not configured for profile e-mail changes.",
    );
  }

  const safeFirstName =
    escapeHtml(
      input.firstName,
    );

  const safeCode =
    escapeHtml(
      input.code,
    );

  const response =
    await fetch(
      "https://api.resend.com/emails",
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            from,

            to: [
              input.to,
            ],

            subject:
              "Bestätige deine neue E-Mail-Adresse",

            html:
              `
                <div style="font-family:Arial,sans-serif;background:#f6f8fb;padding:32px 16px;color:#111c2b">
                  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px">
                    <h1 style="font-size:22px;margin:0 0 16px">Neue E-Mail-Adresse bestätigen</h1>
                    <p>Hallo ${safeFirstName},</p>
                    <p>verwende diesen Sicherheitscode, um deine neue E-Mail-Adresse bei Express-Führerschein zu bestätigen:</p>
                    <div style="margin:24px 0;padding:18px;border-radius:12px;background:#eef5ff;text-align:center;font-size:34px;font-weight:800;letter-spacing:8px;color:#0878ff">${safeCode}</div>
                    <p style="color:#64748b">Der Code ist ${input.expiresInMinutes} Minuten gültig. Wenn du diese Änderung nicht gestartet hast, ignoriere diese E-Mail.</p>
                  </div>
                </div>
              `,
          }),

        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    const detail =
      await response
        .text()
        .catch(
          () =>
            "",
        );

    throw new Error(
      `Resend profile e-mail delivery failed (${response.status}): ${detail}`,
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
      await startProfileEmailChange(
        userId,
        body,
        {
          sendCode:
            sendEmailChangeCode,
        },
      );

    return NextResponse.json(
      {
        ok:
          true,

        message:
          "Wir haben einen Sicherheitscode an deine neue E-Mail-Adresse gesendet.",

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
      "[PROFILE_EMAIL_CHANGE_START_ROUTE_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        code:
          "INTERNAL_ERROR",

        message:
          "Der Sicherheitscode konnte gerade nicht gesendet werden.",
      },
      {
        status:
          502,

        headers:
          NO_STORE_HEADERS,
      },
    );
  }
}
