/**
 * Express-Führerschein
 * POST /api/profile/email/change/resend
 *
 * Body:
 * {
 *   requestId: string
 * }
 *
 * This route keeps the original request id, rotates the six-digit code,
 * resets its expiry and enforces a database-backed cooldown.
 */

import {
  createHmac,
  randomInt,
} from "node:crypto";

import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

import {
  PROFILE_EMAIL_CHANGE,
} from "@/data/profile";

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
  findProfileByUserId,
} from "@/lib/server/profile/profile-repository";

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

const MAX_RESENDS =
  5;

interface ResendRequestRow {
  id:
    string;

  new_email:
    string;

  code_hash:
    string;

  expires_at:
    Date | string;

  resend_count:
    number;

  last_sent_at:
    Date | string;

  completed_at:
    Date | null;

  invalidated_at:
    Date | null;
}

function emailChangeSecret():
  string {
  const value =
    (
      process.env
        .PROFILE_EMAIL_CHANGE_SECRET ??
      process.env
        .REGISTRATION_SESSION_SECRET
    )
      ?.trim();

  if (
    !value
  ) {
    throw new ProfileServiceError(
      "EMAIL_CHANGE_NOT_READY",

      "Die sichere E-Mail-Änderung ist noch nicht vollständig konfiguriert.",
    );
  }

  return value;
}

function generateCode():
  string {
  return randomInt(
    0,
    1_000_000,
  )
    .toString()
    .padStart(
      6,
      "0",
    );
}

