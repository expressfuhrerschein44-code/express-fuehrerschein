"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

import { ErrorQuestionCard, type TheoryErrorItem } from "@/components/theory/errors/error-question-card";
import { ErrorSummary } from "@/components/theory/errors/error-summary";
import { ErrorTrainingCta } from "@/components/theory/errors/error-training-cta";

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: { message?: string };
}

export function ErrorPage() {
  const [questions, setQuestions] = useState<readonly TheoryErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/theory/errors?take=100", {
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as ApiEnvelope<readonly TheoryErrorItem[]>;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Fehlerfragen konnten nicht geladen werden.");
      }
      setQuestions(payload.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Fehlerfragen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 py-5 lg:px-7 lg:py-7">
      <Link href="/theorie" className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5F6F84] hover:text-[#0B63F6]">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Theorieübersicht
      </Link>

      <div className="mt-4">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#EF4444]">Wiederholen</p>
        <h1 className="mt-1 text-[22px] font-extrabold text-[#081529]">Meine Fehler</h1>
        <p className="mt-1 text-[10px] leading-5 text-[#66758A]">Hier erscheinen nur Fragen, die dein Lernfortschritt aktuell zur Wiederholung markiert.</p>
      </div>

      {loading ? (
        <div className="mt-6 flex min-h-48 items-center justify-center rounded-[16px] border border-[#E5EAF2] bg-white">
          <Loader2 className="h-5 w-5 animate-spin text-[#0B63F6]" aria-label="Wird geladen" />
        </div>
      ) : error ? (
        <div className="mt-6 rounded-[16px] border border-[#F4CACA] bg-[#FFF8F8] p-5 text-center">
          <AlertTriangle className="mx-auto h-5 w-5 text-[#EF4444]" aria-hidden="true" />
          <p className="mt-2 text-[10px] font-bold text-[#A52F2F]">{error}</p>
          <button type="button" onClick={() => void load()} className="mt-3 rounded-lg border border-[#E9B8B8] px-4 py-2 text-[9px] font-extrabold text-[#A52F2F]">Erneut laden</button>
        </div>
      ) : questions.length === 0 ? (
        <div className="mt-6 rounded-[16px] border border-[#D9EBDD] bg-[#F7FCF9] p-8 text-center">
          <p className="text-[12px] font-extrabold text-[#0C7D51]">Keine offenen Fehler</p>
          <p className="mt-1 text-[9px] text-[#5F7B6D]">Aktuell ist keine Frage zur Wiederholung markiert.</p>
        </div>
      ) : (
        <>
          <div className="mt-6"><ErrorSummary questions={questions} /></div>
          <div className="mt-4"><ErrorTrainingCta count={questions.length} /></div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {questions.map((question) => <ErrorQuestionCard key={question.id} question={question} />)}
          </div>
        </>
      )}
    </div>
  );
}
