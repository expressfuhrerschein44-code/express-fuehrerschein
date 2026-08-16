"use client";

import Link from "next/link";
import { CheckCircle2, RotateCcw, Target, XCircle } from "lucide-react";

export interface PracticeResultData {
  id: string;
  sessionType: string;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  scorePercent: number | null;
  durationSeconds: number;
}

export interface PracticeResultProps {
  result: PracticeResultData;
  onRestart?: () => void;
}

function durationLabel(seconds: number): string {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return minutes > 0 ? `${minutes} Min ${rest} Sek` : `${rest} Sek`;
}

export function PracticeResult({ result, onRestart }: PracticeResultProps) {
  const score = result.scorePercent ?? 0;

  return (
    <section className="rounded-[18px] border border-[#E5EAF2] bg-white p-5 text-center shadow-[0_8px_24px_rgba(17,40,70,0.04)]">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF8F2] text-[#10A36A]">
        <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
      </span>
      <p className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#718094]">
        Training abgeschlossen
      </p>
      <h2 className="mt-1 text-[20px] font-extrabold text-[#081529]">{score}%</h2>
      <p className="mt-1 text-[10px] text-[#66758A]">Aktive Lernzeit: {durationLabel(result.durationSeconds)}</p>

      <div className="mx-auto mt-5 grid max-w-[620px] gap-3 sm:grid-cols-3">
        <Metric icon={Target} label="Bearbeitet" value={result.questionsAnswered} />
        <Metric icon={CheckCircle2} label="Richtig" value={result.correctAnswers} />
        <Metric icon={XCircle} label="Falsch" value={result.incorrectAnswers} />
      </div>

      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        {onRestart ? (
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-4 text-[10px] font-extrabold text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Nochmal trainieren
          </button>
        ) : null}
        <Link
          href="/theorie"
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#DCE4EF] px-4 text-[10px] font-extrabold text-[#53647A]"
        >
          Zur Theorieübersicht
        </Link>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[14px] bg-[#F7F9FC] p-3 text-left">
      <Icon className="h-4 w-4 text-[#0B63F6]" aria-hidden="true" />
      <p className="mt-2 text-[18px] font-extrabold text-[#081529]">{value}</p>
      <p className="text-[8px] font-semibold text-[#718094]">{label}</p>
    </div>
  );
}
