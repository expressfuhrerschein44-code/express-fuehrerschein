import { CheckCircle2, Circle, Clock3, XCircle } from "lucide-react";

import type { AdminApplicationTimelineItem } from "@/types/admin-applications";

interface AdminApplicationTimelineProps {
  items: AdminApplicationTimelineItem[];
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const tone = {
  neutral: { icon: Circle, className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  info: { icon: Clock3, className: "bg-blue-500/10 text-blue-300 border-blue-500/20" },
  success: { icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  danger: { icon: XCircle, className: "bg-rose-500/10 text-rose-300 border-rose-500/20" },
} as const;

export function AdminApplicationTimeline({ items }: AdminApplicationTimelineProps) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1424] p-5 sm:p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Verlauf</p>
      <h2 className="mt-1 text-base font-black text-white">Antragshistorie</h2>

      <div className="mt-5 space-y-0">
        {items.map((item, index) => {
          const config = tone[item.tone];
          const Icon = config.icon;
          const last = index === items.length - 1;
          return (
            <div key={item.key} className="grid grid-cols-[34px_minmax(0,1fr)] gap-3">
              <div className="flex flex-col items-center">
                <span className={`flex h-8 w-8 items-center justify-center rounded-full border ${config.className}`}>
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                {!last ? <span className="min-h-8 w-px flex-1 bg-white/[0.08]" /> : null}
              </div>
              <div className={last ? "pb-0" : "pb-5"}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-black text-slate-200">{item.title}</p>
                  <time className="text-[10px] font-semibold text-slate-600">{formatDateTime(item.occurredAt)}</time>
                </div>
                {item.description ? <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default AdminApplicationTimeline;
