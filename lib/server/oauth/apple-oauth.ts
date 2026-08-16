/**
 * Express-Führerschein
 * Sign in with Apple — server-side OAuth / OpenID Connect flow.
 *
 * Responsibilities:
 * - build the Apple authorization URL;
 * - create the Apple ES256 client-secret JWT;
 * - exchange the authorization code;
 * - download/cache Apple JWKS;
 * - verify the Apple ID-token signature;
 * - validate issuer, audience, expiration and nonce;
 * - return a normalized verified Apple identity.
 *
 * Server only.
 */

import {
  createPrivateKey,
  createPublicKey,
  sign as signData,
  verify as verifySignature,
  type JsonWebKey as NodeJsonWebKey,
} from "node:crypto";

import {
  getOAuthCallbackUrl,
} from "@/lib/server/auth-origin";

/* ==========================================================================
   APPLE ENDPOINTS
   ========================================================================== */

const APPLE_ISSUER =
  "https://appleid.apple.com";

const APPLE_AUTHORIZATION_ENDPOINT =
  "https://appleid.apple.com/auth/authorize";

const APPLE_TOKEN_ENDPOINT =
  "https://appleid.apple.com/auth/token";

const APPLE_JWKS_URI =
  "https://appleid.apple.com/auth/keys";

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

/**
 * Apple client-secret lifetime.
 *
 * 180 days keeps the generated token
 * below Apple's six-month maximum.
 */
const APPLE_CLIENT_SECRET_TTL_SECONDS =
  60 * 60 * 24 * 180;

/**
 * Local JWKS cache.
 *
 * Apple may rotate keys, therefore a missing kid
 * forces one immediate refresh.
 */
const APPLE_JWKS_CACHE_MS =
  60 * 60 * 1000;

/**
 * Small clock tolerance.
 */
const TOKEN_CLOCK_TOLERANCE_SECONDS =
  60;

/* ==========================================================================
   ENVIRONMENT
   ========================================================================== */

type AppleEnvironmentVariable =
  | "APPLE_CLIENT_ID"
  | "APPLE_TEAM_ID"
  | "APPLE_KEY_ID"
  | "APPLE_PRIVATE_KEY";

function requiredEnv(
  name:
    AppleEnvironmentVariable,
): string {
  const value =
    process.env[name]
      ?.trim();

  if (!value) {
    throw new Error(
      `[Express-Führerschein] ${name} fehlt.`,
    );
  }

  return value;
}

function getAppleClientId():
  string {
  return requiredEnv(
    "APPLE_CLIENT_ID",
  );
}

/**
 * APPLE_PRIVATE_KEY can be stored in .env either:
 *
 * -----BEGIN PRIVATE KEY-----
 * ...
 * -----END PRIVATE KEY-----
 *
 * or with escaped \n characters.
 */
function getApplePrivateKey():
  string {
  return requiredEnv(
    "APPLE_PRIVATE_KEY",
  ).replace(
    /\\n/g,
    "\n",
  );
}

/* ==========================================================================
   TOKEN RESPONSE
   ========================================================================== */

interface AppleTokenResponse {
  access_token?:
    string;

  expires_in?:
    number;

  id_token?:
    string;

  refresh_token?:
    string;

  token_type?:
    string;
}

interface AppleTokenErrorResponse {
  error?:
    string;
}

/* ==========================================================================
   JWT HEADER
   ========================================================================== */

interface JwtHeader {
  alg?:
    string;

  kid?:
    string;

  typ?:
    string;
}

/* ==========================================================================
   APPLE ID-TOKEN CLAIMS
   ========================================================================== */

interface AppleIdTokenClaims {
  iss?:
    string;

  aud?:
    string | string[];

  sub?:
    string;

  email?:
    string;

  email_verified?:
    boolean | string;

  is_private_email?:
    boolean | string;

  nonce?:
    string;

  iat?:
    number;

  exp?:
    number;
}

/* ==========================================================================
   APPLE JWK
   ========================================================================== */

