"use client";

import { ArrowLeft, ArrowRight, Flag } from "lucide-react";

export interface ExamNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  disabled?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onRequestFinish?: () => void;
}

export function ExamNavigation({
  currentIndex,
  totalQuestions,
  disabled = false,
  onPrevious,
  onNext,
  onRequestFinish,
}: ExamNavigationProps) {
  const last = totalQuestions > 0 && currentIndex >= totalQuestions - 1;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-[14px] border border-[#E5EAF2] bg-white p-3">
      <button type="button" disabled={disabled || currentIndex <= 0} onClick={onPrevious} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#DCE4EF] px-3 text-[9px] font-extrabold text-[#53647A] disabled:opacity-40">
        <ArrowLeft className="h-3.5 w-3.5" /> Zurück
      </button>
      <span className="text-[9px] font-extrabold text-[#081529]">{totalQuestions > 0 ? currentIndex + 1 : 0} / {totalQuestions}</span>
      <div className="flex items-center gap-2">
        {last ? (
          <button type="button" disabled={disabled} onClick={onRequestFinish} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#061427] px-3 text-[9px] font-extrabold text-white disabled:opacity-50"><Flag className="h-3.5 w-3.5" /> Prüfung beenden</button>
        ) : (
          <button type="button" disabled={disabled || totalQuestions === 0} onClick={onNext} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#0B63F6] px-3 text-[9px] font-extrabold text-white disabled:opacity-50">Weiter <ArrowRight className="h-3.5 w-3.5" /></button>
        )}
      </div>
    </div>
  );
}
