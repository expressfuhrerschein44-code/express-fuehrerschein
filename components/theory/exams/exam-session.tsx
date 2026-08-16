"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
} from "lucide-react";

import {
  ExamQuestion,
} from "@/components/theory/exams/exam-question";
import {
  ExamTimer,
} from "@/components/theory/exams/exam-timer";

import type {
  TheoryExamSessionView,
  TheoryQuestionView,
} from "@/types/theory";

export interface ExamSessionProps {
  session: TheoryExamSessionView;
  question: TheoryQuestionView;
  saving?: boolean;
  onSubmitAnswer: (selected: readonly string[]) => Promise<void> | void;
  onPrevious?: () => void;
  onNext?: () => void;
  onFinish?: () => Promise<void> | void;
  onMark?: () => void;
  onExpire?: () => void;
}

export function ExamSession({
  session,
  question,
  saving = false,
  onSubmitAnswer,
  onPrevious,
  onNext,
  onFinish,
  onMark,
  onExpire,
}: ExamSessionProps) {
  const [selected, setSelected] = useState<readonly string[]>([]);

  async function submitAndContinue() {
    if (selected.length === 0 || saving) {
      return;
    }

    await onSubmitAnswer(selected);
    setSelected([]);

    const last = session.currentIndex >= session.questionIds.length - 1;

    if (last) {
      await onFinish?.();
      return;
    }

    onNext?.();
  }

  return (
    <section className="mx-auto w-full max-w-[900px]">
      <header className="mb-4 flex items-center justify-between gap-3 rounded-[14px] border border-[#E5EAF2] bg-white p-3">
        <div>
          <p className="text-[8px] uppercase tracking-[0.08em] text-[#718094]">
            Prüfungssimulation
          </p>
          <p className="mt-0.5 text-[11px] font-extrabold text-[#081529]">
            {session.title}
          </p>
        </div>

        <ExamTimer
          initialSeconds={session.remainingSeconds}
          running={!session.completed}
          onExpire={onExpire}
        />
      </header>

      <ExamQuestion
        question={question}
        selected={selected}
        disabled={saving}
        onChange={setSelected}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onMark}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#DCE4EF] px-3 text-[9px] font-extrabold text-[#53647A]"
        >
          <Bookmark className="h-3.5 w-3.5" />
          Markieren
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={session.currentIndex <= 0}
            onClick={onPrevious}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-[#DCE4EF] px-3 text-[9px] font-extrabold text-[#53647A] disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Zurück
          </button>

          <button
            type="button"
            disabled={selected.length === 0 || saving}
            onClick={() => void submitAndContinue()}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-[#0B63F6] px-4 text-[9px] font-extrabold text-white disabled:opacity-50"
          >
            {saving ? "Speichern..." : "Weiter"}
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