/**
 * IMPORTANT:
 *
 * We extend Node's own JsonWebKey type instead of declaring
 * an unrelated browser/global JsonWebKey.
 *
 * @types/node expects its JsonWebKey structure when
 * createPublicKey({ key, format: "jwk" }) is used.
 */
interface AppleJwk
  extends NodeJsonWebKey {
  kid?:
    string;

  use?:
    string;

  alg?:
    string;
}

interface AppleJwkSet {
  keys?:
    AppleJwk[];
}

/* ==========================================================================
   PUBLIC IDENTITY
   ========================================================================== */

export interface AppleIdentity {
  provider:
    "apple";

  /**
   * Apple's stable subject identifier.
   */
  providerAccountId:
    string;

  email:
    string;

  emailVerified:
    true;

  /**
   * Indicates whether Apple supplied
   * a private relay address.
   */
  privateRelay:
    boolean;
}

/* ==========================================================================
   BASE64URL HELPERS
   ========================================================================== */

function base64UrlJson(
  value:
    unknown,
): string {
  return Buffer
    .from(
      JSON.stringify(
        value,
      ),
      "utf8",
    )
    .toString(
      "base64url",
    );
}

function decodeJsonSegment<T>(
  segment:
    string,
): T {
  try {
    return JSON.parse(
      Buffer
        .from(
          segment,
          "base64url",
        )
        .toString(
          "utf8",
        ),
    ) as T;
  } catch {
    throw new Error(
      "Apple JWT enthält ungültige JSON-Daten.",
    );
  }
}

/* ==========================================================================
   APPLE CLIENT SECRET
   ========================================================================== */

/**
 * Creates the JWT Apple expects as client_secret.
 *
 * Header:
 * - alg = ES256
 * - kid = Apple Key ID
 *
 * Claims:
 * - iss = Team ID
 * - aud = https://appleid.apple.com
 * - sub = Services ID / client ID
 */
function createAppleClientSecret():
  string {
  const now =
    Math.floor(
      Date.now() / 1000,
    );

  const header = {
    alg:
      "ES256",

    kid:
      requiredEnv(
        "APPLE_KEY_ID",
      ),

    typ:
      "JWT",
  };

  const payload = {
    iss:
      requiredEnv(
        "APPLE_TEAM_ID",
      ),

    iat:
      now,

    exp:
      now +
      APPLE_CLIENT_SECRET_TTL_SECONDS,

    aud:
      APPLE_ISSUER,

    sub:
      getAppleClientId(),
  };

  const encodedHeader =
    base64UrlJson(
      header,
    );

  const encodedPayload =
    base64UrlJson(
      payload,
    );

  const signingInput =
    `${encodedHeader}.${encodedPayload}`;

  let privateKey;

  try {
    privateKey =
      createPrivateKey(
        getApplePrivateKey(),
      );
  } catch {
    throw new Error(
      "[Express-Führerschein] APPLE_PRIVATE_KEY ist ungültig.",
    );
  }

  /**
   * JWT ES256 uses a fixed-width R || S signature,
   * therefore ieee-p1363 is required here.
   */
  const signature =
    signData(
      "sha256",

      Buffer.from(
        signingInput,
        "utf8",
      ),

      {
        key:
          privateKey,

        dsaEncoding:
          "ieee-p1363",
      },
    );

  return (
    `${signingInput}.` +
    signature.toString(
      "base64url",
    )
  );
}

/* ==========================================================================
   AUTHORIZATION URL
   ========================================================================== */

