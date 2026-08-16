"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  LockKeyhole,
} from "lucide-react";

export interface LessonNavigationProps {
  canGoBack: boolean;
  isLastBlock: boolean;
  disabled?: boolean;
  busy?: boolean;
  nextLocked?: boolean;
  onPrevious: () => Promise<void> | void;
  onNext: () => Promise<void> | void;
}

export function LessonNavigation({
  canGoBack,
  isLastBlock,
  disabled = false,
  busy = false,
  nextLocked = false,
  onPrevious,
  onNext,
}: LessonNavigationProps) {
  const nextDisabled = disabled || busy || nextLocked;

  return (
    <nav
      aria-label="Navigation innerhalb der Lektion"
      className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <button
        type="button"
        disabled={!canGoBack || busy}
        onClick={() => void onPrevious()}
        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[#DCE4EF] bg-white px-4 text-[10px] font-extrabold text-[#53647A] transition hover:bg-[#F7F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFD7FF] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Zurück
      </button>

      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        {nextLocked ? (
          <p className="inline-flex items-center justify-center gap-1 text-[8px] font-semibold text-[#7A899C] sm:justify-end">
            <LockKeyhole className="h-3 w-3" aria-hidden="true" />
            Beantworte zuerst die Wissensfrage.
          </p>
        ) : null}

        <button
          type="button"
          disabled={nextDisabled}
          onClick={() => void onNext()}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white transition hover:bg-[#0959DC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#BFD7FF] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : isLastBlock ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {busy
            ? "Wird gespeichert..."
            : isLastBlock
              ? "Lektion abschließen"
              : "Weiter"}
        </button>
      </div>
    </nav>
  );
}
