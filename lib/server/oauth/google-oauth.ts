/**
 * Express-Führerschein
 * Google OpenID Connect — server-side authentication flow.
 *
 * Security:
 * - Authorization Code flow;
 * - PKCE S256;
 * - state handled separately by oauth-state.ts;
 * - nonce validation;
 * - RS256 ID-token signature verification;
 * - Google JWKS rotation support;
 * - issuer / audience / expiration validation.
 *
 * Server only.
 */

import {
  createPublicKey,
  verify as verifySignature,
  type JsonWebKey as NodeJsonWebKey,
} from "node:crypto";

import {
  getOAuthCallbackUrl,
} from "@/lib/server/auth-origin";

/* ==========================================================================
   GOOGLE ENDPOINTS
   ========================================================================== */

const GOOGLE_AUTHORIZATION_ENDPOINT =
  "https://accounts.google.com/o/oauth2/v2/auth";

const GOOGLE_TOKEN_ENDPOINT =
  "https://oauth2.googleapis.com/token";

const GOOGLE_JWKS_URI =
  "https://www.googleapis.com/oauth2/v3/certs";

/**
 * Google officially accepts these issuer values
 * for its OpenID Connect ID tokens.
 */
const GOOGLE_ISSUERS =
  new Set([
    "https://accounts.google.com",
    "accounts.google.com",
  ]);

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

const DEFAULT_JWKS_CACHE_MS =
  60 * 60 * 1000;

/**
 * Small tolerance for clock differences
 * between our server and Google.
 */
const TOKEN_CLOCK_TOLERANCE_SECONDS =
  60;

/* ==========================================================================
   ENVIRONMENT
   ========================================================================== */

type GoogleEnvironmentVariable =
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET";

