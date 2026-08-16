/**
 * Express-Führerschein
 * Shared section heading.
 */

import Link from "next/link";

import {
  cn,
} from "@/lib/utils";

export interface DashboardSectionHeaderProps {
  title:
    string;

  description?:
    string;

  actionLabel?:
    string;

  actionHref?:
    string;

  className?:
    string;

  inverse?:
    boolean;
}

export function DashboardSectionHeader({
  title,
  description,
  actionLabel,
  actionHref,
  className,
  inverse =
    false,
}: DashboardSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-start justify-between gap-4",
        className,
      )}
    >
      <div
        className="min-w-0"
      >
        <h2
          className={cn(
            "text-[15px] font-extrabold tracking-[-0.015em]",
            inverse
              ? "text-white"
              : "text-[#111C2B]",
          )}
        >
          {title}
        </h2>

        {description ? (
          <p
            className={cn(
              "mt-1 text-[11px] leading-5",
              inverse
                ? "text-[#9FB0C3]"
                : "text-[#6E7D90]",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {actionLabel &&
      actionHref ? (
        <Link
          href={
            actionHref
          }
          className={cn(
            "shrink-0 rounded-sm text-[11px] font-bold outline-none transition hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#0878FF]",
            inverse
              ? "text-[#3B9CFF]"
              : "text-[#006FF5]",
          )}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
