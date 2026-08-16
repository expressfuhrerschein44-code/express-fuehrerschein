/**
 * Express-Führerschein
 * Opaque authenticated user sessions.
 *
 * Security model:
 * - random opaque token stored only in the browser cookie;
 * - SHA-256 token hash stored in PostgreSQL;
 * - HttpOnly cookie;
 * - SameSite=Lax;
 * - Secure in production;
 * - server-side expiration and revocation.
 *
 * Persistence:
 * sessionRepository -> Prisma -> PostgreSQL -> Supabase.
 */

import "server-only";

import {
  createHash,
  randomBytes,
} from "node:crypto";

import {
  cookies,
} from "next/headers";

import {
  AUTH_SESSION_COOKIE_NAME,
} from "@/lib/constants";

import {
  sessionRepository,
} from "@/lib/server/repositories/session-repository";

import type {
  AuthSessionRecord,
} from "@/lib/server/repositories/session-repository";

/* ==========================================================================
   PUBLIC CONSTANT
   ========================================================================== */

/**
 * Backward-compatible export.
 *
 * AUTH_SESSION_COOKIE_NAME in lib/constants.ts remains the single source
 * of truth for the actual cookie name.
 */
export const AUTH_SESSION_COOKIE =
  AUTH_SESSION_COOKIE_NAME;

/* ==========================================================================
   SESSION SETTINGS
   ========================================================================== */

const DEFAULT_SESSION_TTL_SECONDS =
  60 *
  60 *
  24 *
  7;

const MIN_SESSION_TTL_SECONDS =
  15 *
  60;

const MAX_SESSION_TTL_SECONDS =
  60 *
  60 *
  24 *
  90;

function getSessionTtlSeconds():
  number {
  const raw =
    Number(
      process
        .env
        .AUTH_SESSION_TTL_SECONDS,
    );

  return (
    Number.isInteger(
      raw,
    ) &&
    raw >=
      MIN_SESSION_TTL_SECONDS &&
    raw <=
      MAX_SESSION_TTL_SECONDS
  )
    ? raw
    : DEFAULT_SESSION_TTL_SECONDS;
}

/* ==========================================================================
   TOKEN GENERATION / HASHING
   ========================================================================== */

function generateSessionToken():
  string {
  /**
   * 48 random bytes = 384 bits of entropy before base64url encoding.
   */
  return randomBytes(
    48,
  ).toString(
    "base64url",
  );
}

export function hashAuthSessionToken(
  token:
    string,
): string {
  return createHash(
    "sha256",
  )
    .update(
      token,
      "utf8",
    )
    .digest(
      "hex",
    );
}

/* ==========================================================================
   COOKIE
   ========================================================================== */

function cookieOptions(
  maxAge:
    number,
) {
  return {
    httpOnly:
      true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite:
      "lax" as const,

    path:
      "/",

    maxAge:
      Math.max(
        0,
        maxAge,
      ),
  };
}

async function clearAuthSessionCookie():
  Promise<void> {
  const cookieStore =
    await cookies();

  cookieStore.set(
    AUTH_SESSION_COOKIE_NAME,
    "",
    cookieOptions(
      0,
    ),
  );
}

/* ==========================================================================
   ISSUE SESSION
   ========================================================================== */

export async function issueAuthSession(
  userId:
    string,
): Promise<AuthSessionRecord> {
  const normalizedUserId =
    userId.trim();

  if (
    !normalizedUserId
  ) {
    throw new Error(
      "Ungültige Benutzer-ID für Auth-Session.",
    );
  }

  /**
   * Opportunistic cleanup keeps development/small deployments tidy.
   *
   * A dedicated scheduled cleanup job can replace this later without
   * changing the public session API.
   */
  await sessionRepository
    .deleteExpired();

  const token =
    generateSessionToken();

  const ttl =
    getSessionTtlSeconds();

  const expiresAt =
    new Date(
      Date.now() +
      ttl *
        1000,
    );

  const record =
    await sessionRepository
      .create({
        userId:
          normalizedUserId,

        tokenHash:
          hashAuthSessionToken(
            token,
          ),

        expiresAt:
          expiresAt
            .toISOString(),
      });

  const cookieStore =
    await cookies();

  cookieStore.set(
    AUTH_SESSION_COOKIE_NAME,
    token,
    cookieOptions(
      ttl,
    ),
  );

  return record;
}

/* ==========================================================================
   READ CURRENT SESSION
   ========================================================================== */

export async function getAuthSession():
  Promise<AuthSessionRecord | null> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore
      .get(
        AUTH_SESSION_COOKIE_NAME,
      )
      ?.value
      ?.trim();

  if (!token) {
    return null;
  }

  return sessionRepository
    .findActiveByTokenHash(
      hashAuthSessionToken(
        token,
      ),
    );
}

/* ==========================================================================
   REVOKE CURRENT SESSION
   ========================================================================== */

export async function revokeCurrentAuthSession():
  Promise<void> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore
      .get(
        AUTH_SESSION_COOKIE_NAME,
      )
      ?.value
      ?.trim();

  try {
    if (token) {
      const record =
        await sessionRepository
          .findActiveByTokenHash(
            hashAuthSessionToken(
              token,
            ),
          );

      if (record) {
        await sessionRepository
          .revokeById(
            record.id,
          );
      }
    }
  } finally {
    /**
     * The browser cookie must be cleared even if the database revocation
     * operation fails or the session was already absent.
     */
    await clearAuthSessionCookie();
  }
}

/* ==========================================================================
   REVOKE ALL USER SESSIONS
   ========================================================================== */

export async function revokeAllUserSessions(
  userId:
    string,
): Promise<number> {
  const normalizedUserId =
    userId.trim();

  if (
    !normalizedUserId
  ) {
    return 0;
  }

  return sessionRepository
    .revokeAllForUser(
      normalizedUserId,
    );
}
