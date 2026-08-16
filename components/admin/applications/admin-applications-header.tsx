import { ClipboardList, ShieldCheck } from "lucide-react";

export function AdminApplicationsHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-blue-300">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Anträge
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
          Führerscheinanträge
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-400">
          Eingereichte Führerscheinanträge prüfen, Dokumente kontrollieren und Entscheidungen nachvollziehbar verwalten.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 self-start rounded-xl border border-emerald-500/15 bg-emerald-500/[0.07] px-3 py-2 text-xs font-bold text-emerald-300 sm:self-auto">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        Geschützter Admin-Bereich
      </div>
    </header>
  );
}

export default AdminApplicationsHeader;