function requiredEnv(
  name:
    GoogleEnvironmentVariable,
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

function getGoogleClientId():
  string {
  return requiredEnv(
    "GOOGLE_CLIENT_ID",
  );
}

function getGoogleClientSecret():
  string {
  return requiredEnv(
    "GOOGLE_CLIENT_SECRET",
  );
}

/* ==========================================================================
   GOOGLE TOKEN RESPONSE
   ========================================================================== */

interface GoogleTokenResponse {
  access_token?:
    string;

  expires_in?:
    number;

  id_token?:
    string;

  scope?:
    string;

  token_type?:
    string;

  refresh_token?:
    string;
}

interface GoogleTokenErrorResponse {
  error?:
    string;

  error_description?:
    string;
}

/* ==========================================================================
   JWT HEADER
   ========================================================================== */

interface GoogleJwtHeader {
  alg?:
    string;

  kid?:
    string;

  typ?:
    string;
}

/* ==========================================================================
   GOOGLE ID-TOKEN CLAIMS
   ========================================================================== */

interface GoogleIdTokenClaims {
  iss?:
    string;

  aud?:
    string | string[];

  /**
   * Authorized party.
   */
  azp?:
    string;

  /**
   * Stable Google account identifier.
   */
  sub?:
    string;

  email?:
    string;

  email_verified?:
    boolean | string;

  name?:
    string;

  given_name?:
    string;

  family_name?:
    string;

  picture?:
    string;

  locale?:
    string;

  nonce?:
    string;

  iat?:
    number;

  exp?:
    number;
}

/* ==========================================================================
   GOOGLE JWK
   ========================================================================== */

/**
 * IMPORTANT:
 *
 * Use Node's own JsonWebKey type.
 *
 * Do not use the global browser JsonWebKey type here.
 * createPublicKey({ format: "jwk" }) expects the Node crypto version.
 */
interface GoogleJwk
  extends NodeJsonWebKey {
  kid?:
    string;

  use?:
    string;

  alg?:
    string;
}

interface GoogleJwkSet {
  keys?:
    GoogleJwk[];
}

/* ==========================================================================
   PUBLIC GOOGLE IDENTITY
   ========================================================================== */

export interface GoogleIdentity {
  provider:
    "google";

  /**
   * Stable Google subject identifier.
   */
  providerAccountId:
    string;

  email:
    string;

  emailVerified:
    true;

  displayName:
    string | null;

  firstName:
    string | null;

  lastName:
    string | null;

  pictureUrl:
    string | null;
}

/* ==========================================================================
   AUTHORIZATION URL
   ========================================================================== */

export function createGoogleAuthorizationUrl(
  input: {
    state:
      string;

    nonce:
      string;

    codeChallenge:
      string;

    request?:
      Request;
  },
): string {
  const state =
    input.state.trim();

  const nonce =
    input.nonce.trim();

  const codeChallenge =
    input
      .codeChallenge
      .trim();

  if (
    !state ||
    !nonce ||
    !codeChallenge
  ) {
    throw new Error(
      "[Express-Führerschein] Google OAuth state, nonce oder PKCE challenge fehlt.",
    );
  }

  const url =
    new URL(
      GOOGLE_AUTHORIZATION_ENDPOINT,
    );

  url.searchParams.set(
    "client_id",
    getGoogleClientId(),
  );

  url.searchParams.set(
    "redirect_uri",
    getOAuthCallbackUrl(
      "google",
      input.request,
    ),
  );

  url.searchParams.set(
    "response_type",
    "code",
  );

  url.searchParams.set(
    "scope",
    "openid email profile",
  );

  url.searchParams.set(
    "state",
    state,
  );

  url.searchParams.set(
    "nonce",
    nonce,
  );

  /* ------------------------------------------------------------------------
     PKCE
     ------------------------------------------------------------------------ */

  url.searchParams.set(
    "code_challenge",
    codeChallenge,
  );

  url.searchParams.set(
    "code_challenge_method",
    "S256",
  );

  /* ------------------------------------------------------------------------
     Account selection
     ------------------------------------------------------------------------ */

  url.searchParams.set(
    "prompt",
    "select_account",
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

    codeVerifier:
      string;

    request?:
      Request;
  },
): Promise<GoogleTokenResponse> {
  const code =
    input.code.trim();

  const codeVerifier =
    input
      .codeVerifier
      .trim();

  if (
    !code ||
    !codeVerifier
  ) {
    throw new Error(
      "Google Authorization Code oder PKCE verifier fehlt.",
    );
  }

  const body =
    new URLSearchParams({
      code,

      client_id:
        getGoogleClientId(),

      client_secret:
        getGoogleClientSecret(),

      redirect_uri:
        getOAuthCallbackUrl(
          "google",
          input.request,
        ),

      grant_type:
        "authorization_code",

      code_verifier:
        codeVerifier,
    });

  const response =
    await fetch(
      GOOGLE_TOKEN_ENDPOINT,
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
      | GoogleTokenResponse
      | GoogleTokenErrorResponse
      | null;

  if (!response.ok) {
    let detail =
      `HTTP ${response.status}`;

    if (
      payload &&
      "error_description" in
        payload &&
      typeof payload
        .error_description ===
        "string"
    ) {
      detail =
        payload
          .error_description;
    } else if (
      payload &&
      "error" in payload &&
      typeof payload.error ===
        "string"
    ) {
      detail =
        payload.error;
    }

    throw new Error(
      `[Express-Führerschein] Google Token Exchange fehlgeschlagen: ${detail}`,
    );
  }

  if (
    !payload ||
    typeof payload !==
      "object"
  ) {
    throw new Error(
      "[Express-Führerschein] Google Token-Antwort ist ungültig.",
    );
  }

  return payload as
    GoogleTokenResponse;
}

/* ==========================================================================
   JWT HELPERS
   ========================================================================== */

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
      "Google JWT enthält ungültige JSON-Daten.",
    );
  }
}

/* ==========================================================================
   AUDIENCE
   ========================================================================== */

