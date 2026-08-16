/**
 * Express-Führerschein
 * Exam readiness card.
 */

import {
  DashboardCard,
} from "@/components/dashboard/shared/dashboard-card";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardReadiness,
} from "@/types/dashboard";

export interface ExamReadinessCardProps {
  data:
    DashboardReadiness;

  compact?:
    boolean;

  dark?:
    boolean;

  className?:
    string;
}

function ReadinessRing({
  value,
  dark,
  compact,
}: {
  value:
    number;

  dark:
    boolean;

  compact:
    boolean;
}) {
  const radius = 31;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (safeValue / 100) * circumference;
  const size = compact ? 82 : 94;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        viewBox="0 0 76 76"
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          stroke={
            dark
              ? "rgba(255,255,255,0.14)"
              : "#E7EBF1"
          }
          strokeWidth="8"
        />

        <circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          stroke="#00A86B"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn(
            "font-black tracking-[-0.03em]",
            compact
              ? "text-[20px]"
              : "text-[22px]",
            dark
              ? "text-white"
              : "text-[#0F1B31]",
          )}
        >
          {Math.round(safeValue)}%
        </span>
      </div>
    </div>
  );
}

export function ExamReadinessCard({
  data,
  compact =
    false,
  dark =
    false,
  className,
}: ExamReadinessCardProps) {
  return (
    <DashboardCard
      dark={dark}
      className={cn(
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "font-bold",
            compact ? "text-[11px]" : "text-[12px]",
            dark ? "text-[#DCE6F0]" : "text-[#172233]",
          )}
        >
          Prüfungsbereitschaft
        </p>

        <span
          title="Die Bereitschaft wird aus deinem realen Lernfortschritt berechnet."
          className={cn(
            "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[9px] font-bold",
            dark
              ? "border-white/35 text-white/80"
              : "border-[#8291A3] text-[#66778B]",
          )}
        >
          i
        </span>
      </div>

      <div
        className={cn(
          "mt-3 flex items-center",
          compact ? "gap-3" : "gap-4",
        )}
      >
        <ReadinessRing
          value={data.percent}
          dark={dark}
          compact={compact}
        />

        <div className="min-w-0">
          <p
            className={cn(
              "font-extrabold text-[#00A86B]",
              compact ? "text-[13px]" : "text-[14px]",
            )}
          >
            {data.label}
          </p>

          {!compact ? (
            <p
              className={cn(
                "mt-1 text-[10px]",
                dark ? "text-[#A9B9CB]" : "text-[#6C7B8D]",
              )}
            >
              Basierend auf deinem aktuellen Lernstand
            </p>
          ) : null}
        </div>
      </div>
    </DashboardCard>
  );
}
