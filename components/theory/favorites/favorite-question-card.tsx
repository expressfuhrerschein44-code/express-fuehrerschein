"use client";

import { useState } from "react";
import { Loader2, Star, Trash2 } from "lucide-react";

export interface TheoryFavoriteItem {
  id: string;
  topicId: string;
  topicTitle: string;
  prompt: string;
  questionType: string;
  penaltyPoints: number;
  createdAt: string;
}

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: { message?: string };
}

export interface FavoriteQuestionCardProps {
  question: TheoryFavoriteItem;
  onRemoved?: (questionId: string) => void;
}

export function FavoriteQuestionCard({ question, onRemoved }: FavoriteQuestionCardProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/theory/favorites", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, favorite: false }),
      });
      const payload = (await response.json()) as ApiEnvelope<{ favorite: boolean }>;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error?.message ?? "Favorit konnte nicht entfernt werden.");
      }
      onRemoved?.(question.id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Favorit konnte nicht entfernt werden.");
    } finally {
      setPending(false);
    }
  }

  return (
    <article className="rounded-[16px] border border-[#E5EAF2] bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF7E8] text-[#F59E0B]">
          <Star className="h-4 w-4 fill-current" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#0B63F6]">{question.topicTitle}</span>
            <span className="rounded-full bg-[#F7F9FC] px-2 py-1 text-[8px] font-semibold text-[#66758A]">{question.penaltyPoints} Fehlerpunkte</span>
          </div>
          <p className="mt-2 text-[11px] font-bold leading-5 text-[#081529]">{question.prompt}</p>
        </div>
      </div>

      {error ? <p role="alert" className="mt-3 text-[8px] font-semibold text-[#C83B3B]">{error}</p> : null}

      <button
        type="button"
        disabled={pending}
        onClick={() => void remove()}
        className="mt-4 inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#E1E7EF] px-3 text-[9px] font-extrabold text-[#66758A] hover:bg-[#F7F9FC] disabled:opacity-55"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        Entfernen
      </button>
    </article>
  );
}
