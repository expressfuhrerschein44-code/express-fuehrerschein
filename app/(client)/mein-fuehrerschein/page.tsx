/**
 * Express-Führerschein
 * "Mein Führerschein" client page.
 *
 * The authenticated Client Shell is provided by app/(client)/layout.tsx.
 * This page only loads the feature data and renders the feature component.
 */

import {
  DrivingLicenseApplicationPage,
} from "@/components/driving-license-application/driving-license-application-page";

import {
  getDrivingLicenseApplicationPageData,
} from "@/lib/server/driving-license-application/application-service";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function MeinFuehrerscheinPage() {
  const initialData =
    await getDrivingLicenseApplicationPageData();

  return (
    <div className="min-w-0">
      <DrivingLicenseApplicationPage
        initialData={
          initialData
        }
      />
    </div>
  );
}
