/**
 * Express-Führerschein
 * Overall learning progress card.
 */

import {
  DashboardCard,
} from "@/components/dashboard/shared/dashboard-card";

import {
  DashboardProgressBar,
} from "@/components/dashboard/shared/dashboard-progress-bar";

import {
  DashboardStatValue,
} from "@/components/dashboard/shared/dashboard-stat-value";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardProgressOverview,
} from "@/types/dashboard";

export interface OverallProgressCardProps {
  data:
    DashboardProgressOverview;

  compact?:
    boolean;

  dark?:
    boolean;

  className?:
    string;
}

export function OverallProgressCard({
  data,
  compact =
    false,
  dark =
    false,
  className,
}: OverallProgressCardProps) {
  return (
    <DashboardCard
      dark={
        dark
      }
      className={cn(
        compact
          ? "p-4"
          : "p-5",
        className,
      )}
    >
      <p
        className={cn(
          "font-bold",
          compact
            ? "text-[11px]"
            : "text-[12px]",
          dark
            ? "text-[#DCE6F0]"
            : "text-[#172233]",
        )}
      >
        Dein Fortschritt
      </p>

      <div className="mt-3">
        <DashboardStatValue
          value={
            data.overallProgressPercent
          }
          suffix="%"
          className={
            dark
              ? "[&>span:first-child]:text-white"
              : undefined
          }
          suffixClassName={
            dark
              ? "text-white"
              : undefined
          }
        />
      </div>

      <DashboardProgressBar
        value={
          data.overallProgressPercent
        }
        className={cn(
          "mt-4",
          compact
            ? "h-2"
            : "h-2.5",
        )}
        trackClassName={
          dark
            ? "bg-white/[0.10]"
            : undefined
        }
      />

      <div
        className={cn(
          "mt-3 flex items-center justify-between text-[10px]",
          dark
            ? "text-[#AFBDD0]"
            : "text-[#58697E]",
        )}
      >
        <span>
          Tag {data.currentDay} von {data.totalDays}
        </span>

        <span>
          Noch {data.remainingDays}{" "}
          {data.remainingDays === 1 ? "Tag" : "Tage"}
        </span>
      </div>
    </DashboardCard>
  );
}
