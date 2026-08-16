/**
 * Express-Führerschein
 * Correct answers / accuracy card.
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
  DashboardAnswerStats,
} from "@/types/dashboard";

export interface CorrectAnswersCardProps {
  data:
    DashboardAnswerStats;

  compact?:
    boolean;

  dark?:
    boolean;

  className?:
    string;
}

function formatNumber(
  value:
    number,
): string {
  return new Intl.NumberFormat(
    "de-DE",
  ).format(
    Math.max(0, value),
  );
}

export function CorrectAnswersCard({
  data,
  compact =
    false,
  dark =
    false,
  className,
}: CorrectAnswersCardProps) {
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
        Richtige Antworten
      </p>

      <div className="mt-3">
        <DashboardStatValue
          value={formatNumber(data.correct)}
          positive
          className={
            compact
              ? "[&>span:first-child]:text-[30px]"
              : undefined
          }
        />
      </div>

      <p
        className={cn(
          "mt-1 text-[10px]",
          dark ? "text-[#AAB9CB]" : "text-[#68788B]",
        )}
      >
        Gesamt beantwortet:{" "}
        <strong
          className={
            dark ? "text-white" : "text-[#263548]"
          }
        >
          {formatNumber(data.totalAnswered)}
        </strong>
      </p>

      <div
        className={cn(
          "mt-4 flex items-center gap-2 border-t pt-3",
          dark ? "border-white/[0.08]" : "border-[#EEF1F4]",
        )}
      >
        <span
          className={cn(
            "font-extrabold",
            compact ? "text-[13px]" : "text-[14px]",
            dark ? "text-white" : "text-[#172233]",
          )}
        >
          {data.accuracyPercent}%
        </span>

        <span
          className={cn(
            "text-[10px]",
            dark ? "text-[#A9B9CB]" : "text-[#6C7B8D]",
          )}
        >
          Durchschnitt
        </span>
      </div>
    </DashboardCard>
  );
}
