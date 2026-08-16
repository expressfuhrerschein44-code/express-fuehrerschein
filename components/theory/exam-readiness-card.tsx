"use client";

import Link from "next/link";

import type {
  TheoryReadinessView,
} from "@/types/theory";

export interface ExamReadinessCardProps {
  readiness: TheoryReadinessView;
}

function readinessCopy(
  label: TheoryReadinessView["label"],
): string {
  switch (label) {
    case "sehr_gut":
      return "Sehr gut!";
    case "fast_bereit":
      return "Fast bereit";
    default:
      return "Weiter üben";
  }
}

export function ExamReadinessCard({
  readiness,
}: ExamReadinessCardProps) {
  const percent = Math.max(
    0,
    Math.min(100, readiness.readinessPercent),
  );

  return (
    <article className="h-full rounded-[16px] border border-[#E5EAF2] bg-white p-4 shadow-[0_8px_24px_rgba(17,40,70,0.04)] lg:p-5">
      <h2 className="text-[13px] font-extrabold text-[#081529]">
        Prüfungsbereitschaft
      </h2>

      <div className="mt-4 flex flex-col items-center">
        <div
          className="relative h-[82px] w-[150px] overflow-hidden"
          aria-label={`${percent} Prozent Prüfungsbereitschaft`}
          role="img"
        >
          <div className="absolute left-1/2 top-0 h-[142px] w-[142px] -translate-x-1/2 rounded-full border-[12px] border-[#E8EDF5]" />

          <div
            className="absolute left-1/2 top-0 h-[142px] w-[142px] -translate-x-1/2 rounded-full border-[12px] border-transparent border-t-[#10A36A] border-r-[#10A36A]"
            style={{
              transform: `translateX(-50%) rotate(${Math.max(-45, Math.min(45, (percent - 50) * 0.9))}deg)`,
            }}
          />

          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[20px] font-extrabold text-[#081529]">
            {percent}%
          </span>
        </div>

        <p className="mt-1 text-[11px] font-extrabold text-[#10A36A]">
          {readinessCopy(readiness.label)}
        </p>

        <p className="mt-1 text-center text-[9px] leading-4 text-[#66758A]">
          Pädagogische Einschätzung deiner aktuellen Vorbereitung.
        </p>
      </div>

      <Link
        href="/fortschritt"
        className="mt-4 inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-[#DCE4EF] px-3 text-[10px] font-extrabold text-[#0B63F6] transition hover:bg-[#F7FAFF]"
      >
        Details ansehen
      </Link>
    </article>
  );
}
