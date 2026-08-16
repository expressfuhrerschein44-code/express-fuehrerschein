/**
 * Express-Führerschein
 * Lightweight answer-performance donut.
 */

import type {
  CSSProperties,
} from "react";

import {
  cn,
} from "@/lib/utils";

export interface PerformanceDonutProps {
  correct:
    number;

  incorrect:
    number;

  open:
    number;

  compact?:
    boolean;

  className?:
    string;
}

function safeCount(
  value:
    number,
): number {
  return Math.max(
    0,
    Number.isFinite(
      value,
    )
      ? value
      : 0,
  );
}

export function PerformanceDonut({
  correct,
  incorrect,
  open,
  compact =
    false,
  className,
}: PerformanceDonutProps) {
  const safeCorrect =
    safeCount(
      correct,
    );

  const safeIncorrect =
    safeCount(
      incorrect,
    );

  const safeOpen =
    safeCount(
      open,
    );

  const total =
    safeCorrect +
    safeIncorrect +
    safeOpen;

  const correctPercent =
    total >
    0
      ? (
          safeCorrect /
          total
        ) *
        100
      : 0;

  const incorrectPercent =
    total >
    0
      ? (
          safeIncorrect /
          total
        ) *
        100
      : 0;

  const firstStop =
    correctPercent;

  const secondStop =
    correctPercent +
    incorrectPercent;

  const background =
    total >
    0
      ? `conic-gradient(#00A86B 0 ${firstStop}%, #F04444 ${firstStop}% ${secondStop}%, #D9E0E8 ${secondStop}% 100%)`
      : "conic-gradient(#E7EBF1 0 100%)";

  const style:
    CSSProperties = {
    background,
  };

  return (
    <div
      className={cn(
        "relative shrink-0 rounded-full",
        compact
          ? "h-[118px] w-[118px]"
          : "h-[142px] w-[142px]",
        className,
      )}
      style={style}
      role="img"
      aria-label={`Leistung: ${safeCorrect} richtig, ${safeIncorrect} falsch, ${safeOpen} offen`}
    >
      <div
        className={cn(
          "absolute rounded-full bg-white",
          compact
            ? "inset-[17px]"
            : "inset-[20px]",
        )}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-black leading-none text-[#101B2B]",
            compact
              ? "text-[22px]"
              : "text-[26px]",
          )}
        >
          {total}
        </span>

        <span className="mt-1 text-[9px] font-medium text-[#7A899A]">
          Gesamt
        </span>
      </div>
    </div>
  );
}
