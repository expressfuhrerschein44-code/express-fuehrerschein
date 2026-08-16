import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquareText,
} from "lucide-react";

import type {
  PraxisAppointmentStatus,
  PraxisAppointmentView,
} from "@/types/praxis";

export interface LessonRequestCardProps {
  appointment:
    PraxisAppointmentView;
  timezone:
    string;
}

function statusMeta(
  status:
    PraxisAppointmentStatus,
) {
  switch (
    status
  ) {
    case "requested":
      return {
        label:
          "Angefragt",
        className:
          "border-[#CFE0FF] bg-[#F2F7FF] text-[#0B63F6]",
      };

    case "confirmed":
      return {
        label:
          "Bestätigt",
        className:
          "border-[#BFE8D7] bg-[#F1FBF6] text-[#0C8B59]",
      };

    case "completed":
      return {
        label:
          "Abgeschlossen",
        className:
          "border-[#D9E2EC] bg-[#F5F7FA] text-[#53647A]",
      };

    case "cancelled":
      return {
        label:
          "Storniert",
        className:
          "border-[#F1CACA] bg-[#FFF5F5] text-[#C43737]",
      };

    case "scheduled":
    default:
      return {
        label:
          "Geplant",
        className:
          "border-[#E0D7FA] bg-[#F8F5FF] text-[#6D4BC3]",
      };
  }
}

function formatDate(
  value: string,
  timezone: string,
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
    return "Termin";
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      timeZone:
        timezone,
      weekday:
        "short",
      day:
        "2-digit",
      month:
        "long",
      year:
        "numeric",
    },
  ).format(
    date,
  );
}

function formatTime(
  value: string,
  timezone: string,
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

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      timeZone:
        timezone,
      hour:
        "2-digit",
      minute:
        "2-digit",
    },
  ).format(
    date,
  );
}

export function LessonRequestCard({
  appointment,
  timezone,
}: LessonRequestCardProps) {
  const meta =
    statusMeta(
      appointment.status,
    );

  return (
    <article className="rounded-[16px] border border-[#E7ECF3] bg-white p-4 transition hover:border-[#D7E1EE]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#708095]">
            <CalendarDays
              className="h-3.5 w-3.5 text-[#0B63F6]"
              aria-hidden="true"
            />

            <span>
              {formatDate(
                appointment.startsAt,
                timezone,
              )}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <p className="flex items-center gap-1.5 text-[12px] font-black text-[#081529]">
              <Clock3
                className="h-3.5 w-3.5 text-[#0B63F6]"
                aria-hidden="true"
              />

              {formatTime(
                appointment.startsAt,
                timezone,
              )}
            </p>

            <span className="rounded-full bg-[#F4F7FB] px-2 py-1 text-[8px] font-extrabold text-[#53647A]">
              Klasse {appointment.licenseClassCode}
            </span>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-extrabold ${meta.className}`}
        >
          {meta.label}
        </span>
      </div>

      {appointment.location ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#F8FAFD] px-3 py-2.5">
          <MapPin
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#708095]"
            aria-hidden="true"
          />

          <div className="min-w-0">
            <p className="text-[8px] font-bold text-[#8390A2]">
              Treffpunkt
            </p>
            <p className="mt-0.5 break-words text-[9px] font-semibold text-[#34445A]">
              {appointment.location}
            </p>
          </div>
        </div>
      ) : null}

      {appointment.notes ? (
        <div className="mt-2 flex items-start gap-2 px-1">
          <MessageSquareText
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8A97A8]"
            aria-hidden="true"
          />

          <p className="whitespace-pre-line break-words text-[9px] font-medium leading-4 text-[#708095]">
            {appointment.notes}
          </p>
        </div>
      ) : null}

      {appointment.status ===
      "completed" ? (
        <div className="mt-3 flex items-center gap-1.5 text-[8px] font-bold text-[#0C8B59]">
          <CheckCircle2
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
          Fahrstunde abgeschlossen
        </div>
      ) : null}
    </article>
  );
}
