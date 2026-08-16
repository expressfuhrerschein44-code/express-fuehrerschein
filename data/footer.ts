/**
 * Express-Führerschein
 * Public Home footer data.
 */

import { ROUTES } from "@/lib/constants";
import type { FooterData } from "@/types/home";

export const HOME_FOOTER_DATA: FooterData = {
  brandDescription:
    "Deine digitale Plattform für eine strukturierte Führerscheinvorbereitung.",

  columns: [
    {
      id: "platform",
      title: "Plattform",
      links: [
        {
          label: "Führerscheinklassen",
          href: ROUTES.licenseClasses,
        },
        {
          label: "Lernen",
          href: "/lernen",
        },
        {
          label: "Prüfungstraining",
          href: "/pruefungstraining",
        },
        {
          label: "21-Tage-Programm",
          href: ROUTES.program21,
        },
      ],
    },
    {
      id: "company",
      title: "Unternehmen",
      links: [
        {
          label: "Über uns",
          href: ROUTES.about,
        },
        {
          label: "Kontakt",
          href: ROUTES.contact,
        },
        {
          label: "Bewertungen",
          href: ROUTES.reviews,
        },
        {
          label: "FAQ",
          href: ROUTES.faq,
        },
      ],
    },
    {
      id: "legal",
      title: "Rechtliches",
      links: [
        {
          label: "Impressum",
          href: ROUTES.imprint,
        },
        {
          label: "Datenschutz",
          href: ROUTES.privacy,
        },
        {
          label: "AGB",
          href: ROUTES.terms,
        },
        {
          label: "Widerrufsrecht",
          href: ROUTES.withdrawal,
        },
        {
          label: "Cookie-Einstellungen",
          href: ROUTES.cookies,
        },
      ],
    },
    {
      id: "countries",
      title: "Länder",
      links: [
        {
          label: "Deutschland",
          href: "/laender/deutschland",
        },
        {
          label: "Österreich",
          href: "/laender/oesterreich",
        },
        {
          label: "Schweiz",
          href: "/laender/schweiz",
        },
        {
          label: "Belgien",
          href: "/laender/belgien",
        },
        {
          label: "Spanien",
          href: "/laender/spanien",
        },
      ],
    },
  ],

  copyright:
    "© Express-Führerschein. Alle Rechte vorbehalten.",
};