function hashCode(
  requestId:
    string,

  code:
    string,
): string {
  return createHmac(
    "sha256",
    emailChangeSecret(),
  )
    .update(
      `${requestId}:${code}`,
      "utf8",
    )
    .digest(
      "hex",
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

  let requestId:
    string;

  try {
    const body =
      await request.json() as
        Record<string, unknown>;

    requestId =
      typeof body.requestId ===
        "string"
        ? body.requestId
            .trim()
        : "";
  } catch {
    requestId =
      "";
  }

  if (
    !/^[0-9a-fA-F-]{36}$/.test(
      requestId,
    )
  ) {
    return NextResponse.json(
      {
        ok:
          false,

        code:
          "VALIDATION_ERROR",

        message:
          "Die E-Mail-Änderungsanfrage ist ungültig.",
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

    const rows =
      (
        await prisma
          .$queryRawUnsafe(
            `
              SELECT
                id,
                new_email,
                code_hash,
                expires_at,
                resend_count,
                last_sent_at,
                completed_at,
                invalidated_at
              FROM email_change_requests
              WHERE id = $1::uuid
                AND user_id = $2::uuid
              LIMIT 1
            `,
            requestId,
            userId,
          )
      ) as
        ResendRequestRow[];

    const changeRequest =
      rows[0];

    if (
      !changeRequest ||
      changeRequest.completed_at ||
      changeRequest.invalidated_at
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            "EMAIL_CHANGE_NOT_FOUND",

          message:
            "Die E-Mail-Änderungsanfrage wurde nicht gefunden oder ist nicht mehr aktiv.",
        },
        {
          status:
            404,

          headers:
            NO_STORE_HEADERS,
        },
      );
    }

    if (
      changeRequest.resend_count >=
      MAX_RESENDS
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            "TOO_MANY_ATTEMPTS",

          message:
            "Zu viele neue Codes wurden angefordert. Starte die E-Mail-Änderung erneut.",
        },
        {
          status:
            429,

          headers:
            NO_STORE_HEADERS,
        },
      );
    }

    const lastSentAt =
      new Date(
        changeRequest
          .last_sent_at,
      )
        .getTime();

    const cooldownMs =
      PROFILE_EMAIL_CHANGE
        .resendCooldownSeconds *
      1000;

    const elapsed =
      Date.now() -
      lastSentAt;

    if (
      Number.isFinite(
        lastSentAt,
      ) &&
      elapsed <
        cooldownMs
    ) {
      const retryAfterSeconds =
        Math.max(
          1,
          Math.ceil(
            (
              cooldownMs -
              elapsed
            ) /
            1000,
          ),
        );

      return NextResponse.json(
        {
          ok:
            false,

          code:
            "TOO_MANY_ATTEMPTS",

          message:
            "Bitte warte kurz, bevor du einen neuen Code anforderst.",

          retryAfterSeconds,
        },
        {
          status:
            429,

          headers: {
            ...NO_STORE_HEADERS,

            "Retry-After":
              String(
                retryAfterSeconds,
              ),
          },
        },
      );
    }

    const user =
      await findProfileByUserId(
        userId,
      );

    if (
      !user
    ) {
      throw new ProfileServiceError(
        "ACCOUNT_UNAVAILABLE",

        "Das Konto konnte nicht gefunden werden.",
      );
    }

    const code =
      generateCode();

    const newCodeHash =
      hashCode(
        changeRequest.id,
        code,
      );

    const newExpiresAt =
      new Date(
        Date.now() +
        PROFILE_EMAIL_CHANGE
          .codeTtlMinutes *
          60_000,
      );

    const oldCodeHash =
      changeRequest.code_hash;

    const oldExpiresAt =
      new Date(
        changeRequest
          .expires_at,
      );

    const oldResendCount =
      changeRequest
        .resend_count;

    const oldLastSentAt =
      new Date(
        changeRequest
          .last_sent_at,
      );

    await prisma
      .$executeRawUnsafe(
        `
          UPDATE email_change_requests
          SET
            code_hash = $1,
            expires_at = $2,
            attempts = 0,
            resend_count = resend_count + 1,
            last_sent_at = NOW(),
            updated_at = NOW()
          WHERE id = $3::uuid
            AND user_id = $4::uuid
            AND completed_at IS NULL
            AND invalidated_at IS NULL
        `,
        newCodeHash,
        newExpiresAt,
        changeRequest.id,
        userId,
      );

    try {
      await sendEmailChangeCode({
        to:
          changeRequest
            .new_email,

        firstName:
          user.firstName,

        code,

        expiresInMinutes:
          PROFILE_EMAIL_CHANGE
            .codeTtlMinutes,
      });
    } catch (
      deliveryError:
        unknown
    ) {
      /**
       * Restore the previous challenge if delivery fails.
       * This prevents an undelivered code from replacing a still-usable one.
       */
      await prisma
        .$executeRawUnsafe(
          `
            UPDATE email_change_requests
            SET
              code_hash = $1,
              expires_at = $2,
              resend_count = $3,
              last_sent_at = $4,
              updated_at = NOW()
            WHERE id = $5::uuid
              AND user_id = $6::uuid
              AND completed_at IS NULL
              AND invalidated_at IS NULL
          `,
          oldCodeHash,
          oldExpiresAt,
          oldResendCount,
          oldLastSentAt,
          changeRequest.id,
          userId,
        )
        .catch(
          (
            rollbackError:
              unknown,
          ) => {
            console.error(
              "[PROFILE_EMAIL_RESEND_ROLLBACK_ERROR]",
              rollbackError,
            );
          },
        );

      throw deliveryError;
    }

    return NextResponse.json(
      {
        ok:
          true,

        message:
          "Ein neuer Sicherheitscode wurde gesendet.",

        data: {
          requestId:
            changeRequest.id,

          expiresInMinutes:
            PROFILE_EMAIL_CHANGE
              .codeTtlMinutes,
        },
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
      const status =
        error.code ===
          "UNAUTHENTICATED"
          ? 401
          : error.code ===
              "ACCOUNT_UNAVAILABLE"
            ? 404
            : error.code ===
                "EMAIL_CHANGE_NOT_READY"
              ? 503
              : 500;

      return NextResponse.json(
        {
          ok:
            false,

          code:
            error.code,

          message:
            error.message,
        },
        {
          status,

          headers:
            NO_STORE_HEADERS,
        },
      );
    }

    console.error(
      "[PROFILE_EMAIL_CHANGE_RESEND_ROUTE_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        code:
          "INTERNAL_ERROR",

        message:
          "Ein neuer Sicherheitscode konnte gerade nicht gesendet werden.",
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
