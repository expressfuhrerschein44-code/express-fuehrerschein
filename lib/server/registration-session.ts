/**
 * Express-Führerschein
 * Temporary signed registration session.
 *
 * The token is stored in an HttpOnly cookie and keeps the pending registration
 * out of the URL.
 */

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";

import { cookies } from "next/headers";

export const REGISTRATION_SESSION_COOKIE =
  "ef_registration" as const;

export interface RegistrationSessionPayload {
  userId: string;
  email: string;
  issuedAt: number;
  expiresAt: number;
}

const DEFAULT_TTL_SECONDS = 15 * 60;

function getSessionSecret(): string {
  const secret =
    process.env.REGISTRATION_SESSION_SECRET?.trim();

  if (!secret) {
    throw new Error(
      "[Express-Führerschein] REGISTRATION_SESSION_SECRET fehlt.",
    );
  }

  if (secret.length < 32) {
    throw new Error(
      "[Express-Führerschein] REGISTRATION_SESSION_SECRET muss mindestens 32 Zeichen lang sein.",
    );
  }

  return secret;
}

function getSessionTtlSeconds(): number {
  const raw = Number(
    process.env.REGISTRATION_SESSION_TTL_SECONDS ??
      DEFAULT_TTL_SECONDS,
  );

  return (
    Number.isFinite(raw) &&
    raw >= 300 &&
    raw <= 3600
  )
    ? Math.floor(raw)
    : DEFAULT_TTL_SECONDS;
}

function encodePayload(
  payload: RegistrationSessionPayload,
): string {
  return Buffer.from(
    JSON.stringify(payload),
    "utf8",
  ).toString("base64url");
}

function sign(encodedPayload: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(encodedPayload, "utf8")
    .digest("base64url");
}

export function createRegistrationSessionToken(
  userId: string,
  email: string,
): string {
  const now = Math.floor(Date.now() / 1000);

  const payload: RegistrationSessionPayload = {
    userId,
    email,
    issuedAt: now,
    expiresAt: now + getSessionTtlSeconds(),
  };

  const encoded = encodePayload(payload);

  return `${encoded}.${sign(encoded)}`;
}

export function verifyRegistrationSessionToken(
  token: string,
): RegistrationSessionPayload | null {
  try {
    const [
      encoded,
      providedSignature,
    ] = token.split(".");

    if (!encoded || !providedSignature) {
      return null;
    }

    const expectedSignature = sign(encoded);

    const provided = Buffer.from(
      providedSignature,
      "base64url",
    );
    const expected = Buffer.from(
      expectedSignature,
      "base64url",
    );

    if (
      provided.length !== expected.length ||
      !timingSafeEqual(provided, expected)
    ) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(
        encoded,
        "base64url",
      ).toString("utf8"),
    ) as Partial<RegistrationSessionPayload>;

    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);

    if (
      parsed.expiresAt <= now ||
      parsed.issuedAt > now + 60
    ) {
      return null;
    }

    return {
      userId: parsed.userId,
      email: parsed.email,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function setRegistrationSessionCookie(
  token: string,
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(
    REGISTRATION_SESSION_COOKIE,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: getSessionTtlSeconds(),
    },
  );
}

export async function getRegistrationSession(): Promise<
  RegistrationSessionPayload | null
> {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    REGISTRATION_SESSION_COOKIE,
  )?.value;

  if (!token) return null;

  return verifyRegistrationSessionToken(token);
}

export async function clearRegistrationSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(
    REGISTRATION_SESSION_COOKIE,
    "",
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    },
  );
}
