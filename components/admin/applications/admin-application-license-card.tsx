import { Banknote, CarFront } from "lucide-react";

import type { AdminApplicationDetail } from "@/types/admin-applications";

interface AdminApplicationLicenseCardProps {
  application: Pick<
    AdminApplicationDetail,
    | "selectedClasses"
    | "classesTotalCents"
    | "processingFeeCents"
    | "totalCents"
    | "currency"
  >;
}

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency || "EUR",
  }).format(Math.max(0, cents) / 100);
}

export function AdminApplicationLicenseCard({ application }: AdminApplicationLicenseCardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1424] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/15 bg-cyan-500/10 text-cyan-300">
          <CarFront className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-cyan-300">Führerschein</p>
          <h2 className="mt-1 text-base font-black text-white">Klasse & Preisübersicht</h2>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {application.selectedClasses.length ? (
          application.selectedClasses.map((licenseClass) => (
            <span
              key={licenseClass}
              className="inline-flex min-h-9 items-center rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 text-sm font-black text-blue-200"
            >
              Klasse {licenseClass}
            </span>
          ))
        ) : (
          <span className="text-sm text-slate-500">Keine Klasse gespeichert</span>
        )}
      </div>

      <div className="mt-5 divide-y divide-white/[0.06] rounded-xl border border-white/[0.07] bg-white/[0.02] px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <span className="text-xs font-semibold text-slate-500">Führerscheinklasse(n)</span>
          <span className="text-sm font-extrabold text-slate-200">{money(application.classesTotalCents, application.currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-3">
          <span className="text-xs font-semibold text-slate-500">Bearbeitungsgebühr</span>
          <span className="text-sm font-extrabold text-slate-200">{money(application.processingFeeCents, application.currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 py-4">
          <span className="inline-flex items-center gap-2 text-sm font-black text-white">
            <Banknote className="h-4 w-4 text-blue-300" aria-hidden="true" />
            Gesamt
          </span>
          <span className="text-lg font-black tracking-[-0.03em] text-blue-300">{money(application.totalCents, application.currency)}</span>
        </div>
      </div>
    </section>
  );
}

export default AdminApplicationLicenseCard;
