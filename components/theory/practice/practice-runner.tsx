"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";

import {
  QuestionPlayer,
} from "@/components/theory/questions/question-player";

import {
  PracticeSession,
} from "@/components/theory/practice/practice-session";

import type {
  TheoryPracticeSessionView,
  TheoryQuestionResultView,
  TheoryQuestionView,
} from "@/types/theory";

export interface PracticeRunnerProps {
  mode:
    TheoryPracticeSessionView["mode"];

  topicId?:
    string | null;

  topicTitle?:
    string | null;
}

type PracticeStartData = {
  sessionId: string;
  kind: string;
  startedAt: string;
  questionIds:
    readonly string[];
};

type ApiSuccess<T> = {
  ok: true;
  data: T;
};

type ApiFailure = {
  ok: false;
  error?: {
    code?: string;
    message?: string;
  };
};

type ApiEnvelope<T> =
  | ApiSuccess<T>
  | ApiFailure;

const MODE_TITLES: Record<
  TheoryPracticeSessionView["mode"],
  string
> = {
  random:
    "Zufällige Fragen",
  errors:
    "Meine Fehler",
  quick:
    "Schnelltraining",
  topic:
    "Themen-Training",
};

async function readApiData<T>(
  response: Response,
): Promise<T> {
  const payload =
    await response
      .json()
      .catch(
        () => null,
      ) as
      | ApiEnvelope<T>
      | null;

  if (
    !response.ok ||
    !payload ||
    payload.ok !== true
  ) {
    const message =
      payload &&
      payload.ok === false
        ? payload.error
            ?.message
        : null;

    throw new Error(
      message ||
        "Die Trainingsdaten konnten nicht geladen werden.",
    );
  }

  return payload.data;
}

function activeDurationSeconds(
  startedAt: number,
): number {
  return Math.max(
    0,
    Math.floor(
      (
        Date.now() -
        startedAt
      ) /
        1000,
    ),
  );
}

