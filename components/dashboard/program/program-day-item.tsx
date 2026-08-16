/**
 * Express-Führerschein
 * One day in the 21-day learning program.
 */

import {
  TodayProgramLabel,
} from "@/components/dashboard/program/today-program-label";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardProgramDay,
} from "@/types/dashboard";

export interface ProgramDayItemProps {
  day:
    DashboardProgramDay;

  compact?:
    boolean;
}

export function ProgramDayItem({
  day,
  compact =
    false,
}: ProgramDayItemProps) {
  const completed =
    day.status ===
      "completed";

  const skipped =
    day.status ===
      "skipped";

  const current =
    day.isCurrent;

  return (
    <div className="flex min-w-0 flex-col items-center">
      <div
        aria-label={`Tag ${day.dayNumber}${
          current
            ? ", heute"
            : completed
              ? ", abgeschlossen"
              : skipped
                ? ", übersprungen"
                : ""
        }`}
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center rounded-full border font-bold transition",
          compact
            ? "h-9 w-9 text-[10px]"
            : "h-10 w-10 text-[11px]",
          current &&
            "border-[#0878FF] bg-[#0878FF] text-white shadow-[0_8px_20px_rgba(8,120,255,0.22)]",
          completed &&
            !current &&
            "border-[#DDE5EC] bg-white text-[#172233]",
          !current &&
            !completed &&
            !skipped &&
            "border-[#E1E6EC] bg-white text-[#4C5C70]",
          skipped &&
            "border-[#E3E7EC] bg-[#F8FAFC] text-[#93A0AF]",
        )}
      >
        <span>
          {day.dayNumber}
        </span>

        {completed &&
        !current ? (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#00A86B]"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 8 3 3 7-7" />
            </svg>
          </span>
        ) : null}
      </div>

      {current ? (
        <TodayProgramLabel />
      ) : (
        <span
          aria-hidden="true"
          className="mt-1 h-[11px]"
        />
      )}
    </div>
  );
}
