import {
  Check,
} from "lucide-react";

import type {
  ProgressDayView,
} from "@/types/progress";

export interface Progress21DayCardProps {
  currentDay:
    number;
  completedDays:
    number;
  totalDays:
    number;
  days:
    readonly ProgressDayView[];
}

function dayClassName(
  day:
    ProgressDayView,
): string {
  switch (
    day.status
  ) {
    case "completed":
      return "border-[#BFE8D7] bg-[#F1FBF6] text-[#0C8B59]";

    case "in_progress":
      return "border-[#0B63F6] bg-[#0B63F6] text-white shadow-[0_5px_14px_rgba(11,99,246,0.18)]";

    case "available":
      return "border-[#CFE0FF] bg-[#F2F7FF] text-[#0B63F6]";

    case "locked":
    default:
      return "border-[#E3E9F1] bg-[#F8FAFD] text-[#97A3B3]";
  }
}

export function Progress21DayCard({
  currentDay,
  completedDays,
  totalDays,
  days,
}: Progress21DayCardProps) {
  const percent =
    totalDays > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (
                completedDays /
                totalDays
              ) *
                100,
            ),
          ),
        )
      : 0;

  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
            21-Tage-Programm
          </p>

          <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
            Tag {currentDay} von {totalDays}
          </h2>

          <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
            {completedDays} von {totalDays} Lerntagen abgeschlossen.
          </p>
        </div>

        <span className="rounded-full bg-[#EFF5FF] px-3 py-1.5 text-[10px] font-extrabold text-[#0B63F6]">
          {percent} %
        </span>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-[#E9EEF5]"
        role="progressbar"
        aria-label="Fortschritt im 21-Tage-Programm"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className="h-full rounded-full bg-[#0B63F6] transition-[width] duration-300"
          style={{
            width:
              `${percent}%`,
          }}
        />
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {days.map(
          (
            day,
          ) => (
            <div
              key={
                day.dayNumber
              }
              title={`Tag ${day.dayNumber}`}
              className={`flex aspect-square min-h-8 items-center justify-center rounded-lg border text-[8px] font-extrabold ${dayClassName(day)}`}
            >
              {day.status ===
              "completed" ? (
                <Check
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
              ) : (
                day.dayNumber
              )}
            </div>
          ),
        )}
      </div>
    </section>
  );
}
