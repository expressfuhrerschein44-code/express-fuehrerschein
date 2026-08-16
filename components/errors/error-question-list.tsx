import {
  CheckCircle2,
} from "lucide-react";

import {
  ErrorQuestionCard,
} from "@/components/errors/error-question-card";

import type {
  ErrorQuestionView,
} from "@/types/errors";

export interface ErrorQuestionListProps {
  questions:
    readonly ErrorQuestionView[];
  onStart:
    (
      questionId:
        string,
    ) => void;
}

export function ErrorQuestionList({
  questions,
  onStart,
}: ErrorQuestionListProps) {
  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Fehlerfragen
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Deine offenen Fehler
        </h2>

        <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
          Diese Fragen sind aktuell mit „needs_review“ markiert und sollten noch einmal trainiert werden.
        </p>
      </div>

      {questions.length ? (
        <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {questions.map(
            (
              question,
            ) => (
              <ErrorQuestionCard
                key={
                  question.id
                }
                question={
                  question
                }
                onStart={
                  onStart
                }
              />
            ),
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-[16px] border border-dashed border-[#CFE5D8] bg-[#F7FCF9] px-5 py-8 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0C8B59] shadow-[0_5px_16px_rgba(17,40,70,0.05)]">
            <CheckCircle2
              className="h-4.5 w-4.5"
              aria-hidden="true"
            />
          </span>

          <p className="mt-3 text-[11px] font-extrabold text-[#34445A]">
            Keine offenen Fehlerfragen
          </p>

          <p className="mx-auto mt-1 max-w-[340px] text-[9px] font-medium leading-4 text-[#8491A3]">
            Sobald eine Frage erneut geübt werden sollte, erscheint sie automatisch hier.
          </p>
        </div>
      )}
    </section>
  );
}
