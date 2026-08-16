import {
  CheckCircle2,
  Circle,
} from "lucide-react";

import type {
  AdminPaymentTimelineItem,
} from "@/types/admin-payments";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const dotTone: Record<
  AdminPaymentTimelineItem["tone"],
  string
> = {
  neutral: "bg-slate-400",
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
};

export function AdminPaymentTimeline({
  items,
}: {
  items: AdminPaymentTimelineItem[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B63F6]">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
            Traçabilité
          </p>
          <h2 className="text-base font-black text-slate-950">
            Historique
          </h2>
        </div>
      </div>

      <div className="mt-5 space-y-0">
        {items.map((item, index) => (
          <div key={item.key} className="relative flex gap-3 pb-5 last:pb-0">
            {index < items.length - 1 && (
              <span className="absolute left-[7px] top-4 h-[calc(100%-4px)] w-px bg-slate-200" />
            )}
            <span
              className={`relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-white ${dotTone[item.tone]}`}
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-sm font-extrabold text-slate-900">
                  {item.label}
                </p>
                <p className="text-[11px] text-slate-400">
                  {formatDateTime(item.occurredAt)}
                </p>
              </div>
              {item.description && (
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Circle className="h-3.5 w-3.5" />
            Aucun événement disponible.
          </div>
        )}
      </div>
    </section>
  );
}
