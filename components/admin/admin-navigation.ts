import type {
  LucideIcon,
} from "lucide-react";

import {
  BookOpenCheck,
  CalendarDays,
  CarFront,
  CreditCard,
  FileCheck2,
  Files,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Users,
} from "lucide-react";

export interface AdminNavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavigationSection {
  label: string;
  items: readonly AdminNavigationItem[];
}

export const ADMIN_NAVIGATION:
  readonly AdminNavigationSection[] =
  [
    {
      label:
        "Übersicht",
      items: [
        {
          href:
            "/admin",
          label:
            "Dashboard",
          icon:
            LayoutDashboard,
        },
      ],
    },
    {
      label:
        "Kunden & Anträge",
      items: [
        {
          href:
            "/admin/kunden",
          label:
            "Kunden",
          icon:
            Users,
        },
        {
          href:
            "/admin/antraege",
          label:
            "Führerscheinanträge",
          icon:
            FileCheck2,
        },
        {
          href:
            "/admin/praxis",
          label:
            "Praxis",
          icon:
            CarFront,
        },
      ],
    },
    {
      label:
        "Verwaltung",
      items: [
        {
          href:
            "/admin/zahlungen",
          label:
            "Zahlungen",
          icon:
            CreditCard,
        },
        {
          href:
            "/admin/termine",
          label:
            "Termine",
          icon:
            CalendarDays,
        },
        {
          href:
            "/admin/dokumente",
          label:
            "Dokumente",
          icon:
            Files,
        },
      ],
    },
    {
      label:
        "Kommunikation",
      items: [
        {
          href:
            "/admin/nachrichten",
          label:
            "Nachrichten",
          icon:
            MessagesSquare,
        },
      ],
    },
    {
      label:
        "Lernplattform",
      items: [
        {
          href:
            "/admin/theorie",
          label:
            "Theorie",
          icon:
            BookOpenCheck,
        },
      ],
    },
    {
      label:
        "System",
      items: [
        {
          href:
            "/admin/einstellungen",
          label:
            "Einstellungen",
          icon:
            Settings,
        },
      ],
    },
  ];

export function findAdminNavigationLabel(
  pathname:
    string,
): string {
  const items =
    ADMIN_NAVIGATION.flatMap(
      (
        section,
      ) =>
        section.items,
    );

  const exact =
    items.find(
      (
        item,
      ) =>
        item.href ===
        pathname,
    );

  if (exact) {
    return exact.label;
  }

  const nested =
    items
      .filter(
        (
          item,
        ) =>
          item.href !==
            "/admin" &&
          pathname.startsWith(
            `${item.href}/`,
          ),
      )
      .sort(
        (
          a,
          b,
        ) =>
          b.href.length -
          a.href.length,
      )[0];

  return nested?.label ??
    "Administration";
}
