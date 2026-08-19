"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Loader2,
  Send,
} from "lucide-react";

import {
  ExamQuestionCard,
} from "@/components/exams/exam-question-card";

import type {
  ExamApiResponse,
  ExamAttemptPageData,
} from "@/types/exams";

export interface ExamPlayerProps {
  data:
    ExamAttemptPageData;
}

interface AnswerResponse {
  attemptId:
    string;
  questionId:
    string;
  answeredQuestions:
    number;
  totalQuestions:
    number;
}

interface FinishResponse {
  attemptId:
    string;
}

function answerTokens(
  value:
    unknown,
): string[] {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value
      .map(
        (
          item,
        ) =>
          String(
            item,
          ).trim(),
      )
      .filter(
        Boolean,
      );
  }

  if (
    typeof value ===
      "string" ||
    typeof value ===
      "number"
  ) {
    const token =
      String(
        value,
      ).trim();

    return token
      ? [
          token,
        ]
      : [];
  }

  return [];
}

function formatTime(
  seconds:
    number,
): string {
  const safe =
    Math.max(
      0,
      Math.round(
        seconds,
      ),
    );

  const minutes =
    Math.floor(
      safe /
        60,
    );

  const rest =
    safe %
    60;

  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function ExamPlayer({
  data,
}: ExamPlayerProps) {
  const router =
    useRouter();

  const [
    index,
    setIndex,
  ] =
    useState(
      0,
    );

  const [
    remaining,
    setRemaining,
  ] =
    useState(
      data.remainingSeconds,
    );

  const [
    busy,
    setBusy,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    selectedByQuestion,
    setSelectedByQuestion,
  ] =
    useState<
      Record<
        string,
        readonly string[]
      >
    >(
      () =>
        Object.fromEntries(
          data.questions.map(
            (
              question,
            ) => [
              question.id,
              answerTokens(
                question
                  .answerPayload,
              ),
            ],
          ),
        ),
    );

  const [
    answeredIds,
    setAnsweredIds,
  ] =
    useState<
      Set<string>
    >(
      () =>
        new Set(
          data.questions
            .filter(
              (
                question,
              ) =>
                question
                  .answered,
            )
            .map(
              (
                question,
              ) =>
                question.id,
            ),
        ),
    );

  const finishingRef =
    useRef(
      false,
    );

  const current =
    data.questions[
      index
    ] ??
    null;

  const answeredCount =
    answeredIds.size;

  const progressPercent =
    data.questions.length >
    0
      ? Math.round(
          (
            answeredCount /
            data.questions
              .length
          ) *
            100,
        )
      : 0;

  const allAnswered =
    answeredCount >=
    data.questions.length;

  const currentSelection =
    current
      ? selectedByQuestion[
          current.id
        ] ??
        []
      : [];

  const timeDanger =
    remaining <=
    300;

  const navItems =
    useMemo(
      () =>
        data.questions.map(
          (
            question,
          ) => ({
            id:
              question.id,
            position:
              question
                .position,
            answered:
              answeredIds.has(
                question.id,
              ),
          }),
        ),
      [
        data.questions,
        answeredIds,
      ],
    );

  const post =
    useCallback(
      async function postRequest<T>(
        body:
          Record<
            string,
            unknown
          >,
      ): Promise<T> {
        const response =
          await fetch(
            "/api/theory/exams",
            {
              method:
                "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body:
                JSON.stringify(
                  body,
                ),
            },
          );

        const payload =
          await response
            .json()
            .catch(
              () => null,
            ) as
            | ExamApiResponse<T>
            | null;

        if (
          !response.ok ||
          !payload ||
          !payload.ok
        ) {
          throw new Error(
            payload &&
            !payload.ok
              ? payload.error
                  .message
              : "Die Prüfungsaktion konnte nicht gespeichert werden.",
          );
        }

        return payload.data;
      },
      [],
    );

  const saveQuestion =
    useCallback(
      async (
        questionId:
          string,
      ): Promise<boolean> => {
        if (
          answeredIds.has(
            questionId,
          )
        ) {
          return true;
        }

        const selected =
          selectedByQuestion[
            questionId
          ] ??
          [];

        if (
          selected.length ===
          0
        ) {
          return false;
        }

        await post<AnswerResponse>({
          action:
            "answer",
          attemptId:
            data.attempt.id,
          questionId,
          answerPayload:
            selected,
        });

        setAnsweredIds(
          (
            previous,
          ) => {
            const next =
              new Set(
                previous,
              );

            next.add(
              questionId,
            );

            return next;
          },
        );

        return true;
      },
      [
        answeredIds,
        selectedByQuestion,
        post,
        data.attempt.id,
      ],
    );

  async function saveCurrentAndMove(
    direction:
      1 | -1,
  ) {
    if (
      !current ||
      busy
    ) {
      return;
    }

    setBusy(
      true,
    );

    setError(
      null,
    );

    try {
      if (
        currentSelection
          .length >
          0
      ) {
        await saveQuestion(
          current.id,
        );
      }

      setIndex(
        (
          currentIndex,
        ) =>
          Math.max(
            0,
            Math.min(
              data.questions
                .length -
                1,
              currentIndex +
                direction,
            ),
          ),
      );
    } catch (
      exception
    ) {
      setError(
        exception instanceof
        Error
          ? exception.message
          : "Die Antwort konnte nicht gespeichert werden.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  const saveAllPendingAnswers =
    useCallback(
      async () => {
        for (
          const question of
          data.questions
        ) {
          if (
            answeredIds.has(
              question.id,
            )
          ) {
            continue;
          }

          const selected =
            selectedByQuestion[
              question.id
            ] ??
            [];

          if (
            selected.length ===
            0
          ) {
            continue;
          }

          await post<AnswerResponse>({
            action:
              "answer",
            attemptId:
              data.attempt.id,
            questionId:
              question.id,
            answerPayload:
              selected,
          });

          setAnsweredIds(
            (
              previous,
            ) => {
              const next =
                new Set(
                  previous,
                );

              next.add(
                question.id,
              );

              return next;
            },
          );
        }
      },
      [
        data.questions,
        data.attempt.id,
        answeredIds,
        selectedByQuestion,
        post,
      ],
    );

  const finish =
    useCallback(
      async (
        reason:
          "manual" |
          "timeout",
      ) => {
        if (
          finishingRef
            .current
        ) {
          return;
        }

        finishingRef.current =
          true;

        setBusy(
          true,
        );

        setError(
          null,
        );

        try {
          if (
            reason ===
            "manual"
          ) {
            await saveAllPendingAnswers();
          }

          await post<FinishResponse>({
            action:
              "finish",
            attemptId:
              data.attempt.id,
            reason,
          });

          router.refresh();
        } catch (
          exception
        ) {
          finishingRef.current =
            false;

          setError(
            exception instanceof
            Error
              ? exception.message
              : "Die Prüfung konnte nicht abgeschlossen werden.",
          );
        } finally {
          setBusy(
            false,
          );
        }
      },
      [
        data.attempt.id,
        post,
        router,
        saveAllPendingAnswers,
      ],
    );

  useEffect(
    () => {
      if (
        data.attempt
          .status !==
        "in_progress"
      ) {
        return;
      }

      const timer =
        window.setInterval(
          () => {
            setRemaining(
              (
                previous,
              ) =>
                Math.max(
                  0,
                  previous -
                    1,
                ),
            );
          },
          1000,
        );

      return () =>
        window.clearInterval(
          timer,
        );
    },
    [
      data.attempt
        .status,
    ],
  );

  useEffect(
    () => {
      if (
        remaining ===
          0 &&
        data.attempt
          .status ===
          "in_progress" &&
        !finishingRef
          .current
      ) {
        void finish(
          "timeout",
        );
      }
    },
    [
      remaining,
      data.attempt
        .status,
      finish,
    ],
  );

  if (!current) {
    return (
      <main className="mx-auto w-full max-w-[980px] px-4 pb-24 pt-5 sm:px-5 lg:px-6 lg:pb-10">
        <div className="rounded-[20px] border border-[#E5EAF2] bg-white p-6 text-center">
          <p className="text-[11px] font-extrabold text-[#34445A]">
            Für diese Simulation konnten keine Prüfungsfragen geladen werden.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1040px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <section className="rounded-[18px] border border-[#E5EAF2] bg-white px-4 py-3.5 shadow-[0_8px_24px_rgba(17,40,70,0.04)] sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
              {data.configuration.trainingOnly
                ? "Trainingssimulation"
                : "Prüfungssimulation"}
            </p>

            <p className="mt-0.5 text-[10px] font-extrabold text-[#081529]">
              Klasse {data.licenseClassCode}
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black ${
              timeDanger
                ? "bg-[#FFF3F3] text-[#C43737]"
                : "bg-[#F2F7FF] text-[#0B63F6]"
            }`}
            aria-live="polite"
          >
            <Clock3
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {formatTime(
              remaining,
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E9EEF5]">
            <div
              className="h-full rounded-full bg-[#0B63F6] transition-[width] duration-300"
              style={{
                width:
                  `${progressPercent}%`,
              }}
            />
          </div>

          <span className="shrink-0 text-[8px] font-extrabold text-[#6E7D91]">
            {answeredCount} / {data.questions.length} beantwortet
          </span>
        </div>
      </section>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-[14px] border border-[#F1CACA] bg-[#FFF7F7] px-4 py-3 text-[9px] font-bold leading-4 text-[#A53030]"
        >
          {error}
        </div>
      ) : null}

      <div className="mt-4">
        <ExamQuestionCard
          question={{
            ...current,
            answered:
              answeredIds.has(
                current.id,
              ),
          }}
          selected={
            currentSelection
          }
          disabled={
            busy ||
            answeredIds.has(
              current.id,
            )
          }
          onChange={(
            selected,
          ) =>
            setSelectedByQuestion(
              (
                previous,
              ) => ({
                ...previous,
                [current.id]:
                  selected,
              }),
            )
          }
        />
      </div>

      <section className="mt-4 rounded-[18px] border border-[#E5EAF2] bg-white p-4">
        <div className="flex flex-wrap gap-1.5">
          {navItems.map(
            (
              item,
              itemIndex,
            ) => {
              const active =
                itemIndex ===
                index;

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    setIndex(
                      itemIndex,
                    )
                  }
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[8px] font-extrabold transition ${
                    active
                      ? "border-[#0B63F6] bg-[#0B63F6] text-white"
                      : item.answered
                        ? "border-[#BFE8D7] bg-[#F1FBF6] text-[#0C8B59]"
                        : "border-[#E1E7EF] bg-white text-[#6E7D91] hover:border-[#C8D6E7]"
                  }`}
                  aria-label={`Frage ${item.position}${item.answered ? ", beantwortet" : ""}`}
                >
                  {item.answered ? (
                    <Check
                      className="h-3 w-3"
                      aria-hidden="true"
                    />
                  ) : (
                    item.position
                  )}
                </button>
              );
            },
          )}
        </div>

        <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={
              busy ||
              index ===
                0
            }
            onClick={() =>
              void saveCurrentAndMove(
                -1,
              )
            }
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#DCE4EF] bg-white px-4 text-[9px] font-extrabold text-[#34445A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            Zurück
          </button>

          <div className="flex flex-col gap-2 sm:flex-row">
            {index <
            data.questions.length -
              1 ? (
              <>
                <button
                  type="button"
                  disabled={
                    busy
                  }
                  onClick={() =>
                    setIndex(
                      (
                        currentIndex,
                      ) =>
                        Math.min(
                          data.questions
                            .length -
                            1,
                          currentIndex +
                            1,
                        ),
                    )
                  }
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#DCE4EF] bg-white px-4 text-[9px] font-extrabold text-[#617086] disabled:opacity-50"
                >
                  Später beantworten
                </button>

                <button
                  type="button"
                  disabled={
                    busy ||
                    (
                      currentSelection
                        .length ===
                        0 &&
                      !answeredIds.has(
                        current.id,
                      )
                    )
                  }
                  onClick={() =>
                    void saveCurrentAndMove(
                      1,
                    )
                  }
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-5 text-[9px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : null}
                  Antwort speichern
                  <ArrowRight
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={
                  busy
                }
                onClick={() =>
                  void finish(
                    "manual",
                  )
                }
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-5 text-[9px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Send
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                )}
                Prüfung abgeben
              </button>
            )}
          </div>
        </div>

        {!allAnswered &&
        index ===
          data.questions.length -
            1 ? (
          <p className="mt-3 text-right text-[8px] font-medium text-[#7E8B9D]">
            Noch {Math.max(0, data.questions.length - answeredCount)} Frage(n) nicht gespeichert.
          </p>
        ) : null}
      </section>
    </main>
  );
}
