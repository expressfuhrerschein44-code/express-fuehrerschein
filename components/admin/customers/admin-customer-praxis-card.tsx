import Link from "next/link";
import {
  CalendarClock,
  MapPin,
} from "lucide-react";

import type {
  AdminCustomerPraxisAppointmentView,
} from "@/types/admin-customers";

interface AdminCustomerPraxisCardProps {
  appointments: AdminCustomerPraxisAppointmentView[];
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(date);
}

export function AdminCustomerPraxisCard({
  appointments,
}: AdminCustomerPraxisCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-cyan-700">
            Pratique
          </p>
          <h2 className="text-lg font-black text-slate-950">
            Rendez-vous récents
          </h2>
        </div>
        <CalendarClock className="h-5 w-5 text-cyan-700" />
      </div>

      {appointments.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Aucun rendez-vous enregistré.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {appointments.slice(0, 8).map((appointment) => (
            <Link
              key={appointment.id}
              href={`/admin/praxis/${appointment.id}`}
              className="block rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">
                    {appointment.title}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {formatDate(appointment.startsAt)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-black text-slate-600">
                  {appointment.status}
                </span>
              </div>

              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                {appointment.location ?? "Lieu non renseigné"}
                {appointment.licenseClassCode
                  ? ` • Classe ${appointment.licenseClassCode}`
                  : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
