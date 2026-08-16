"use client";

import { AlertTriangle, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

export interface TheoryErrorItem {
  id: string;
  topicId: string;
  topicTitle: string;
  prompt: string;
  questionType: string;
  penaltyPoints: number;
  attemptCount: number;
  correctCount: number;
  incorrectCount: number;
  lastAnswerCorrect: boolean | null;
  isMastered: boolean;
  lastAnsweredAt: string | null;
}

export interface ErrorQuestionCardProps {
  question: TheoryErrorItem;
  onTrain?: (question: TheoryErrorItem) => void;
}

export function ErrorQuestionCard({ question, onTrain }: ErrorQuestionCardProps) {
  return (
    <article className="rounded-[16px] border border-[#E5EAF2] bg-white p-4 shadow-[0_6px_20px_rgba(17,40,70,0.035)]">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF2F2] text-[#EF4444]">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#0B63F6]">
              {question.topicTitle}
            </span>
            <span className="rounded-full bg-[#F7F9FC] px-2 py-1 text-[8px] font-semibold text-[#66758A]">
              {question.penaltyPoints} Fehlerpunkte
            </span>
          </div>
          <p className="mt-2 text-[11px] font-bold leading-5 text-[#081529]">{question.prompt}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat icon={RotateCcw} label="Versuche" value={question.attemptCount} />
        <Stat icon={CheckCircle2} label="Richtig" value={question.correctCount} />
        <Stat icon={XCircle} label="Falsch" value={question.incorrectCount} />
      </div>

      {onTrain ? (
        <button
          type="button"
          onClick={() => onTrain(question)}
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63F6] px-4 text-[9px] font-extrabold text-white"
        >
          Frage wiederholen
        </button>
      ) : null}
    </article>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof RotateCcw; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#F7F9FC] p-2.5">
      <Icon className="h-3.5 w-3.5 text-[#6B7A8F]" aria-hidden="true" />
      <p className="mt-1 text-[12px] font-extrabold text-[#081529]">{value}</p>
      <p className="text-[7px] font-semibold text-[#718094]">{label}</p>
    </div>
  );
}
