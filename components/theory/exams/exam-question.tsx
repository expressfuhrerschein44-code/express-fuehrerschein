"use client";

import {
  QuestionOptions,
} from "@/components/theory/questions/question-options";

import type {
  TheoryQuestionView,
} from "@/types/theory";

export interface ExamQuestionProps {
  question: TheoryQuestionView;
  selected: readonly string[];
  disabled?: boolean;
  onChange: (selected: readonly string[]) => void;
}

export function ExamQuestion({
  question,
  selected,
  disabled = false,
  onChange,
}: ExamQuestionProps) {
  return (
    <section className="rounded-[16px] border border-[#E5EAF2] bg-white p-4 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#6F7F94]">
          {question.position && question.totalQuestions
            ? `Frage ${question.position} / ${question.totalQuestions}`
            : "Prüfungsfrage"}
        </p>

        {question.penaltyPoints > 0 ? (
          <span className="text-[8px] font-extrabold text-[#66758A]">
            {question.penaltyPoints} Punkte
          </span>
        ) : null}
      </div>

      <h2 className="mt-4 text-[16px] font-extrabold leading-6 text-[#081529]">
        {question.prompt}
      </h2>

      <div className="mt-5">
        <QuestionOptions
          question={question}
          selected={selected}
          disabled={disabled}
          onChange={onChange}
        />
      </div>
    </section>
  );
}
