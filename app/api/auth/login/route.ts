import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  LOGIN_ROUTES,
} from "@/data/login";

import {
  getAuthPublicOrigin,
  sanitizeReturnPath,
} from "@/lib/server/auth-origin";

import {
  issueAuthSession,
} from "@/lib/server/auth-session";

import {
  getClientIp,
} from "@/lib/server/client-ip";

import {
  authenticateCredentials,
  LoginServiceError,
} from "@/lib/server/login-service";

import type {
  LoginApiErrorResponse,
  LoginApiFieldError,
  LoginResponse,
} from "@/types/login";

/* ==========================================================================
   ROUTE CONFIGURATION
   ========================================================================== */

/**
 * Cette route utilise :
 *
 * - node:crypto indirectement ;
 * - sessions serveur ;
 * - password verification ;
 * - repositories.
 *
 * Elle doit donc rester sur le runtime Node.js.
 */
export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* ==========================================================================
   RESPONSE HEADERS
   ========================================================================== */

/**
 * Les réponses d'authentification ne doivent
 * jamais être mises en cache.
 */
const NO_STORE_HEADERS = {
  "Cache-Control":
    "no-store, max-age=0",

  Pragma:
    "no-cache",
} as const;

/* ==========================================================================
   INTERNAL TYPES
   ========================================================================== */

interface LoginRequestBody {
  identifier?:
    unknown;

  password?:
    unknown;

  countryCode?:
    unknown;

  returnTo?:
    unknown;
}

/* ==========================================================================
   REQUEST HELPERS
   ========================================================================== */

function isRecord(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value,
    )
  );
}

/* ==========================================================================
   ORIGIN SECURITY
   ========================================================================== */

/**
 * Vérifie que la requête POST provient
 * bien de notre propre application.
 *
 * En production :
 * - Origin est obligatoire ;
 * - l'origine doit correspondre exactement
 *   au domaine public configuré.
 *
 * En développement :
 * - l'absence de Origin reste tolérée
 *   pour faciliter les tests locaux.
 */
function requestOriginAllowed(
  request:
    NextRequest,
): boolean {
  const origin =
    request.headers.get(
      "origin",
    );

  if (!origin) {
    return (
      process.env.NODE_ENV !==
      "production"
    );
  }

  try {
    const incomingOrigin =
      new URL(
        origin,
      ).origin;

    const expectedOrigin =
      getAuthPublicOrigin(
        request,
      );

    return (
      incomingOrigin ===
      expectedOrigin
    );
  } catch {
    return false;
  }
}

/* ==========================================================================
   RETURN PATH
   ========================================================================== */

/**
 * Récupère la destination demandée après
 * connexion puis la passe obligatoirement
 * par sanitizeReturnPath().
 *
 * Cela bloque les redirections externes :
 *
 * https://malicious-site.example
 * //malicious-site.example
 */
function resolveReturnTo(
  body: unknown,
): string {
  if (!isRecord(body)) {
    return (
      LOGIN_ROUTES
        .afterLogin
    );
  }

  const requestBody =
    body as
      LoginRequestBody;

  if (
    typeof requestBody
      .returnTo !==
    "string"
  ) {
    return (
      LOGIN_ROUTES
        .afterLogin
    );
  }

  return sanitizeReturnPath(
    requestBody.returnTo,

    LOGIN_ROUTES
      .afterLogin,
  );
}

/* ==========================================================================
   HTTP STATUS
   ========================================================================== */

function statusForError(
  code:
    LoginServiceError["code"],
): number {
  switch (code) {
    /* ----------------------------------------------------------------------
       Invalid request
       ---------------------------------------------------------------------- */

    case "VALIDATION_ERROR":
    case "INVALID_IDENTIFIER":
      return 400;

    /* ----------------------------------------------------------------------
       Authentication failed
       ---------------------------------------------------------------------- */

    case "INVALID_CREDENTIALS":
      return 401;

    /* ----------------------------------------------------------------------
       Account exists but cannot authenticate
       ---------------------------------------------------------------------- */

    case "EMAIL_NOT_VERIFIED":
    case "ACCOUNT_DISABLED":
      return 403;

    /* ----------------------------------------------------------------------
       Rate limiting
       ---------------------------------------------------------------------- */

    case "RATE_LIMITED":
      return 429;

    /* ----------------------------------------------------------------------
       Defensive fallback
       ---------------------------------------------------------------------- */

    default:
      return 500;
  }
}

/* ==========================================================================
   RATE LIMIT DETAILS
   ========================================================================== */

function retryAfterSeconds(
  details:
    unknown,
): number | undefined {
  if (
    !isRecord(
      details,
    )
  ) {
    return undefined;
  }

  const value =
    details
      .retryAfterSeconds;

  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    ) ||
    value <= 0
  ) {
    return undefined;
  }

  return Math.ceil(
    value,
  );
}

/* ==========================================================================
   VALIDATION DETAILS
   ========================================================================== */

/**
 * Transforme uniquement les erreurs serveur
 * compatibles avec LoginApiFieldError.
 *
 * On évite de renvoyer directement un objet
 * interne non validé au navigateur.
 */
