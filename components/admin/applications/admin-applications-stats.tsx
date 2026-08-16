import {
  CheckCircle2,
  Clock3,
  Files,
  Inbox,
  XCircle,
} from "lucide-react";

import type { AdminApplicationsStats } from "@/types/admin-applications";

interface AdminApplicationsStatsProps {
  stats: AdminApplicationsStats;
}

const cards = [
  { key: "total", label: "Gesamt", icon: Files, tone: "text-blue-300 bg-blue-500/10 border-blue-500/15" },
  { key: "newCount", label: "Neu", icon: Inbox, tone: "text-cyan-300 bg-cyan-500/10 border-cyan-500/15" },
  { key: "underReview", label: "In Prüfung", icon: Clock3, tone: "text-amber-300 bg-amber-500/10 border-amber-500/15" },
  { key: "approved", label: "Bestätigt", icon: CheckCircle2, tone: "text-emerald-300 bg-emerald-500/10 border-emerald-500/15" },
  { key: "rejected", label: "Abgelehnt", icon: XCircle, tone: "text-rose-300 bg-rose-500/10 border-rose-500/15" },
] as const;

export function AdminApplicationsStats({ stats }: AdminApplicationsStatsProps) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.key}
            className="rounded-2xl border border-white/[0.08] bg-[#0B1424] p-4 shadow-[0_12px_34px_rgba(0,0,0,0.12)]"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${card.tone}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="mt-4 text-2xl font-black tracking-[-0.04em] text-white">
              {stats[card.key].toLocaleString("de-DE")}
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {card.label}
            </p>
          </article>
        );
      })}
    </section>
  );
}

export default AdminApplicationsStats;
