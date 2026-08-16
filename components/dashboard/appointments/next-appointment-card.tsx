/**
 * Express-Führerschein
 * Next appointment card.
 */

import Link from "next/link";

import {
  DashboardCard,
} from "@/components/dashboard/shared/dashboard-card";

import {
  CLIENT_ROUTES,
} from "@/data/client-navigation";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardAppointment,
} from "@/types/dashboard";

export interface NextAppointmentCardProps {
  appointment:
    DashboardAppointment | null;

  timezone:
    string;

  compact?:
    boolean;

  dark?:
    boolean;

  className?:
    string;
}

function formatAppointmentDate(
  iso:
    string,

  timezone:
    string,
): string {
  const date =
    new Date(
      iso,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      "de-DE",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",

        timeZone:
          timezone,
      },
    ).format(
      date,
    );
  } catch {
    return new Intl.DateTimeFormat(
      "de-DE",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      },
    ).format(
      date,
    );
  }
}

export function NextAppointmentCard({
  appointment,
  timezone,
  compact =
    false,
  dark =
    false,
  className,
}: NextAppointmentCardProps) {
  return (
    <DashboardCard
      dark={dark}
      className={cn(
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <h2
        className={cn(
          "text-[14px] font-extrabold",
          dark ? "text-white" : "text-[#111C2B]",
        )}
      >
        Nächster Termin
      </h2>

      {appointment ? (
        <>
          <div className="mt-4 flex gap-3">
            <span
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                dark
                  ? "bg-[#0B2C55] text-[#3A9CFF]"
                  : "bg-[#EEF5FF] text-[#0878FF]",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M8 3v4M16 3v4M3 10h18" />
              </svg>
            </span>

            <div className="min-w-0">
              <p
                className={cn(
                  "truncate text-[11px] font-extrabold",
                  dark ? "text-white" : "text-[#172233]",
                )}
              >
                {appointment.title}
              </p>

              <p
                className={cn(
                  "mt-1 text-[10px]",
                  dark ? "text-[#B1BFD0]" : "text-[#526277]",
                )}
              >
                {formatAppointmentDate(
                  appointment.startsAt,
                  timezone,
                )}
              </p>

              {appointment.location ? (
                <p
                  className={cn(
                    "mt-1 truncate text-[9px]",
                    dark ? "text-[#8194A9]" : "text-[#7C8999]",
                  )}
                >
                  {appointment.location}
                </p>
              ) : null}
            </div>
          </div>

          <Link
            href={CLIENT_ROUTES.appointments}
            className={cn(
              "mt-4 inline-flex h-9 w-full items-center justify-center rounded-lg border text-[10px] font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#0878FF]",
              dark
                ? "border-white/[0.14] text-[#3A9CFF] hover:bg-white/[0.04]"
                : "border-[#D9E2EC] text-[#0878FF] hover:bg-[#F6FAFF]",
            )}
          >
            Termin ansehen
          </Link>
        </>
      ) : (
        <div className="mt-4">
          <p
            className={cn(
              "text-[11px] leading-5",
              dark ? "text-[#AAB9CA]" : "text-[#718095]",
            )}
          >
            Zurzeit ist kein kommender Termin eingetragen.
          </p>

          <Link
            href={CLIENT_ROUTES.appointments}
            className="mt-3 inline-flex text-[10px] font-bold text-[#0878FF] outline-none focus-visible:ring-2 focus-visible:ring-[#0878FF]"
          >
            Termine öffnen
          </Link>
        </div>
      )}
    </DashboardCard>
  );
}
