"use client";

import {
  CheckCircle2,
  XCircle,
} from "lucide-react";

import type {
  TheoryQuestionResultView,
} from "@/types/theory";

export interface QuestionResultProps {
  result: TheoryQuestionResultView;
}

export function QuestionResult({
  result,
}: QuestionResultProps) {
  return (
    <aside
      className={`rounded-[14px] border p-4 ${
        result.correct
          ? "border-[#BFE8D7] bg-[#F2FBF7]"
          : "border-[#F8C8C8] bg-[#FFF6F6]"
      }`}
    >
      <div className="flex items-center gap-2">
        {result.correct ? (
          <CheckCircle2 className="h-5 w-5 text-[#10A36A]" />
        ) : (
          <XCircle className="h-5 w-5 text-[#EF4444]" />
        )}

        <p
          className={`text-[11px] font-extrabold ${
            result.correct ? "text-[#0C8B59]" : "text-[#D93B3B]"
          }`}
        >
          {result.correct ? "Richtig" : "Falsch"}
        </p>
      </div>

      {result.explanation ? (
        <div className="mt-3">
          <p className="text-[9px] font-extrabold text-[#081529]">
            Warum?
          </p>

          <p className="mt-1 text-[10px] leading-5 text-[#5F6F84]">
            {result.explanation}
          </p>
        </div>
      ) : null}
    </aside>
  );
}
