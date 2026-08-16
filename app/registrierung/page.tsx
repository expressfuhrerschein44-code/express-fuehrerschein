import type {
  Metadata,
} from "next";

import {
  headers,
} from "next/headers";

import { RegistrationForm } from "@/components/auth/registration/registration-form";
import { RegistrationLayout } from "@/components/auth/registration/registration-layout";

import {
  REGISTRATION_COPY,
} from "@/data/registration";

import {
  getClientIp,
} from "@/lib/server/client-ip";

import {
  detectCountryFromHeaders,
} from "@/lib/server/geo-country";

import type {
  CountryDetectionMethod,
} from "@/types/registration";

/* ==========================================================================
   ROUTE CONFIG
   ========================================================================== */

export const dynamic =
  "force-dynamic";

/* ==========================================================================
   METADATA
   ========================================================================== */

export const metadata:
  Metadata = {
  title:
    "Konto erstellen",

  description:
    "Erstelle dein Express-Führerschein Konto und starte deine strukturierte Führerscheinvorbereitung.",

  robots: {
    index: false,
    follow: false,
  },
};

/* ==========================================================================
   PAGE
   ========================================================================== */

export default async function RegistrationPage() {
  /**
   * Clone the incoming request headers into a standard Web Headers object.
   * This keeps the geo/IP helpers framework-independent.
   */
  const requestHeaders =
    new Headers(
      await headers(),
    );

  /**
   * Read the client IP for request context.
   * We do not expose or persist the raw IP in this page.
   */
  const clientIp =
    getClientIp(
      requestHeaders,
    );

  /**
   * Country detection relies on trusted geo headers supplied by the
   * production proxy/CDN/host. If unavailable, Germany remains the default.
   */
  const detectedCountry =
    detectCountryFromHeaders(
      requestHeaders,
    );

  const detectionMethod:
    CountryDetectionMethod =
    detectedCountry.detectedByIp &&
    Boolean(clientIp.ip)
      ? "ip"
      : "default";

  return (
    <RegistrationLayout
      currentStep="account"
      title={
        REGISTRATION_COPY
          .account.title
      }
      subtitle={
        REGISTRATION_COPY
          .account.subtitle
      }
    >
      <RegistrationForm
        initialCountryCode={
          detectedCountry
            .countryCode
        }
        countryDetectionMethod={
          detectionMethod
        }
      />
    </RegistrationLayout>
  );
}
