/* eslint-disable @next/next/no-img-element */
"use client";

import type {
  ExamQuestionView,
} from "@/types/exams";

export interface ExamQuestionCardProps {
  question:
    ExamQuestionView;
  selected:
    readonly string[];
  disabled?:
    boolean;
  onChange: (
    selected:
      readonly string[],
  ) => void;
}

export function ExamQuestionCard({
  question,
  selected,
  disabled = false,
  onChange,
}: ExamQuestionCardProps) {
  const multiple =
    question.questionType ===
    "MULTIPLE_CHOICE";

  function toggle(
    optionId:
      string,
  ) {
    if (disabled) {
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
            (
              id,
            ) =>
              id !==
              optionId,
          )
        : [
            ...selected,
            optionId,
          ],
    );
  }

  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#6F7F94]">
          Frage {question.position} von {question.totalQuestions}
        </p>

        {question.penaltyPoints >
        0 ? (
          <span className="rounded-full bg-[#F7F9FC] px-2.5 py-1 text-[8px] font-extrabold text-[#53647A]">
            {question.penaltyPoints} Punkte
          </span>
        ) : null}
      </div>

      <h1 className="mt-4 text-[16px] font-black leading-6 text-[#081529] lg:text-[18px]">
        {question.prompt}
      </h1>

      {question.mediaUrl ? (
        <div className="mt-4 overflow-hidden rounded-[14px] border border-[#E7ECF3] bg-[#F8FAFD]">
          {question.questionType ===
          "VIDEO" ? (
            <video
              controls
              preload="metadata"
              playsInline
              className="aspect-video w-full bg-black object-contain"
            >
              <source
                src={
                  question.mediaUrl
                }
              />
            </video>
          ) : (
            <img
              src={
                question.mediaUrl
              }
              alt=""
              className="max-h-[480px] w-full object-contain"
            />
          )}
        </div>
      ) : null}

      {question.questionType ===
      "NUMERIC" ? (
        <label className="mt-5 block">
          <span className="mb-2 block text-[9px] font-semibold text-[#5F6F84]">
            Deine Antwort
          </span>

          <input
            type="number"
            disabled={
              disabled
            }
            value={
              selected[0] ??
              ""
            }
            onChange={(
              event,
            ) => {
              const value =
                event.target
                  .value;

              onChange(
                value
                  ? [
                      value,
                    ]
                  : [],
              );
            }}
            className="min-h-11 w-full rounded-xl border border-[#DCE4EF] bg-white px-3 text-[11px] font-semibold text-[#081529] outline-none transition focus:border-[#0B63F6] focus:ring-2 focus:ring-[#DCEBFF] disabled:cursor-not-allowed disabled:bg-[#F5F7FA]"
          />
        </label>
      ) : (
        <div className="mt-5 space-y-2">
          {question.options.map(
            (
              option,
            ) => {
              const active =
                selected.includes(
                  option.id,
                );

              return (
                <button
                  key={
                    option.id
                  }
                  type="button"
                  disabled={
                    disabled
                  }
                  onClick={() =>
                    toggle(
                      option.id,
                    )
                  }
                  className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                    active
                      ? "border-[#0B63F6] bg-[#F4F8FF]"
                      : "border-[#E2E8F0] bg-white hover:border-[#C9D8ED]"
                  } disabled:cursor-not-allowed disabled:bg-[#FAFBFD]`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center ${
                      multiple
                        ? "rounded-md"
                        : "rounded-full"
                    } border ${
                      active
                        ? "border-[#0B63F6] bg-[#0B63F6]"
                        : "border-[#B9C5D4] bg-white"
                    }`}
                  >
                    {active ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    ) : null}
                  </span>

                  {option.imageUrl ? (
                    <img
                      src={
                        option.imageUrl
                      }
                      alt=""
                      className="h-16 w-20 shrink-0 rounded-lg object-cover"
                    />
                  ) : null}

                  <span className="text-[10px] font-semibold leading-4 text-[#223248]">
                    {option.label}
                  </span>
                </button>
              );
            },
          )}
        </div>
      )}

      {question.answered ? (
        <div className="mt-4 rounded-xl border border-[#CFE0FF] bg-[#F3F7FF] px-3.5 py-2.5">
          <p className="text-[9px] font-bold text-[#0B63F6]">
            Antwort gespeichert. Die Auswertung wird erst nach Prüfungsende angezeigt.
          </p>
        </div>
      ) : null}
    </section>
  );
}
