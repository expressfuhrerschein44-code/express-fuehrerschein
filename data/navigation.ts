/**
 * Express-Führerschein
 * Public Home navigation
 *
 * Default language: German.
 * Labels will later be resolved from messages/*.json when i18n is connected.
 */

import { ROUTES } from "@/lib/constants";
import type {
  HomeHeaderData,
  HomeNavigationItem,
} from "@/types/home";

export const HOME_NAVIGATION_ITEMS = [
  {
    id: "license-classes",
    label: "Führerscheinklassen",
    href: ROUTES.licenseClasses,
  },
  {
    id: "process",
    label: "Ablauf",
    href: ROUTES.process,
  },
  {
    id: "benefits",
    label: "Vorteile",
    href: ROUTES.benefits,
  },
  {
    id: "about",
    label: "Über uns",
    href: ROUTES.about,
  },
  {
    id: "reviews",
    label: "Bewertungen",
    href: ROUTES.reviews,
  },
  {
    id: "faq",
    label: "FAQ",
    href: ROUTES.faq,
  },
] as const satisfies readonly HomeNavigationItem[];

export const HOME_HEADER_DATA: HomeHeaderData = {
  navigation: HOME_NAVIGATION_ITEMS,

  startCta: {
    label: "Jetzt starten",
    href: ROUTES.register,
    ariaLabel: "Jetzt mit Express-Führerschein starten",
  },
};
