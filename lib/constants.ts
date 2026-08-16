/**
 * Express-Führerschein
 * Global application constants.
 *
 * Ce fichier contient uniquement les constantes techniques
 * et produit stables utilisées dans toute l'application.
 *
 * Ne pas placer ici :
 * - statistiques dynamiques ;
 * - avis clients ;
 * - contenus CMS ;
 * - règles réglementaires ;
 * - données provenant de l'administration ;
 * - secrets ;
 * - clés API ;
 * - tokens OAuth.
 */

import type {
  SupportedCountryCode,
  SupportedLocale,
} from "@/types/country";

/* ==========================================================================
   BRAND
   ========================================================================== */

export const APP_NAME =
  "Express-Führerschein" as const;

export const APP_TECHNICAL_NAME =
  "express-fuehrerschein" as const;

/**
 * Langue principale de la plateforme.
 *
 * Si aucune préférence utilisateur
 * n'est détectée, l'allemand est utilisé.
 */
export const DEFAULT_LOCALE:
  SupportedLocale =
  "de";

/**
 * Marché principal.
 */
export const PRIMARY_COUNTRY_CODE:
  SupportedCountryCode =
  "DE";

/* ==========================================================================
   COOKIES
   ========================================================================== */

/**
 * Préférence de langue de l'interface.
 *
 * Ce cookie peut être lu/modifié par
 * LanguageSelector.
 */
export const LOCALE_COOKIE_NAME =
  "ef_locale" as const;

/**
 * Pays dans lequel le candidat
 * prépare son permis.
 *
 * IMPORTANT :
 *
 * pays et langue restent deux
 * paramètres indépendants.
 */
export const COUNTRY_COOKIE_NAME =
  "ef_country" as const;

/**
 * Session temporaire utilisée uniquement
 * pendant l'inscription.
 *
 * Le token réel est géré côté serveur.
 */
export const REGISTRATION_SESSION_COOKIE_NAME =
  "ef_registration" as const;

/**
 * Session utilisateur après connexion.
 *
 * Doit être HttpOnly côté serveur.
 */
export const AUTH_SESSION_COOKIE_NAME =
  "ef_session" as const;

/**
 * Transaction temporaire OAuth :
 *
 * - state ;
 * - nonce ;
 * - PKCE verifier ;
 * - returnTo.
 *
 * Cookie HttpOnly géré côté serveur.
 */
export const OAUTH_STATE_COOKIE_NAME =
  "ef_oauth_state" as const;

/* ==========================================================================
   SUPPORTED LOCALES
   ========================================================================== */

export const SUPPORTED_LOCALES = [
  "de",
  "fr",
  "nl",
  "es",
  "it",
  "en",
] as const satisfies
  readonly SupportedLocale[];

/**
 * Informations stables utilisées par :
 *
 * - sélecteur de langue ;
 * - menu mobile ;
 * - profil ;
 * - authentification ;
 * - i18n.
 */
export const LOCALE_LABELS:
  Readonly<
    Record<
      SupportedLocale,
      {
        native: string;
        short: string;
      }
    >
  > = {
  de: {
    native: "Deutsch",
    short: "DE",
  },

  fr: {
    native: "Français",
    short: "FR",
  },

  nl: {
    native: "Nederlands",
    short: "NL",
  },

  es: {
    native: "Español",
    short: "ES",
  },

  it: {
    native: "Italiano",
    short: "IT",
  },

  en: {
    native: "English",
    short: "EN",
  },
};

/* ==========================================================================
   SUPPORTED COUNTRIES
   ========================================================================== */

export const SUPPORTED_COUNTRIES = [
  "DE",
  "AT",
  "CH",
  "BE",
  "ES",
] as const satisfies
  readonly SupportedCountryCode[];

/**
 * Informations techniques stables
 * concernant les marchés.
 *
 * Les traductions complètes peuvent
 * également venir de messages/*.json.
 */
export const COUNTRY_LABELS:
  Readonly<
    Record<
      SupportedCountryCode,
      {
        de: string;
        flag: string;
        primary: boolean;
      }
    >
  > = {
  DE: {
    de: "Deutschland",
    flag: "🇩🇪",
    primary: true,
  },

  AT: {
    de: "Österreich",
    flag: "🇦🇹",
    primary: false,
  },

  CH: {
    de: "Schweiz",
    flag: "🇨🇭",
    primary: false,
  },

  BE: {
    de: "Belgien",
    flag: "🇧🇪",
    primary: false,
  },

  ES: {
    de: "Spanien",
    flag: "🇪🇸",
    primary: false,
  },
};

