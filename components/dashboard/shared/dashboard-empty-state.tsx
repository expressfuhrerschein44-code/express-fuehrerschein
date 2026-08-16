/**
 * Express-Führerschein
 * Shared dashboard empty state.
 */

import Link from "next/link";

import {
  cn,
} from "@/lib/utils";

export interface DashboardEmptyStateProps {
  title:
    string;

  description:
    string;

  actionLabel?:
    string;

  actionHref?:
    string;

  className?:
    string;
}

export function DashboardEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#CCD6E2] bg-white px-6 py-8 text-center",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF5FF] text-[#0878FF]"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>

      <h2
        className="text-[16px] font-extrabold text-[#101B2B]"
      >
        {title}
      </h2>

      <p
        className="mt-2 max-w-[420px] text-[12px] leading-5 text-[#6D7C8F]"
      >
        {description}
      </p>

      {actionLabel &&
      actionHref ? (
        <Link
          href={
            actionHref
          }
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-[#0878FF] px-5 text-[12px] font-bold text-white outline-none transition hover:bg-[#006DEB] focus-visible:ring-2 focus-visible:ring-[#0878FF] focus-visible:ring-offset-2"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