export function createAppleAuthorizationUrl(
  input: {
    state:
      string;

    nonce:
      string;

    request?:
      Request;
  },
): string {
  const state =
    input.state.trim();

  const nonce =
    input.nonce.trim();

  if (
    !state ||
    !nonce
  ) {
    throw new Error(
      "[Express-Führerschein] Apple OAuth state/nonce fehlt.",
    );
  }

  const url =
    new URL(
      APPLE_AUTHORIZATION_ENDPOINT,
    );

  url.searchParams.set(
    "client_id",
    getAppleClientId(),
  );

  url.searchParams.set(
    "redirect_uri",
    getOAuthCallbackUrl(
      "apple",
      input.request,
    ),
  );

  url.searchParams.set(
    "response_type",
    "code",
  );

  /**
   * Our callback route is POST:
   *
   * /api/auth/oauth/apple/callback
   */
  url.searchParams.set(
    "response_mode",
    "form_post",
  );

  url.searchParams.set(
    "scope",
    "name email",
  );

  url.searchParams.set(
    "state",
    state,
  );

  url.searchParams.set(
    "nonce",
    nonce,
  );

  return url.toString();
}

/* ==========================================================================
   TOKEN EXCHANGE
   ========================================================================== */

async function exchangeCode(
  input: {
    code:
      string;

    request?:
      Request;
  },
): Promise<AppleTokenResponse> {
  const code =
    input.code.trim();

  if (!code) {
    throw new Error(
      "Apple Authorization Code fehlt.",
    );
  }

  const body =
    new URLSearchParams({
      client_id:
        getAppleClientId(),

      client_secret:
        createAppleClientSecret(),

      code,

      grant_type:
        "authorization_code",

      redirect_uri:
        getOAuthCallbackUrl(
          "apple",
          input.request,
        ),
    });

  const response =
    await fetch(
      APPLE_TOKEN_ENDPOINT,

      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",

          Accept:
            "application/json",
        },

        body,

        cache:
          "no-store",
      },
    );

  const payload =
    (
      await response
        .json()
        .catch(
          () => null,
        )
    ) as
      | AppleTokenResponse
      | AppleTokenErrorResponse
      | null;

  if (!response.ok) {
    const detail =
      payload &&
      "error" in payload &&
      typeof payload.error ===
        "string"
        ? payload.error
        : `HTTP ${response.status}`;

    throw new Error(
      `[Express-Führerschein] Apple Token Exchange fehlgeschlagen: ${detail}`,
    );
  }

  if (
    !payload ||
    typeof payload !==
      "object"
  ) {
    throw new Error(
      "[Express-Führerschein] Apple Token-Antwort ist ungültig.",
    );
  }

  return payload as
    AppleTokenResponse;
}

/* ==========================================================================
   AUDIENCE
   ========================================================================== */

function audienceMatches(
  aud:
    string | string[] | undefined,

  expected:
    string,
): boolean {
  if (
    typeof aud ===
    "string"
  ) {
    return (
      aud === expected
    );
  }

  return (
    Array.isArray(
      aud,
    ) &&
    aud.includes(
      expected,
    )
  );
}

/* ==========================================================================
   JWKS CACHE
   ========================================================================== */

let jwksCache:
  {
    expiresAt:
      number;

    keys:
      AppleJwk[];
  }
  | null =
  null;

/* ==========================================================================
   LOAD APPLE JWKS
   ========================================================================== */

async function getJwks(
  forceRefresh =
    false,
): Promise<AppleJwk[]> {
  const now =
    Date.now();

  if (
    !forceRefresh &&
    jwksCache &&
    jwksCache.expiresAt >
      now
  ) {
    return (
      jwksCache.keys
    );
  }

  const response =
    await fetch(
      APPLE_JWKS_URI,

      {
        method:
          "GET",

        headers: {
          Accept:
            "application/json",
        },

        cache:
          "no-store",
      },
    );

  if (!response.ok) {
    throw new Error(
      `[Express-Führerschein] Apple JWKS konnten nicht geladen werden. HTTP ${response.status}`,
    );
  }

  const payload =
    (
      await response.json()
    ) as
      AppleJwkSet;

  const keys =
    Array.isArray(
      payload.keys,
    )
      ? payload.keys
      : [];

  if (
    keys.length === 0
  ) {
    throw new Error(
      "[Express-Führerschein] Apple JWKS enthält keine Schlüssel.",
    );
  }

  jwksCache = {
    keys,

    expiresAt:
      now +
      APPLE_JWKS_CACHE_MS,
  };

  return keys;
}

