/**
 * Express-Führerschein
 * Protected client-area layout.
 *
 * This route-group layout wraps every authenticated client page:
 *
 * - /dashboard
 * - /theorie
 * - /mein-fuehrerschein
 * - /praxis
 * - /fortschritt
 * - /trainieren
 * - /pruefungen
 * - /fehler
 * - /termine
 * - /dokumente
 * - /nachrichten
 * - /zahlungen
 * - /einstellungen
 * - /hilfe-support
 * - /profil
 *
 * IMPORTANT:
 * `(client)` is a Next.js route group.
 * It does NOT appear in the public URL.
 *
 * Responsibilities:
 * - require an authenticated client session;
 * - load the complete shell data server-side;
 * - redirect unauthenticated/unavailable accounts to /login;
 * - render the shared responsive ClientShell;
 * - keep private client pages out of search-engine indexes;
 * - avoid static caching of user-specific content.
 */

import type {
  Metadata,
} from "next";

import {
  redirect,
} from "next/navigation";

import type {
  ReactNode,
} from "react";

import {
  ClientShell,
} from "@/components/client-shell/client-shell";

import {
  CLIENT_ROUTES,
} from "@/data/client-navigation";

import {
  getClientShellData,
} from "@/lib/server/client-shell-service";

import {
  ClientShellServiceError,
} from "@/types/client-shell";

/* ==========================================================================
   ROUTE BEHAVIOUR
   ========================================================================== */

/**
 * Every page rendered inside this layout contains private,
 * user-specific information.
 *
 * Never pre-render the authenticated client area as static HTML.
 */
export const dynamic =
  "force-dynamic";

/**
 * Do not cache/revalidate private client shell data.
 */
export const revalidate =
  0;

/* ==========================================================================
   SEO / PRIVACY
   ========================================================================== */

export const metadata:
  Metadata = {
  title: {
    default:
      "Kundenbereich | Express-Führerschein",

    template:
      "%s | Express-Führerschein",
  },

  robots: {
    index:
      false,

    follow:
      false,

    nocache:
      true,

    googleBot: {
      index:
        false,

      follow:
        false,

      noimageindex:
        true,
    },
  },
};

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface ClientAreaLayoutProps {
  children:
    ReactNode;
}

/* ==========================================================================
   AUTHENTICATED CLIENT LAYOUT
   ========================================================================== */

export default async function ClientAreaLayout({
  children,
}: ClientAreaLayoutProps) {
  try {
    /**
     * Server-side source of truth.
     *
     * This resolves:
     * - ef_session;
     * - auth_sessions;
     * - users;
     * - user_profile;
     * - primary license class;
     * - navigation badges;
     * - desktop/mobile navigation data.
     */
    const shellData =
      await getClientShellData();

    return (
      <ClientShell
        data={
          shellData
        }
      >
        {children}
      </ClientShell>
    );
  } catch (
    error:
      unknown
  ) {
    /**
     * Authentication/account-state failures must never render
     * private client-area content.
     */
    if (
      error instanceof
      ClientShellServiceError
    ) {
      switch (
        error.code
      ) {
        case "UNAUTHENTICATED":
        case "ACCOUNT_UNAVAILABLE":
          redirect(
            CLIENT_ROUTES.login,
          );

        case "DATABASE_ERROR":
          /**
           * A database outage is not an authentication failure.
           *
           * Do not silently redirect to login, otherwise users
           * may think their credentials are invalid.
           *
           * Re-throw so Next.js can surface the normal server
           * error boundary/logging path.
           */
          throw error;

        default: {
          const exhaustiveCheck:
            never =
            error.code;

          throw new Error(
            `[Express-Führerschein] Unhandled client shell error: ${exhaustiveCheck}`,
          );
        }
      }
    }

    /**
     * Preserve unexpected server errors for observability.
     */
    throw error;
  }
}
