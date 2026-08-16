/**
 * Express-Führerschein
 * Shared large dashboard statistic.
 */

import type {
  ReactNode,
} from "react";

import {
  cn,
} from "@/lib/utils";

export interface DashboardStatValueProps {
  value:
    ReactNode;

  suffix?:
    ReactNode;

  className?:
    string;

  suffixClassName?:
    string;

  positive?:
    boolean;
}

export function DashboardStatValue({
  value,
  suffix,
  className,
  suffixClassName,
  positive =
    false,
}: DashboardStatValueProps) {
  return (
    <div
      className={cn(
        "flex items-end gap-1.5",
        className,
      )}
    >
      <span
        className={cn(
          "text-[38px] font-black leading-none tracking-[-0.04em]",
          positive
            ? "text-[#00A86B]"
            : "text-[#0F1B31]",
        )}
      >
        {value}
      </span>

      {suffix ? (
        <span
          className={cn(
            "pb-0.5 text-[18px] font-black leading-none text-inherit",
            suffixClassName,
          )}
        >
          {suffix}
        </span>
      ) : null}
    </div>
  );
}