/* ==========================================================================
   FIND SIGNING KEY
   ========================================================================== */

async function findAppleSigningKey(
  kid:
    string,
): Promise<AppleJwk> {
  const normalizedKid =
    kid.trim();

  if (!normalizedKid) {
    throw new Error(
      "Apple ID-Token enthält keine Key-ID.",
    );
  }

  let key =
    (
      await getJwks()
    ).find(
      (candidate) =>
        candidate.kid ===
        normalizedKid,
    );

  /**
   * Apple may have rotated signing keys.
   *
   * Force one refresh before rejecting the token.
   */
  if (!key) {
    key =
      (
        await getJwks(
          true,
        )
      ).find(
        (candidate) =>
          candidate.kid ===
          normalizedKid,
      );
  }

  if (!key) {
    throw new Error(
      "Apple Signaturschlüssel nicht gefunden.",
    );
  }

  return key;
}

/* ==========================================================================
   VERIFY SIGNATURE + CLAIMS
   ========================================================================== */

function validateWithKey(
  idToken:
    string,

  claims:
    AppleIdTokenClaims,

  jwk:
    AppleJwk,

  expectedNonce:
    string,
): AppleIdTokenClaims {
  const [
    headerPart,
    payloadPart,
    signaturePart,
  ] =
    idToken.split(
      ".",
    );

  if (
    !headerPart ||
    !payloadPart ||
    !signaturePart
  ) {
    throw new Error(
      "Ungültiges Apple ID-Token.",
    );
  }

  /* ------------------------------------------------------------------------
     Import Apple RSA public JWK
     ------------------------------------------------------------------------ */

  let publicKey;

  try {
    publicKey =
      createPublicKey({
        /**
         * IMPORTANT:
         *
         * AppleJwk extends Node's own JsonWebKey type.
         * No global DOM JsonWebKey cast is used.
         */
        key:
          jwk,

        format:
          "jwk",
      });
  } catch {
    throw new Error(
      "Apple Signaturschlüssel konnte nicht importiert werden.",
    );
  }

  /* ------------------------------------------------------------------------
     Verify JWS signature
     ------------------------------------------------------------------------ */

  const signingInput =
    `${headerPart}.${payloadPart}`;

  const signature =
    Buffer.from(
      signaturePart,
      "base64url",
    );

  const validSignature =
    verifySignature(
      "RSA-SHA256",

      Buffer.from(
        signingInput,
        "utf8",
      ),

      publicKey,

      signature,
    );

  if (
    !validSignature
  ) {
    throw new Error(
      "Ungültige Apple ID-Token-Signatur.",
    );
  }

  /* ------------------------------------------------------------------------
     Claims
     ------------------------------------------------------------------------ */

  const now =
    Math.floor(
      Date.now() / 1000,
    );

  if (
    claims.iss !==
    APPLE_ISSUER
  ) {
    throw new Error(
      "Ungültiger Apple Token-Issuer.",
    );
  }

  if (
    !audienceMatches(
      claims.aud,
      getAppleClientId(),
    )
  ) {
    throw new Error(
      "Ungültige Apple Token-Audience.",
    );
  }

  if (
    typeof claims.exp !==
      "number" ||
    claims.exp <=
      now -
        TOKEN_CLOCK_TOLERANCE_SECONDS
  ) {
    throw new Error(
      "Apple ID-Token ist abgelaufen.",
    );
  }

  if (
    typeof claims.iat ===
      "number" &&
    claims.iat >
      now +
        TOKEN_CLOCK_TOLERANCE_SECONDS
  ) {
    throw new Error(
      "Apple ID-Token besitzt einen ungültigen Ausstellungszeitpunkt.",
    );
  }

  if (
    !expectedNonce ||
    claims.nonce !==
      expectedNonce
  ) {
    throw new Error(
      "Apple ID-Token enthält einen ungültigen Nonce.",
    );
  }

  return claims;
}

