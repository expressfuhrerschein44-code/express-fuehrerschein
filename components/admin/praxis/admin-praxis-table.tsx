import Link from "next/link";

import {
  ArrowRight,
  CalendarDays,
  CarFront,
  MapPin,
  UserRound,
} from "lucide-react";

import {
  AdminPraxisStatusBadge,
} from "@/components/admin/praxis/admin-praxis-status-badge";

import type {
  AdminPraxisAppointmentView,
} from "@/types/admin-praxis";

export interface AdminPraxisTableProps {
  appointments:
    AdminPraxisAppointmentView[];
}

function formatDateTime(
  value:
    string,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day:
        "2-digit",
      month:
        "2-digit",
      year:
        "numeric",
      hour:
        "2-digit",
      minute:
        "2-digit",
      timeZone:
        "Europe/Berlin",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function formatTime(
  value:
    string,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      hour:
        "2-digit",
      minute:
        "2-digit",
      timeZone:
        "Europe/Berlin",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function AppointmentMobileCard({
  appointment,
}: {
  appointment:
    AdminPraxisAppointmentView;
}) {
  return (
    <article className="rounded-[16px] border border-[#E3E9F2] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-black text-[#0A172A]">
            {
              appointment.customer.fullName
            }
          </p>

          <p className="mt-1 truncate text-[10px] font-semibold text-[#738197]">
            {
              appointment.title
            }
          </p>
        </div>

        <AdminPraxisStatusBadge
          status={
            appointment.status
          }
          compact
        />
      </div>

      <div className="mt-4 grid gap-2 text-[10px] font-semibold text-[#5E6D82]">
        <span className="flex items-center gap-2">
          <CalendarDays
            aria-hidden="true"
            className="h-3.5 w-3.5 text-[#0B63F6]"
          />

          {formatDateTime(
            appointment.startsAt,
          )}

          {appointment.endsAt
            ? ` – ${formatTime(
                appointment.endsAt,
              )}`
            : ""}
        </span>

        <span className="flex items-center gap-2">
          <CarFront
            aria-hidden="true"
            className="h-3.5 w-3.5 text-[#0B63F6]"
          />

          {appointment.licenseClass
            ? `Klasse ${appointment.licenseClass.code}`
            : "Keine Klasse zugeordnet"}
        </span>

        {appointment.location ? (
          <span className="flex items-center gap-2">
            <MapPin
              aria-hidden="true"
              className="h-3.5 w-3.5 text-[#0B63F6]"
            />
            {
              appointment.location
            }
          </span>
        ) : null}
      </div>

      <Link
        href={`/admin/praxis/${encodeURIComponent(
          appointment.id,
        )}`}
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[11px] bg-[#F0F5FD] px-3 text-[10px] font-black text-[#0B63F6] transition hover:bg-[#E5EFFF]"
      >
        Termin öffnen
        <ArrowRight
          aria-hidden="true"
          className="h-3.5 w-3.5"
        />
      </Link>
    </article>
  );
}

export function AdminPraxisTable({
  appointments,
}: AdminPraxisTableProps) {
  if (
    appointments.length ===
    0
  ) {
    return (
      <section className="flex min-h-[300px] flex-col items-center justify-center rounded-[18px] border border-[#E3E9F2] bg-white px-6 text-center shadow-[0_8px_28px_rgba(15,23,42,0.03)]">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#EEF5FF] text-[#0B63F6]">
          <CarFront
            aria-hidden="true"
            className="h-6 w-6"
          />
        </div>

        <h2 className="mt-4 text-[15px] font-black text-[#0A172A]">
          Keine Fahrstunden gefunden
        </h2>

        <p className="mt-2 max-w-md text-[11px] font-medium leading-5 text-[#718096]">
          Für die ausgewählten Filter gibt es aktuell keine Praxistermine.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[18px] border border-[#E3E9F2] bg-white shadow-[0_8px_28px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between border-b border-[#E9EEF5] px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-[13px] font-black text-[#0A172A]">
            Fahrstunden
          </h2>

          <p className="mt-1 text-[9px] font-semibold text-[#8290A2]">
            {appointments.length.toLocaleString(
              "de-DE",
            )}{" "}
            Einträge
          </p>
        </div>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {appointments.map(
          (
            appointment,
          ) => (
            <AppointmentMobileCard
              key={
                appointment.id
              }
              appointment={
                appointment
              }
            />
          ),
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead>
            <tr className="bg-[#F8FAFD] text-[9px] font-black uppercase tracking-[0.1em] text-[#7C8A9C]">
              <th className="px-5 py-3.5">
                Kunde
              </th>
              <th className="px-5 py-3.5">
                Klasse
              </th>
              <th className="px-5 py-3.5">
                Fahrstunde
              </th>
              <th className="px-5 py-3.5">
                Ort
              </th>
              <th className="px-5 py-3.5">
                Status
              </th>
              <th className="px-5 py-3.5">
                Verwaltung
              </th>
              <th className="px-5 py-3.5 text-right">
                Aktion
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EDF1F6]">
            {appointments.map(
              (
                appointment,
              ) => (
                <tr
                  key={
                    appointment.id
                  }
                  className="transition hover:bg-[#FAFCFF]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EEF5FF] text-[#0B63F6]">
                        <UserRound
                          aria-hidden="true"
                          className="h-4 w-4"
                        />
                      </span>

                      <div className="min-w-0">
                        <p className="max-w-[190px] truncate text-[11px] font-black text-[#152238]">
                          {
                            appointment.customer.fullName
                          }
                        </p>

                        <p className="mt-0.5 max-w-[190px] truncate text-[9px] font-medium text-[#7A889B]">
                          {
                            appointment.customer.email
                          }
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-[8px] bg-[#F0F5FD] px-2.5 py-1.5 text-[10px] font-black text-[#0B63F6]">
                      {appointment.licenseClass
                        ? `Klasse ${appointment.licenseClass.code}`
                        : "—"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <p className="max-w-[210px] truncate text-[10px] font-black text-[#203047]">
                      {
                        appointment.title
                      }
                    </p>

                    <p className="mt-1 text-[9px] font-semibold text-[#758398]">
                      {formatDateTime(
                        appointment.startsAt,
                      )}
                      {appointment.endsAt
                        ? ` – ${formatTime(
                            appointment.endsAt,
                          )}`
                        : ""}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="flex max-w-[180px] items-center gap-1.5 text-[10px] font-semibold text-[#5F6F84]">
                      <MapPin
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-[#8C99A9]"
                      />
                      <span className="truncate">
                        {appointment.location ??
                          "—"}
                      </span>
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <AdminPraxisStatusBadge
                      status={
                        appointment.status
                      }
                      compact
                    />
                  </td>

                  <td className="px-5 py-4">
                    <p className="max-w-[170px] truncate text-[9px] font-semibold text-[#66758A]">
                      {appointment.managedBy?.fullName ??
                        "Nicht zugewiesen"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/praxis/${encodeURIComponent(
                        appointment.id,
                      )}`}
                      className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-[10px] border border-[#DCE5F0] bg-white px-3 text-[9px] font-black text-[#0B63F6] transition hover:border-[#BFD3F2] hover:bg-[#F4F8FE]"
                    >
                      Öffnen
                      <ArrowRight
                        aria-hidden="true"
                        className="h-3 w-3"
                      />
                    </Link>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminPraxisTable;
