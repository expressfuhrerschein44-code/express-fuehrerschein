/**
 * Express-Führerschein
 * Client-space session resolver.
 *
 * This module is intentionally independent from UI components.
 *
 * Current persistence target:
 * Prisma -> PostgreSQL -> Supabase.
 *
 * IMPORTANT:
 * The existing authentication/login repository must also persist issued
 * sessions in the `auth_sessions` table before the client shell is wired
 * into production routes. Until that repository migration is completed,
 * this module can exist safely without changing the existing login flow.
 */

import "server-only";

import {
  createHash,
} from "node:crypto";

import {
  cookies,
} from "next/headers";

import type {
  NextRequest,
} from "next/server";

import {
  AUTH_SESSION_COOKIE_NAME,
} from "@/lib/constants";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  SupportedCountryCode,
} from "@/types/country";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

/* ==========================================================================
   TYPES
   ========================================================================== */

export type ClientSessionFailureReason =
  | "MISSING_TOKEN"
  | "SESSION_NOT_FOUND"
  | "SESSION_REVOKED"
  | "SESSION_EXPIRED"
  | "ACCOUNT_NOT_ACTIVE"
  | "EMAIL_NOT_VERIFIED"
  | "DATABASE_ERROR";

export interface ClientSessionUser {
  id:
    string;

  firstName:
    string;

  lastName:
    string;

  email:
    string;

  countryCode:
    SupportedCountryCode;

  status:
    string;

  emailVerifiedAt:
    Date | null;

  preferredLocale:
    ClientShellLocale;

  timezone:
    string;

  avatarPath:
    string | null;
}

export interface ClientSession {
  id:
    string;

  userId:
    string;

  expiresAt:
    Date;

  createdAt:
    Date;

  user:
    ClientSessionUser;
}

export type ClientSessionResult =
  | {
      authenticated:
        true;

      session:
        ClientSession;

      user:
        ClientSessionUser;
    }
  | {
      authenticated:
        false;

      reason:
        ClientSessionFailureReason;
    };

export class ClientSessionError
  extends Error {
  readonly reason:
    ClientSessionFailureReason;

  constructor(
    reason:
      ClientSessionFailureReason,
    message:
      string,
  ) {
    super(message);

    this.name =
      "ClientSessionError";

    this.reason =
      reason;
  }
}

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

const DEFAULT_LOCALE:
  ClientShellLocale =
  "de";

const DEFAULT_TIMEZONE =
  "Europe/Berlin";

const ACTIVE_USER_STATUS =
  "active";

/* ==========================================================================
   HELPERS
   ========================================================================== */

export function hashClientSessionToken(
  rawToken:
    string,
): string {
  return createHash(
    "sha256",
  )
    .update(
      rawToken,
    )
    .digest(
      "hex",
    );
}

function normalizeLocale(
  value:
    string | null | undefined,
): ClientShellLocale {
  switch (
    value
      ?.trim()
      .toLowerCase()
  ) {
    case "de":
    case "fr":
    case "nl":
    case "es":
    case "it":
    case "en":
      return value
        .trim()
        .toLowerCase() as
        ClientShellLocale;

    default:
      return DEFAULT_LOCALE;
  }
}

function normalizeCountryCode(
  value:
    string,
): SupportedCountryCode {
  switch (
    value
      .trim()
      .toUpperCase()
  ) {
    case "DE":
    case "AT":
    case "CH":
    case "BE":
    case "ES":
      return value
        .trim()
        .toUpperCase() as
        SupportedCountryCode;

    default:
      return "DE";
  }
}

function normalizeToken(
  value:
    string | null | undefined,
): string | null {
  const token =
    value?.trim() ??
    "";

  if (!token) {
    return null;
  }

  return token;
}

/* ==========================================================================
   DATABASE RESOLUTION
   ========================================================================== */

