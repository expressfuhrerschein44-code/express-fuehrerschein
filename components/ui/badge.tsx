import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: "hero" | "blue" | "neutral" | "success";
  dot?: boolean;
}

const variants = {
  hero:
    "border-white/[0.04] bg-[#12243A]/90 text-white",
  blue:
    "border-[#D8E9FF] bg-[#EEF6FF] text-[#0768DB]",
  neutral:
    "border-[#E1E7EF] bg-[#F5F7FA] text-[#536176]",
  success:
    "border-[#CDEEE2] bg-[#EAF9F3] text-[#087B57]",
} as const;

export function Badge({
  children,
  className,
  variant = "neutral",
  dot = false,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.035em] sm:text-[11px]",
        variants[variant],
        className,
      )}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="h-2 w-2 shrink-0 rounded-full bg-[#0878FF] shadow-[0_0_0_3px_rgba(8,120,255,0.08)]"
        />
      ) : null}

      {children}
    </span>
  );
}
