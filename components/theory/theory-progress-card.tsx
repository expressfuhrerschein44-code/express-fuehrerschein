"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type {
  TheoryProgressView,
} from "@/types/theory";

export interface TheoryProgressCardProps {
  progress: TheoryProgressView;
  compact?: boolean;
}

function progressMessage(
  percent: number,
): string {
  if (percent >= 90) {
    return "Nur noch wenige Themen fehlen.";
  }

  if (percent >= 60) {
    return "Du bist auf dem besten Weg.";
  }

  if (percent > 0) {
    return "Weiter so!";
  }

  return "Deine Lernreise beginnt hier.";
}

export function TheoryProgressCard({
  progress,
  compact = false,
}: TheoryProgressCardProps) {
  const percent = Math.max(
    0,
    Math.min(100, progress.overallPercent),
  );

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (percent / 100) * circumference;

  return (
    <article className="h-full rounded-[16px] border border-[#E5EAF2] bg-white p-4 shadow-[0_8px_24px_rgba(17,40,70,0.04)] lg:p-5">
      <h2 className="text-[13px] font-extrabold text-[#081529]">
        Dein Lernfortschritt
      </h2>

      <div className={`mt-4 flex ${compact ? "items-center" : "items-center"} gap-4`}>
        <div className="relative shrink-0">
          <svg
            className="h-[88px] w-[88px] -rotate-90"
            viewBox="0 0 80 80"
            role="img"
            aria-label={`${percent} Prozent Lernfortschritt`}
          >
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#E8EDF5"
              strokeWidth="7"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#0B63F6"
              strokeLinecap="round"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>

          <span className="absolute inset-0 flex items-center justify-center text-[20px] font-extrabold text-[#081529]">
            {percent}%
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-extrabold text-[#10A36A]">
            {percent > 0 ? "Gut gemacht!" : "Los geht's!"}
          </p>

          <p className="mt-1 text-[10px] leading-4 text-[#66758A]">
            {progressMessage(percent)}
          </p>
        </div>
      </div>

      <Link
        href="/fortschritt"
        className="mt-4 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-[#DCE4EF] px-3 text-[10px] font-extrabold text-[#0B63F6] transition hover:border-[#BFD4F7] hover:bg-[#F7FAFF]"
      >
        Fortschritt ansehen
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}
