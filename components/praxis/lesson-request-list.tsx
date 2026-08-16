import {
  CalendarX2,
} from "lucide-react";

import {
  LessonRequestCard,
} from "@/components/praxis/lesson-request-card";

import type {
  PraxisAppointmentView,
} from "@/types/praxis";

export interface LessonRequestListProps {
  appointments:
    readonly PraxisAppointmentView[];
  timezone:
    string;
}

export function LessonRequestList({
  appointments,
  timezone,
}: LessonRequestListProps) {
  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Übersicht
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Meine Fahrstunden
        </h2>

        <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
          Deine Terminwünsche und bestätigten Fahrstunden an einem Ort.
        </p>
      </div>

      {appointments.length ? (
        <div className="mt-5 space-y-3">
          {appointments.map(
            (
              appointment,
            ) => (
              <LessonRequestCard
                key={
                  appointment.id
                }
                appointment={
                  appointment
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
            <CalendarX2
              className="h-4 w-4"
              aria-hidden="true"
            />
          </span>

          <p className="mt-3 text-[11px] font-extrabold text-[#34445A]">
            Noch keine Fahrstunden
          </p>

          <p className="mx-auto mt-1 max-w-[310px] text-[9px] font-medium leading-4 text-[#8491A3]">
            Sobald du eine Fahrstunde anfragst, erscheint sie hier mit ihrem aktuellen Status.
          </p>
        </div>
      )}
    </section>
  );
}
