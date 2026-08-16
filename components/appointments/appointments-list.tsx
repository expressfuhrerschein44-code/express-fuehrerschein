import Link from "next/link";

import {
  CalendarDays,
  History,
} from "lucide-react";

import {
  AppointmentCard,
} from "@/components/appointments/appointment-card";

import type {
  AppointmentView,
} from "@/types/appointments";

export interface AppointmentsListProps {
  upcoming:
    readonly AppointmentView[];
  history:
    readonly AppointmentView[];
  locale:
    string;
  timezone:
    string;
}

export function AppointmentsList({
  upcoming,
  history,
  locale,
  timezone,
}: AppointmentsListProps) {
  return (
    <div className="space-y-4">
      <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
            Demnächst
          </p>

          <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
            Kommende Termine
          </h2>

          <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
            Deine nächsten Fahrstunden, Prüfungen und Fahrschultermine.
          </p>
        </div>

        {upcoming.length ? (
          <div className="mt-5 space-y-3">
            {upcoming.map(
              (
                appointment,
              ) => (
                <AppointmentCard
                  key={
                    appointment.id
                  }
                  appointment={
                    appointment
                  }
                  locale={
                    locale
                  }
                  timezone={
                    timezone
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-[16px] border border-dashed border-[#D7E0EB] bg-[#F8FAFD] px-5 py-8 text-center">
            <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#7E8DA1] shadow-[0_5px_16px_rgba(17,40,70,0.05)]">
              <CalendarDays
                className="h-4.5 w-4.5"
                aria-hidden="true"
              />
            </span>

            <p className="mt-3 text-[11px] font-extrabold text-[#34445A]">
              Keine kommenden Termine
            </p>

            <p className="mx-auto mt-1 max-w-[360px] text-[9px] font-medium leading-4 text-[#8491A3]">
              Sobald eine Fahrstunde, Prüfung oder ein anderer Termin geplant ist, erscheint er automatisch hier.
            </p>

            <Link
              href="/praxis"
              className="mt-4 inline-flex min-h-9 items-center justify-center rounded-lg bg-[#0B63F6] px-4 text-[8px] font-extrabold text-white"
            >
              Fahrstunde anfragen
            </Link>
          </div>
        )}
      </section>

      <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#6F7F94]">
            Verlauf
          </p>

          <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
            Vergangene Termine
          </h2>
        </div>

        {history.length ? (
          <div className="mt-5 space-y-3">
            {history.map(
              (
                appointment,
              ) => (
                <AppointmentCard
                  key={
                    appointment.id
                  }
                  appointment={
                    appointment
                  }
                  locale={
                    locale
                  }
                  timezone={
                    timezone
                  }
                />
              ),
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-[16px] border border-dashed border-[#D7E0EB] bg-[#F8FAFD] px-5 py-7 text-center">
            <History
              className="mx-auto h-4.5 w-4.5 text-[#8592A4]"
              aria-hidden="true"
            />

            <p className="mt-2 text-[10px] font-extrabold text-[#53647A]">
              Noch keine vergangenen Termine
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
