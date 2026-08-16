"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { ExamHistory } from "@/components/theory/results/exam-history";
import { ExamResultDetail } from "@/components/theory/results/exam-result-detail";
import type { ExamHistoryItem } from "@/components/theory/results/exam-result-card";

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: {
    message?: string;
  };
}

export function ExamResultsPage() {
  const [results, setResults] =
    useState<readonly ExamHistoryItem[]>([]);

  const [selected, setSelected] =
    useState<ExamHistoryItem | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/theory/exams",
        {
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const payload =
        (await response.json()) as ApiEnvelope<
          readonly ExamHistoryItem[]
        >;

      if (
        !response.ok ||
        !payload.ok ||
        !payload.data
      ) {
        throw new Error(
          payload.error?.message ??
            "Prüfungsergebnisse konnten nicht geladen werden.",
        );
      }

      const data = payload.data;

      setResults(data);

      setSelected((current) => {
        if (current) {
          const stillExists = data.some(
            (item) => item.id === current.id,
          );

          if (stillExists) {
            return current;
          }
        }

        return data[0] ?? null;
      });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Prüfungsergebnisse konnten nicht geladen werden.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-3 py-5 lg:px-7 lg:py-7">
      <Link
        href="/theorie"
        className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#5F6F84] transition-colors hover:text-[#0B63F6]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Theorieübersicht
      </Link>

      <div className="mt-4">
        <h1 className="text-[22px] font-extrabold text-[#081529]">
          Prüfungsergebnisse
        </h1>

        <p className="mt-1 text-[10px] text-[#66758A]">
          Deine abgeschlossenen Theorie-Simulationen und deren
          serverseitig berechnete Ergebnisse.
        </p>
      </div>

      {loading ? (
        <div className="mt-6 flex min-h-56 items-center justify-center rounded-[16px] border border-[#E5EAF2] bg-white">
          <Loader2 className="h-5 w-5 animate-spin text-[#0B63F6]" />
        </div>
      ) : error ? (
        <div className="mt-6 rounded-[16px] border border-[#F4CACA] bg-[#FFF8F8] p-5 text-center">
          <AlertTriangle className="mx-auto h-5 w-5 text-[#EF4444]" />

          <p className="mt-2 text-[10px] font-bold text-[#A52F2F]">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 rounded-lg border border-[#E9B8B8] px-4 py-2 text-[9px] font-extrabold text-[#A52F2F] transition-colors hover:bg-[#FFF1F1]"
          >
            Erneut laden
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <ExamHistory
            results={results}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
          />

          <ExamResultDetail result={selected} />
        </div>
      )}
    </div>
  );
}