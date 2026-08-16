"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import {
  ErrorQuestionList,
} from "@/components/errors/error-question-list";

import {
  ErrorTrainingCard,
} from "@/components/errors/error-training-card";

import {
  ErrorsHeader,
} from "@/components/errors/errors-header";

import {
  ErrorsOverview,
} from "@/components/errors/errors-overview";

import {
  QuestionPlayer,
} from "@/components/theory/questions/question-player";

import type {
  TheoryQuestionResultView,
  TheoryQuestionView,
} from "@/types/theory";

import type {
  ErrorQuestionView,
  ErrorsPageData,
} from "@/types/errors";

export interface ErrorsPageProps {
  data:
    ErrorsPageData;
}

interface PublicQuestionPayload {
  id:
    string;
  topicId?:
    string;
  questionType?:
    string;
  penaltyPoints?:
    number;
  prompt?:
    string;
  answerOptions?:
    unknown;
  favorite?:
    boolean;
  mediaStoragePath?:
    string | null;
  mediaUrl?:
    string | null;
}

interface AnswerResultPayload {
  questionId:
    string;
  correct:
    boolean;
  explanation?:
    string | null;
  correctAnswer?:
    unknown;
  correctOptionIds?:
    unknown;
  needsReview?:
    boolean;
}

interface ApiSuccess<T> {
  ok:
    true;
  data:
    T;
}

interface ApiError {
  ok:
    false;
  error: {
    code:
      string;
    message:
      string;
  };
}

type ApiResponse<T> =
  | ApiSuccess<T>
  | ApiError;

function normalizeQuestionType(
  value:
    string | undefined,
): string {
  switch (
    value
      ?.trim()
      .toLowerCase()
  ) {
    case "multiple_choice":
    case "multiple-choice":
      return "MULTIPLE_CHOICE";

    case "image_choice":
    case "image-choice":
      return "IMAGE_CHOICE";

    case "video":
      return "VIDEO";

    case "numeric":
    case "number":
      return "NUMERIC";

    case "single_choice":
    case "single-choice":
    default:
      return "SINGLE_CHOICE";
  }
}

function asRecord(
  value:
    unknown,
): Record<
  string,
  unknown
> | null {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value,
    )
  ) {
    return null;
  }

  return value as Record<
    string,
    unknown
  >;
}

function primitiveToken(
  value:
    unknown,
): string | null {
  switch (
    typeof value
  ) {
    case "string":
      return value.trim();

    case "number":
    case "boolean":
      return String(
        value,
      );

    default:
      return null;
  }
}

function collectTokens(
  value:
    unknown,
): string[] {
  const direct =
    primitiveToken(
      value,
    );

  if (
    direct !==
    null
  ) {
    return direct
      ? [
          direct,
        ]
      : [];
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return value
      .flatMap(
        collectTokens,
      )
      .filter(
        Boolean,
      );
  }

  const record =
    asRecord(
      value,
    );

  if (!record) {
    return [];
  }

  for (
    const key of [
      "answerIds",
      "selectedAnswers",
      "answers",
      "answer",
      "value",
      "id",
      "key",
    ]
  ) {
    if (
      key in record
    ) {
      return collectTokens(
        record[
          key
        ],
      );
    }
  }

  return Object
    .values(
      record,
    )
    .flatMap(
      collectTokens,
    )
    .filter(
      Boolean,
    );
}

function optionArray(
  value:
    unknown,
): unknown[] {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value;
  }

  const record =
    asRecord(
      value,
    );

  if (!record) {
    return [];
  }

  for (
    const key of [
      "options",
      "answers",
      "choices",
      "items",
    ]
  ) {
    const candidate =
      record[
        key
      ];

    if (
      Array.isArray(
        candidate,
      )
    ) {
      return candidate;
    }
  }

  return [];
}

function optionValue(
  record:
    Record<
      string,
      unknown
    >,
  keys:
    readonly string[],
): string | null {
  for (
    const key of keys
  ) {
    const value =
      primitiveToken(
        record[
          key
        ],
      );

    if (
      value
    ) {
      return value;
    }
  }

  return null;
}