export function PracticeRunner({
  mode,
  topicId = null,
  topicTitle = null,
}: PracticeRunnerProps) {
  const router =
    useRouter();

  const [
    session,
    setSession,
  ] =
    useState<
      TheoryPracticeSessionView | null
    >(null);

  const [
    question,
    setQuestion,
  ] =
    useState<
      TheoryQuestionView | null
    >(null);

  const [
    result,
    setResult,
  ] =
    useState<
      TheoryQuestionResultView | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    finishing,
    setFinishing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const startedAtRef =
    useRef<number>(
      Date.now(),
    );

  const startedKeyRef =
    useRef<
      string | null
    >(null);

  const generationRef =
    useRef(0);

  const loadQuestion =
    useCallback(
      async (
        questionId: string,
        index: number,
        totalQuestions: number,
        generation: number,
      ) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
          const response =
            await fetch(
              `/api/theory/practice?questionId=${encodeURIComponent(
                questionId,
              )}`,
              {
                method: "GET",
                cache: "no-store",
                credentials:
                  "same-origin",
              },
            );

          const data =
            await readApiData<TheoryQuestionView>(
              response,
            );

          if (
            generation !==
            generationRef.current
          ) {
            return;
          }

          setQuestion({
            ...data,
            position:
              index + 1,
            totalQuestions,
          });
        } catch (loadError) {
          if (
            generation !==
            generationRef.current
          ) {
            return;
          }

          setQuestion(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Die Frage konnte nicht geladen werden.",
          );
        } finally {
          if (
            generation ===
            generationRef.current
          ) {
            setLoading(false);
          }
        }
      },
      [],
    );

  const startSession =
    useCallback(
      async () => {
        const generation =
          generationRef.current +
          1;

        generationRef.current =
          generation;

        setLoading(true);
        setSubmitting(false);
        setFinishing(false);
        setError(null);
        setResult(null);
        setQuestion(null);
        setSession(null);

        try {
          const response =
            await fetch(
              "/api/theory/practice",
              {
                method: "POST",
                credentials:
                  "same-origin",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify(
                  {
                    action:
                      "start",
                    kind:
                      mode,
                    topicId:
                      mode ===
                      "topic"
                        ? topicId
                        : null,
                  },
                ),
              },
            );

          const data =
            await readApiData<PracticeStartData>(
              response,
            );

          if (
            generation !==
            generationRef.current
          ) {
            return;
          }

          if (
            !data.questionIds
              .length
          ) {
            throw new Error(
              "Für dieses Training sind derzeit keine Fragen verfügbar.",
            );
          }

          startedAtRef.current =
            Date.now();

          const nextSession:
            TheoryPracticeSessionView = {
              id:
                data.sessionId,
              title:
                mode ===
                  "topic" &&
                topicTitle
                  ? topicTitle
                  : MODE_TITLES[
                      mode
                    ],
              mode,
              questionIds:
                data.questionIds,
              currentIndex:
                0,
              answeredCount:
                0,
              correctCount:
                0,
              completed:
                false,
            };

          setSession(
            nextSession,
          );

          await loadQuestion(
            data.questionIds[0],
            0,
            data.questionIds
              .length,
            generation,
          );
        } catch (startError) {
          if (
            generation !==
            generationRef.current
          ) {
            return;
          }

          setError(
            startError instanceof Error
              ? startError.message
              : "Das Training konnte nicht gestartet werden.",
          );
          setLoading(false);
        }
      },
      [
        loadQuestion,
        mode,
        topicId,
        topicTitle,
      ],
    );

  const startKey =
    `${mode}:${topicId ?? ""}`;

  useEffect(() => {
    if (
      startedKeyRef.current ===
      startKey
    ) {
      return;
    }

    startedKeyRef.current =
      startKey;

    void startSession();
  }, [
    startKey,
    startSession,
  ]);

  const finishSession =
    useCallback(
      async (
        markCompleted: boolean,
      ) => {
        if (
          !session ||
          finishing
        ) {
          return;
        }

        setFinishing(true);
        setError(null);

        try {
          const response =
            await fetch(
              "/api/theory/practice",
              {
                method: "POST",
                credentials:
                  "same-origin",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify(
                  {
                    action:
                      "finish",
                    sessionId:
                      session.id,
                    activeDurationSeconds:
                      activeDurationSeconds(
                        startedAtRef.current,
                      ),
                  },
                ),
              },
            );

          await readApiData<unknown>(
            response,
          );

          if (markCompleted) {
            setSession(
              (current) =>
                current
                  ? {
                      ...current,
                      completed:
                        true,
                    }
                  : current,
            );
          }
        } catch (finishError) {
          setError(
            finishError instanceof Error
              ? finishError.message
              : "Das Training konnte nicht abgeschlossen werden.",
          );
        } finally {
          setFinishing(false);
        }
      },
      [
        finishing,
        session,
      ],
    );

  const submitAnswer =
    useCallback(
      async (
        selected:
          readonly string[],
      ) => {
        if (
          !session ||
          !question ||
          result ||
          submitting
        ) {
          return;
        }

        setSubmitting(true);
        setError(null);

        try {
          const response =
            await fetch(
              `/api/theory/questions/${encodeURIComponent(
                question.id,
              )}/answer`,
              {
                method: "POST",
                credentials:
                  "same-origin",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify(
                  {
                    sessionId:
                      session.id,
                    selectedOptionIds:
                      selected,
                  },
                ),
              },
            );

          const data =
            await readApiData<TheoryQuestionResultView>(
              response,
            );

          setResult(data);

          setSession(
            (current) =>
              current
                ? {
                    ...current,
                    answeredCount:
                      Math.min(
                        current
                          .questionIds
                          .length,
                        current
                          .answeredCount +
                          1,
                      ),
                    correctCount:
                      current
                        .correctCount +
                      (
                        data.correct
                          ? 1
                          : 0
                      ),
                  }
                : current,
          );
        } catch (submitError) {
          setError(
            submitError instanceof Error
              ? submitError.message
              : "Die Antwort konnte nicht geprüft werden.",
          );
        } finally {
          setSubmitting(false);
        }
      },
      [
        question,
        result,
        session,
        submitting,
      ],
    );

  const nextQuestion =
    useCallback(() => {
      if (
        !session ||
        !result ||
        loading ||
        finishing
      ) {
        return;
      }

      const nextIndex =
        session.currentIndex +
        1;

      if (
        nextIndex >=
        session.questionIds
          .length
      ) {
        void finishSession(
          true,
        );
        return;
      }

      const generation =
        generationRef.current;

      setSession(
        (current) =>
          current
            ? {
                ...current,
                currentIndex:
                  nextIndex,
              }
            : current,
      );

      void loadQuestion(
        session.questionIds[
          nextIndex
        ],
        nextIndex,
        session.questionIds
          .length,
        generation,
      );
    },
    [
      finishSession,
      finishing,
      loadQuestion,
      loading,
      result,
      session,
    ]);

  const exitPractice =
    useCallback(() => {
      const goBack = () => {
        router.push(
          "/theorie/uebungen",
        );
        router.refresh();
      };

      if (!session) {
        goBack();
        return;
      }

      void (async () => {
        await finishSession(
          false,
        );
        goBack();
      })();
    },
    [
      finishSession,
      router,
      session,
    ]);

  const retry =
    useCallback(() => {
      startedKeyRef.current =
        startKey;
      void startSession();
    }, [
      startKey,
      startSession,
    ]);

  if (
    loading &&
    !session
  ) {
    return (
      <div className="mt-5 rounded-[16px] border border-[#E5EAF2] bg-white p-6">
        <div className="flex items-center gap-3 text-[#53647A]">
          <Loader2 className="h-4 w-4 animate-spin text-[#0B63F6]" />
          <p className="text-[10px] font-semibold">
            Training wird vorbereitet...
          </p>
        </div>
      </div>
    );
  }

  if (
    error &&
    !session
  ) {
    return (
      <div className="mt-5 rounded-[16px] border border-[#F2C7C7] bg-[#FFF8F8] p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#D93B3B]" />

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold text-[#A92F2F]">
              Training konnte nicht gestartet werden
            </p>

            <p className="mt-1 text-[10px] leading-5 text-[#6F5A5A]">
              {error}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={retry}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#0B63F6] px-4 text-[9px] font-extrabold text-white hover:bg-[#0958DC]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Erneut versuchen
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/theorie/uebungen",
                  )
                }
                className="inline-flex min-h-9 items-center rounded-lg border border-[#DDE5EF] bg-white px-4 text-[9px] font-extrabold text-[#53647A] hover:bg-[#F7F9FC]"
              >
                Zur Auswahl
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (session.completed) {
    const percent =
      session.questionIds
        .length > 0
        ? Math.round(
            (
              session.correctCount /
              session.questionIds
                .length
            ) * 100,
          )
        : 0;

    return (
      <div className="mt-5 rounded-[18px] border border-[#BFE8D7] bg-white p-6 text-center shadow-[0_8px_24px_rgba(17,40,70,0.04)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F2FBF7]">
          <CheckCircle2 className="h-6 w-6 text-[#10A36A]" />
        </span>

        <h2 className="mt-4 text-[16px] font-extrabold text-[#081529]">
          Training abgeschlossen
        </h2>

        <p className="mt-1 text-[10px] leading-5 text-[#66758A]">
          {session.correctCount} von {session.questionIds.length} Fragen richtig beantwortet.
        </p>

        <p className="mt-3 text-[24px] font-extrabold text-[#0B63F6]">
          {percent}%
        </p>

        {error ? (
          <p className="mx-auto mt-3 max-w-[560px] rounded-xl bg-[#FFF6F6] px-3 py-2 text-[9px] leading-4 text-[#B23B3B]">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => {
            router.push(
              "/theorie/uebungen",
            );
            router.refresh();
          }}
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white hover:bg-[#0958DC]"
        >
          Neue Übung wählen
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <PracticeSession
        session={session}
        onExit={
          exitPractice
        }
      />

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#F2C7C7] bg-[#FFF8F8] px-3 py-2.5">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D93B3B]" />
          <p className="text-[9px] leading-4 text-[#A84949]">
            {error}
          </p>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[18px] border border-[#E5EAF2] bg-white p-6">
          <div className="flex items-center gap-3 text-[#53647A]">
            <Loader2 className="h-4 w-4 animate-spin text-[#0B63F6]" />
            <p className="text-[10px] font-semibold">
              Frage wird geladen...
            </p>
          </div>
        </div>
      ) : question ? (
        <QuestionPlayer
          question={
            question
          }
          result={result}
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

      {finishing ? (
        <div className="mt-3 flex items-center justify-center gap-2 text-[9px] font-semibold text-[#66758A]">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0B63F6]" />
          Training wird gespeichert...
        </div>
      ) : null}
    </div>
  );
}
