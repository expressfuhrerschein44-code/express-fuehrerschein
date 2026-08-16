import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Gauge,
} from "lucide-react";

import type {
  PraxisOverviewView,
} from "@/types/praxis";

export interface PraxisOverviewProps {
  overview:
    PraxisOverviewView;
  timezone:
    string;
}

function formatNextAppointment(
  startsAt: string,
  timezone: string,
): string {
  const date =
    new Date(
      startsAt,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      timeZone:
        timezone,
      day:
        "2-digit",
      month:
        "short",
      hour:
        "2-digit",
      minute:
        "2-digit",
    },
  ).format(
    date,
  );
}

export function PraxisOverview({
  overview,
  timezone,
}: PraxisOverviewProps) {
  const items = [
    {
      id:
        "total",
      label:
        "Fahrstunden",
      value:
        String(
          overview.totalLessons,
        ),
      icon:
        Gauge,
    },
    {
      id:
        "completed",
      label:
        "Abgeschlossen",
      value:
        String(
          overview.completedLessons,
        ),
      icon:
        CheckCircle2,
    },
    {
      id:
        "requests",
      label:
        "Offene Anfragen",
      value:
        String(
          overview.openRequests,
        ),
      icon:
        Clock3,
    },
    {
      id:
        "next",
      label:
        "Nächster Termin",
      value:
        overview.nextAppointment
          ? formatNextAppointment(
              overview.nextAppointment.startsAt,
              timezone,
            )
          : "—",
      icon:
        CalendarClock,
    },
  ] as const;

  return (
    <section
      aria-label="Praxis Übersicht"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {items.map(
        (
          item,
        ) => {
          const Icon =
            item.icon;

          return (
            <article
              key={
                item.id
              }
              className="rounded-[18px] border border-[#E5EAF2] bg-white p-4 shadow-[0_8px_24px_rgba(17,40,70,0.035)] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-[#758499]">
                    {item.label}
                  </p>

                  <p className="mt-2 truncate text-[18px] font-black tracking-[-0.03em] text-[#081529] sm:text-[21px]">
                    {item.value}
                  </p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
                  <Icon
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </article>
          );
        },
      )}
    </section>
  );
}
