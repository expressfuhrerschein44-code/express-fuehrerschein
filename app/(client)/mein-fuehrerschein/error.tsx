"use client";

/**
 * Express-Führerschein
 * Route-level error boundary for "Mein Führerschein".
 */

import {
  useEffect,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export interface MeinFuehrerscheinErrorProps {
  error:
    Error & {
      digest?:
        string;
    };

  reset:
    () =>
      void;
}

export default function MeinFuehrerscheinError({
  error,

  reset,
}: MeinFuehrerscheinErrorProps) {
  useEffect(
    () => {
      console.error(
        "[MEIN_FUEHRERSCHEIN_PAGE_ERROR]",
        error,
      );
    },
    [
      error,
    ],
  );

  return (
    <div className="mx-auto flex min-h-[58vh] w-full max-w-[720px] items-center justify-center px-3">
      <div className="w-full rounded-2xl border border-[#F0D5D5] bg-white p-7 text-center shadow-[0_10px_30px_rgba(20,35,55,0.04)]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF2F2] text-[#D34C4C]">
          <AlertTriangle className="h-6 w-6" />
        </span>

        <h1 className="mt-4 text-[19px] font-black text-[#142238]">
          Der Antrag konnte nicht geladen werden.
        </h1>

        <p className="mx-auto mt-2 max-w-[520px] text-[12px] leading-6 text-[#68788C]">
          Bitte versuche es erneut. Deine bereits gespeicherten Daten bleiben erhalten.
        </p>

        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={
              reset
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-5 text-[11px] font-extrabold text-white transition hover:bg-[#0757D8]"
          >
            <RefreshCw className="h-4 w-4" />
            Erneut versuchen
          </button>

          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#DCE5EF] bg-white px-5 text-[11px] font-extrabold text-[#34465A] transition hover:bg-[#F8FAFC]"
          >
            Zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
