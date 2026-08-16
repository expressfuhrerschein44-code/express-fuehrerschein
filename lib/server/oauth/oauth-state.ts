/**
 * Express-Führerschein
 * OAuth transaction protection: state, nonce and PKCE verifier.
 */

import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import {
  sanitizeReturnPath,
  type OAuthProviderName,
} from "@/lib/server/auth-origin";

export interface OAuthTransaction {
  provider: OAuthProviderName;
  state: string;
  nonce: string;
  codeVerifier: string;
  returnTo: string;
  issuedAt: number;
  expiresAt: number;
}

export interface PreparedOAuthTransaction {
  state: string;
  nonce: string;
  codeChallenge: string;
}

export const OAUTH_STATE_COOKIE = "ef_oauth_state" as const;
const TRANSACTION_TTL_SECONDS = 10 * 60;

function getOAuthStateSecret(): string {
  const secret = process.env.OAUTH_STATE_SECRET?.trim();
  if (!secret) {
    throw new Error("[Express-Führerschein] OAUTH_STATE_SECRET fehlt.");
  }
  if (secret.length < 32) {
    throw new Error(
      "[Express-Führerschein] OAUTH_STATE_SECRET muss mindestens 32 Zeichen lang sein.",
    );
  }
  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getOAuthStateSecret())
    .update(payload, "utf8")
    .digest("base64url");
}

function encodeTransaction(transaction: OAuthTransaction): string {
  return Buffer.from(JSON.stringify(transaction), "utf8").toString("base64url");
}

function createSignedValue(transaction: OAuthTransaction): string {
  const payload = encodeTransaction(transaction);
  return `${payload}.${signPayload(payload)}`;
}

function readSignedValue(value: string): OAuthTransaction | null {
  try {
    const [payload, signature] = value.split(".");
    if (!payload || !signature) return null;

    const expected = Buffer.from(signPayload(payload), "base64url");
    const provided = Buffer.from(signature, "base64url");
    if (
      expected.length !== provided.length ||
      !timingSafeEqual(expected, provided)
    ) {
      return null;
    }

    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Partial<OAuthTransaction>;

    if (
      (parsed.provider !== "google" && parsed.provider !== "apple") ||
      typeof parsed.state !== "string" ||
      typeof parsed.nonce !== "string" ||
      typeof parsed.codeVerifier !== "string" ||
      typeof parsed.returnTo !== "string" ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    return parsed as OAuthTransaction;
  } catch {
    return null;
  }
}

function createCodeVerifier(): string {
  return randomBytes(64).toString("base64url");
}

function createCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier, "utf8").digest("base64url");
}

function sameSiteFor(provider: OAuthProviderName) {
  // Apple web sign-in commonly returns with response_mode=form_post.
  // In production, SameSite=None + Secure allows the transaction cookie
  // on that cross-site POST callback. Google uses a normal top-level GET.
  if (provider === "apple" && process.env.NODE_ENV === "production") {
    return "none" as const;
  }
  return "lax" as const;
}

export async function prepareOAuthTransaction(
  provider: OAuthProviderName,
  returnTo?: string | null,
): Promise<PreparedOAuthTransaction> {
  const now = Math.floor(Date.now() / 1000);
  const codeVerifier = createCodeVerifier();

  const transaction: OAuthTransaction = {
    provider,
    state: randomBytes(32).toString("base64url"),
    nonce: randomBytes(32).toString("base64url"),
    codeVerifier,
    returnTo: sanitizeReturnPath(returnTo, "/"),
    issuedAt: now,
    expiresAt: now + TRANSACTION_TTL_SECONDS,
  };

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, createSignedValue(transaction), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: sameSiteFor(provider),
    path: "/",
    maxAge: TRANSACTION_TTL_SECONDS,
  });

  return {
    state: transaction.state,
    nonce: transaction.nonce,
    codeChallenge: createCodeChallenge(codeVerifier),
  };
}

export async function consumeOAuthTransaction(
  provider: OAuthProviderName,
  returnedState: string,
): Promise<OAuthTransaction | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(OAUTH_STATE_COOKIE)?.value;

  cookieStore.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: sameSiteFor(provider),
    path: "/",
    maxAge: 0,
  });

  if (!raw) return null;
  const transaction = readSignedValue(raw);
  if (!transaction) return null;

  const now = Math.floor(Date.now() / 1000);
  if (
    transaction.provider !== provider ||
    transaction.state !== returnedState ||
    transaction.expiresAt <= now ||
    transaction.issuedAt > now + 60
  ) {
    return null;
  }

  return transaction;
}
