import {
  Eye,
  LockKeyhole,
  MessageSquareText,
} from "lucide-react";

import type {
  AdminPraxisAppointmentDetailView,
} from "@/types/admin-praxis";

export interface AdminPraxisNotesCardProps {
  appointment:
    AdminPraxisAppointmentDetailView;
}

export function AdminPraxisNotesCard({
  appointment,
}: AdminPraxisNotesCardProps) {
  return (
    <section className="rounded-[18px] border border-[#E3E9F2] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.03)] sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#F2F5F9] text-[#526176]">
          <MessageSquareText
            aria-hidden="true"
            className="h-4.5 w-4.5"
          />
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#7A899C]">
            Notizen
          </p>
          <h2 className="mt-1 text-[15px] font-black text-[#0A172A]">
            Terminnotizen
          </h2>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[14px] border border-[#E6EBF2] bg-[#FAFCFE] p-4">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.08em] text-[#64748B]">
            <Eye
              aria-hidden="true"
              className="h-3.5 w-3.5 text-[#0B63F6]"
            />
            Kundennotiz
          </div>

          <p className="mt-3 whitespace-pre-wrap text-[10px] font-medium leading-5 text-[#425168]">
            {appointment.notes ??
              "Keine Kundennotiz hinterlegt."}
          </p>
        </div>

        <div className="rounded-[14px] border border-[#E6EBF2] bg-[#FAFCFE] p-4">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.08em] text-[#64748B]">
            <LockKeyhole
              aria-hidden="true"
              className="h-3.5 w-3.5 text-[#0B63F6]"
            />
            Interne Admin-Notiz
          </div>

          <p className="mt-3 whitespace-pre-wrap text-[10px] font-medium leading-5 text-[#425168]">
            {appointment.adminNotes ??
              "Keine interne Notiz hinterlegt."}
          </p>
        </div>
      </div>
    </section>
  );
}

export default AdminPraxisNotesCard;
