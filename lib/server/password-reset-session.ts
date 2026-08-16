/**
 * Express-Führerschein
 * Signed temporary password-reset session.
 *
 * The cookie stores only:
 * - request ID;
 * - current reset stage;
 * - issue/expiry timestamps.
 *
 * It never stores:
 * - the verification code;
 * - the user's password;
 * - the password hash;
 * - OAuth credentials.
 */

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import type {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  PASSWORD_RESET_SETTINGS,
} from "@/data/password-reset";

import type {
  PasswordResetSessionPayload,
  PasswordResetStage,
} from "@/types/password-reset";

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

export const PASSWORD_RESET_SESSION_COOKIE_NAME =
  "ef_password_reset";

const SESSION_VERSION =
  1 as const;

/* ==========================================================================
   ENVIRONMENT
   ========================================================================== */

function getPasswordResetSecret(): string {
  const secret =
    process.env
      .PASSWORD_RESET_SECRET
      ?.trim();

  if (
    !secret ||
    secret.length < 32
  ) {
    throw new Error(
      "[Express-Führerschein] PASSWORD_RESET_SECRET fehlt oder ist zu kurz.",
    );
  }

  return secret;
}

function getSessionTtlSeconds(): number {
  const raw =
    process.env
      .PASSWORD_RESET_SESSION_TTL_SECONDS
      ?.trim();

  if (!raw) {
    return PASSWORD_RESET_SETTINGS
      .sessionTtlSeconds;
  }

  const parsed =
    Number(raw);

  if (
    !Number.isInteger(parsed) ||
    parsed < 60 ||
    parsed > 60 * 60
  ) {
    return PASSWORD_RESET_SETTINGS
      .sessionTtlSeconds;
  }

  return parsed;
}

/* ==========================================================================
   TOKEN HELPERS
   ========================================================================== */

function encodePayload(
  payload: PasswordResetSessionPayload,
): string {
  return Buffer
    .from(
      JSON.stringify(payload),
      "utf8",
    )
    .toString(
      "base64url",
    );
}

function signPayload(
  encodedPayload: string,
): string {
  return createHmac(
    "sha256",
    getPasswordResetSecret(),
  )
    .update(
      `password-reset-session:${encodedPayload}`,
      "utf8",
    )
    .digest(
      "base64url",
    );
}

function safeSignatureEqual(
  a: string,
  b: string,
): boolean {
  try {
    const left =
      Buffer.from(
        a,
        "base64url",
      );

    const right =
      Buffer.from(
        b,
        "base64url",
      );

    return (
      left.length ===
        right.length &&
      timingSafeEqual(
        left,
        right,
      )
    );
  } catch {
    return false;
  }
}

function parsePayload(
  encodedPayload: string,
): PasswordResetSessionPayload | null {
  try {
    const raw =
      Buffer.from(
        encodedPayload,
        "base64url",
      )
        .toString(
          "utf8",
        );

    const parsed:
      unknown =
      JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null
    ) {
      return null;
    }

    const value =
      parsed as Partial<PasswordResetSessionPayload>;

    if (
      value.version !==
        SESSION_VERSION ||
      typeof value.requestId !==
        "string" ||
      !value.requestId.trim() ||
      (
        value.stage !==
          "challenge" &&
        value.stage !==
          "verified"
      ) ||
      typeof value.issuedAt !==
        "number" ||
      !Number.isFinite(
        value.issuedAt,
      ) ||
      typeof value.expiresAt !==
        "number" ||
      !Number.isFinite(
        value.expiresAt,
      ) ||
      value.expiresAt <=
        value.issuedAt
    ) {
      return null;
    }

    return {
      version:
        SESSION_VERSION,

      requestId:
        value.requestId.trim(),

      stage:
        value.stage,

      issuedAt:
        value.issuedAt,

      expiresAt:
        value.expiresAt,
    };
  } catch {
    return null;
  }
}

/* ==========================================================================
   PUBLIC TOKEN API
   ========================================================================== */

export function createPasswordResetSessionToken(
  requestId: string,
  stage: PasswordResetStage,
): {
  token: string;
  payload: PasswordResetSessionPayload;
} {
  const normalizedRequestId =
    requestId.trim();

  if (!normalizedRequestId) {
    throw new Error(
      "[Express-Führerschein] Ungültige Password-Reset-Request-ID.",
    );
  }

  const now =
    Math.floor(
      Date.now() / 1000,
    );

  const payload:
    PasswordResetSessionPayload = {
    version:
      SESSION_VERSION,

    requestId:
      normalizedRequestId,

    stage,

    issuedAt:
      now,

    expiresAt:
      now +
      getSessionTtlSeconds(),
  };

  const encodedPayload =
    encodePayload(
      payload,
    );

  const signature =
    signPayload(
      encodedPayload,
    );

  return {
    token:
      `${encodedPayload}.${signature}`,

    payload,
  };
}

export function verifyPasswordResetSessionToken(
  token: string,
): PasswordResetSessionPayload | null {
  const normalizedToken =
    token.trim();

  if (!normalizedToken) {
    return null;
  }

  const parts =
    normalizedToken.split(".");

  if (
    parts.length !== 2
  ) {
    return null;
  }

  const [
    encodedPayload,
    receivedSignature,
  ] = parts;

  if (
    !encodedPayload ||
    !receivedSignature
  ) {
    return null;
  }

  const expectedSignature =
    signPayload(
      encodedPayload,
    );

  if (
    !safeSignatureEqual(
      receivedSignature,
      expectedSignature,
    )
  ) {
    return null;
  }

  const payload =
    parsePayload(
      encodedPayload,
    );

  if (!payload) {
    return null;
  }

  const now =
    Math.floor(
      Date.now() / 1000,
    );

  if (
    payload.expiresAt <=
    now
  ) {
    return null;
  }

  return payload;
}

/* ==========================================================================
   REQUEST / RESPONSE COOKIE API
   ========================================================================== */

export function readPasswordResetSession(
  request: NextRequest,
): PasswordResetSessionPayload | null {
  const token =
    request.cookies.get(
      PASSWORD_RESET_SESSION_COOKIE_NAME,
    )?.value;

  if (!token) {
    return null;
  }

  return verifyPasswordResetSessionToken(
    token,
  );
}

export function issuePasswordResetSession(
  response: NextResponse,
  requestId: string,
  stage: PasswordResetStage,
): PasswordResetSessionPayload {
  const {
    token,
    payload,
  } =
    createPasswordResetSessionToken(
      requestId,
      stage,
    );

  const maxAge =
    Math.max(
      0,
      payload.expiresAt -
        Math.floor(
          Date.now() / 1000,
        ),
    );

  response.cookies.set(
    PASSWORD_RESET_SESSION_COOKIE_NAME,
    token,
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

      maxAge,
    },
  );

  return payload;
}

export function clearPasswordResetSession(
  response: NextResponse,
): void {
  response.cookies.set(
    PASSWORD_RESET_SESSION_COOKIE_NAME,
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