function validationDetails(
  details:
    unknown,
):
  | readonly LoginApiFieldError[]
  | undefined {
  if (
    !Array.isArray(
      details,
    )
  ) {
    return undefined;
  }

  const result:
    LoginApiFieldError[] = [];

  for (
    const detail
    of details
  ) {
    if (
      !isRecord(
        detail,
      )
    ) {
      continue;
    }

    const code =
      detail.code;

    const message =
      detail.message;

    const field =
      detail.field;

    if (
      typeof code !==
        "string" ||
      typeof message !==
        "string"
    ) {
      continue;
    }

    const fieldValue:
      LoginApiFieldError["field"] =
      field ===
        "identifier" ||
      field ===
        "password" ||
      field ===
        "countryCode"
        ? field
        : undefined;

    result.push({
      field:
        fieldValue,

      code,

      message,
    });
  }

  return result.length > 0
    ? result
    : undefined;
}

/* ==========================================================================
   LOGIN SERVICE ERROR RESPONSE
   ========================================================================== */

function createLoginServiceErrorResponse(
  error:
    LoginServiceError,
):
  NextResponse<
    LoginApiErrorResponse
  > {
  const retryAfter =
    retryAfterSeconds(
      error.details,
    );

  const headers:
    Record<
      string,
      string
    > = {
    ...NO_STORE_HEADERS,
  };

  /**
   * HTTP Retry-After pour les réponses 429.
   */
  if (
    error.code ===
      "RATE_LIMITED" &&
    retryAfter
  ) {
    headers[
      "Retry-After"
    ] =
      String(
        retryAfter,
      );
  }

  const response:
    LoginApiErrorResponse = {
    ok: false,

    error: {
      code:
        error.code,

      message:
        error.message,

      details:
        error.code ===
          "VALIDATION_ERROR"
          ? validationDetails(
              error.details,
            )
          : undefined,

      retryAfterSeconds:
        retryAfter,

      /**
       * Un compte non vérifié doit pouvoir
       * reprendre le processus d'inscription.
       */
      nextPath:
        error.code ===
          "EMAIL_NOT_VERIFIED"
          ? LOGIN_ROUTES
              .register
          : undefined,
    },
  };

  return NextResponse.json(
    response,

    {
      status:
        statusForError(
          error.code,
        ),

      headers,
    },
  );
}

/* ==========================================================================
   GENERIC ERROR RESPONSE
   ========================================================================== */

function createErrorResponse(
  status: number,
  code: string,
  message: string,
):
  NextResponse<
    LoginApiErrorResponse
  > {
  return NextResponse.json(
    {
      ok: false,

      error: {
        code,
        message,
      },
    },

    {
      status,

      headers:
        NO_STORE_HEADERS,
    },
  );
}

/* ==========================================================================
   POST /api/auth/login
   ========================================================================== */

export async function POST(
  request:
    NextRequest,
) {
  /* ------------------------------------------------------------------------
     1. Origin / CSRF protection
     ------------------------------------------------------------------------ */

  if (
    !requestOriginAllowed(
      request,
    )
  ) {
    return createErrorResponse(
      403,

      "INVALID_ORIGIN",

      "Die Anfrage stammt von einer nicht erlaubten Quelle.",
    );
  }

  /* ------------------------------------------------------------------------
     2. Parse JSON
     ------------------------------------------------------------------------ */

  let body:
    unknown;

  try {
    body =
      await request.json();
  } catch {
    return createErrorResponse(
      400,

      "INVALID_JSON",

      "Die Anfrage enthält keine gültigen Anmeldedaten.",
    );
  }

  /* ------------------------------------------------------------------------
     3. Safe redirect destination
     ------------------------------------------------------------------------ */

  const returnTo =
    resolveReturnTo(
      body,
    );

  /* ------------------------------------------------------------------------
     4. Client IP
     ------------------------------------------------------------------------ */

  const {
    ip,
  } =
    getClientIp(
      request.headers,
    );

  /* ------------------------------------------------------------------------
     5. Authenticate
     ------------------------------------------------------------------------ */

  try {
    const user =
      await authenticateCredentials(
        body,

        ip,
      );

    /* ----------------------------------------------------------------------
       6. Create authenticated session
       ---------------------------------------------------------------------- */

    await issueAuthSession(
      user.id,
    );

    /* ----------------------------------------------------------------------
       7. Public response
       ---------------------------------------------------------------------- */

    const response:
      LoginResponse = {
      ok: true,

      data: {
        /**
         * Return only safe public information.
         *
         * Never return:
         *
         * passwordHash
         * session token
         * internal authentication secrets
         */
        user: {
          id:
            user.id,

          firstName:
            user.firstName,

          lastName:
            user.lastName,

          email:
            user.email,

          countryCode:
            user.countryCode,
        },

        nextPath:
          returnTo,
      },
    };

    return NextResponse.json(
      response,

      {
        status:
          200,

        headers:
          NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    /* ----------------------------------------------------------------------
       Known authentication error
       ---------------------------------------------------------------------- */

    if (
      error instanceof
        LoginServiceError
    ) {
      return createLoginServiceErrorResponse(
        error,
      );
    }

    /* ----------------------------------------------------------------------
       Unexpected server error
       ---------------------------------------------------------------------- */

    console.error(
      "[Express-Führerschein] login failed",
      error,
    );

    return createErrorResponse(
      500,

      "INTERNAL_ERROR",

      "Die Anmeldung konnte nicht durchgeführt werden. Bitte versuche es erneut.",
    );
  }
}