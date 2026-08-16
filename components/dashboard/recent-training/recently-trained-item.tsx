/**
 * Express-Führerschein
 * One recent training record.
 */

import {
  DashboardProgressBar,
} from "@/components/dashboard/shared/dashboard-progress-bar";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardRecentTraining,
} from "@/types/dashboard";

export interface RecentlyTrainedItemProps {
  item:
    DashboardRecentTraining;

  compact?:
    boolean;
}

function formatDate(
  value:
    string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day:
        "2-digit",

      month:
        "2-digit",
    },
  ).format(
    date,
  );
}

export function RecentlyTrainedItem({
  item,
  compact =
    false,
}: RecentlyTrainedItemProps) {
  const score =
    item.scorePercent ??
    (
      item.questionsAnswered >
      0
        ? Math.round(
            (
              item.correctAnswers /
              item.questionsAnswered
            ) *
              100,
          )
        : 0
    );

  return (
    <div
      className={cn(
        "rounded-xl border border-[#E8EDF3] bg-white",
        compact
          ? "p-3"
          : "p-3.5",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-extrabold text-[#192438]">
            {item.topicTitle}
          </p>

          <p className="mt-1 text-[9px] text-[#7A899B]">
            {formatDate(item.startedAt)}
            {item.questionsAnswered > 0
              ? ` · ${item.questionsAnswered} Fragen`
              : ""}
          </p>
        </div>

        <span className="shrink-0 text-[12px] font-black text-[#0878FF]">
          {score}%
        </span>
      </div>

      <DashboardProgressBar
        value={score}
        className="mt-3 h-1.5"
        ariaLabel={`${item.topicTitle}: ${score}%`}
      />
    </div>
  );
}
