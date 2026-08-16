"use client";

import { CheckCircle2, Target } from "lucide-react";

export interface PracticeProgressProps {
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function PracticeProgress({
  currentIndex,
  totalQuestions,
  answeredCount,
  correctCount,
}: PracticeProgressProps) {
  const safeTotal = Math.max(0, totalQuestions);
  const safeAnswered = Math.max(0, Math.min(answeredCount, safeTotal));
  const percent = safeTotal > 0 ? clampPercent((safeAnswered / safeTotal) * 100) : 0;
  const accuracy = safeAnswered > 0 ? clampPercent((correctCount / safeAnswered) * 100) : 0;

  return (
    <div className="rounded-[14px] border border-[#E5EAF2] bg-white p-3">
      <div className="flex flex-wrap items-center gap-3 text-[9px] text-[#66758A]">
        <span className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-[#0B63F6]" aria-hidden="true" />
          Frage {safeTotal > 0 ? Math.min(currentIndex + 1, safeTotal) : 0} / {safeTotal}
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#10A36A]" aria-hidden="true" />
          {correctCount} richtig · {accuracy}% Trefferquote
        </span>
        <span className="ml-auto font-extrabold text-[#081529]">{percent}%</span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E9EEF5]" aria-label={`Trainingsfortschritt ${percent}%`}>
        <div className="h-full rounded-full bg-[#0B63F6] transition-[width]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
