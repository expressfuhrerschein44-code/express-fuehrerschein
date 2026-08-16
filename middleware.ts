import {
  NextResponse,
  type NextRequest,
} from "next/server";

/* ==========================================================================
   EXPRESS-FÜHRERSCHEIN
   MIDDLEWARE — LANGUAGE DETECTION
   ========================================================================== */

/**
 * Le middleware gère uniquement la langue de l'interface.
 *
 * IMPORTANT :
 *
 * - langue et pays restent totalement indépendants ;
 * - aucune redirection automatique ;
 * - aucune logique de permis de conduire ;
 * - aucune logique d'inscription ;
 * - aucune logique d'authentification ;
 * - aucune géolocalisation IP ici ;
 * - le pays est déterminé séparément côté serveur.
 *
 * La locale normalisée est transmise à l'application via :
 *
 * x-ef-locale
 *
 * et conservée dans :
 *
 * ef_locale
 */

/* ==========================================================================
   LOCALES
   ========================================================================== */

const SUPPORTED_LOCALES = [
  "de",
  "fr",
  "nl",
  "es",
  "it",
  "en",
] as const;

type Locale =
  (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: Locale =
  "de";

const LOCALE_COOKIE =
  "ef_locale";

const LOCALE_HEADER =
  "x-ef-locale";

/**
 * Durée :
 * 1 année.
 */
const LOCALE_COOKIE_MAX_AGE =
  60 * 60 * 24 * 365;

/* ==========================================================================
   NORMALIZATION
   ========================================================================== */

/**
 * Convertit par exemple :
 *
 * de
 * de-DE
 * de_de
 *
 * en :
 *
 * de
 *
 * Retourne null lorsque la langue
 * n'est pas supportée.
 */
function normalizeLocale(
  value:
    | string
    | null
    | undefined,
): Locale | null {
  if (!value) {
    return null;
  }

  const normalized =
    value
      .trim()
      .toLowerCase()
      .replace("_", "-")
      .split("-")[0];

  if (!normalized) {
    return null;
  }

  return SUPPORTED_LOCALES.includes(
    normalized as Locale,
  )
    ? (normalized as Locale)
    : null;
}

/* ==========================================================================
   ACCEPT-LANGUAGE
   ========================================================================== */

interface ParsedLanguage {
  locale: Locale;
  quality: number;
  index: number;
}

/**
 * Exemples acceptés :
 *
 * de-DE,de;q=0.9,en;q=0.8
 *
 * fr-FR,fr;q=0.9,en;q=0.7
 *
 * nl-BE,nl;q=0.9,fr;q=0.8
 *
 * es-ES,es;q=0.9
 */
function localeFromAcceptLanguage(
  header:
    | string
    | null,
): Locale {
  if (!header) {
    return DEFAULT_LOCALE;
  }

  const languages:
    ParsedLanguage[] = [];

  const entries =
    header.split(",");

  entries.forEach(
    (
      rawEntry,
      index,
    ) => {
      const entry =
        rawEntry.trim();

      if (!entry) {
        return;
      }

      const parts =
        entry
          .split(";")
          .map((part) =>
            part.trim(),
          );

      const languageTag =
        parts[0];

      /**
       * "*" signifie :
       * toutes langues acceptées.
       *
       * Dans ce cas nous laisserons
       * DEFAULT_LOCALE prendre le relais.
       */
      if (
        !languageTag ||
        languageTag === "*"
      ) {
        return;
      }

      const locale =
        normalizeLocale(
          languageTag,
        );

      if (!locale) {
        return;
      }

      let quality = 1;

      const qualityPart =
        parts.find((part) =>
          part
            .toLowerCase()
            .startsWith("q="),
        );

      if (qualityPart) {
        const parsed =
          Number.parseFloat(
            qualityPart.slice(2),
          );

        /**
         * Une valeur q invalide
         * élimine cette entrée.
         */
        if (
          !Number.isFinite(
            parsed,
          )
        ) {
          return;
        }

        quality =
          Math.min(
            1,
            Math.max(
              0,
              parsed,
            ),
          );
      }

      /**
       * q=0 signifie explicitement :
       * langue non souhaitée.
       */
      if (quality <= 0) {
        return;
      }

      languages.push({
        locale,
        quality,
        index,
      });
    },
  );

  /**
   * Priorité :
   *
   * 1. meilleure qualité q
   * 2. ordre d'apparition
   */
  languages.sort(
    (a, b) => {
      if (
        b.quality !==
        a.quality
      ) {
        return (
          b.quality -
          a.quality
        );
      }

      return (
        a.index -
        b.index
      );
    },
  );

  return (
    languages[0]?.locale ??
    DEFAULT_LOCALE
  );
}

/* ==========================================================================
   COOKIE
   ========================================================================== */

/**
 * Cherche d'abord la préférence
 * explicitement enregistrée.
 *
 * Si le cookie contient :
 *
 * de-DE
 *
 * on retourne quand même :
 *
 * de
 */
function localeFromCookie(
  request: NextRequest,
): Locale | null {
  const cookieValue =
    request.cookies.get(
      LOCALE_COOKIE,
    )?.value;

  return normalizeLocale(
    cookieValue,
  );
}

/* ==========================================================================
   RESOLVE LOCALE
   ========================================================================== */

/**
 * Ordre de priorité :
 *
 * 1. Cookie enregistré
 * 2. Accept-Language du navigateur
 * 3. Allemand
 */
function resolveLocale(
  request: NextRequest,
): Locale {
  const savedLocale =
    localeFromCookie(
      request,
    );

  if (savedLocale) {
    return savedLocale;
  }

  return localeFromAcceptLanguage(
    request.headers.get(
      "accept-language",
    ),
  );
}

/* ==========================================================================
   SHOULD UPDATE COOKIE
   ========================================================================== */

/**
 * Le cookie est corrigé lorsqu'il :
 *
 * - n'existe pas ;
 * - contient une locale invalide ;
 * - contient une forme non normalisée
 *   comme de-DE au lieu de de.
 */
function shouldUpdateLocaleCookie(
  request: NextRequest,
  locale: Locale,
): boolean {
  const rawValue =
    request.cookies.get(
      LOCALE_COOKIE,
    )?.value;

  if (!rawValue) {
    return true;
  }

  const normalized =
    normalizeLocale(
      rawValue,
    );

  if (!normalized) {
    return true;
  }

  return (
    rawValue !== locale
  );
}

/* ==========================================================================
   MIDDLEWARE
   ========================================================================== */

export function middleware(
  request: NextRequest,
) {
  /* ------------------------------------------------------------------------
     1. Resolve locale
     ------------------------------------------------------------------------ */

  const locale =
    resolveLocale(
      request,
    );

  /* ------------------------------------------------------------------------
     2. Clone request headers
     ------------------------------------------------------------------------ */

  const requestHeaders =
    new Headers(
      request.headers,
    );

  /**
   * Toujours écraser la valeur éventuelle
   * envoyée par le navigateur.
   *
   * x-ef-locale devient ainsi notre
   * valeur interne contrôlée.
   */
  requestHeaders.set(
    LOCALE_HEADER,
    locale,
  );

  /* ------------------------------------------------------------------------
     3. Continue request
     ------------------------------------------------------------------------ */

  const response =
    NextResponse.next({
      request: {
        headers:
          requestHeaders,
      },
    });

  /* ------------------------------------------------------------------------
     4. Locale cookie
     ------------------------------------------------------------------------ */

  if (
    shouldUpdateLocaleCookie(
      request,
      locale,
    )
  ) {
    response.cookies.set({
      name:
        LOCALE_COOKIE,

      value:
        locale,

      path:
        "/",

      maxAge:
        LOCALE_COOKIE_MAX_AGE,

      /**
       * Le LanguageSelector du navigateur
       * peut modifier ce cookie.
       *
       * C'est pourquoi httpOnly reste false.
       */
      httpOnly:
        false,

      sameSite:
        "lax",

      secure:
        process.env.NODE_ENV ===
        "production",
    });
  }

  /* ------------------------------------------------------------------------
     5. Response language information
     ------------------------------------------------------------------------ */

  response.headers.set(
    "Content-Language",
    locale,
  );

  return response;
}

/* ==========================================================================
   MATCHER
   ========================================================================== */

/**
 * Le middleware intervient sur les pages utilisateur.
 *
 * Il ignore :
 *
 * /api/*
 * /_next/*
 * favicon
 * robots
 * sitemap
 * images
 * fonts
 * fichiers statiques
 * fichiers possédant une extension
 *
 * Cela évite d'exécuter inutilement le middleware
 * pour les ressources publiques.
 */
export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};