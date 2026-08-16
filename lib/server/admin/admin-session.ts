import "server-only";

import {
  createHash,
  randomBytes,
} from "node:crypto";

import {
  cookies,
} from "next/headers";

import {
  findAdminSessionRecordByTokenHash,
  touchAdminSession,
} from "@/lib/server/admin/admin-repository";

import type {
  AdminSessionView,
} from "@/types/admin";

export const ADMIN_SESSION_COOKIE_NAME =
  "ef_admin_session";

const DEFAULT_SESSION_HOURS =
  12;

const REMEMBER_SESSION_DAYS =
  30;

const SESSION_TOUCH_INTERVAL_MS =
  5 *
  60 *
  1000;

export function hashAdminSessionToken(
  token: string,
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

export function createAdminSessionToken():
  string {
  return randomBytes(
    32,
  ).toString(
    "base64url",
  );
}

export function createAdminSessionExpiry(
  rememberMe: boolean,
): Date {
  const now =
    Date.now();

  const duration =
    rememberMe
      ? REMEMBER_SESSION_DAYS *
        24 *
        60 *
        60 *
        1000
      : DEFAULT_SESSION_HOURS *
        60 *
        60 *
        1000;

  return new Date(
    now +
      duration,
  );
}

export function getAdminSessionCookieOptions(
  expiresAt: Date,
) {
  return {
    name:
      ADMIN_SESSION_COOKIE_NAME,
    httpOnly:
      true,
    sameSite:
      "lax" as const,
    secure:
      process.env.NODE_ENV ===
      "production",
    path:
      "/",
    expires:
      expiresAt,
  };
}

export async function resolveAdminSessionFromToken(
  token:
    string |
    null |
    undefined,
): Promise<AdminSessionView | null> {
  const cleanToken =
    token?.trim();

  if (!cleanToken) {
    return null;
  }

  const tokenHash =
    hashAdminSessionToken(
      cleanToken,
    );

  const record =
    await findAdminSessionRecordByTokenHash(
      tokenHash,
    );

  if (!record) {
    return null;
  }

  if (
    record.revoked_at ||
    record.expires_at.getTime() <=
      Date.now() ||
    !record.admin.is_active
  ) {
    return null;
  }

  const lastSeenAt =
    record.last_seen_at
      ?.getTime() ??
    0;

  if (
    Date.now() -
      lastSeenAt >=
    SESSION_TOUCH_INTERVAL_MS
  ) {
    void touchAdminSession({
      sessionId:
        record.id,
      adminId:
        record.admin.id,
    }).catch(
      (
        error,
      ) => {
        console.error(
          "[ADMIN_SESSION_TOUCH_ERROR]",
          error,
        );
      },
    );
  }

  return {
    sessionId:
      record.id,
    expiresAt:
      record.expires_at,
    admin: {
      id:
        record.admin.id,
      role:
        record.admin.role,
      firstName:
        record.admin.first_name,
      lastName:
        record.admin.last_name,
      email:
        record.admin.email,
    },
  };
}

export async function getCurrentAdminSession():
  Promise<AdminSessionView | null> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      ADMIN_SESSION_COOKIE_NAME,
    )?.value;

  return resolveAdminSessionFromToken(
    token,
  );
}
