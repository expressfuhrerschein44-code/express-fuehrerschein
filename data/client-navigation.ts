/**
 * Express-Führerschein
 * Client-space navigation data.
 *
 * Single source of truth for:
 * - desktop sidebar;
 * - mobile hamburger drawer;
 * - mobile bottom navigation;
 * - profile/support/logout destinations.
 *
 * IMPORTANT:
 * Do not duplicate these routes inside UI components.
 */

import type {
  ClientNavigationItem,
} from "@/types/client-navigation";

/* ==========================================================================
   CLIENT ROUTES
   ========================================================================== */

export const CLIENT_ROUTES = {
  dashboard:
    "/dashboard",

  theory:
    "/theorie",

  license:
    "/mein-fuehrerschein",

  practice:
    "/praxis",

  progress:
    "/fortschritt",

  training:
    "/trainieren",

  exams:
    "/pruefungen",

  errors:
    "/fehler",

  appointments:
    "/termine",

  documents:
    "/dokumente",

  messages:
    "/nachrichten",

  payments:
    "/zahlungen",

  settings:
    "/einstellungen",

  support:
    "/hilfe-support",

  profile:
    "/profil",

  login:
    "/login",

  logoutApi:
    "/api/auth/logout",
} as const;

/* ==========================================================================
   MAIN NAVIGATION
   ========================================================================== */

export const CLIENT_NAVIGATION = [
  {
    id:
      "dashboard",

    label:
      "Dashboard",

    href:
      CLIENT_ROUTES.dashboard,

    icon:
      "home",

    match:
      "exact",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      true,
  },

  {
    id:
      "theory",

    label:
      "Theorie",

    href:
      CLIENT_ROUTES.theory,

    icon:
      "book",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      true,
  },

  {
    id:
      "license",

    label:
      "Mein Führerschein",

    href:
      CLIENT_ROUTES.license,

    icon:
      "car",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      true,

    prominentOnMobile:
      true,
  },

  {
    id:
      "practice",

    label:
      "Praxis",

    href:
      CLIENT_ROUTES.practice,

    icon:
      "user",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      true,
  },

  {
    id:
      "progress",

    label:
      "Fortschritt",

    href:
      CLIENT_ROUTES.progress,

    icon:
      "chart",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      false,
  },

  {
    id:
      "training",

    label:
      "Trainieren",

    href:
      CLIENT_ROUTES.training,

    icon:
      "sparkles",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      false,
  },

  {
    id:
      "exams",

    label:
      "Prüfungen",

    href:
      CLIENT_ROUTES.exams,

    icon:
      "clipboard-check",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      false,
  },

  {
    id:
      "errors",

    label:
      "Fehler",

    href:
      CLIENT_ROUTES.errors,

    icon:
      "alert-circle",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      false,
  },

  {
    id:
      "appointments",

    label:
      "Termine",

    href:
      CLIENT_ROUTES.appointments,

    icon:
      "calendar",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      false,
  },

  {
    id:
      "documents",

    label:
      "Dokumente",

    href:
      CLIENT_ROUTES.documents,

    icon:
      "file",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      false,
  },

  {
    id:
      "messages",

    label:
      "Nachrichten",

    href:
      CLIENT_ROUTES.messages,

    icon:
      "message",

    match:
      "prefix",

    badgeKey:
      "unreadMessages",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      false,
  },

  {
    id:
      "payments",

    label:
      "Zahlungen",

    href:
      CLIENT_ROUTES.payments,

    icon:
      "credit-card",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      false,
  },

  {
    id:
      "settings",

    label:
      "Einstellungen",

    href:
      CLIENT_ROUTES.settings,

    icon:
      "settings",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      false,
  },

  {
    id:
      "support",

    label:
      "Hilfe & Support",

    href:
      CLIENT_ROUTES.support,

    icon:
      "help-circle",

    match:
      "prefix",

    showInMainNavigation:
      true,

    showInBottomNavigation:
      false,
  },

  {
    id:
      "profile",

    label:
      "Profil",

    href:
      CLIENT_ROUTES.profile,

    icon:
      "user",

    match:
      "prefix",

    showInMainNavigation:
      false,

    showInBottomNavigation:
      true,
  },
] as const satisfies
  readonly ClientNavigationItem[];

/* ==========================================================================
   DERIVED NAVIGATION SETS
   ========================================================================== */

export const CLIENT_MAIN_NAVIGATION =
  CLIENT_NAVIGATION.filter(
    (item) =>
      item.showInMainNavigation,
  );

export const CLIENT_BOTTOM_NAVIGATION =
  CLIENT_NAVIGATION.filter(
    (item) =>
      item.showInBottomNavigation,
  );

/**
 * Architecture requirement:
 * mobile bottom navigation must contain exactly five entries.
 */
export const CLIENT_BOTTOM_NAVIGATION_SIZE =
  5 as const;

/* ==========================================================================
   SUPPORT
   ========================================================================== */

export const CLIENT_SUPPORT = {
  title:
    "Fragen oder Probleme?",

  description:
    "Unser Support ist für dich da.",

  actionLabel:
    "Kontaktieren",

  href:
    CLIENT_ROUTES.support,
} as const;

/* ==========================================================================
   PROFILE MENU
   ========================================================================== */

export const CLIENT_PROFILE_MENU = {
  profileLabel:
    "Profil ansehen",

  settingsLabel:
    "Einstellungen",

  logoutLabel:
    "Abmelden",
} as const;
