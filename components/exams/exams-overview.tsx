import {
  Award,
  CheckCircle2,
  Gauge,
  History,
} from "lucide-react";

import type {
  ExamsOverviewView,
} from "@/types/exams";

export interface ExamsOverviewProps {
  overview:
    ExamsOverviewView;
}

export function ExamsOverview({
  overview,
}: ExamsOverviewProps) {
  const items = [
    {
      id:
        "attempts",
      label:
        "Versuche",
      value:
        String(
          overview
            .completedAttempts,
        ),
      icon:
        History,
    },
    {
      id:
        "passed",
      label:
        "Bestanden",
      value:
        String(
          overview
            .passedAttempts,
        ),
      icon:
        CheckCircle2,
    },
    {
      id:
        "average",
      label:
        "Ø Ergebnis",
      value:
        overview
          .averageScorePercent ===
        null
          ? "—"
          : `${overview.averageScorePercent} %`,
      icon:
        Award,
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
      aria-label="Prüfungsübersicht"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
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

                  <p className="mt-2 truncate text-[19px] font-black tracking-[-0.03em] text-[#081529] sm:text-[22px]">
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
