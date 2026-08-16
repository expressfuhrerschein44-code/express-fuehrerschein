/**
 * Express-Führerschein
 * Exam simulations statistics.
 */

import {
  DashboardCard,
} from "@/components/dashboard/shared/dashboard-card";

import {
  DashboardStatValue,
} from "@/components/dashboard/shared/dashboard-stat-value";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardExamStats,
} from "@/types/dashboard";

export interface ExamSimulationsCardProps {
  data:
    DashboardExamStats;

  compact?:
    boolean;

  dark?:
    boolean;

  className?:
    string;
}

export function ExamSimulationsCard({
  data,
  compact =
    false,
  dark =
    false,
  className,
}: ExamSimulationsCardProps) {
  return (
    <DashboardCard
      dark={dark}
      className={cn(
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <p
        className={cn(
          "font-bold",
          compact ? "text-[11px]" : "text-[12px]",
          dark ? "text-[#DCE6F0]" : "text-[#172233]",
        )}
      >
        Prüfungssimulationen
      </p>

      <div className="mt-3">
        <DashboardStatValue
          value={data.completed}
          className={cn(
            "[&>span:first-child]:text-[#0878FF]",
            compact &&
              "[&>span:first-child]:text-[30px]",
          )}
        />
      </div>

      <p
        className={cn(
          "mt-1 text-[10px]",
          dark ? "text-[#AAB9CB]" : "text-[#68788B]",
        )}
      >
        Abgeschlossen
      </p>

      <div
        className={cn(
          "mt-4 flex items-center gap-2 border-t pt-3",
          dark ? "border-white/[0.08]" : "border-[#EEF1F4]",
        )}
      >
        <span className="text-[12px] font-extrabold text-[#00A86B]">
          {data.passed}
        </span>

        <span
          className={cn(
            "text-[10px]",
            dark ? "text-[#A9B9CB]" : "text-[#6C7B8D]",
          )}
        >
          bestanden
        </span>

        {data.completed > 0 ? (
          <span
            className={cn(
              "ml-auto text-[10px]",
              dark ? "text-[#8FA1B5]" : "text-[#79889A]",
            )}
          >
            {data.passRatePercent}%
          </span>
        ) : null}
      </div>
    </DashboardCard>
  );
}
