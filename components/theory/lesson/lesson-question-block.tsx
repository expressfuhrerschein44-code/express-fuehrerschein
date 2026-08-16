"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Loader2,
  RefreshCcw,
} from "lucide-react";

import { QuestionPlayer } from "@/components/theory/questions/question-player";
import type {
  TheoryQuestionResultView,
  TheoryQuestionView,
} from "@/types/theory";

interface PublicQuestionPayload {
  id: string;
  topicId: string;
  questionType: string;
  penaltyPoints: number;
  mediaStoragePath?: string | null;
  prompt: string;
  answerOptions: unknown;
  favorite?: boolean;
}

interface AnswerPayload {
  correct: boolean;
  explanation: string | null;
  correctAnswer?: unknown;
}

export interface LessonQuestionBlockProps {
  questionId: string;
  title?: string | null;
  text?: string | null;
  onResolved?: () => Promise<void> | void;
}

function normalizeQuestionType(value: string): string {
  const normalized = value.trim().toUpperCase();
  const aliases: Record<string, string> = {
    SINGLE: "SINGLE_CHOICE",
    SINGLE_CHOICE: "SINGLE_CHOICE",
    MULTIPLE: "MULTIPLE_CHOICE",
    MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
    IMAGE: "IMAGE_CHOICE",
    IMAGE_CHOICE: "IMAGE_CHOICE",
    VIDEO: "VIDEO",
    NUMERIC: "NUMERIC",
    NUMBER: "NUMERIC",
  };

  return aliases[normalized] ?? normalized;
}

function normalizeOptions(value: unknown): TheoryQuestionView["options"] {
  if (!value) return [];

  const raw = Array.isArray(value)
    ? value
    : typeof value === "object"
      ? Object.entries(value as Record<string, unknown>).map(([key, item]) => {
          if (item && typeof item === "object" && !Array.isArray(item)) {
            return { id: key, ...(item as Record<string, unknown>) };
          }
          return { id: key, label: String(item ?? "") };
        })
      : [];

  return raw
    .map((item, index) => {
      if (typeof item === "string" || typeof item === "number") {
        return {
          id: String(index + 1),
          label: String(item),
        };
      }

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const record = item as Record<string, unknown>;
      const id =
        record.id
        ?? record.key
        ?? record.value
        ?? record.code
        ?? index + 1;
      const label =
        record.label
        ?? record.text
        ?? record.title
        ?? record.answer
        ?? record.value
        ?? "";
      const imageUrl =
        typeof record.imageUrl === "string"
          ? record.imageUrl
          : typeof record.image_url === "string"
            ? record.image_url
            : null;

      return {
        id: String(id),
        label: String(label),
        imageUrl,
      };
    })
    .filter((item): item is TheoryQuestionView["options"][number] => Boolean(item));
}

function correctOptionIds(value: unknown): readonly string[] | undefined {
  if (value === null || value === undefined) return undefined;

  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["answerIds", "selectedAnswers", "answers", "answer", "value", "id"]) {
      if (key in record) return correctOptionIds(record[key]);
    }
  }

  if (["string", "number", "boolean"].includes(typeof value)) {
    return [String(value)];
  }

  return undefined;
}

export function LessonQuestionBlock({
  questionId,
  title = null,
  text = null,
  onResolved,
}: LessonQuestionBlockProps) {
  const [question, setQuestion] = useState<PublicQuestionPayload | null>(null);
  const [result, setResult] = useState<TheoryQuestionResultView | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `/api/theory/questions?id=${encodeURIComponent(questionId)}`,
        { method: "GET", cache: "no-store" },
      );
      const payload = await response.json() as {
        ok?: boolean;
        data?: PublicQuestionPayload;
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Frage konnte nicht geladen werden.");
      }

      setQuestion(payload.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Frage konnte nicht geladen werden.",
      );
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const view = useMemo<TheoryQuestionView | null>(() => {
    if (!question) return null;

    return {
      id: question.id,
      topicId: question.topicId,
      questionType: normalizeQuestionType(question.questionType),
      penaltyPoints: question.penaltyPoints,
      mediaUrl: question.mediaStoragePath ?? null,
      prompt: question.prompt,
      options: normalizeOptions(question.answerOptions),
      favorite: question.favorite ?? false,
    };
  }, [question]);

  async function submit(selected: readonly string[]) {
    if (!question || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/theory/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "answer",
          questionId: question.id,
          answerPayload: selected,
          mode: "learning",
        }),
      });
      const payload = await response.json() as {
        ok?: boolean;
        data?: AnswerPayload;
        error?: { message?: string };
      };

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Antwort konnte nicht geprüft werden.");
      }

      setResult({
        correct: payload.data.correct,
        explanation: payload.data.explanation,
        correctOptionIds: correctOptionIds(payload.data.correctAnswer),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Antwort konnte nicht geprüft werden.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function setFavorite(favorite: boolean) {
    if (!question) return;

    const response = await fetch("/api/theory/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, favorite }),
    });

    if (!response.ok) return;

    setQuestion((current) => current ? { ...current, favorite } : current);
  }

  if (loading) {
    return (
      <section className="rounded-[18px] border border-[#E5EAF2] bg-white p-6 text-center">
        <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#0B63F6]" aria-hidden="true" />
        <p className="mt-2 text-[10px] font-semibold text-[#66758A]">
          Wissensfrage wird geladen...
        </p>
      </section>
    );
  }

  if (error || !view) {
    return (
      <section className="rounded-[18px] border border-[#F4D0D0] bg-[#FFF8F8] p-5 text-center">
        <AlertCircle className="mx-auto h-5 w-5 text-[#EF4444]" aria-hidden="true" />
        <p className="mt-2 text-[10px] font-extrabold text-[#B92F2F]">
          {error ?? "Frage konnte nicht geladen werden."}
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#E6C4C4] bg-white px-3 text-[9px] font-extrabold text-[#A23B3B]"
        >
          <RefreshCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Erneut versuchen
        </button>
      </section>
    );
  }

  return (
    <div>
      {title || text ? (
        <div className="mb-3 rounded-[14px] border border-[#DCE8F8] bg-[#F7FAFF] px-4 py-3">
          {title ? (
            <p className="text-[10px] font-extrabold text-[#081529]">
              {title}
            </p>
          ) : null}
          {text ? (
            <p className="mt-1 text-[10px] leading-5 text-[#66758A]">
              {text}
            </p>
          ) : null}
        </div>
      ) : null}

      <QuestionPlayer
        question={view}
        result={result}
        submitting={submitting}
        favoriteSupported
        onSubmit={submit}
        onFavoriteChange={setFavorite}
        onNext={() => void onResolved?.()}
      />
    </div>
  );
}
