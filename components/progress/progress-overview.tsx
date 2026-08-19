import {
  CalendarDays,
  Clock3,
  FileQuestion,
  Gauge,
  TrendingUp,
} from "lucide-react";

import type {
  ProgressOverviewView,
} from "@/types/progress";

export interface ProgressOverviewProps {
  overview:
    ProgressOverviewView;
}

export function ProgressOverview({
  overview,
}: ProgressOverviewProps) {
  const items = [
    {
      id:
        "progress",
      label:
        "Gesamtfortschritt",
      value:
        `${overview.overallProgressPercent} %`,
      icon:
        TrendingUp,
    },
    {
      id:
        "day",
      label:
        "Aktueller Tag",
      value:
        `${overview.currentDay} / ${overview.totalDays}`,
      icon:
        CalendarDays,
    },
    {
      id:
        "study",
      label:
        "Lernzeit",
      value:
        `${overview.totalStudyMinutes} Min`,
      icon:
        Clock3,
    },
    {
      id:
        "questions",
      label:
        "Fragen bearbeitet",
      value:
        String(
          overview.answeredQuestions,
        ),
      icon:
        FileQuestion,
    },
    {
      id:
        "readiness",
      label:
        "Prüfungsreife",
      value:
        `${overview.readinessScore} %`,
      icon:
        Gauge,
    },
  ] as const;

  return (
    <section
      aria-label="Fortschrittsübersicht"
      className="grid grid-cols-2 gap-3 lg:grid-cols-5"
    >
      {items.map(
        (
          item,
        ) => {
          const Icon =
            item.icon;

          return (
            <article
              key={
                item.id
              }
              className="rounded-[18px] border border-[#E5EAF2] bg-white p-4 shadow-[0_8px_24px_rgba(17,40,70,0.035)] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-[#758499]">
                    {item.label}
                  </p>

                  <p className="mt-2 truncate text-[18px] font-black tracking-[-0.03em] text-[#081529] sm:text-[21px]">
                    {item.value}
                  </p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
                  <Icon
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </article>
          );
        },
      )}
    </section>
  );
}