async function resolveClientSessionByToken(
  rawToken:
    string,
): Promise<ClientSessionResult> {
  const tokenHash =
    hashClientSessionToken(
      rawToken,
    );

  try {
    const record =
      await prisma
        .auth_sessions
        .findUnique({
          where: {
            token_hash:
              tokenHash,
          },

          select: {
            id:
              true,

            user_id:
              true,

            expires_at:
              true,

            revoked_at:
              true,

            created_at:
              true,

            users: {
              select: {
                id:
                  true,

                first_name:
                  true,

                last_name:
                  true,

                email:
                  true,

                country_code:
                  true,

                status:
                  true,

                email_verified_at:
                  true,

                user_profile: {
                  select: {
                    preferred_locale:
                      true,

                    timezone:
                      true,

                    avatar_path:
                      true,
                  },
                },
              },
            },
          },
        });

    if (!record) {
      return {
        authenticated:
          false,

        reason:
          "SESSION_NOT_FOUND",
      };
    }

    if (
      record.revoked_at
    ) {
      return {
        authenticated:
          false,

        reason:
          "SESSION_REVOKED",
      };
    }

    const now =
      new Date();

    if (
      record.expires_at <=
      now
    ) {
      return {
        authenticated:
          false,

        reason:
          "SESSION_EXPIRED",
      };
    }

    if (
      record.users.status !==
      ACTIVE_USER_STATUS
    ) {
      return {
        authenticated:
          false,

        reason:
          "ACCOUNT_NOT_ACTIVE",
      };
    }

    if (
      !record
        .users
        .email_verified_at
    ) {
      return {
        authenticated:
          false,

        reason:
          "EMAIL_NOT_VERIFIED",
      };
    }

    const profile =
      record
        .users
        .user_profile;

    const user:
      ClientSessionUser = {
      id:
        record.users.id,

      firstName:
        record
          .users
          .first_name,

      lastName:
        record
          .users
          .last_name,

      email:
        record.users.email,

      countryCode:
        normalizeCountryCode(
          record
            .users
            .country_code,
        ),

      status:
        record.users.status,

      emailVerifiedAt:
        record
          .users
          .email_verified_at,

      preferredLocale:
        normalizeLocale(
          profile
            ?.preferred_locale,
        ),

      timezone:
        profile
          ?.timezone
          ?.trim() ||
        DEFAULT_TIMEZONE,

      avatarPath:
        profile
          ?.avatar_path ??
        null,
    };

    const session:
      ClientSession = {
      id:
        record.id,

      userId:
        record.user_id,

      expiresAt:
        record.expires_at,

      createdAt:
        record.created_at,

      user,
    };

    return {
      authenticated:
        true,

      session,

      user,
    };
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[CLIENT_SESSION_DATABASE_ERROR]",
      error instanceof Error
        ? error.message
        : error,
    );

    return {
      authenticated:
        false,

      reason:
        "DATABASE_ERROR",
    };
  }
}

/* ==========================================================================
   COOKIE-BASED RESOLUTION
   ========================================================================== */

export async function getClientSession():
  Promise<ClientSessionResult> {
  const cookieStore =
    await cookies();

  const rawToken =
    normalizeToken(
      cookieStore
        .get(
          AUTH_SESSION_COOKIE_NAME,
        )
        ?.value,
    );

  if (!rawToken) {
    return {
      authenticated:
        false,

      reason:
        "MISSING_TOKEN",
    };
  }

  return resolveClientSessionByToken(
    rawToken,
  );
}

/**
 * API/Route Handler variant.
 */
export async function getClientSessionFromRequest(
  request:
    NextRequest,
): Promise<ClientSessionResult> {
  const rawToken =
    normalizeToken(
      request
        .cookies
        .get(
          AUTH_SESSION_COOKIE_NAME,
        )
        ?.value,
    );

  if (!rawToken) {
    return {
      authenticated:
        false,

      reason:
        "MISSING_TOKEN",
    };
  }

  return resolveClientSessionByToken(
    rawToken,
  );
}

/* ==========================================================================
   REQUIRED SESSION
   ========================================================================== */

export async function requireClientSession():
  Promise<ClientSession> {
  const result =
    await getClientSession();

  if (
    !result.authenticated
  ) {
    throw new ClientSessionError(
      result.reason,

      "Eine aktive Anmeldung ist erforderlich.",
    );
  }

  return result.session;
}
