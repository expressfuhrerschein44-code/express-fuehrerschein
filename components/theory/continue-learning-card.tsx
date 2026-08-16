"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";

import type {
  TheoryContinueLearningView,
} from "@/types/theory";

export interface ContinueLearningCardProps {
  item: TheoryContinueLearningView | null;
}

export function ContinueLearningCard({
  item,
}: ContinueLearningCardProps) {
  if (!item) {
    return (
      <article className="h-full rounded-[16px] border border-[#E5EAF2] bg-white p-4 lg:p-5">
        <h2 className="text-[13px] font-extrabold text-[#081529]">
          Weiterlernen
        </h2>

        <div className="mt-4 rounded-xl bg-[#F7F9FC] px-4 py-6 text-center">
          <p className="text-[10px] font-semibold text-[#66758A]">
            Noch keine Lernposition gespeichert.
          </p>

          <Link
            href="/theorie"
            className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold text-[#0B63F6]"
          >
            Erstes Thema starten
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </article>
    );
  }

  const percent = Math.max(0, Math.min(100, item.progressPercent));

  return (
    <article className="h-full rounded-[16px] border border-[#E5EAF2] bg-white p-4 lg:p-5">
      <h2 className="text-[13px] font-extrabold text-[#081529]">
        Weiterlernen
      </h2>

      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B63F6]">
          <BookOpenCheck className="h-6 w-6" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#7A899C]">
            Zuletzt gelernt
          </p>

          <p className="mt-1 line-clamp-1 text-[11px] font-extrabold text-[#081529]">
            {item.title}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-[8px] text-[#718094]">
          <span>Fortschritt</span>
          <span className="font-extrabold text-[#081529]">
            {percent}%
          </span>
        </div>

        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#E9EEF5]">
          <div
            className="h-full rounded-full bg-[#0B63F6]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <Link
        href={item.href}
        className="mt-4 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-3 text-[10px] font-extrabold text-white transition hover:bg-[#0958DC]"
      >
        Weiterlernen
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </article>
  );
}
