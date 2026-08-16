import {
  CheckCircle2,
  Clock3,
  FileClock,
  FileSearch,
  XCircle,
} from "lucide-react";

import type {
  AdminPaymentsStats,
} from "@/types/admin-payments";

export function AdminPaymentsStats({
  stats,
}: {
  stats: AdminPaymentsStats;
}) {
  const cards = [
    {
      label: "À vérifier",
      value: stats.toReview,
      hint: "Preuves reçues ou en contrôle",
      icon: FileSearch,
    },
    {
      label: "En attente",
      value: stats.awaitingPayment,
      hint: "Paiements activés côté client",
      icon: Clock3,
    },
    {
      label: "Payés",
      value: stats.paid,
      hint: "Paiements confirmés",
      icon: CheckCircle2,
    },
    {
      label: "Refusés",
      value: stats.rejected,
      hint: "Preuves non confirmées",
      icon: XCircle,
    },
    {
      label: "Brouillons",
      value: stats.draft,
      hint: "Étapes encore invisibles",
      icon: FileClock,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {card.value}
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0B63F6]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-[11px] leading-4 text-slate-500">
              {card.hint}
            </p>
          </div>
        );
      })}
    </div>
  );
}
