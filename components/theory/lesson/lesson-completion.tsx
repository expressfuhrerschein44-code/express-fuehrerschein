"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

export interface LessonCompletionProps {
  topicSlug: string;
  lessonTitle: string;
  nextLesson?: { slug: string; title: string } | null;
  onReviewLesson?: () => void;
}

export function LessonCompletion({
  topicSlug,
  lessonTitle,
  nextLesson = null,
  onReviewLesson,
}: LessonCompletionProps) {
  const topicHref = `/theorie/${encodeURIComponent(topicSlug)}`;
  const nextHref = nextLesson
    ? `/theorie/${encodeURIComponent(topicSlug)}/${encodeURIComponent(nextLesson.slug)}`
    : null;

  return (
    <section className="rounded-[18px] border border-[#CBE9DB] bg-[#F5FCF8] p-5 text-center shadow-[0_8px_24px_rgba(16,163,106,0.04)] sm:p-7">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#10A36A] shadow-sm">
        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
      </span>

      <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.09em] text-[#0C8B59]">
        Lektion abgeschlossen
      </p>

      <h2 className="mx-auto mt-1.5 max-w-[620px] text-[20px] font-black leading-7 text-[#081529]">
        {lessonTitle}
      </h2>

      <p className="mx-auto mt-2 max-w-[560px] text-[11px] leading-5 text-[#5F6F84]">
        Dein Lernfortschritt wurde gespeichert. Du kannst direkt mit der nächsten Lektion fortfahren oder zum Themenbereich zurückkehren.
      </p>

      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        {nextHref && nextLesson ? (
          <Link
            href={nextHref}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white transition hover:bg-[#0959DC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFD7FF]"
          >
            Nächste Lektion
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : null}

        <Link
          href={topicHref}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#D7E1EC] bg-white px-4 text-[10px] font-extrabold text-[#53647A] transition hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFD7FF]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Zum Thema
        </Link>

        {onReviewLesson ? (
          <button
            type="button"
            onClick={onReviewLesson}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-4 text-[10px] font-extrabold text-[#53647A] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFD7FF]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Lektion wiederholen
          </button>
        ) : null}
      </div>
    </section>
  );
}
