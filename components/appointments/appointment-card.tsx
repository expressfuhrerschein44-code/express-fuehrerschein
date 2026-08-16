import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  GraduationCap,
  MapPin,
  MessageSquareText,
  XCircle,
} from "lucide-react";

import type {
  AppointmentStatusView,
  AppointmentTypeView,
  AppointmentView,
} from "@/types/appointments";

export interface AppointmentCardProps {
  appointment:
    AppointmentView;
  locale:
    string;
  timezone:
    string;
}

function appointmentTypeLabel(
  type:
    AppointmentTypeView,
  fallbackTitle:
    string,
): string {
  switch (
    type
  ) {
    case "driving_lesson":
      return "Fahrstunde";

    case "theory_exam":
      return "Theorieprüfung";

    case "practical_exam":
      return "Praktische Prüfung";

    case "school":
      return "Fahrschultermin";

    case "other":
    default:
      return fallbackTitle ||
        "Termin";
  }
}

function statusLabel(
  status:
    AppointmentStatusView,
  rawStatus:
    string,
): string {
  switch (
    status
  ) {
    case "requested":
      return "Angefragt";

    case "scheduled":
      return "Geplant";

    case "confirmed":
      return "Bestätigt";

    case "completed":
      return "Abgeschlossen";

    case "cancelled":
      return "Storniert";

    case "other":
    default:
      return rawStatus ||
        "Termin";
  }
}

function statusClasses(
  status:
    AppointmentStatusView,
): string {
  switch (
    status
  ) {
    case "confirmed":
      return "border-[#BFE8D7] bg-[#F1FBF6] text-[#0C8B59]";

    case "completed":
      return "border-[#D4DCE7] bg-[#F6F8FB] text-[#5F6F84]";

    case "cancelled":
      return "border-[#F1CACA] bg-[#FFF5F5] text-[#C43737]";

    case "requested":
      return "border-[#F2D9A6] bg-[#FFF9EE] text-[#A66B13]";

    case "scheduled":
      return "border-[#CFE0FF] bg-[#F2F7FF] text-[#0B63F6]";

    case "other":
    default:
      return "border-[#DCE4EF] bg-[#F8FAFD] text-[#65758A]";
  }
}

function formatDate(
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
    return new Intl.DateTimeFormat(
      locale || "de",
      {
        weekday:
          "long",
        day:
          "2-digit",
        month:
          "long",
        year:
          "numeric",
        timeZone:
          timezone,
      },
    ).format(
      date,
    );
  } catch {
    return "—";
  }
}

function formatTime(
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
    return new Intl.DateTimeFormat(
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
  } catch {
    return "—";
  }
}

function StatusIcon({
  status,
}: {
  status:
    AppointmentStatusView;
}) {
  if (
    status ===
    "confirmed"
  ) {
    return (
      <CheckCircle2
        className="h-3 w-3"
        aria-hidden="true"
      />
    );
  }

  if (
    status ===
    "cancelled"
  ) {
    return (
      <XCircle
        className="h-3 w-3"
        aria-hidden="true"
      />
    );
  }

  return (
    <CircleAlert
      className="h-3 w-3"
      aria-hidden="true"
    />
  );
}

export function AppointmentCard({
  appointment,
  locale,
  timezone,
}: AppointmentCardProps) {
  const typeLabel =
    appointmentTypeLabel(
      appointment.appointmentType,
      appointment.title,
    );

  const startTime =
    formatTime(
      appointment.startsAt,
      locale,
      timezone,
    );

  const endTime =
    appointment.endsAt
      ? formatTime(
          appointment.endsAt,
          locale,
          timezone,
        )
      : null;

  return (
    <article className="rounded-[17px] border border-[#E6EBF2] bg-white p-4 transition hover:border-[#D2DDEB] hover:shadow-[0_8px_22px_rgba(17,40,70,0.045)] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF5FF] px-2.5 py-1 text-[8px] font-extrabold text-[#0B63F6]">
              <CalendarDays
                className="h-3 w-3"
                aria-hidden="true"
              />
              {typeLabel}
            </span>

            {appointment.licenseClassCode ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E0E7F0] bg-[#FAFBFD] px-2.5 py-1 text-[8px] font-extrabold text-[#53647A]">
                <GraduationCap
                  className="h-3 w-3"
                  aria-hidden="true"
                />
                Klasse {appointment.licenseClassCode}
              </span>
            ) : null}
          </div>

          <h3 className="mt-3 text-[13px] font-black leading-5 text-[#081529]">
            {appointment.title}
          </h3>

          <p className="mt-1 text-[9px] font-semibold capitalize text-[#66758A]">
            {formatDate(
              appointment.startsAt,
              locale,
              timezone,
            )}
          </p>
        </div>

        <span
          className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[8px] font-extrabold ${statusClasses(appointment.status)}`}
        >
          <StatusIcon
            status={
              appointment.status
            }
          />
          {statusLabel(
            appointment.status,
            appointment.rawStatus,
          )}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-xl bg-[#F8FAFD] px-3 py-2.5">
          <Clock3
            className="h-3.5 w-3.5 shrink-0 text-[#0B63F6]"
            aria-hidden="true"
          />

          <div>
            <p className="text-[7px] font-bold uppercase tracking-[0.05em] text-[#8491A3]">
              Uhrzeit
            </p>

            <p className="mt-0.5 text-[9px] font-extrabold text-[#34445A]">
              {startTime}
              {endTime
                ? ` – ${endTime}`
                : ""}
            </p>
          </div>
        </div>

        {appointment.location ? (
          <div className="flex items-center gap-2 rounded-xl bg-[#F8FAFD] px-3 py-2.5">
            <MapPin
              className="h-3.5 w-3.5 shrink-0 text-[#0B63F6]"
              aria-hidden="true"
            />

            <div className="min-w-0">
              <p className="text-[7px] font-bold uppercase tracking-[0.05em] text-[#8491A3]">
                Treffpunkt
              </p>

              <p className="mt-0.5 truncate text-[9px] font-extrabold text-[#34445A]">
                {appointment.location}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {appointment.notes ? (
        <div className="mt-2 flex items-start gap-2 rounded-xl border border-[#E8EDF4] px-3 py-2.5">
          <MessageSquareText
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7B899B]"
            aria-hidden="true"
          />

          <p className="whitespace-pre-line text-[8px] font-medium leading-4 text-[#6E7D91]">
            {appointment.notes}
          </p>
        </div>
      ) : null}
    </article>
  );
}
