/**
 * Express-Führerschein
 * Dashboard static configuration.
 *
 * No user statistics belong in this file.
 * Real values come from Prisma/Supabase through dashboard-service.ts.
 */

import {
  CLIENT_ROUTES,
} from "@/data/client-navigation";

import type {
  DashboardQuickAccessItem,
  DashboardReadinessLevel,
} from "@/types/dashboard";

/* ==========================================================================
   PROGRAM
   ========================================================================== */

export const DASHBOARD_PROGRAM_DAYS =
  21 as const;

/* ==========================================================================
   QUERY / DISPLAY LIMITS
   ========================================================================== */

export const DASHBOARD_LIMITS = {
  visibleTopicsDesktop:
    5,

  visibleTopicsMobile:
    5,

  recentTraining:
    3,
} as const;

/* ==========================================================================
   READINESS LABELS
   ========================================================================== */

export const DASHBOARD_READINESS_LABELS:
  Record<
    DashboardReadinessLevel,
    string
  > = {
  not_ready:
    "Noch nicht bereit",

  progressing:
    "Fortschritte machen",

  well_prepared:
    "Gut vorbereitet",

  almost_ready:
    "Fast bereit",
};

/* ==========================================================================
   QUICK ACCESS
   ========================================================================== */

export const DASHBOARD_QUICK_ACCESS:
  readonly DashboardQuickAccessItem[] = [
  {
    id:
      "theory",

    label:
      "Theorie lernen",

    href:
      CLIENT_ROUTES.theory,

    icon:
      "book",
  },

  {
    id:
      "training",

    label:
      "Üben",

    href:
      CLIENT_ROUTES.training,

    icon:
      "sparkles",
  },

  {
    id:
      "exam",

    label:
      "Prüfungssimulation",

    href:
      CLIENT_ROUTES.exams,

    icon:
      "clipboard-check",
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
  },
];

/* ==========================================================================
   TODAY TASK ROUTES / COPY
   ========================================================================== */

export const DASHBOARD_TODAY_COPY = {
  continueTheoryAction:
    "Weiterlernen",

  reviewErrorsTitle:
    "Fragen wiederholen",

  reviewErrorsAction:
    "Starten",

  reviewErrorsDescription:
    "Wiederhole Fragen, die du noch nicht sicher beherrschst.",

  trainingTitle:
    "Trainieren",

  trainingDescription:
    "Festige dein Wissen mit gezieltem Training.",

  trainingAction:
    "Trainieren",

  examTitle:
    "Prüfungssimulation",

  examDescription:
    "Teste dein Wissen unter prüfungsnahen Bedingungen.",

  examAction:
    "Prüfung starten",
} as const;