function audienceMatches(
  audience:
    string | string[] | undefined,

  expected:
    string,
): boolean {
  if (
    typeof audience ===
    "string"
  ) {
    return (
      audience ===
      expected
    );
  }

  return (
    Array.isArray(
      audience,
    ) &&
    audience.includes(
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
      GoogleJwk[];
  }
  | null =
  null;

/* ==========================================================================
   CACHE-CONTROL
   ========================================================================== */

/**
 * Google recommends respecting the cache lifetime
 * returned with its public signing keys.
 */
function cacheDurationFromResponse(
  response:
    Response,
): number {
  const cacheControl =
    response.headers.get(
      "cache-control",
    );

  if (!cacheControl) {
    return (
      DEFAULT_JWKS_CACHE_MS
    );
  }

  const match =
    cacheControl.match(
      /(?:^|,|\s)max-age=(\d+)/i,
    );

  if (!match?.[1]) {
    return (
      DEFAULT_JWKS_CACHE_MS
    );
  }

  const seconds =
    Number.parseInt(
      match[1],
      10,
    );

  if (
    !Number.isFinite(
      seconds,
    ) ||
    seconds <= 0
  ) {
    return (
      DEFAULT_JWKS_CACHE_MS
    );
  }

  return (
    seconds * 1000
  );
}

/* ==========================================================================
   LOAD GOOGLE JWKS
   ========================================================================== */

async function getJwks(
  forceRefresh =
    false,
): Promise<GoogleJwk[]> {
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
      GOOGLE_JWKS_URI,
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
      `[Express-Führerschein] Google JWKS konnten nicht geladen werden. HTTP ${response.status}`,
    );
  }

  const payload =
    (
      await response
        .json()
    ) as
      GoogleJwkSet;

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
      "[Express-Führerschein] Google JWKS enthält keine Schlüssel.",
    );
  }

  jwksCache = {
    keys,

    expiresAt:
      now +
      cacheDurationFromResponse(
        response,
      ),
  };

  return keys;
}

/* ==========================================================================
   FIND GOOGLE SIGNING KEY
   ========================================================================== */

async function findGoogleSigningKey(
  kid:
    string,
): Promise<GoogleJwk> {
  const normalizedKid =
    kid.trim();

  if (!normalizedKid) {
    throw new Error(
      "Google ID-Token enthält keine Key-ID.",
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
   * Google rotates its signing keys.
   *
   * If kid is not present in the current cache,
   * force exactly one refresh.
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
      "Google Signaturschlüssel nicht gefunden.",
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
    GoogleIdTokenClaims,

  jwk:
    GoogleJwk,

  expectedNonce:
    string,
): GoogleIdTokenClaims {
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
      "Ungültiges Google ID-Token.",
    );
  }

  /* ------------------------------------------------------------------------
     Import Google RSA JWK
     ------------------------------------------------------------------------ */

  let publicKey;

  try {
    publicKey =
      createPublicKey({
        /**
         * GoogleJwk extends Node's JsonWebKey.
         *
         * No global browser JsonWebKey cast.
         */
        key:
          jwk,

        format:
          "jwk",
      });
  } catch {
    throw new Error(
      "Google Signaturschlüssel konnte nicht importiert werden.",
    );
  }

  /* ------------------------------------------------------------------------
     Verify RS256 signature
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
      "Ungültige Google ID-Token-Signatur.",
    );
  }

  /* ------------------------------------------------------------------------
     Time
     ------------------------------------------------------------------------ */

  const now =
    Math.floor(
      Date.now() / 1000,
    );

  /* ------------------------------------------------------------------------
     Issuer
     ------------------------------------------------------------------------ */

  if (
    !claims.iss ||
    !GOOGLE_ISSUERS.has(
      claims.iss,
    )
  ) {
    throw new Error(
      "Ungültiger Google Token-Issuer.",
    );
  }

  /* ------------------------------------------------------------------------
     Audience
     ------------------------------------------------------------------------ */

  const clientId =
    getGoogleClientId();

  if (
    !audienceMatches(
      claims.aud,
      clientId,
    )
  ) {
    throw new Error(
      "Ungültige Google Token-Audience.",
    );
  }

  /**
   * If multiple audiences are present, azp identifies
   * the client for which the token was actually issued.
   */
  if (
    Array.isArray(
      claims.aud,
    ) &&
    claims.aud.length > 1 &&
    claims.azp !==
      clientId
  ) {
    throw new Error(
      "Ungültige Google Token Authorized Party.",
    );
  }

  /* ------------------------------------------------------------------------
     Expiration
     ------------------------------------------------------------------------ */

  if (
    typeof claims.exp !==
      "number" ||
    claims.exp <=
      now -
        TOKEN_CLOCK_TOLERANCE_SECONDS
  ) {
    throw new Error(
      "Google ID-Token ist abgelaufen.",
    );
  }

  /* ------------------------------------------------------------------------
     Issued At
     ------------------------------------------------------------------------ */

  if (
    typeof claims.iat ===
      "number" &&
    claims.iat >
      now +
        TOKEN_CLOCK_TOLERANCE_SECONDS
  ) {
    throw new Error(
      "Google ID-Token besitzt einen ungültigen Ausstellungszeitpunkt.",
    );
  }

  /* ------------------------------------------------------------------------
     Nonce
     ------------------------------------------------------------------------ */

  if (
    !expectedNonce ||
    claims.nonce !==
      expectedNonce
  ) {
    throw new Error(
      "Google ID-Token enthält einen ungültigen Nonce.",
    );
  }

  return claims;
}

