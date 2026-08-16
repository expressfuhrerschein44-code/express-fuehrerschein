/**
 * Express-Führerschein
 * Shared dashboard card shell.
 */

import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import {
  cn,
} from "@/lib/utils";

export interface DashboardCardProps
  extends HTMLAttributes<HTMLDivElement> {
  children:
    ReactNode;

  interactive?:
    boolean;

  dark?:
    boolean;
}

export function DashboardCard({
  children,
  className,
  interactive =
    false,
  dark =
    false,
  ...props
}: DashboardCardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl border shadow-[0_8px_30px_rgba(15,23,42,0.035)]",
        dark
          ? "border-white/[0.08] bg-[linear-gradient(180deg,#07182A_0%,#061426_100%)] text-white"
          : "border-[#E3E8EF] bg-white text-[#101B2B]",
        interactive &&
          "transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}