/* ==========================================================================
   PUBLIC ROUTES
   ========================================================================== */

/**
 * Routes publiques principales.
 *
 * Toutes les routes utilisateur importantes
 * doivent être centralisées ici.
 */
export const ROUTES = {
  /* ------------------------------------------------------------------------
     Home
     ------------------------------------------------------------------------ */

  home:
    "/",

  /* ------------------------------------------------------------------------
     Public website
     ------------------------------------------------------------------------ */

  licenseClasses:
    "/fuehrerscheinklassen",

  program21:
    "/21-tage-programm",

  process:
    "/ablauf",

  benefits:
    "/#vorteile",

  about:
    "/ueber-uns",

  reviews:
    "/bewertungen",

  faq:
    "/faq",

  contact:
    "/kontakt",

  /* ------------------------------------------------------------------------
     Authentication
     ------------------------------------------------------------------------ */

  /**
   * Page officielle de connexion.
   *
   * IMPORTANT :
   * ancien chemin "/login" supprimé.
   */
  login:
    "/login",

  register:
    "/registrierung",

  registrationVerification:
    "/registrierung/verifizieren",

  registrationSuccess:
    "/registrierung/erfolg",

  forgotPassword:
    "/passwort-vergessen",

  /* ------------------------------------------------------------------------
     Candidate platform
     ------------------------------------------------------------------------ */

  dashboard:
    "/dashboard",

  /* ------------------------------------------------------------------------
     Legal
     ------------------------------------------------------------------------ */

  imprint:
    "/impressum",

  privacy:
    "/datenschutz",

  terms:
    "/agb",

  withdrawal:
    "/widerrufsrecht",

  cookies:
    "/cookie-einstellungen",
} as const;

/* ==========================================================================
   INTERNAL API ROUTES
   ========================================================================== */

/**
 * Routes API internes de l'application Next.js.
 *
 * Elles sont séparées de ROUTES afin que :
 *
 * ROUTES
 * = navigation utilisateur
 *
 * AUTH_API_ROUTES
 * = appels réseau internes
 */
export const AUTH_API_ROUTES = {
  /* ------------------------------------------------------------------------
     Registration
     ------------------------------------------------------------------------ */

  registration: {
    start:
      "/api/auth/register/start",

    verify:
      "/api/auth/register/verify",

    resend:
      "/api/auth/register/resend",
  },

  /* ------------------------------------------------------------------------
     Credential authentication
     ------------------------------------------------------------------------ */

  login:
    "/api/auth/login",

  logout:
    "/api/auth/logout",

  session:
    "/api/auth/session",

  /* ------------------------------------------------------------------------
     OAuth
     ------------------------------------------------------------------------ */

  oauth: {
    google: {
      start:
        "/api/auth/oauth/google/start",

      callback:
        "/api/auth/oauth/google/callback",
    },

    apple: {
      start:
        "/api/auth/oauth/apple/start",

      callback:
        "/api/auth/oauth/apple/callback",
    },
  },
} as const;

/* ==========================================================================
   HOME SECTION IDS
   ========================================================================== */

/**
 * IDs stables des sections de la Home.
 *
 * Utilisés notamment pour :
 *
 * - navigation par ancre ;
 * - CTA ;
 * - analytics ;
 * - accessibilité ;
 * - scrolling.
 */
export const HOME_SECTION_IDS = {
  hero:
    "hero",

  trust:
    "vertrauen",

  stats:
    "statistiken",

  licenseClasses:
    "fuehrerscheinklassen",

  benefits:
    "vorteile",

  program21:
    "21-tage-programm",

  process:
    "ablauf",

  security:
    "sicherheit",

  reviews:
    "bewertungen",

  countries:
    "laender",

  faq:
    "faq",

  finalCta:
    "starten",
} as const;

/* ==========================================================================
   PUBLIC ASSETS
   ========================================================================== */

