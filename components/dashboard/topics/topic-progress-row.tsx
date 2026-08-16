/**
 * Express-Führerschein
 * One topic-progress row.
 */

import {
  DashboardProgressBar,
} from "@/components/dashboard/shared/dashboard-progress-bar";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardTopicProgress,
} from "@/types/dashboard";

export interface TopicProgressRowProps {
  topic:
    DashboardTopicProgress;

  compact?:
    boolean;
}

function colorClass(
  value:
    number,
): string {
  if (
    value >=
    80
  ) {
    return "bg-[#00A86B]";
  }

  if (
    value >=
    40
  ) {
    return "bg-[#F5A300]";
  }

  return "bg-[#F04444]";
}

export function TopicProgressRow({
  topic,
  compact =
    false,
}: TopicProgressRowProps) {
  return (
    <div
      className={cn(
        "grid items-center gap-3",
        compact
          ? "grid-cols-[100px_minmax(0,1fr)_34px]"
          : "grid-cols-[120px_minmax(0,1fr)_42px]",
      )}
    >
      <span
        className="truncate text-[10px] font-medium text-[#3C4B60]"
        title={topic.title}
      >
        {topic.title}
      </span>

      <DashboardProgressBar
        value={topic.progressPercent}
        className="h-2"
        barClassName={colorClass(
          topic.progressPercent,
        )}
        ariaLabel={`${topic.title}: ${topic.progressPercent}%`}
      />

      <span className="text-right text-[10px] font-extrabold text-[#172233]">
        {topic.progressPercent}%
      </span>
    </div>
  );
}
