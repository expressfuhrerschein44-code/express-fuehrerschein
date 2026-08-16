import {
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import {
  AdminPraxisStatusBadge,
} from "@/components/admin/praxis/admin-praxis-status-badge";

import type {
  AdminPraxisAppointmentDetailView,
} from "@/types/admin-praxis";

export interface AdminPraxisAppointmentCardProps {
  appointment:
    AdminPraxisAppointmentDetailView;
}

function formatDate(
  value:
    string,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
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

export function AdminPraxisAppointmentCard({
  appointment,
}: AdminPraxisAppointmentCardProps) {
  return (
    <section className="rounded-[18px] border border-[#E3E9F2] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#0B63F6]">
            Praxistermin
          </p>

          <h2 className="mt-1 text-[18px] font-black tracking-[-0.025em] text-[#081529]">
            {
              appointment.title
            }
          </h2>
        </div>

        <AdminPraxisStatusBadge
          status={
            appointment.status
          }
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[14px] bg-[#F7F9FC] p-4">
          <div className="flex gap-3">
            <CalendarDays
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#0B63F6]"
            />
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[#8390A2]">
                Datum
              </p>
              <p className="mt-1 text-[11px] font-black text-[#25344A]">
                {formatDate(
                  appointment.startsAt,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[14px] bg-[#F7F9FC] p-4">
          <div className="flex gap-3">
            <Clock3
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#0B63F6]"
            />
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[#8390A2]">
                Uhrzeit
              </p>
              <p className="mt-1 text-[11px] font-black text-[#25344A]">
                {formatTime(
                  appointment.startsAt,
                )}
                {appointment.endsAt
                  ? ` – ${formatTime(
                      appointment.endsAt,
                    )}`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[14px] bg-[#F7F9FC] p-4">
          <div className="flex gap-3">
            <MapPin
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#0B63F6]"
            />
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[#8390A2]">
                Ort
              </p>
              <p className="mt-1 text-[11px] font-black text-[#25344A]">
                {appointment.location ??
                  "Nicht angegeben"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[14px] bg-[#F7F9FC] p-4">
          <div className="flex gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-[#0B63F6]"
            />
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[#8390A2]">
                Verwaltet von
              </p>
              <p className="mt-1 text-[11px] font-black text-[#25344A]">
                {appointment.managedBy?.fullName ??
                  "Nicht zugewiesen"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminPraxisAppointmentCard;
