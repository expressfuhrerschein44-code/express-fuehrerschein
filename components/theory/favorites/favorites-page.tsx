"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2, Star } from "lucide-react";

import { FavoriteQuestionCard, type TheoryFavoriteItem } from "@/components/theory/favorites/favorite-question-card";
import { FavoritesEmptyState } from "@/components/theory/favorites/favorites-empty-state";

interface FavoritesPayload {
  capability: { supported: true; reason: string };
  questionIds: readonly string[];
  questions: readonly TheoryFavoriteItem[];
}

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: { message?: string };
}

export function FavoritesPage() {
  const [items, setItems] = useState<readonly TheoryFavoriteItem[]>([]);
  const [reason, setReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/theory/favorites?take=200", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiEnvelope<FavoritesPayload>;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Favoriten konnten nicht geladen werden.");
      }
      setItems(payload.data.questions);
      setReason(payload.data.capability.reason);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Favoriten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function remove(questionId: string) {
    setItems((current) => current.filter((item) => item.id !== questionId));
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 py-5 lg:px-7 lg:py-7">
      <Link href="/theorie" className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5F6F84] hover:text-[#0B63F6]">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Theorieübersicht
      </Link>

      <div className="mt-4 flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7E8] text-[#F59E0B]"><Star className="h-5 w-5" /></span>
        <div>
          <h1 className="text-[22px] font-extrabold text-[#081529]">Favoriten</h1>
          <p className="mt-1 text-[9px] leading-4 text-[#66758A]">{reason ?? "Deine gespeicherten Theoriefragen."}</p>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 flex min-h-48 items-center justify-center rounded-[16px] border border-[#E5EAF2] bg-white"><Loader2 className="h-5 w-5 animate-spin text-[#0B63F6]" aria-label="Wird geladen" /></div>
      ) : error ? (
        <div className="mt-6 rounded-[16px] border border-[#F4CACA] bg-[#FFF8F8] p-5 text-center">
          <AlertTriangle className="mx-auto h-5 w-5 text-[#EF4444]" />
          <p className="mt-2 text-[10px] font-bold text-[#A52F2F]">{error}</p>
          <button type="button" onClick={() => void load()} className="mt-3 rounded-lg border border-[#E9B8B8] px-4 py-2 text-[9px] font-extrabold text-[#A52F2F]">Erneut laden</button>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6"><FavoritesEmptyState /></div>
      ) : (
        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {items.map((item) => <FavoriteQuestionCard key={item.id} question={item} onRemoved={remove} />)}
        </div>
      )}
    </div>
  );
}
