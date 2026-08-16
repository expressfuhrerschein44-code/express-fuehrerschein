/**
 * Express-Führerschein
 * Shared profile section header.
 */

import {
  cn,
} from "@/lib/utils";

export interface ProfileSectionHeaderProps {
  title:
    string;

  description?:
    string;

  actionLabel?:
    string;

  onAction?:
    () => void;

  className?:
    string;
}

export function ProfileSectionHeader({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: ProfileSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4",
        className,
      )}
    >
      <div
        className="min-w-0"
      >
        <h2
          className="text-[15px] font-extrabold tracking-[-0.015em] text-[#111C2B]"
        >
          {title}
        </h2>

        {description ? (
          <p
            className="mt-1 text-[11px] leading-5 text-[#6E7D90]"
          >
            {description}
          </p>
        ) : null}
      </div>

      {actionLabel &&
      onAction ? (
        <button
          type="button"
          onClick={
            onAction
          }
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg bg-[#0878FF] px-3 text-[10px] font-bold text-white outline-none transition hover:bg-[#006DEB] focus-visible:ring-2 focus-visible:ring-[#0878FF] focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
