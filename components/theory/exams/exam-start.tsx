"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Loader2, LockKeyhole, Play } from "lucide-react";

interface ExamConfiguration {
  id: string;
  version: string;
  questionCount: number;
  durationSeconds: number;
  scoringMethod: string;
  passingRule: unknown;
}

export interface StartedExam {
  attemptId: string;
  startedAt: string;
  configuration: ExamConfiguration;
  questionIds: readonly string[];
}

interface ApiEnvelope<T> {
  ok: boolean;
  data?: T;
  error?: { message?: string };
}

export interface ExamStartProps {
  onStarted?: (exam: StartedExam) => void;
}

function durationLabel(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} Min`;
}

function passingRuleLabels(value: unknown): readonly string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const record = value as Record<string, unknown>;
  const result: string[] = [];
  const requireAll = record.requireAllAnswered ?? record.require_all_answered;
  const minimum = record.minimumScorePercent ?? record.minimum_score_percent;
  const maximum = record.maximumPenaltyPoints ?? record.maximum_penalty_points;
  if (requireAll === true) result.push("Alle Fragen müssen beantwortet werden");
  if (typeof minimum === "number") result.push(`Mindestens ${Math.round(minimum)}%`);
  if (typeof maximum === "number") result.push(`Maximal ${Math.round(maximum)} Fehlerpunkte`);
  return result;
}

export function ExamStart({ onStarted }: ExamStartProps) {
  const [configuration, setConfiguration] = useState<ExamConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/theory/exams?action=configuration", { credentials: "same-origin", cache: "no-store" });
      const payload = (await response.json()) as ApiEnvelope<ExamConfiguration>;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Prüfungskonfiguration ist nicht verfügbar.");
      }
      setConfiguration(payload.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Prüfungskonfiguration ist nicht verfügbar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfiguration();
  }, [loadConfiguration]);

  const rules = useMemo(() => passingRuleLabels(configuration?.passingRule), [configuration]);

  async function start() {
    if (starting || !configuration) return;
    setStarting(true);
    setError(null);
    try {
      const response = await fetch("/api/theory/exams", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      const payload = (await response.json()) as ApiEnvelope<StartedExam>;
      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Prüfungssimulation konnte nicht gestartet werden.");
      }
      onStarted?.(payload.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Prüfungssimulation konnte nicht gestartet werden.");
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return <div className="flex min-h-56 items-center justify-center rounded-[18px] border border-[#E5EAF2] bg-white"><Loader2 className="h-5 w-5 animate-spin text-[#0B63F6]" /></div>;
  }

  return (
    <section className="rounded-[18px] border border-[#E5EAF2] bg-white p-5 shadow-[0_8px_24px_rgba(17,40,70,0.04)] lg:p-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF5FF] text-[#0B63F6]"><ClipboardCheck className="h-6 w-6" /></span>
      <h1 className="mt-4 text-[22px] font-extrabold text-[#081529]">Prüfungssimulation</h1>
      <p className="mt-1 text-[10px] leading-5 text-[#66758A]">Die Regeln werden ausschließlich aus der veröffentlichten serverseitigen Prüfungs-Konfiguration geladen.</p>

      {configuration ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Info label="Fragen" value={String(configuration.questionCount)} />
          <Info label="Dauer" value={durationLabel(configuration.durationSeconds)} />
          <Info label="Version" value={configuration.version} />
        </div>
      ) : null}

      {rules.length > 0 ? (
        <div className="mt-4 rounded-[14px] bg-[#F7F9FC] p-4">
          <p className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#718094]">Bestehensregeln</p>
          <ul className="mt-2 space-y-1 text-[9px] text-[#53647A]">{rules.map((rule) => <li key={rule}>• {rule}</li>)}</ul>
        </div>
      ) : null}

      <div className="mt-4 flex items-start gap-2 rounded-[14px] border border-[#DDE7F4] bg-[#F8FAFD] p-3">
        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#0B63F6]" />
        <p className="text-[8px] leading-4 text-[#53647A]">Richtige Antworten werden während einer laufenden Simulation nicht vorzeitig angezeigt. Die Auswertung erfolgt serverseitig.</p>
      </div>

      {error ? <p role="alert" className="mt-3 rounded-xl bg-[#FFF2F2] px-3 py-2 text-[9px] font-semibold text-[#C83B3B]">{error}</p> : null}

      <button type="button" disabled={starting || !configuration} onClick={() => void start()} className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white disabled:opacity-55">
        {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {starting ? "Wird gestartet…" : "Simulation starten"}
      </button>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[14px] bg-[#F7F9FC] p-3"><p className="text-[8px] font-semibold text-[#718094]">{label}</p><p className="mt-1 text-[14px] font-extrabold text-[#081529]">{value}</p></div>;
}
