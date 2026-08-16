"use client";

/**
 * Express-Führerschein
 * Final submission button with duplicate-click protection.
 */

import {
  Loader2,
  Send,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

export interface ApplicationSubmitButtonProps {
  disabled:
    boolean;

  submitting:
    boolean;

  onSubmit:
    () =>
      Promise<void>;

  compact?:
    boolean;

  className?:
    string;
}

export function ApplicationSubmitButton({
  disabled,

  submitting,

  onSubmit,

  compact =
    false,

  className,
}: ApplicationSubmitButtonProps) {
  return (
    <button
      type="button"
      disabled={
        disabled ||
        submitting
      }
      onClick={
        () =>
          void onSubmit()
      }
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-[#0B63F6] font-extrabold text-white shadow-[0_8px_20px_rgba(11,99,246,0.18)] transition hover:bg-[#0757D8] disabled:cursor-not-allowed disabled:bg-[#A9C7F4] disabled:shadow-none",

        compact
          ? "min-h-12 w-full px-5 text-[12px]"
          : "min-h-11 w-full px-6 text-[12px]",

        className,
      )}
    >
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Anfrage wird gesendet…
        </>
      ) : (
        <>
          <Send className="h-4 w-4" />
          Antrag absenden
        </>
      )}
    </button>
  );
}
