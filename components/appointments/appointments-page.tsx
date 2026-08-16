import {
  AlertCircle,
} from "lucide-react";

import {
  AppointmentsHeader,
} from "@/components/appointments/appointments-header";

import {
  AppointmentsList,
} from "@/components/appointments/appointments-list";

import {
  AppointmentsOverview,
} from "@/components/appointments/appointments-overview";

import type {
  AppointmentsPageData,
} from "@/types/appointments";

export interface AppointmentsPageProps {
  data:
    AppointmentsPageData;
}

export function AppointmentsPage({
  data,
}: AppointmentsPageProps) {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <AppointmentsHeader
        status={
          data.status
        }
        licenseClassCode={
          data.licenseClassCode
        }
      />

      <div className="mt-4">
        <AppointmentsOverview
          overview={
            data.overview
          }
          locale={
            data.locale
          }
          timezone={
            data.timezone
          }
        />
      </div>

      {data.status ===
      "no_active_license_class" ? (
        <div
          role="status"
          className="mt-4 flex items-start gap-2.5 rounded-[14px] border border-[#F1D6A6] bg-[#FFF9EE] px-4 py-3"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#B7791F]"
            aria-hidden="true"
          />

          <p className="text-[9px] font-bold leading-4 text-[#8A6117]">
            Aktuell ist keine aktive Führerscheinklasse hinterlegt. Bereits vorhandene Termine werden trotzdem weiterhin angezeigt.
          </p>
        </div>
      ) : null}

      <div className="mt-4">
        <AppointmentsList
          upcoming={
            data.upcoming
          }
          history={
            data.history
          }
          locale={
            data.locale
          }
          timezone={
            data.timezone
          }
        />
      </div>
    </main>
  );
}