/* ==========================================================================
   VALIDATE APPLE ID TOKEN
   ========================================================================== */

async function validateAppleIdToken(
  idToken:
    string,

  expectedNonce:
    string,
): Promise<AppleIdTokenClaims> {
  const parts =
    idToken.split(
      ".",
    );

  if (
    parts.length !== 3
  ) {
    throw new Error(
      "Ungültiges Apple ID-Token.",
    );
  }

  const [
    headerPart,
    payloadPart,
  ] =
    parts;

  if (
    !headerPart ||
    !payloadPart
  ) {
    throw new Error(
      "Ungültiges Apple ID-Token.",
    );
  }

  const header =
    decodeJsonSegment<JwtHeader>(
      headerPart,
    );

  const claims =
    decodeJsonSegment<AppleIdTokenClaims>(
      payloadPart,
    );

  /* ------------------------------------------------------------------------
     Algorithm
     ------------------------------------------------------------------------ */

  if (
    header.alg !==
    "RS256"
  ) {
    throw new Error(
      "Nicht unterstützte Apple ID-Token-Signatur.",
    );
  }

  /* ------------------------------------------------------------------------
     Key ID
     ------------------------------------------------------------------------ */

  if (
    !header.kid
  ) {
    throw new Error(
      "Apple ID-Token enthält keine Signaturschlüssel-ID.",
    );
  }

  const jwk =
    await findAppleSigningKey(
      header.kid,
    );

  return validateWithKey(
    idToken,
    claims,
    jwk,
    expectedNonce,
  );
}

/* ==========================================================================
   BOOLEAN CLAIM
   ========================================================================== */

function appleBooleanClaim(
  value:
    boolean | string | undefined,
): boolean {
  return (
    value === true ||
    value === "true"
  );
}

/* ==========================================================================
   AUTHENTICATE AUTHORIZATION CODE
   ========================================================================== */

export async function authenticateAppleAuthorizationCode(
  input: {
    code:
      string;

    nonce:
      string;

    request?:
      Request;
  },
): Promise<AppleIdentity> {
  /* ------------------------------------------------------------------------
     Input
     ------------------------------------------------------------------------ */

  const code =
    input.code.trim();

  const nonce =
    input.nonce.trim();

  if (
    !code ||
    !nonce
  ) {
    throw new Error(
      "Apple Authorization Code oder Nonce fehlt.",
    );
  }

  /* ------------------------------------------------------------------------
     Code exchange
     ------------------------------------------------------------------------ */

  const tokenResponse =
    await exchangeCode({
      code,

      request:
        input.request,
    });

  if (
    !tokenResponse
      .id_token
  ) {
    throw new Error(
      "Apple hat kein ID-Token geliefert.",
    );
  }

  /* ------------------------------------------------------------------------
     ID-token validation
     ------------------------------------------------------------------------ */

  const claims =
    await validateAppleIdToken(
      tokenResponse
        .id_token,

      nonce,
    );

  /* ------------------------------------------------------------------------
     Verified e-mail
     ------------------------------------------------------------------------ */

  const emailVerified =
    appleBooleanClaim(
      claims
        .email_verified,
    );

  if (
    !claims.sub ||
    !claims.email ||
    !emailVerified
  ) {
    throw new Error(
      "Apple-Konto besitzt keine verifizierte E-Mail-Adresse.",
    );
  }

  const email =
    claims.email
      .trim()
      .toLowerCase();

  if (!email) {
    throw new Error(
      "Apple-Konto enthält keine gültige E-Mail-Adresse.",
    );
  }

  /* ------------------------------------------------------------------------
     Identity
     ------------------------------------------------------------------------ */

  return {
    provider:
      "apple",

    providerAccountId:
      claims.sub,

    email,

    emailVerified:
      true,

    privateRelay:
      appleBooleanClaim(
        claims
          .is_private_email,
      ),
  };
}