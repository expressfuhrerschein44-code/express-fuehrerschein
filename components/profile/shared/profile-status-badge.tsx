/**
 * Express-Führerschein
 * Profile status badge.
 */

import {
  cn,
} from "@/lib/utils";

export interface ProfileStatusBadgeProps {
  verified:
    boolean;

  className?:
    string;
}

export function ProfileStatusBadge({
  verified,
  className,
}: ProfileStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] font-bold",
        verified
          ? "bg-[#EDF8FF] text-[#0878FF]"
          : "bg-[#FFF7E7] text-[#B16A00]",
        className,
      )}
    >
      {verified ? (
        <svg
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle
            cx="8"
            cy="8"
            r="7"
          />
          <path
            d="m4.8 8.1 1.8 1.8 4.3-4.4"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <span
          aria-hidden="true"
        >
          !
        </span>
      )}

      {
        verified
          ? "Verifiziert"
          : "Nicht verifiziert"
      }
    </span>
  );
}
