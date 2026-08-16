/**
 * Express-Führerschein
 * Complete responsive dashboard page.
 *
 * IMPORTANT:
 * - receives already-resolved DashboardData;
 * - never talks to Prisma directly;
 * - desktop and mobile display the same real data;
 * - no demo statistics are hard-coded;
 * - a real driving-license application prevents the old license-class
 *   onboarding state from hiding the dashboard.
 */

import {
  DashboardDesktop,
} from "@/components/dashboard/dashboard-desktop";

import {
  DashboardMobile,
} from "@/components/dashboard/dashboard-mobile";

import {
  DashboardEmptyState,
} from "@/components/dashboard/shared/dashboard-empty-state";

import {
  CLIENT_ROUTES,
} from "@/data/client-navigation";

import type {
  DashboardData,
} from "@/types/dashboard";

export interface DashboardPageProps {
  data:
    DashboardData;
}

export function DashboardPage({
  data,
}: DashboardPageProps) {
  /**
   * The previous condition only checked `requiresLicenseClassSetup`.
   *
   * That flag is based on the absence of an active `user_license_classes`
   * record. A client can however already have a real application in
   * `driving_license_applications` before an active license class is created.
   *
   * In that situation we must render the normal dashboard so that
   * ApplicationStatusCard can display the current application.
   */
  const shouldShowLicenseClassSetup =
    data
      .requiresLicenseClassSetup &&
    !data
      .drivingLicenseApplication;

  if (
    shouldShowLicenseClassSetup
  ) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-3 py-5 lg:px-7 lg:py-7">
        <DashboardEmptyState
          title="Führerscheinklasse auswählen"
          description="Wähle zuerst deine Führerscheinklasse aus. Danach kann Express-Führerschein deinen persönlichen 21-Tage-Lernplan, Fortschritt und deine Prüfungsvorbereitung anzeigen."
          actionLabel="Mein Führerschein öffnen"
          actionHref={
            CLIENT_ROUTES
              .license
          }
        />
      </div>
    );
  }

  return (
    <>
      <DashboardDesktop
        data={
          data
        }
      />

      <DashboardMobile
        data={
          data
        }
      />
    </>
  );
}
