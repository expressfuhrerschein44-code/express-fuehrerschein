"use client";

import { useEffect, useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";

export interface QuestionFavoriteButtonProps {
  questionId: string;
  initialFavorite?: boolean;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  onChange?: (favorite: boolean) => void;
}

interface FavoriteApiResponse {
  ok?: boolean;
  data?: {
    favorite?: boolean;
  };
  error?: {
    message?: string;
  };
}

export function QuestionFavoriteButton({
  questionId,
  initialFavorite = false,
  disabled = false,
  compact = false,
  className = "",
  onChange,
}: QuestionFavoriteButtonProps) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFavorite(initialFavorite);
    setError(null);
  }, [initialFavorite, questionId]);

  async function toggleFavorite() {
    if (!questionId || saving || disabled) return;

    const nextFavorite = !favorite;
    const previousFavorite = favorite;

    setSaving(true);
    setError(null);
    setFavorite(nextFavorite);

    try {
      const response = await fetch("/api/theory/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          questionId,
          favorite: nextFavorite,
        }),
      });

      const payload = await response.json() as FavoriteApiResponse;

      if (!response.ok || payload.ok !== true) {
        throw new Error(
          payload.error?.message
            ?? "Markierung konnte nicht gespeichert werden.",
        );
      }

      const persisted = typeof payload.data?.favorite === "boolean"
        ? payload.data.favorite
        : nextFavorite;

      setFavorite(persisted);
      onChange?.(persisted);
    } catch (cause) {
      setFavorite(previousFavorite);
      setError(
        cause instanceof Error
          ? cause.message
          : "Markierung konnte nicht gespeichert werden.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <button
        type="button"
        aria-pressed={favorite}
        aria-label={favorite ? "Frage aus Favoriten entfernen" : "Frage zu Favoriten hinzufügen"}
        disabled={disabled || saving || !questionId}
        onClick={() => void toggleFavorite()}
        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#E0E6EF] bg-white px-3 text-[9px] font-extrabold text-[#53647A] transition hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63F6]/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        ) : (
          <Bookmark
            className={`h-3.5 w-3.5 ${favorite ? "fill-current text-[#0B63F6]" : ""}`}
            aria-hidden="true"
          />
        )}
        {!compact ? (favorite ? "Markiert" : "Frage merken") : null}
      </button>

      {error ? (
        <p role="alert" className="mt-1 max-w-[260px] text-[9px] font-semibold text-[#D9363E]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
