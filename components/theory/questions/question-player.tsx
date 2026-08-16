"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
} from "lucide-react";

import {
  QuestionActions,
} from "@/components/theory/questions/question-actions";

import {
  QuestionOptions,
} from "@/components/theory/questions/question-options";

import {
  QuestionResult,
} from "@/components/theory/questions/question-result";

import type {
  TheoryQuestionResultView,
  TheoryQuestionView,
} from "@/types/theory";

export interface QuestionPlayerProps {
  question:
    TheoryQuestionView;

  result?:
    TheoryQuestionResultView | null;

  submitting?:
    boolean;

  favoriteSupported?:
    boolean;

  onSubmit:
    (
      selected: readonly string[],
    ) => Promise<void> | void;

  onNext?:
    () => void;

  onFavoriteChange?:
    (
      favorite: boolean,
    ) => Promise<void> | void;

  onReport?:
    () => Promise<void> | void;
}

export function QuestionPlayer({
  question,
  result = null,
  submitting = false,
  favoriteSupported = true,
  onSubmit,
  onNext,
  onFavoriteChange,
  onReport,
}: QuestionPlayerProps) {
  const [
    selected,
    setSelected,
  ] =
    useState<
      readonly string[]
    >([]);

  /**
   * A new question must always start
   * without a previous selection.
   */
  useEffect(() => {
    setSelected([]);
  }, [
    question.id,
  ]);

  const answered =
    Boolean(result);

  const canSubmit =
    selected.length > 0 &&
    !submitting &&
    !answered;

  return (
    <section className="mx-auto w-full max-w-[820px] rounded-[18px] border border-[#E5EAF2] bg-white p-4 shadow-[0_8px_24px_rgba(17,40,70,0.04)] lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#6F7F94]">
          {question.position &&
          question.totalQuestions
            ? `Frage ${question.position} von ${question.totalQuestions}`
            : "Theoriefrage"}
        </p>

        {question.penaltyPoints >
        0 ? (
          <span className="rounded-full bg-[#F7F9FC] px-2.5 py-1 text-[8px] font-extrabold text-[#53647A]">
            {
              question.penaltyPoints
            }{" "}
            Punkte
          </span>
        ) : null}
      </div>

      <h1 className="mt-4 text-[16px] font-extrabold leading-6 text-[#081529] lg:text-[18px]">
        {question.prompt}
      </h1>

      <div className="mt-5">
        <QuestionOptions
          question={
            question
          }
          selected={
            selected
          }
          result={
            result
          }
          disabled={
            answered ||
            submitting
          }
          onChange={
            setSelected
          }
        />
      </div>

      {result ? (
        <div className="mt-4">
          <QuestionResult
            result={
              result
            }
          />
        </div>
      ) : null}

      <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <QuestionActions
          favorite={
            question.favorite
          }
          favoriteSupported={
            favoriteSupported
          }
          onFavoriteChange={
            onFavoriteChange
          }
          onReport={
            onReport
          }
        />

        {answered ? (
          onNext ? (
            <button
              type="button"
              onClick={
                onNext
              }
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white transition hover:bg-[#0958DC]"
            >
              Weiter

              <ArrowRight
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            </button>
          ) : null
        ) : (
          <button
            type="button"
            disabled={
              !canSubmit
            }
            onClick={() => {
              void onSubmit(
                selected,
              );
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white transition hover:bg-[#0958DC] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#0B63F6]"
          >
            {submitting
              ? "Wird geprüft..."
              : "Antwort prüfen"}
          </button>
        )}
      </div>
    </section>
  );
}