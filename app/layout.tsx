import type {
  Metadata,
  Viewport,
} from "next";

import {
  cookies,
} from "next/headers";

import type {
  ReactNode,
} from "react";

import "./globals.css";

import {
  PwaInstallPrompt,
} from "@/components/pwa/pwa-install-prompt";

import {
  PwaRegister,
} from "@/components/pwa/pwa-register";

import {
  APP_NAME,
  ASSETS,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  SITE_URL,
  SUPPORTED_LOCALES,
} from "@/lib/constants";

import type {
  SupportedLocale,
} from "@/types/country";

/* ==========================================================================
   METADATA BASE
   ========================================================================== */

/**
 * En développement :
 * http://localhost:3000
 *
 * En production :
 * NEXT_PUBLIC_SITE_URL venant du .env de l'hébergeur.
 */
const metadataBaseUrl =
  SITE_URL ||
  "http://localhost:3000";

/* ==========================================================================
   METADATA
   ========================================================================== */

export const metadata:
  Metadata =
  {
    metadataBase:
      new URL(
        metadataBaseUrl,
      ),

    title: {
      default:
        "Express-Führerschein | Führerscheinvorbereitung einfach & digital",

      template:
        `%s | ${APP_NAME}`,
    },

    description:
      "Bereite dich strukturiert, schnell und sicher auf deinen Führerschein vor – mit Lernplan, Training, Prüfungssimulationen und persönlicher Begleitung.",

    applicationName:
      APP_NAME,

    manifest:
      "/manifest.webmanifest",

    authors: [
      {
        name:
          APP_NAME,
      },
    ],

    creator:
      APP_NAME,

    publisher:
      APP_NAME,

    formatDetection: {
      email:
        false,

      address:
        false,

      telephone:
        false,
    },

    icons: {
      icon: [
        {
          url:
            "/favicon.ico",
        },
        {
          url:
            "/icon.png",

          type:
            "image/png",

          sizes:
            "512x512",
        },
        {
          url:
            ASSETS.icon,

          type:
            "image/png",
        },
      ],

      shortcut:
        "/favicon.ico",

      apple: [
        {
          url:
            "/apple-icon.png",

          type:
            "image/png",

          sizes:
            "180x180",
        },
      ],
    },

    appleWebApp: {
      capable:
        true,

      title:
        APP_NAME,

      statusBarStyle:
        "black-translucent",
    },

    other: {
      "mobile-web-app-capable":
        "yes",

      "apple-mobile-web-app-capable":
        "yes",

      "apple-mobile-web-app-status-bar-style":
        "black-translucent",

      "apple-mobile-web-app-title":
        APP_NAME,
    },

    openGraph: {
      type:
        "website",

      locale:
        "de_DE",

      siteName:
        APP_NAME,

      title:
        "Express-Führerschein | Führerscheinvorbereitung einfach & digital",

      description:
        "Deine digitale Plattform für eine strukturierte Führerscheinvorbereitung.",

      url:
        metadataBaseUrl,
    },

    twitter: {
      card:
        "summary",

      title:
        APP_NAME,

      description:
        "Deine digitale Plattform für eine strukturierte Führerscheinvorbereitung.",
    },

    robots: {
      index:
        true,

      follow:
        true,

      googleBot: {
        index:
          true,

        follow:
          true,

        "max-image-preview":
          "large",

        "max-snippet":
          -1,

        "max-video-preview":
          -1,
      },
    },
  };

/* ==========================================================================
   VIEWPORT
   ========================================================================== */

export const viewport:
  Viewport =
  {
    width:
      "device-width",

    initialScale:
      1,

    maximumScale:
      5,

    viewportFit:
      "cover",

    themeColor:
      "#020914",

    colorScheme:
      "light",
  };

/* ==========================================================================
   LOCALE VALIDATION
   ========================================================================== */

function isSupportedLocale(
  value:
    string |
    undefined,
): value is SupportedLocale {
  if (!value) {
    return false;
  }

  return SUPPORTED_LOCALES.includes(
    value as
      SupportedLocale,
  );
}

/* ==========================================================================
   ROOT LAYOUT
   ========================================================================== */

export default async function RootLayout({
  children,
}: Readonly<{
  children:
    ReactNode;
}>) {
  /**
   * Lecture du cookie enregistré
   * par LanguageSelector.
   */
  const cookieStore =
    await cookies();

  const localeFromCookie =
    cookieStore.get(
      LOCALE_COOKIE_NAME,
    )?.value;

  /**
   * Si aucune langue valide n'est enregistrée,
   * l'allemand reste la langue principale.
   */
  const locale:
    SupportedLocale =
    isSupportedLocale(
      localeFromCookie,
    )
      ? localeFromCookie
      : DEFAULT_LOCALE;

  return (
    <html
      lang={
        locale
      }
      suppressHydrationWarning
    >
      <body>
        {/* Accessibilité clavier */}
        <a
          href="#main-content"
          className="skip-link"
        >
          Zum Hauptinhalt springen
        </a>

        {children}

        {/* PWA */}
        <PwaRegister />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
