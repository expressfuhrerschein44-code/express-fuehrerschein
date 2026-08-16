import {
  BadgeCheck,
  FileText,
  MailWarning,
  UsersRound,
} from "lucide-react";

import type {
  AdminCustomersStats as AdminCustomersStatsData,
} from "@/types/admin-customers";

interface AdminCustomersStatsProps {
  stats: AdminCustomersStatsData;
}

const cards = [
  {
    key: "total" as const,
    label: "Clients au total",
    helper: "Comptes enregistrés",
    icon: UsersRound,
  },
  {
    key: "active" as const,
    label: "Comptes actifs",
    helper: "Statut active",
    icon: BadgeCheck,
  },
  {
    key: "pendingVerification" as const,
    label: "À vérifier",
    helper: "E-mail en attente",
    icon: MailWarning,
  },
  {
    key: "withApplications" as const,
    label: "Avec demande",
    helper: "Au moins un dossier",
    icon: FileText,
  },
];

export function AdminCustomersStats({
  stats,
}: AdminCustomersStatsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.key}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  {card.label}
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950">
                  {stats[card.key].toLocaleString("fr-FR")}
                </p>
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  {card.helper}
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B63F6]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
          </article>
        );
      })}
    </section>
  );
}
