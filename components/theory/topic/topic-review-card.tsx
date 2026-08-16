import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";

export interface TopicReviewCardProps {
  topicId: string;
  reviewQuestions: number;
  masteryScore: number;
}

export function TopicReviewCard({
  topicId,
  reviewQuestions,
  masteryScore,
}: TopicReviewCardProps) {
  const href = `/theorie/uebungen?mode=errors&topic=${encodeURIComponent(topicId)}`;

  if (reviewQuestions === 0) {
    return (
      <section className="rounded-[18px] border border-[#DCEFE6] bg-[#F7FCF9] p-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#10A36A] shadow-sm">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#10A36A]">
          Wiederholen
        </p>
        <h2 className="mt-1 text-[14px] font-extrabold text-[#081529]">
          Keine offenen Fehler
        </h2>
        <p className="mt-1 text-[9px] leading-4 text-[#66758A]">
          Aktuell ist keine veröffentlichte Frage dieses Themas als „zu wiederholen“ markiert.
        </p>
        <div className="mt-4 rounded-xl bg-white px-3 py-2.5 text-[9px] font-semibold text-[#66758A] shadow-sm">
          Themenbeherrschung: {Math.max(0, Math.min(100, Math.round(masteryScore)))}%
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[18px] border border-[#F5D9A5] bg-[#FFF9EF] p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#F59E0B] shadow-sm">
        <TriangleAlert className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#C57907]">
        Wiederholen
      </p>
      <h2 className="mt-1 text-[14px] font-extrabold text-[#081529]">
        Fehler gezielt trainieren
      </h2>
      <p className="mt-1 text-[9px] leading-4 text-[#66758A]">
        {reviewQuestions} {reviewQuestions === 1 ? "Frage ist" : "Fragen sind"} aktuell zur Wiederholung markiert.
      </p>

      <Link
        href={href}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#EFCB8A] bg-white px-4 py-3 text-[10px] font-extrabold text-[#9A620A] transition hover:border-[#E2B65F]"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Fehler wiederholen
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
