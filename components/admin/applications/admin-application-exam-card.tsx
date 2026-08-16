import { Check, HelpCircle, X } from "lucide-react";

import type { AdminApplicationDetail } from "@/types/admin-applications";

interface AdminApplicationExamCardProps {
  theoryPassed: AdminApplicationDetail["theoryPassed"];
  practicalPassed: AdminApplicationDetail["practicalPassed"];
}

function Answer({ label, value }: { label: string; value: boolean | null }) {
  const content =
    value === true
      ? { text: "Ja", icon: Check, className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" }
      : value === false
        ? { text: "Nein", icon: X, className: "border-slate-500/20 bg-slate-500/10 text-slate-300" }
        : { text: "Nicht angegeben", icon: HelpCircle, className: "border-amber-500/20 bg-amber-500/10 text-amber-300" };
  const Icon = content.icon;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
      <p className="text-sm font-bold text-slate-300">{label}</p>
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${content.className}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {content.text}
      </span>
    </div>
  );
}

export function AdminApplicationExamCard({ theoryPassed, practicalPassed }: AdminApplicationExamCardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1424] p-5 sm:p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-violet-300">Prüfungsinformationen</p>
      <h2 className="mt-1 text-base font-black text-white">Angaben des Kunden</h2>
      <div className="mt-5 grid gap-3">
        <Answer label="Theorie bestanden?" value={theoryPassed} />
        <Answer label="Praxis bestanden?" value={practicalPassed} />
      </div>
    </section>
  );
}

export default AdminApplicationExamCard;
