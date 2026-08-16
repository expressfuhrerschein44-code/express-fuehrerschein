"use client";

/**
 * Express-Führerschein
 * Numbered mobile accordion section.
 */

import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

export interface ApplicationMobileSectionProps {
  step:
    number;

  title:
    string;

  meta?:
    string;

  complete?:
    boolean;

  open:
    boolean;

  onToggle:
    () =>
      void;

  children:
    React.ReactNode;
}

export function ApplicationMobileSection({
  step,

  title,

  meta,

  complete =
    false,

  open,

  onToggle,

  children,
}: ApplicationMobileSectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#E5EAF1] bg-white">
      <button
        type="button"
        aria-expanded={
          open
        }
        onClick={
          onToggle
        }
        className="flex w-full items-center gap-2.5 px-3 py-3 text-left"
      >
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black text-white",

            complete
              ? "bg-[#0B63F6]"
              : "bg-[#1677FF]",
          )}
        >
          {
            step
          }
        </span>

        <span className="min-w-0 flex-1 truncate text-[11px] font-extrabold text-[#16253B]">
          {
            title
          }
        </span>

        {meta ? (
          <span
            className={cn(
              "shrink-0 text-[9px] font-bold",

              complete
                ? "text-[#169B5E]"
                : "text-[#748397]",
            )}
          >
            {
              meta
            }
          </span>
        ) : null}

        {open ? (
          <ChevronUp className="h-3.5 w-3.5 shrink-0 text-[#758599]" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#758599]" />
        )}
      </button>

      {open ? (
        <div className="border-t border-[#EEF2F6] px-3 pb-3 pt-3">
          {
            children
          }
        </div>
      ) : null}
    </section>
  );
}
