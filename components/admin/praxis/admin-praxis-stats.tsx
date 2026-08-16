import {
  Ban,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

import type {
  AdminPraxisStatsView,
} from "@/types/admin-praxis";

export interface AdminPraxisStatsProps {
  stats:
    AdminPraxisStatsView;
}

const CARDS = [
  {
    key:
      "total",
    label:
      "Gesamt",
    icon:
      CalendarDays,
    className:
      "bg-[#F6F9FD] text-[#334155]",
  },
  {
    key:
      "today",
    label:
      "Heute",
    icon:
      CalendarCheck2,
    className:
      "bg-[#EEF5FF] text-[#0B63F6]",
  },
  {
    key:
      "scheduled",
    label:
      "Geplant",
    icon:
      CalendarClock,
    className:
      "bg-amber-50 text-amber-700",
  },
  {
    key:
      "confirmed",
    label:
      "Bestätigt",
    icon:
      CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700",
  },
  {
    key:
      "cancelled",
    label:
      "Abgesagt",
    icon:
      Ban,
    className:
      "bg-red-50 text-red-700",
  },
] as const;

export function AdminPraxisStats({
  stats,
}: AdminPraxisStatsProps) {
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {CARDS.map(
        (
          card,
        ) => {
          const Icon =
            card.icon;

          return (
            <article
              key={
                card.key
              }
              className="rounded-[18px] border border-[#E3E9F2] bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.035)]"
            >
              <div
                className={[
                  "flex h-9 w-9 items-center justify-center rounded-[11px]",
                  card.className,
                ].join(
                  " ",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </div>

              <p className="mt-4 text-[9px] font-black uppercase tracking-[0.1em] text-[#7B899C]">
                {
                  card.label
                }
              </p>

              <p className="mt-1 text-[22px] font-black tracking-[-0.04em] text-[#081529]">
                {stats[
                  card.key
                ].toLocaleString(
                  "de-DE",
                )}
              </p>
            </article>
          );
        },
      )}
    </section>
  );
}

export default AdminPraxisStats;
