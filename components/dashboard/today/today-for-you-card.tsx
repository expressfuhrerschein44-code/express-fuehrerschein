/**
 * Express-Führerschein
 * "Heute für dich" dashboard card.
 */

import {
  DashboardCard,
} from "@/components/dashboard/shared/dashboard-card";

import {
  TodayTaskItem,
} from "@/components/dashboard/today/today-task-item";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardTodayTask,
} from "@/types/dashboard";

export interface TodayForYouCardProps {
  tasks:
    readonly DashboardTodayTask[];

  compact?:
    boolean;

  className?:
    string;
}

export function TodayForYouCard({
  tasks,
  compact =
    false,
  className,
}: TodayForYouCardProps) {
  return (
    <DashboardCard
      className={cn(
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className="text-[20px]"
        >
          🔥
        </span>

        <h2 className="text-[15px] font-extrabold text-[#111C2B]">
          Heute für dich
        </h2>
      </div>

      {tasks.length > 0 ? (
        <div className="mt-4 space-y-2">
          {tasks.map(
            (
              task,
            ) => (
              <TodayTaskItem
                key={task.id}
                task={task}
                compact={compact}
              />
            ),
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-[#F7F9FC] px-4 py-5 text-center text-[11px] leading-5 text-[#6C7B8D]">
          Sobald dein Lernprogramm aktiv ist, erscheinen hier deine nächsten Aufgaben.
        </p>
      )}
    </DashboardCard>
  );
}
