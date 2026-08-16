"use client";

import {
  useEffect,
} from "react";

import {
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export default function TheorieError({
  error,
  reset,
}: {
  error:
    Error & {
      digest?:
        string;
    };

  reset:
    () =>
      void;
}) {
  useEffect(
    () => {
      console.error(
        "[THEORIE_PAGE_ERROR]",
        error,
      );
    },
    [
      error,
    ],
  );

  return (
    <div className="mx-auto flex min-h-[420px] w-full max-w-[900px] items-center justify-center px-3 py-8 lg:px-7">
      <div className="w-full rounded-[18px] border border-[#F0D9D9] bg-white px-5 py-12 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF2F2] text-[#EF4444]">
          <AlertCircle className="h-5 w-5" />
        </span>

        <h1 className="mt-4 text-[18px] font-extrabold text-[#081529]">
          Die Daten konnten nicht geladen werden.
        </h1>

        <p className="mx-auto mt-2 max-w-[520px] text-[11px] leading-5 text-[#66758A]">
          Bitte versuche es erneut. Deine gespeicherten Lernfortschritte werden dadurch nicht gelöscht.
        </p>

        <button
          type="button"
          onClick={
            reset
          }
          className="mt-5 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white transition hover:bg-[#0958DC]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
