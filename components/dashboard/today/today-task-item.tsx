/**
 * Express-Führerschein
 * One "Heute für dich" task.
 */

import Link from "next/link";

import {
  ClientNavigationIcon,
} from "@/components/client-shell/shared/client-navigation-icon";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardTodayTask,
} from "@/types/dashboard";

export interface TodayTaskItemProps {
  task:
    DashboardTodayTask;

  compact?:
    boolean;
}

export function TodayTaskItem({
  task,
  compact =
    false,
}: TodayTaskItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-[#E8EDF3] bg-white",
        compact ? "p-2.5" : "p-3",
      )}
    >
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF5FF] text-[#0878FF]">
        <ClientNavigationIcon
          name={task.icon}
          className="h-[18px] w-[18px]"
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[11px] font-extrabold text-[#152033]">
            {task.title}
          </p>

          {task.meta ? (
            <span className="ml-auto hidden shrink-0 text-[9px] font-medium text-[#7B8899] sm:inline">
              {task.meta}
            </span>
          ) : null}
        </div>

        {!compact ? (
          <p className="mt-0.5 truncate text-[9px] text-[#6C7B8D]">
            {task.description}
          </p>
        ) : null}
      </div>

      <Link
        href={task.href}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg border border-[#0878FF] font-bold text-[#0878FF] outline-none transition hover:bg-[#EEF5FF] focus-visible:ring-2 focus-visible:ring-[#0878FF]",
          compact
            ? "h-8 w-8"
            : "h-9 min-w-[96px] px-3 text-[10px]",
        )}
        aria-label={`${task.actionLabel}: ${task.title}`}
      >
        {compact ? (
          <svg
            viewBox="0 0 20 20"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m7 4 6 6-6 6" />
          </svg>
        ) : (
          task.actionLabel
        )}
      </Link>
    </div>
  );
}
