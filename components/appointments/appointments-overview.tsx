import {
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  History,
} from "lucide-react";

import type {
  AppointmentsOverviewView,
} from "@/types/appointments";

export interface AppointmentsOverviewProps {
  overview:
    AppointmentsOverviewView;
  locale:
    string;
  timezone:
    string;
}

function formatNextAppointment(
  value:
    string,
  locale:
    string,
  timezone:
    string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  try {
    const dateText =
      new Intl.DateTimeFormat(
        locale || "de",
        {
          day:
            "2-digit",
          month:
            "short",
          timeZone:
            timezone,
        },
      ).format(
        date,
      );

    const timeText =
      new Intl.DateTimeFormat(
        locale || "de",
        {
          hour:
            "2-digit",
          minute:
            "2-digit",
          hour12:
            false,
          timeZone:
            timezone,
        },
      ).format(
        date,
      );

    return `${dateText} · ${timeText}`;
  } catch {
    return "—";
  }
}

export function AppointmentsOverview({
  overview,
  locale,
  timezone,
}: AppointmentsOverviewProps) {
  const items = [
    {
      id:
        "next",
      label:
        "Nächster Termin",
      value:
        overview.nextAppointment
          ? formatNextAppointment(
              overview
                .nextAppointment
                .startsAt,
              locale,
              timezone,
            )
          : "Keiner",
      icon:
        CalendarClock,
    },
    {
      id:
        "upcoming",
      label:
        "Kommende",
      value:
        String(
          overview.upcomingCount,
        ),
      icon:
        CalendarCheck2,
    },
    {
      id:
        "confirmed",
      label:
        "Bestätigt",
      value:
        String(
          overview.confirmedCount,
        ),
      icon:
        CheckCircle2,
    },
    {
      id:
        "completed",
      label:
        "Abgeschlossen",
      value:
        String(
          overview.completedCount,
        ),
      icon:
        History,
    },
  ] as const;

  return (
    <section
      aria-label="Terminübersicht"
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

                  <p className="mt-2 truncate text-[16px] font-black tracking-[-0.025em] text-[#081529] sm:text-[18px]">
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
