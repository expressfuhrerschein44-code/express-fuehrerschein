/**
 * Express-Führerschein
 * Small navigation badge.
 */

import {
  cn,
} from "@/lib/utils";

export interface ClientNotificationBadgeProps {
  count:
    number | null | undefined;

  className?:
    string;
}

export function ClientNotificationBadge({
  count,
  className,
}: ClientNotificationBadgeProps) {
  const normalized =
    Math.max(
      0,
      count ??
        0,
    );

  if (
    normalized <=
    0
  ) {
    return null;
  }

  const label =
    normalized >
    99
      ? "99+"
      : String(
          normalized,
        );

  return (
    <span
      aria-label={`${normalized} ungelesen`}
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full bg-[#0878FF] px-1.5 py-0.5 text-[10px] font-extrabold leading-4 text-white shadow-[0_0_0_2px_rgba(8,120,255,0.10)]",
        className,
      )}
    >
      {label}
    </span>
  );
}
