import {
  BookOpen,
  CircleHelp,
  FileWarning,
  GraduationCap,
  Layers3,
} from "lucide-react";

import type {
  AdminTheoryStatsView,
} from "@/types/admin-theory";

export function AdminTheoryStats({
  stats,
}: {
  stats: AdminTheoryStatsView;
}) {
  const cards = [
    {
      label: "Programme",
      value: stats.programs,
      hint: `${stats.currentPrograms} aktuell`,
      icon: Layers3,
    },
    {
      label: "Aktive Themen",
      value: stats.activeTopics,
      hint: `${stats.lessons} Lektionen`,
      icon: BookOpen,
    },
    {
      label: "Fragen online",
      value: stats.publishedQuestions,
      hint: `${stats.questions} gesamt`,
      icon: CircleHelp,
    },
    {
      label: "Offene Meldungen",
      value: stats.openReports,
      hint: "Qualitätsprüfung",
      icon: FileWarning,
    },
    {
      label: "Kandidaten",
      value: stats.candidates,
      hint: "aktive Klassen",
      icon: GraduationCap,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className="rounded-[18px] border border-[#E1E8F2] bg-white p-4 shadow-[0_10px_28px_rgba(15,35,65,0.04)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#708096]">
                  {card.label}
                </p>
                <p className="mt-1 text-[24px] font-black tracking-[-0.04em] text-[#071426]">
                  {card.value}
                </p>
                <p className="mt-1 text-[9px] font-semibold text-[#91A0B2]">
                  {card.hint}
                </p>
              </div>

              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1F6FF] text-[#0B63F6]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
