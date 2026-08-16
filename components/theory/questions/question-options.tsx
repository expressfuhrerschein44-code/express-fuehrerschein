"use client";

import {
  Check,
  X,
} from "lucide-react";

import type {
  TheoryQuestionResultView,
  TheoryQuestionView,
} from "@/types/theory";

export interface QuestionOptionsProps {
  question: TheoryQuestionView;

  selected: readonly string[];

  result?: TheoryQuestionResultView | null;

  disabled?: boolean;

  onChange: (
    selected: readonly string[],
  ) => void;
}

export function QuestionOptions({
  question,
  selected,
  result = null,
  disabled = false,
  onChange,
}: QuestionOptionsProps) {
  const multiple =
    question.questionType ===
    "MULTIPLE_CHOICE";

  const answered =
    Boolean(result);

  const correctOptionIds =
    new Set(
      result?.correctOptionIds ??
      [],
    );

  function toggle(
    optionId: string,
  ) {
    if (
      disabled ||
      answered
    ) {
      return;
    }

    if (!multiple) {
      onChange([
        optionId,
      ]);

      return;
    }

    onChange(
      selected.includes(
        optionId,
      )
        ? selected.filter(
            (id) =>
              id !==
              optionId,
          )
        : [
            ...selected,
            optionId,
          ],
    );
  }

  /**
   * Numeric questions use the same selected[] transport format as
   * choice questions.
   *
   * An empty field must produce [] rather than [""], otherwise
   * QuestionPlayer would consider the question answerable.
   */
  if (
    question.questionType ===
    "NUMERIC"
  ) {
    const value =
      selected[0] ??
      "";

    const expectedValue =
      result?.correctOptionIds?.[0] ??
      null;

    const numericCorrect =
      Boolean(
        result?.correct,
      );

    const numericIncorrect =
      answered &&
      !numericCorrect;

    return (
      <div>
        <label className="block">
          <span className="mb-2 block text-[9px] font-semibold text-[#5F6F84]">
            Deine Antwort
          </span>

          <div className="relative">
            <input
              type="number"
              disabled={
                disabled ||
                answered
              }
              value={value}
              onChange={(
                event,
              ) => {
                const nextValue =
                  event
                    .target
                    .value;

                onChange(
                  nextValue
                    ? [
                        nextValue,
                      ]
                    : [],
                );
              }}
              className={`min-h-11 w-full rounded-xl border bg-white px-3 pr-10 text-[11px] font-semibold text-[#081529] outline-none transition ${
                answered
                  ? numericCorrect
                    ? "border-[#8ED8BA] bg-[#F2FBF7]"
                    : "border-[#F1AFAF] bg-[#FFF6F6]"
                  : "border-[#DCE4EF] focus:border-[#0B63F6] focus:ring-2 focus:ring-[#DCEBFF]"
              }`}
            />

            {answered ? (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                {numericCorrect ? (
                  <Check
                    className="h-4 w-4 text-[#10A36A]"
                    aria-hidden="true"
                  />
                ) : (
                  <X
                    className="h-4 w-4 text-[#EF4444]"
                    aria-hidden="true"
                  />
                )}
              </span>
            ) : null}
          </div>
        </label>

        {numericIncorrect &&
        expectedValue ? (
          <div className="mt-2 rounded-xl border border-[#BFE8D7] bg-[#F2FBF7] px-3 py-2.5">
            <p className="text-[8px] font-extrabold uppercase tracking-[0.05em] text-[#0C8B59]">
              Richtige Antwort
            </p>

            <p className="mt-1 text-[11px] font-extrabold text-[#081529]">
              {expectedValue}
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {question.options.map(
        (option) => {
          const active =
            selected.includes(
              option.id,
            );

          const explicitlyCorrect =
            correctOptionIds.has(
              option.id,
            );

          /**
           * When the server confirms the answer as correct but no explicit
           * correctOptionIds were returned, the selected option(s) are still
           * safe to display as correct.
           */
          const correct =
            answered &&
            (
              explicitlyCorrect ||
              (
                Boolean(
                  result?.correct,
                ) &&
                active
              )
            );

          const wrongSelected =
            answered &&
            active &&
            !correct;

          const neutral =
            !correct &&
            !wrongSelected;

          const buttonTone =
            correct
              ? "border-[#8ED8BA] bg-[#F2FBF7]"
              : wrongSelected
                ? "border-[#F1AFAF] bg-[#FFF6F6]"
                : active
                  ? "border-[#0B63F6] bg-[#F4F8FF]"
                  : "border-[#E2E8F0] bg-white hover:border-[#C9D8ED]";

          const markerTone =
            correct
              ? "border-[#10A36A] bg-[#10A36A]"
              : wrongSelected
                ? "border-[#EF4444] bg-[#EF4444]"
                : active
                  ? "border-[#0B63F6] bg-[#0B63F6]"
                  : "border-[#B9C5D4] bg-white";

          return (
            <button
              key={
                option.id
              }
              type="button"
              disabled={
                disabled ||
                answered
              }
              onClick={() =>
                toggle(
                  option.id,
                )
              }
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${buttonTone} disabled:cursor-not-allowed`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                  multiple
                    ? "rounded-md"
                    : "rounded-full"
                } border ${markerTone}`}
                aria-hidden="true"
              >
                {correct ? (
                  <Check className="h-3 w-3 text-white" />
                ) : wrongSelected ? (
                  <X className="h-3 w-3 text-white" />
                ) : active ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                ) : null}
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={`block text-[10px] font-semibold leading-4 ${
                    correct
                      ? "text-[#087A50]"
                      : wrongSelected
                        ? "text-[#C43737]"
                        : "text-[#223248]"
                  }`}
                >
                  {
                    option.label
                  }
                </span>

                {answered &&
                correct ? (
                  <span className="mt-0.5 block text-[8px] font-extrabold text-[#10A36A]">
                    Richtige Antwort
                  </span>
                ) : null}

                {answered &&
                wrongSelected ? (
                  <span className="mt-0.5 block text-[8px] font-extrabold text-[#EF4444]">
                    Deine Antwort
                  </span>
                ) : null}
              </span>

              {answered &&
              neutral ? (
                <span className="sr-only">
                  Nicht ausgewählt
                </span>
              ) : null}
            </button>
          );
        },
      )}
    </div>
  );
}