/**
 * Express-Führerschein
 * Overall answer-performance card.
 */

import {
  DashboardCard,
} from "@/components/dashboard/shared/dashboard-card";

import {
  PerformanceDonut,
} from "@/components/dashboard/performance/performance-donut";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardAnswerStats,
} from "@/types/dashboard";

export interface PerformanceOverviewCardProps {
  data:
    DashboardAnswerStats;

  compact?:
    boolean;

  className?:
    string;
}

function PerformanceLegend({
  label,
  value,
  dotClassName,
}: {
  label:
    string;

  value:
    number;

  dotClassName:
    string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          dotClassName,
        )}
      />

      <span className="min-w-0 flex-1 text-[10px] text-[#65758A]">
        {label}
      </span>

      <span className="text-[10px] font-extrabold text-[#172233]">
        {value}
      </span>
    </div>
  );
}

export function PerformanceOverviewCard({
  data,
  compact =
    false,
  className,
}: PerformanceOverviewCardProps) {
  return (
    <DashboardCard
      className={cn(
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[14px] font-extrabold text-[#111C2B]">
          Deine Leistung
        </h2>

        <span className="text-[12px] font-black text-[#0878FF]">
          {data.accuracyPercent}%
        </span>
      </div>

      <div
        className={cn(
          "mt-4 flex items-center",
          compact
            ? "gap-4"
            : "gap-5",
        )}
      >
        <PerformanceDonut
          correct={data.correct}
          incorrect={data.incorrect}
          open={data.open}
          compact={compact}
        />

        <div className="min-w-0 flex-1 space-y-3">
          <PerformanceLegend
            label="Richtig"
            value={data.correct}
            dotClassName="bg-[#00A86B]"
          />

          <PerformanceLegend
            label="Falsch"
            value={data.incorrect}
            dotClassName="bg-[#F04444]"
          />

          <PerformanceLegend
            label="Offen"
            value={data.open}
            dotClassName="bg-[#D9E0E8]"
          />

          {data.questionsToReview > 0 ? (
            <div className="border-t border-[#EEF1F4] pt-3 text-[9px] text-[#6D7C8F]">
              <strong className="text-[#F04444]">
                {data.questionsToReview}
              </strong>{" "}
              {data.questionsToReview === 1
                ? "Frage"
                : "Fragen"}{" "}
              zur Wiederholung
            </div>
          ) : null}
        </div>
      </div>
    </DashboardCard>
  );
}
