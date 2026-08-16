"use client";

import { useMemo, useState } from "react";
import { Loader2, Play } from "lucide-react";

import {
  PracticeModeCard,
  type PracticeMode,
} from "@/components/theory/practice/practice-mode-card";

export interface PracticeStartedSession {
  sessionId: string;
  kind: PracticeMode;
  startedAt: string;
  questionIds: readonly string[];
}

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: {
    code?: string;
    message?: string;
  };
}

export interface PracticeStartProps {
  initialMode?: PracticeMode | null;
  topicId?: string | null;
  questionCount?: number;
  onStarted?: (session: PracticeStartedSession) => void;
}

const MODES: readonly {
  mode: PracticeMode;
  title: string;
  description: string;
  badge?: string;
}[] = [
  {
    mode: "random",
    title: "Zufällige Fragen",
    description: "Trainiere eine gemischte Auswahl aus deinem aktuellen Theorieprogramm.",
  },
  {
    mode: "topic",
    title: "Nach Thema",
    description: "Konzentriere dich auf den aktuell ausgewählten Themenbereich.",
  },
  {
    mode: "errors",
    title: "Meine Fehler",
    description: "Wiederhole nur Fragen, die aktuell noch zur Wiederholung markiert sind.",
  },
  {
    mode: "favorites",
    title: "Favoriten",
    description: "Trainiere gezielt Fragen, die du gespeichert hast.",
  },
  {
    mode: "quick",
    title: "Schnelltraining",
    description: "Starte eine kompakte Einheit für zwischendurch.",
    badge: "Kurz",
  },
];

export function PracticeStart({
  initialMode = null,
  topicId = null,
  questionCount,
  onStarted,
}: PracticeStartProps) {
  const [mode, setMode] = useState<PracticeMode>(initialMode ?? "random");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicMissing = mode === "topic" && !topicId;

  const selectedDescription = useMemo(
    () => MODES.find((item) => item.mode === mode)?.description ?? "",
    [mode],
  );

  async function start() {
    if (pending || topicMissing) return;

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/theory/practice", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          kind: mode,
          topicId: mode === "topic" ? topicId : null,
          ...(typeof questionCount === "number" ? { questionCount } : {}),
        }),
      });

      const payload = (await response.json()) as ApiEnvelope<PracticeStartedSession>;

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Training konnte nicht gestartet werden.");
      }

      onStarted?.(payload.data);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Training konnte nicht gestartet werden.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-[18px] border border-[#E5EAF2] bg-white p-4 shadow-[0_8px_24px_rgba(17,40,70,0.04)] lg:p-5">
      <div className="flex flex-col gap-1">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#0B63F6]">
          Training starten
        </p>
        <h2 className="text-[16px] font-extrabold text-[#081529]">
          Wähle deinen Trainingsmodus
        </h2>
        <p className="text-[10px] leading-5 text-[#66758A]">
          {selectedDescription}
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {MODES.map((item) => (
          <PracticeModeCard
            key={item.mode}
            mode={item.mode}
            title={item.title}
            description={item.description}
            badge={item.badge}
            selected={mode === item.mode}
            disabled={item.mode === "topic" && !topicId}
            onSelect={setMode}
          />
        ))}
      </div>

      {topicMissing ? (
        <p className="mt-3 rounded-xl bg-[#FFF7E8] px-3 py-2 text-[9px] font-semibold text-[#9A6500]">
          Öffne zuerst einen Themenbereich, um „Nach Thema“ zu verwenden.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 rounded-xl bg-[#FFF2F2] px-3 py-2 text-[9px] font-semibold text-[#C83B3B]">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={pending || topicMissing}
        onClick={start}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-4 text-[10px] font-extrabold text-white transition hover:bg-[#0959DE] disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Play className="h-4 w-4" aria-hidden="true" />
        )}
        {pending ? "Wird gestartet…" : "Training starten"}
      </button>
    </section>
  );
}
