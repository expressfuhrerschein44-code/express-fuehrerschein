"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Clock3,
  ListChecks,
  Shuffle,
  Star,
} from "lucide-react";

export type PracticeMode =
  | "random"
  | "topic"
  | "errors"
  | "favorites"
  | "quick";

const MODE_ICONS: Record<PracticeMode, LucideIcon> = {
  random: Shuffle,
  topic: ListChecks,
  errors: AlertTriangle,
  favorites: Star,
  quick: Clock3,
};

export interface PracticeModeCardProps {
  mode: PracticeMode;
  title: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  badge?: string | null;
  onSelect?: (mode: PracticeMode) => void;
}

export function PracticeModeCard({
  mode,
  title,
  description,
  selected = false,
  disabled = false,
  badge = null,
  onSelect,
}: PracticeModeCardProps) {
  const Icon = MODE_ICONS[mode];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.(mode)}
      aria-pressed={selected}
      className={[
        "group w-full rounded-[16px] border p-4 text-left transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63F6]/30",
        selected
          ? "border-[#0B63F6] bg-[#F5F9FF] shadow-[0_8px_24px_rgba(11,99,246,0.08)]"
          : "border-[#E5EAF2] bg-white hover:border-[#C9D8EC] hover:shadow-[0_8px_24px_rgba(17,40,70,0.05)]",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <span
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            selected
              ? "bg-[#0B63F6] text-white"
              : "bg-[#EEF5FF] text-[#0B63F6] group-hover:bg-[#E5F0FF]",
          ].join(" ")}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-extrabold text-[#081529]">
              {title}
            </span>
            {badge ? (
              <span className="shrink-0 rounded-full bg-[#EEF5FF] px-2 py-1 text-[8px] font-extrabold text-[#0B63F6]">
                {badge}
              </span>
            ) : null}
          </span>

          <span className="mt-1 block text-[9px] leading-4 text-[#66758A]">
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}
