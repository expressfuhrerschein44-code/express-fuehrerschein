/**
 * Express-Führerschein
 * 21-day program card.
 */

import {
  DashboardCard,
} from "@/components/dashboard/shared/dashboard-card";

import {
  DashboardSectionHeader,
} from "@/components/dashboard/shared/dashboard-section-header";

import {
  ProgramDayItem,
} from "@/components/dashboard/program/program-day-item";

import {
  CLIENT_ROUTES,
} from "@/data/client-navigation";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardProgram,
} from "@/types/dashboard";

export interface TwentyOneDayProgramProps {
  data:
    DashboardProgram;

  compact?:
    boolean;

  className?:
    string;
}

export function TwentyOneDayProgram({
  data,
  compact =
    false,
  className,
}: TwentyOneDayProgramProps) {
  return (
    <DashboardCard
      className={cn(
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <DashboardSectionHeader
        title="Dein 21-Tage-Programm"
        actionLabel="Programm ansehen"
        actionHref={
          CLIENT_ROUTES.progress
        }
      />

      <div
        className={cn(
          "mt-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          compact && "-mx-1 px-1",
        )}
      >
        <div
          className={cn(
            "flex min-w-max items-start",
            compact ? "gap-2.5" : "gap-3",
          )}
        >
          {data.days.map(
            (
              day,
            ) => (
              <ProgramDayItem
                key={day.dayNumber}
                day={day}
                compact={compact}
              />
            ),
          )}
        </div>
      </div>
    </DashboardCard>
  );
}
