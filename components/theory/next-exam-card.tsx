"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";

import type {
  TheoryNextExamRecommendation,
} from "@/types/theory";

export interface NextExamCardProps {
  recommendation?: TheoryNextExamRecommendation | null;
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function NextExamCard({
  recommendation = null,
}: NextExamCardProps) {
  return (
    <article className="h-full rounded-[16px] border border-[#E5EAF2] bg-white p-4 shadow-[0_8px_24px_rgba(17,40,70,0.04)] lg:p-5">
      <h2 className="text-[13px] font-extrabold text-[#081529]">
        Nächste Prüfungssimulation
      </h2>

      <div className="mt-4 flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B63F6]">
          <CalendarDays className="h-5 w-5" />
        </span>

        <div className="min-w-0">
          {recommendation?.recommendedAt ? (
            <>
              <p className="text-[9px] font-semibold text-[#66758A]">
                {recommendation.label}
              </p>
              <p className="mt-1 text-[11px] font-extrabold text-[#081529]">
                {formatDate(recommendation.recommendedAt)}
              </p>
            </>
          ) : (
            <p className="text-[10px] leading-4 text-[#66758A]">
              Du kannst jederzeit eine neue Simulation starten.
            </p>
          )}
        </div>
      </div>

      <Link
        href={recommendation?.href ?? "/theorie/pruefungssimulation"}
        className="mt-4 inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-[#DCE4EF] px-3 text-[10px] font-extrabold text-[#0B63F6] transition hover:bg-[#F7FAFF]"
      >
        Simulation starten
      </Link>
    </article>
  );
}
