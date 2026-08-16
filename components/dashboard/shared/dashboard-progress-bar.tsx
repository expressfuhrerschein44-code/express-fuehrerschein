/**
 * Express-Führerschein
 * Shared progress bar.
 */

import {
  cn,
} from "@/lib/utils";

export interface DashboardProgressBarProps {
  value:
    number;

  className?:
    string;

  trackClassName?:
    string;

  barClassName?:
    string;

  ariaLabel?:
    string;
}

function clampPercent(
  value:
    number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        value,
      ),
    ),
  );
}

export function DashboardProgressBar({
  value,
  className,
  trackClassName,
  barClassName,
  ariaLabel =
    "Fortschritt",
}: DashboardProgressBarProps) {
  const safeValue =
    clampPercent(
      value,
    );

  return (
    <div
      className={cn(
        "h-2.5 overflow-hidden rounded-full bg-[#E7EBF1]",
        trackClassName,
        className,
      )}
      role="progressbar"
      aria-label={
        ariaLabel
      }
      aria-valuemin={
        0
      }
      aria-valuemax={
        100
      }
      aria-valuenow={
        safeValue
      }
    >
      <div
        className={cn(
          "h-full rounded-full bg-[#0878FF] transition-[width] duration-300",
          barClassName,
        )}
        style={{
          width:
            `${safeValue}%`,
        }}
      />
    </div>
  );
}
