"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

export interface ErrorTrainingCtaProps {
  count: number;
  topicId?: string | null;
}

export function ErrorTrainingCta({ count, topicId = null }: ErrorTrainingCtaProps) {
  if (count <= 0) return null;

  const href = topicId
    ? `/theorie/uebungen?mode=errors&topic=${encodeURIComponent(topicId)}`
    : "/theorie/uebungen?mode=errors";

  return (
    <section className="flex flex-col gap-4 rounded-[16px] border border-[#DCE7F8] bg-[#F8FBFF] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0B63F6]">
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-[11px] font-extrabold text-[#081529]">Fehler gezielt trainieren</h2>
          <p className="mt-1 text-[9px] leading-4 text-[#66758A]">
            {count} {count === 1 ? "Frage ist" : "Fragen sind"} aktuell zur Wiederholung markiert.
          </p>
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-4 text-[9px] font-extrabold text-white"
      >
        Fehler trainieren
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </section>
  );
}
