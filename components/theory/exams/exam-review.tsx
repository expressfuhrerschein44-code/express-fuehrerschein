"use client";

import { AlertCircle, Bookmark, CheckCircle2 } from "lucide-react";

export interface ExamReviewProps {
  questionIds: readonly string[];
  answeredQuestionIds: readonly string[];
  markedQuestionIds?: readonly string[];
  onSelect?: (index: number, questionId: string) => void;
}

export function ExamReview({
  questionIds,
  answeredQuestionIds,
  markedQuestionIds = [],
  onSelect,
}: ExamReviewProps) {
  const answered = new Set(answeredQuestionIds);
  const marked = new Set(markedQuestionIds);
  const unansweredCount = questionIds.filter((id) => !answered.has(id)).length;

  return (
    <section className="rounded-[16px] border border-[#E5EAF2] bg-white p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-[12px] font-extrabold text-[#081529]">Vor dem Abgeben prüfen</h2>
        <p className="text-[9px] text-[#66758A]">Diese Übersicht zeigt nur deinen Bearbeitungsstatus, keine Lösungen.</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Status icon={CheckCircle2} label="Beantwortet" value={answered.size} />
        <Status icon={AlertCircle} label="Offen" value={unansweredCount} />
        <Status icon={Bookmark} label="Markiert" value={marked.size} />
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
        {questionIds.map((id, index) => {
          const isAnswered = answered.has(id);
          const isMarked = marked.has(id);
          return (
            <button key={id} type="button" onClick={() => onSelect?.(index, id)} className={[
              "relative flex aspect-square items-center justify-center rounded-lg border text-[9px] font-extrabold",
              isAnswered ? "border-[#BFE4D4] bg-[#F0FBF6] text-[#0C7D51]" : "border-[#F0D3A5] bg-[#FFF8EC] text-[#A06900]",
            ].join(" ")}>
              {index + 1}
              {isMarked ? <Bookmark className="absolute -right-1 -top-1 h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Status({ icon: Icon, label, value }: { icon: typeof CheckCircle2; label: string; value: number }) {
  return <div className="rounded-xl bg-[#F7F9FC] p-3"><Icon className="h-4 w-4 text-[#0B63F6]" /><p className="mt-1 text-[16px] font-extrabold text-[#081529]">{value}</p><p className="text-[8px] text-[#718094]">{label}</p></div>;
}
