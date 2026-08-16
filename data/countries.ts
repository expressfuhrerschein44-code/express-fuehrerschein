/**
 * Express-Führerschein
 * Public country list.
 *
 * Country of training and interface language remain independent.
 */

import type { Country } from "@/types/country";

export const HOME_COUNTRIES = [
  {
    code: "DE",
    name: "Deutschland",
    flag: "🇩🇪",
    primary: true,
    status: "active",
    slug: "deutschland",
    availableLocales: ["de", "fr", "nl", "es", "it", "en"],
    sortOrder: 10,
    href: "/laender/deutschland",
  },
  {
    code: "AT",
    name: "Österreich",
    flag: "🇦🇹",
    primary: false,
    status: "active",
    slug: "oesterreich",
    availableLocales: ["de", "fr", "nl", "es", "it", "en"],
    sortOrder: 20,
    href: "/laender/oesterreich",
  },
  {
    code: "CH",
    name: "Schweiz",
    flag: "🇨🇭",
    primary: false,
    status: "active",
    slug: "schweiz",
    availableLocales: ["de", "fr", "nl", "es", "it", "en"],
    sortOrder: 30,
    href: "/laender/schweiz",
  },
  {
    code: "BE",
    name: "Belgien",
    flag: "🇧🇪",
    primary: false,
    status: "active",
    slug: "belgien",
    availableLocales: ["de", "fr", "nl", "es", "it", "en"],
    sortOrder: 40,
    href: "/laender/belgien",
  },
  {
    code: "ES",
    name: "Spanien",
    flag: "🇪🇸",
    primary: false,
    status: "active",
    slug: "spanien",
    availableLocales: ["de", "fr", "nl", "es", "it", "en"],
    sortOrder: 50,
    href: "/laender/spanien",
  },
] as const satisfies readonly Country[];