function normalizeOptions(
  value:
    unknown,
) {
  return optionArray(
    value,
  )
    .map(
      (
        item,
        index,
      ) => {
        const primitive =
          primitiveToken(
            item,
          );

        if (
          primitive !==
          null
        ) {
          return {
            id:
              primitive ||
              String(
                index +
                  1,
              ),
            label:
              primitive ||
              `Antwort ${index + 1}`,
            imageUrl:
              null,
          };
        }

        const record =
          asRecord(
            item,
          );

        if (!record) {
          return null;
        }

        return {
          id:
            optionValue(
              record,
              [
                "id",
                "key",
                "code",
                "value",
              ],
            ) ??
            String(
              index +
                1,
            ),
          label:
            optionValue(
              record,
              [
                "label",
                "text",
                "title",
                "name",
                "value",
              ],
            ) ??
            `Antwort ${index + 1}`,
          imageUrl:
            optionValue(
              record,
              [
                "imageUrl",
                "image_url",
                "image",
                "src",
              ],
            ),
        };
      },
    )
    .filter(
      Boolean,
    );
}

function buildQuestionView(
  input: {
    payload:
      PublicQuestionPayload;
    meta:
      ErrorQuestionView;
    position:
      number;
    total:
      number;
  },
): TheoryQuestionView {
  return {
    id:
      input.payload.id,
    topicId:
      input.payload.topicId ??
      input.meta.topicId,
    questionType:
      normalizeQuestionType(
        input.payload
          .questionType,
      ),
    penaltyPoints:
      Math.max(
        0,
        input.payload
          .penaltyPoints ??
          input.meta
            .penaltyPoints,
      ),
    prompt:
      input.payload.prompt ??
      input.meta.prompt,
    options:
      normalizeOptions(
        input.payload
          .answerOptions,
      ),
    favorite:
      input.payload.favorite ===
      true,
    position:
      input.position,
    totalQuestions:
      input.total,
  } as unknown as TheoryQuestionView;
}

