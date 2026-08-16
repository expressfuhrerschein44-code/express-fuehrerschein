"use client";

import { Bookmark } from "lucide-react";

export interface ExamQuestionGridProps {
  questionIds: readonly string[];
  currentIndex: number;
  answeredQuestionIds?: readonly string[];
  markedQuestionIds?: readonly string[];
  disabled?: boolean;
  onSelect?: (index: number, questionId: string) => void;
}

export function ExamQuestionGrid({
  questionIds,
  currentIndex,
  answeredQuestionIds = [],
  markedQuestionIds = [],
  disabled = false,
  onSelect,
}: ExamQuestionGridProps) {
  const answered = new Set(answeredQuestionIds);
  const marked = new Set(markedQuestionIds);

  return (
    <section className="rounded-[14px] border border-[#E5EAF2] bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[9px] font-extrabold text-[#081529]">Fragenübersicht</h2>
        <span className="text-[8px] text-[#718094]">{answered.size} / {questionIds.length} beantwortet</span>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
        {questionIds.map((questionId, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = answered.has(questionId);
          const isMarked = marked.has(questionId);
          return (
            <button
              key={questionId}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(index, questionId)}
              aria-label={`Frage ${index + 1}${isAnswered ? ", beantwortet" : ", offen"}${isMarked ? ", markiert" : ""}`}
              className={[
                "relative flex aspect-square min-h-9 items-center justify-center rounded-lg border text-[9px] font-extrabold transition",
                isCurrent
                  ? "border-[#0B63F6] bg-[#0B63F6] text-white"
                  : isAnswered
                    ? "border-[#BFE4D4] bg-[#F0FBF6] text-[#0C7D51]"
                    : "border-[#DCE4EF] bg-white text-[#66758A] hover:border-[#B7C8DE]",
              ].join(" ")}
            >
              {index + 1}
              {isMarked ? <Bookmark className="absolute -right-1 -top-1 h-3 w-3 fill-[#F59E0B] text-[#F59E0B]" /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
