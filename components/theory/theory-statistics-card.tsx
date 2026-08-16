"use client";

import {
  CheckCircle2,
  Clock3,
  LibraryBig,
} from "lucide-react";

import type {
  TheoryStatisticsView,
} from "@/types/theory";

export interface TheoryStatisticsCardProps {
  statistics: TheoryStatisticsView;
}

function formatMinutes(
  totalMinutes: number,
): string {
  const safe = Math.max(0, totalMinutes);
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;

  if (hours === 0) {
    return `${minutes} Min`;
  }

  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function TheoryStatisticsCard({
  statistics,
}: TheoryStatisticsCardProps) {
  const rows = [
    {
      id: "learned",
      icon: LibraryBig,
      label: "Gelernt",
      value: `${statistics.uniqueQuestionsLearned} / ${statistics.activeQuestions} Fragen`,
    },
    {
      id: "correct",
      icon: CheckCircle2,
      label: "Richtig beantwortet",
      value: `${statistics.correctAttempts} Antworten`,
    },
    {
      id: "time",
      icon: Clock3,
      label: "Lernzeit",
      value: formatMinutes(statistics.totalStudyMinutes),
    },
  ];

  return (
    <article className="h-full rounded-[16px] border border-[#E5EAF2] bg-white p-4 shadow-[0_8px_24px_rgba(17,40,70,0.04)] lg:p-5">
      <h2 className="text-[13px] font-extrabold text-[#081529]">
        Lernstatistik
      </h2>

      <div className="mt-3 space-y-1.5">
        {rows.map((row) => {
          const Icon = row.icon;

          return (
            <div
              key={row.id}
              className="flex items-center justify-between gap-3 rounded-lg px-1 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#F2F6FC] text-[#4E6380]">
                  <Icon className="h-3.5 w-3.5" />
                </span>

                <span className="truncate text-[10px] font-medium text-[#5F6F84]">
                  {row.label}
                </span>
              </div>

              <span className="shrink-0 text-right text-[10px] font-extrabold text-[#081529]">
                {row.value}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