export function ErrorsPage({
  data,
}: ErrorsPageProps) {
  const router =
    useRouter();

  const [
    training,
    setTraining,
  ] =
    useState(
      false,
    );

  const [
    index,
    setIndex,
  ] =
    useState(
      0,
    );

  const [
    question,
    setQuestion,
  ] =
    useState<
      TheoryQuestionView | null
    >(
      null,
    );

  const [
    result,
    setResult,
  ] =
    useState<
      TheoryQuestionResultView | null
    >(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  const [
    submitting,
    setSubmitting,
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

  const queue =
    useMemo(
      () =>
        data.questions,
      [
        data.questions,
      ],
    );

  const activeMeta =
    training
      ? queue[
          index
        ] ??
        null
      : null;

  function startAt(
    questionId?:
      string,
  ) {
    if (
      !queue.length
    ) {
      return;
    }

    const nextIndex =
      questionId
        ? Math.max(
            0,
            queue.findIndex(
              (
                item,
              ) =>
                item.id ===
                questionId,
            ),
          )
        : 0;

    setIndex(
      nextIndex,
    );

    setResult(
      null,
    );

    setError(
      null,
    );

    setTraining(
      true,
    );

    window.setTimeout(
      () => {
        window.scrollTo({
          top:
            0,
          behavior:
            "smooth",
        });
      },
      0,
    );
  }

  function stopTraining() {
    setTraining(
      false,
    );

    setQuestion(
      null,
    );

    setResult(
      null,
    );

    setError(
      null,
    );

    router.refresh();
  }

  useEffect(
    () => {
      if (
        !training ||
        !activeMeta
      ) {
        return;
      }

      const controller =
        new AbortController();

      let alive =
        true;

      setLoading(
        true,
      );

      setQuestion(
        null,
      );

      setResult(
        null,
      );

      setError(
        null,
      );

      void (
        async () => {
          try {
            const response =
              await fetch(
                `/api/theory/questions?id=${encodeURIComponent(activeMeta.id)}`,
                {
                  method:
                    "GET",
                  cache:
                    "no-store",
                  signal:
                    controller.signal,
                },
              );

            const payload =
              await response
                .json()
                .catch(
                  () => null,
                ) as
                | ApiResponse<PublicQuestionPayload>
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
                  : "Die Fehlerfrage konnte nicht geladen werden.",
              );
            }

            if (!alive) {
              return;
            }

            setQuestion(
              buildQuestionView({
                payload:
                  payload.data,
                meta:
                  activeMeta,
                position:
                  index +
                  1,
                total:
                  queue.length,
              }),
            );
          } catch (
            exception
          ) {
            if (
              controller.signal
                .aborted
            ) {
              return;
            }

            if (!alive) {
              return;
            }

            setError(
              exception instanceof
              Error
                ? exception.message
                : "Die Fehlerfrage konnte nicht geladen werden.",
            );
          } finally {
            if (alive) {
              setLoading(
                false,
              );
            }
          }
        }
      )();

      return () => {
        alive =
          false;

        controller.abort();
      };
    },
    [
      training,
      activeMeta,
      index,
      queue.length,
    ],
  );

  async function submitAnswer(
    selected:
      readonly string[],
  ) {
    if (
      !activeMeta ||
      submitting
    ) {
      return;
    }

    setSubmitting(
      true,
    );

    setError(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/theory/questions",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                action:
                  "answer",
                questionId:
                  activeMeta.id,
                answerPayload:
                  selected,
                mode:
                  "error_review",
              }),
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () => null,
          ) as
          | ApiResponse<AnswerResultPayload>
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
            : "Die Antwort konnte nicht geprüft werden.",
        );
      }

      setResult(
        {
          correct:
            payload.data
              .correct,
          explanation:
            payload.data
              .explanation ??
            null,
          correctOptionIds:
            collectTokens(
              payload.data
                .correctOptionIds ??
              payload.data
                .correctAnswer,
            ),
        } as TheoryQuestionResultView,
      );
    } catch (
      exception
    ) {
      setError(
        exception instanceof
        Error
          ? exception.message
          : "Die Antwort konnte nicht geprüft werden.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  function nextQuestion() {
    if (
      index <
      queue.length -
        1
    ) {
      setIndex(
        (
          current,
        ) =>
          current +
          1,
      );

      setResult(
        null,
      );

      return;
    }

    stopTraining();
  }

  const statusMessage =
    data.status ===
    "no_active_license_class"
      ? "Für das Fehlertraining ist noch keine aktive Führerscheinklasse verfügbar."
      : data.status ===
          "no_published_program"
        ? "Für deine Führerscheinklasse ist aktuell kein veröffentlichtes Theorieprogramm verfügbar."
        : null;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <ErrorsHeader
        status={
          data.status
        }
        licenseClassCode={
          data.licenseClassCode
        }
      />

      <div className="mt-4">
        <ErrorsOverview
          overview={
            data.overview
          }
        />
      </div>

      {statusMessage ? (
        <div
          role="status"
          className="mt-4 flex items-start gap-2.5 rounded-[14px] border border-[#F1D6A6] bg-[#FFF9EE] px-4 py-3"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#B7791F]"
            aria-hidden="true"
          />

          <p className="text-[9px] font-bold leading-4 text-[#8A6117]">
            {statusMessage}
          </p>
        </div>
      ) : null}

      {training ? (
        <section className="mt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={
                stopTraining
              }
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#DCE4EF] bg-white px-4 text-[8px] font-extrabold text-[#34445A]"
            >
              <ArrowLeft
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              Fehlerübersicht
            </button>

            <span className="text-[8px] font-extrabold text-[#718096]">
              {Math.min(index + 1, queue.length)} / {queue.length}
            </span>
          </div>

          {error ? (
            <div
              role="alert"
              className="mb-3 rounded-[14px] border border-[#F1CACA] bg-[#FFF7F7] px-4 py-3 text-[9px] font-bold leading-4 text-[#A53030]"
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-[20px] border border-[#E5EAF2] bg-white">
              <div className="text-center">
                <Loader2
                  className="mx-auto h-5 w-5 animate-spin text-[#0B63F6]"
                  aria-hidden="true"
                />
                <p className="mt-2 text-[9px] font-bold text-[#718096]">
                  Fehlerfrage wird geladen...
                </p>
              </div>
            </div>
          ) : question ? (
            <QuestionPlayer
              question={
                question
              }
              result={
                result
              }
              submitting={
                submitting
              }
              favoriteSupported={
                false
              }
              onSubmit={
                submitAnswer
              }
              onNext={
                nextQuestion
              }
            />
          ) : null}
        </section>
      ) : (
        <>
          <div className="mt-4">
            <ErrorTrainingCard
              needsReviewCount={
                data.overview
                  .needsReviewCount
              }
              ready={
                data.status ===
                "ready"
              }
              onStart={() =>
                startAt()
              }
            />
          </div>

          <div className="mt-4">
            <ErrorQuestionList
              questions={
                data.questions
              }
              onStart={
                startAt
              }
            />
          </div>
        </>
      )}
    </main>
  );
}
