"use client";

import {
  CheckCircle2,
  CircleDot,
} from "lucide-react";

import type {
  TheoryPracticeSessionView,
} from "@/types/theory";

export interface PracticeSessionProps {
  session: TheoryPracticeSessionView;
  onExit?: () => void;
}

export function PracticeSession({
  session,
  onExit,
}: PracticeSessionProps) {
  const percent =
    session.questionIds.length > 0
      ? Math.round((session.answeredCount / session.questionIds.length) * 100)
      : 0;

  return (
    <header className="mb-4 rounded-[14px] border border-[#E5EAF2] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#718094]">
            Training
          </p>
          <h1 className="mt-1 text-[15px] font-extrabold text-[#081529]">
            {session.title}
          </h1>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="rounded-lg px-3 py-2 text-[9px] font-extrabold text-[#66758A] hover:bg-[#F7F9FC]"
        >
          Beenden
        </button>
      </div>

      <div className="mt-4 flex items-center gap-4 text-[9px] text-[#66758A]">
        <span className="flex items-center gap-1.5">
          <CircleDot className="h-3.5 w-3.5 text-[#0B63F6]" />
          {session.answeredCount} / {session.questionIds.length}
        </span>

        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-[#10A36A]" />
          {session.correctCount} richtig
        </span>

        <span className="ml-auto font-extrabold text-[#081529]">
          {percent}%
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E9EEF5]">
        <div
          className="h-full rounded-full bg-[#0B63F6]"
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
    </header>
  );
}