/**
 * Tous les chemins commencent depuis /public.
 *
 * Exemple :
 *
 * public/logos/logo.png
 *
 * devient :
 *
 * /logos/logo.png
 */
export const ASSETS = {
  /* ------------------------------------------------------------------------
     Brand
     ------------------------------------------------------------------------ */

  logo:
    "/logos/logo.png",

  icon:
    "/icons/icon.png",

  /* ------------------------------------------------------------------------
     Home Hero
     ------------------------------------------------------------------------ */

  hero: {
    desktop:
      "/images/home/hero/hero-car-berlin.webp",

    mobile:
      "/images/home/hero/hero-car-berlin-mobile.webp",
  },

  /* ------------------------------------------------------------------------
     Registration
     ------------------------------------------------------------------------ */

  registration: {
    sidePanel:
      "/images/registration/registration-berlin-car.webp",
  },

  /* ------------------------------------------------------------------------
     Login
     ------------------------------------------------------------------------ */

  login: {
    sidePanel:
      "/images/login/login-berlin-car.webp",
  },

  /* ------------------------------------------------------------------------
     Licence classes
     ------------------------------------------------------------------------ */

  licenseClasses: {
    B:
      "/images/home/license-classes/klasse-b.webp",

    A:
      "/images/home/license-classes/klasse-a.webp",

    C:
      "/images/home/license-classes/klasse-c.webp",

    D:
      "/images/home/license-classes/klasse-d.webp",

    BE:
      "/images/home/license-classes/klasse-be.webp",

    AM:
      "/images/home/license-classes/klasse-am.webp",
  },

  /* ------------------------------------------------------------------------
     Trust partners
     ------------------------------------------------------------------------ */

  partners: {
    dekra:
      "/images/home/partners/dekra.svg",

    tuev:
      "/images/home/partners/tuv.svg",

    kba:
      "/images/home/partners/kba.svg",

    trustpilot:
      "/images/home/partners/trustpilot.svg",
  },
} as const;

/* ==========================================================================
   LAYOUT
   ========================================================================== */

/**
 * Largeur maximale principale du site.
 */
export const SITE_MAX_WIDTH =
  1440 as const;

/**
 * Breakpoints de référence.
 *
 * Ils doivent rester cohérents avec
 * globals.css / Tailwind.
 */
export const BREAKPOINTS = {
  mobile:
    320,

  tablet:
    768,

  laptop:
    1024,

  desktop:
    1440,

  wide:
    1920,
} as const;

/* ==========================================================================
   ENVIRONMENT
   ========================================================================== */

/**
 * URLs utilisées uniquement comme fallback
 * pendant le développement local.
 */
const DEV_SITE_URL =
  "http://localhost:3000";

const DEV_API_URL =
  "http://localhost:4000/api/v1";

/* --------------------------------------------------------------------------
   Environment flags
   -------------------------------------------------------------------------- */

export const IS_DEVELOPMENT =
  process.env.NODE_ENV ===
  "development";

export const IS_PRODUCTION =
  process.env.NODE_ENV ===
  "production";

export const IS_TEST =
  process.env.NODE_ENV ===
  "test";

/* --------------------------------------------------------------------------
   URL normalization
   -------------------------------------------------------------------------- */

/**
 * Supprime les "/" finaux.
 *
 * Exemple :
 *
 * https://example.com///
 *
 * devient :
 *
 * https://example.com
 */
function normalizeEnvironmentUrl(
  value: string,
): string {
  return value
    .trim()
    .replace(
      /\/+$/,
      "",
    );
}

/* --------------------------------------------------------------------------
   Environment values
   -------------------------------------------------------------------------- */

const ENV_SITE_URL =
  process.env
    .NEXT_PUBLIC_SITE_URL
    ?.trim();

const ENV_API_URL =
  process.env
    .NEXT_PUBLIC_API_URL
    ?.trim();

/**
 * URL publique principale du site.
 *
 * Développement :
 *
 * http://localhost:3000
 *
 * Production :
 *
 * NEXT_PUBLIC_SITE_URL
 */
export const SITE_URL =
  ENV_SITE_URL
    ? normalizeEnvironmentUrl(
        ENV_SITE_URL,
      )
    : IS_DEVELOPMENT
      ? DEV_SITE_URL
      : "";