/* ==========================================================================
   VALIDATE GOOGLE ID TOKEN
   ========================================================================== */

async function validateGoogleIdToken(
  idToken:
    string,

  expectedNonce:
    string,
): Promise<GoogleIdTokenClaims> {
  const parts =
    idToken.split(
      ".",
    );

  if (
    parts.length !== 3
  ) {
    throw new Error(
      "Ungültiges Google ID-Token.",
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
      "Ungültiges Google ID-Token.",
    );
  }

  const header =
    decodeJsonSegment<GoogleJwtHeader>(
      headerPart,
    );

  const claims =
    decodeJsonSegment<GoogleIdTokenClaims>(
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
      "Nicht unterstützte Google ID-Token-Signatur.",
    );
  }

  /* ------------------------------------------------------------------------
     Key ID
     ------------------------------------------------------------------------ */

  if (
    !header.kid
  ) {
    throw new Error(
      "Google ID-Token enthält keine Signaturschlüssel-ID.",
    );
  }

  const jwk =
    await findGoogleSigningKey(
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

function googleBooleanClaim(
  value:
    boolean | string | undefined,
): boolean {
  return (
    value === true ||
    value === "true"
  );
}

/* ==========================================================================
   AUTHENTICATE GOOGLE AUTHORIZATION CODE
   ========================================================================== */

export async function authenticateGoogleAuthorizationCode(
  input: {
    code:
      string;

    codeVerifier:
      string;

    nonce:
      string;

    request?:
      Request;
  },
): Promise<GoogleIdentity> {
  /* ------------------------------------------------------------------------
     Input
     ------------------------------------------------------------------------ */

  const code =
    input.code.trim();

  const codeVerifier =
    input
      .codeVerifier
      .trim();

  const nonce =
    input.nonce.trim();

  if (
    !code ||
    !codeVerifier ||
    !nonce
  ) {
    throw new Error(
      "Google Authorization Code, PKCE verifier oder Nonce fehlt.",
    );
  }

  /* ------------------------------------------------------------------------
     Exchange authorization code
     ------------------------------------------------------------------------ */

  const tokenResponse =
    await exchangeCode({
      code,

      codeVerifier,

      request:
        input.request,
    });

  if (
    !tokenResponse
      .id_token
  ) {
    throw new Error(
      "Google hat kein ID-Token geliefert.",
    );
  }

  /* ------------------------------------------------------------------------
     Validate ID token
     ------------------------------------------------------------------------ */

  const claims =
    await validateGoogleIdToken(
      tokenResponse
        .id_token,

      nonce,
    );

  /* ------------------------------------------------------------------------
     E-mail
     ------------------------------------------------------------------------ */

  const emailVerified =
    googleBooleanClaim(
      claims
        .email_verified,
    );

  if (
    !claims.sub ||
    !claims.email ||
    !emailVerified
  ) {
    throw new Error(
      "Google-Konto besitzt keine verifizierte E-Mail-Adresse.",
    );
  }

  const email =
    claims.email
      .trim()
      .toLowerCase();

  if (!email) {
    throw new Error(
      "Google-Konto enthält keine gültige E-Mail-Adresse.",
    );
  }

  /* ------------------------------------------------------------------------
     Identity
     ------------------------------------------------------------------------ */

  return {
    provider:
      "google",

    providerAccountId:
      claims.sub,

    email,

    emailVerified:
      true,

    displayName:
      claims.name ??
      null,

    firstName:
      claims.given_name ??
      null,

    lastName:
      claims.family_name ??
      null,

    pictureUrl:
      claims.picture ??
      null,
  };
}