/**
 * Express-Führerschein
 * Real client Dashboard route.
 *
 * Responsibilities:
 * - resolve the authenticated user's DashboardData on the server;
 * - redirect an unauthenticated request to /login;
 * - render the complete responsive Dashboard;
 * - never expose Prisma directly to the browser.
 */

import {
  redirect,
} from "next/navigation";

import {
  DashboardPage,
} from "@/components/dashboard/dashboard-page";

import {
  getDashboardData,
} from "@/lib/server/dashboard/dashboard-service";

import {
  DashboardServiceError,
} from "@/types/dashboard";

/* ==========================================================================
   ROUTE CONFIG
   ========================================================================== */

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

/* ==========================================================================
   PAGE
   ========================================================================== */

export default async function DashboardRoutePage() {
  try {
    const data =
      await getDashboardData();

    return (
      <DashboardPage
        data={
          data
        }
      />
    );
  } catch (
    error:
      unknown
  ) {
    /**
     * The parent client layout already protects the whole client area.
     * This additional guard keeps /dashboard safe if the route is ever
     * rendered independently or the session expires between layout/page reads.
     */
    if (
      error instanceof
        DashboardServiceError &&
      error.code ===
        "UNAUTHENTICATED"
    ) {
      redirect(
        "/login",
      );
    }

    /**
     * Database/service failures are intentionally re-thrown so Next.js
     * renders app/(client)/dashboard/error.tsx.
     */
    throw error;
  }
}