/**
 * URL du backend externe.
 *
 * Cette constante est distincte
 * des routes API internes Next.js.
 */
export const API_URL =
  ENV_API_URL
    ? normalizeEnvironmentUrl(
        ENV_API_URL,
      )
    : IS_DEVELOPMENT
      ? DEV_API_URL
      : "";

/* ==========================================================================
   ENVIRONMENT VALIDATION
   ========================================================================== */

export function requireEnvironmentUrl(
  value: string,
  variableName: string,
): string {
  if (!value) {
    throw new Error(
      `[Express-Führerschein] Variable d'environnement manquante : ${variableName}`,
    );
  }

  return value;
}

/**
 * URL publique obligatoire.
 */
export function getRequiredSiteUrl():
  string {
  return requireEnvironmentUrl(
    SITE_URL,
    "NEXT_PUBLIC_SITE_URL",
  );
}

/**
 * URL backend obligatoire.
 */
export function getRequiredApiUrl():
  string {
  return requireEnvironmentUrl(
    API_URL,
    "NEXT_PUBLIC_API_URL",
  );
}

/* ==========================================================================
   API
   ========================================================================== */

/**
 * Timeout réseau standard.
 */
export const API_REQUEST_TIMEOUT =
  15_000 as const;

/**
 * Version backend prévue.
 */
export const API_VERSION =
  "v1" as const;

/* ==========================================================================
   AUTHENTICATION
   ========================================================================== */

/**
 * Durée par défaut d'une session connectée.
 *
 * 7 jours.
 *
 * IMPORTANT :
 * la variable serveur AUTH_SESSION_TTL_SECONDS
 * reste la source de vérité en production.
 */
export const DEFAULT_AUTH_SESSION_TTL_SECONDS =
  60 * 60 * 24 * 7;

/**
 * Durée de validité d'une transaction OAuth.
 *
 * 10 minutes.
 */
export const OAUTH_TRANSACTION_TTL_SECONDS =
  10 * 60;

/**
 * Nombre maximal de tentatives de connexion
 * pendant une fenêtre.
 */
export const LOGIN_RATE_LIMIT_MAX_ATTEMPTS =
  8;

/**
 * Fenêtre :
 * 15 minutes.
 */
export const LOGIN_RATE_LIMIT_WINDOW_MS =
  15 * 60_000;

/* ==========================================================================
   CACHE
   ========================================================================== */

/**
 * Revalidation publique par défaut.
 *
 * 300 secondes = 5 minutes.
 */
export const DEFAULT_REVALIDATE_SECONDS =
  300 as const;

/* ==========================================================================
   LINKS
   ========================================================================== */

/**
 * Protection standard des liens externes.
 */
export const EXTERNAL_LINK_REL =
  "noopener noreferrer" as const;

/* ==========================================================================
   UI
   ========================================================================== */

export const UI_TRANSITION = {
  fast:
    160,

  normal:
    220,

  slow:
    320,
} as const;

/* ==========================================================================
   ACCESSIBILITY
   ========================================================================== */

/**
 * Taille tactile minimale recommandée.
 */
export const MIN_TOUCH_TARGET =
  44 as const;

/* ==========================================================================
   PRODUCT
   ========================================================================== */

/**
 * Durée principale du programme
 * Express-Führerschein.
 */
export const EXPRESS_PROGRAM_DAYS =
  21 as const;

/* ==========================================================================
   EXPORT TYPES
   ========================================================================== */

/**
 * Toutes les routes publiques utilisateur.
 */
export type AppRoute =
  (typeof ROUTES)[keyof typeof ROUTES];

/**
 * IDs des sections de la Home.
 */
export type HomeSectionId =
  (typeof HOME_SECTION_IDS)[keyof typeof HOME_SECTION_IDS];

/**
 * Classes disposant actuellement
 * d'un asset Home.
 */
export type SupportedAssetLicenseClass =
  keyof typeof ASSETS.licenseClasses;

/**
 * Partenaires disposant actuellement
 * d'un asset public.
 */
export type SupportedPartner =
  keyof typeof ASSETS.partners;

/**
 * Noms des providers OAuth actuellement
 * pris en charge.
 */
export type SupportedOAuthProvider =
  keyof typeof AUTH_API_ROUTES.oauth;