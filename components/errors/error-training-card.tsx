import Link from "next/link";

import {
  CheckCircle2,
  PlayCircle,
  RotateCcw,
} from "lucide-react";

export interface ErrorTrainingCardProps {
  needsReviewCount:
    number;
  ready:
    boolean;
  onStart:
    () => void;
}

export function ErrorTrainingCard({
  needsReviewCount,
  ready,
  onStart,
}: ErrorTrainingCardProps) {
  const canStart =
    ready &&
    needsReviewCount >
      0;

  if (
    ready &&
    needsReviewCount ===
      0
  ) {
    return (
      <section className="rounded-[20px] border border-[#BFE8D7] bg-[#F7FCF9] p-5 shadow-[0_10px_28px_rgba(17,40,70,0.035)] lg:p-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0C8B59] shadow-[0_4px_14px_rgba(17,40,70,0.05)]">
          <CheckCircle2
            className="h-4.5 w-4.5"
            aria-hidden="true"
          />
        </span>

        <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0C8B59]">
          Sehr gut
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Keine offenen Fehlerfragen
        </h2>

        <p className="mt-1.5 max-w-[520px] text-[10px] font-medium leading-5 text-[#66758A]">
          Aktuell musst du keine Frage wiederholen. Du kannst direkt mit einem neuen Training weitermachen.
        </p>

        <Link
          href="/trainieren"
          className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0B63F6] px-5 text-[9px] font-extrabold text-white"
        >
          Zum Training
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.04)] lg:p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF2F2] text-[#C43737]">
        <RotateCcw
          className="h-4.5 w-4.5"
          aria-hidden="true"
        />
      </span>

      <p className="mt-4 text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
        Fehler wiederholen
      </p>

      <h2 className="mt-1 text-[18px] font-black tracking-[-0.02em] text-[#081529]">
        {needsReviewCount} {needsReviewCount === 1 ? "Frage wartet" : "Fragen warten"} auf dich
      </h2>

      <p className="mt-1.5 max-w-[520px] text-[10px] font-medium leading-5 text-[#718096]">
        Arbeite deine offenen Fehlerfragen nacheinander durch. Jede Antwort wird über den bestehenden Theorie-Service gespeichert und ausgewertet.
      </p>

      <button
        type="button"
        disabled={
          !canStart
        }
        onClick={
          onStart
        }
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white transition hover:bg-[#0958DC] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <PlayCircle
          className="h-4 w-4"
          aria-hidden="true"
        />
        Fehlertraining starten
      </button>
    </section>
  );
}
