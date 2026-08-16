import Link from "next/link";
import { ArrowRight, Dumbbell, Sparkles } from "lucide-react";

export interface TopicPracticeCardProps {
  topicId: string;
  title: string;
  questionCount: number;
}

export function TopicPracticeCard({
  topicId,
  title,
  questionCount,
}: TopicPracticeCardProps) {
  const href = `/theorie/uebungen?mode=topic&topic=${encodeURIComponent(topicId)}`;

  return (
    <section className="rounded-[18px] border border-[#CFE0FA] bg-[linear-gradient(145deg,#F6FAFF_0%,#FFFFFF_70%)] p-5 shadow-[0_8px_24px_rgba(11,99,246,0.05)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0B63F6] text-white shadow-[0_8px_18px_rgba(11,99,246,0.18)]">
        <Dumbbell className="h-5 w-5" aria-hidden="true" />
      </span>

      <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#0B63F6]">
        Üben
      </p>
      <h2 className="mt-1 text-[14px] font-extrabold text-[#081529]">
        Thema trainieren
      </h2>
      <p className="mt-1 text-[9px] leading-4 text-[#66758A]">
        Trainiere veröffentlichte Fragen aus „{title}“ und aktualisiere deinen Lernfortschritt automatisch.
      </p>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-[9px] font-semibold text-[#66758A] shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-[#0B63F6]" aria-hidden="true" />
        {questionCount} verfügbare Fragen im Thema
      </div>

      {questionCount > 0 ? (
        <Link
          href={href}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-4 py-3 text-[10px] font-extrabold text-white transition hover:bg-[#084FC5]"
        >
          Training starten
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <div className="mt-4 rounded-xl bg-[#EEF2F7] px-4 py-3 text-center text-[9px] font-bold text-[#7A889A]">
          Noch keine Trainingsfragen veröffentlicht
        </div>
      )}
    </section>
  );
}
