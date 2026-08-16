/**
 * Express-Führerschein
 * Shared clickable action row.
 */

import type {
  ReactNode,
} from "react";

import {
  cn,
} from "@/lib/utils";

export interface ProfileActionRowProps {
  label:
    string;

  description?:
    string;

  icon:
    ReactNode;

  onClick:
    () => void;

  trailing?:
    ReactNode;

  destructive?:
    boolean;

  className?:
    string;
}

export function ProfileActionRow({
  label,
  description,
  icon,
  onClick,
  trailing,
  destructive =
    false,
  className,
}: ProfileActionRowProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left outline-none transition hover:bg-[#F7F9FC] focus-visible:ring-2 focus-visible:ring-[#0878FF]",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F5F8FC]",
          destructive
            ? "text-[#F04444]"
            : "text-[#52657D]",
        )}
      >
        {icon}
      </span>

      <span
        className="min-w-0 flex-1"
      >
        <span
          className={cn(
            "block text-[11px] font-semibold",
            destructive
              ? "text-[#F04444]"
              : "text-[#243348]",
          )}
        >
          {label}
        </span>

        {description ? (
          <span
            className="mt-0.5 block text-[9px] leading-4 text-[#8491A1]"
          >
            {description}
          </span>
        ) : null}
      </span>

      {trailing ?? (
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4 shrink-0 text-[#8A98A8]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path
            d="m7 4 6 6-6 6"
          />
        </svg>
      )}
    </button>
  );
}
