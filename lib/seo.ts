/**
 * Express-Führerschein
 * SEO helpers for Next.js App Router.
 *
 * This module only builds metadata.
 * Localized commercial copy should come from messages/CMS.
 */

import type { Metadata } from "next";

import {
  APP_NAME,
  DEFAULT_LOCALE,
  SITE_URL,
  SUPPORTED_LOCALES,
} from "@/lib/constants";
import { absoluteUrl, normalizeSiteUrl } from "@/lib/utils";
import type { SupportedLocale } from "@/types/country";

export interface SeoInput {
  title: string;
  description: string;

  /**
   * Public route beginning with "/".
   * Example: "/fuehrerscheinklassen"
   */
  path?: string;

  locale?: SupportedLocale;

  /**
   * Optional alternate routes by locale.
   * If omitted, every locale points to the same path.
   */
  localizedPaths?: Partial<Record<SupportedLocale, string>>;

  image?: string;

  noIndex?: boolean;
  noFollow?: boolean;

  type?: "website" | "article";
}

const DEFAULT_OG_IMAGE = "/icons/icon.png";

function getLanguageAlternates(
  path: string,
  localizedPaths?: Partial<Record<SupportedLocale, string>>,
): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of SUPPORTED_LOCALES) {
    const localePath = localizedPaths?.[locale] ?? path;
    languages[locale] = absoluteUrl(localePath, SITE_URL);
  }

  const defaultPath = localizedPaths?.[DEFAULT_LOCALE] ?? path;
  languages["x-default"] = absoluteUrl(defaultPath, SITE_URL);

  return languages;
}

/**
 * Central helper for App Router metadata.
 *
 * Usage:
 * export const metadata = buildMetadata({...})
 *
 * Or inside generateMetadata().
 */
export function buildMetadata({
  title,
  description,
  path = "/",
  locale = DEFAULT_LOCALE,
  localizedPaths,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
  noFollow = false,
  type = "website",
}: SeoInput): Metadata {
  const canonical = absoluteUrl(path, SITE_URL);
  const socialImage = absoluteUrl(image, SITE_URL);

  return {
    metadataBase: new URL(normalizeSiteUrl(SITE_URL)),

    title,
    description,

    applicationName: APP_NAME,

    alternates: {
      canonical,
      languages: getLanguageAlternates(path, localizedPaths),
    },

    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },

    openGraph: {
      type,
      locale,
      url: canonical,
      siteName: APP_NAME,
      title,
      description,
      images: [
        {
          url: socialImage,
          alt: APP_NAME,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Structured data                                                             */
/* -------------------------------------------------------------------------- */

export interface OrganizationStructuredDataInput {
  name?: string;
  url?: string;
  logo?: string;
}

export function createOrganizationStructuredData({
  name = APP_NAME,
  url = SITE_URL,
  logo = "/logos/logo.png",
}: OrganizationStructuredDataInput = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: normalizeSiteUrl(url),
    logo: absoluteUrl(logo, url),
  } as const;
}

export interface WebsiteStructuredDataInput {
  name?: string;
  url?: string;
  language?: SupportedLocale;
}

export function createWebsiteStructuredData({
  name = APP_NAME,
  url = SITE_URL,
  language = DEFAULT_LOCALE,
}: WebsiteStructuredDataInput = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url: normalizeSiteUrl(url),
    inLanguage: language,
  } as const;
}

/**
 * Serializes JSON-LD safely for insertion in a <script type="application/ld+json">.
 * Replacing "<" prevents HTML parser ambiguity in embedded JSON.
 */
export function serializeJsonLd(
  data: Readonly<Record<string, unknown>>,
): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
