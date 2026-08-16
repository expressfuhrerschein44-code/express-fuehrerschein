/**
 * Express-Führerschein
 * Shared profile card shell.
 */

import type {
  HTMLAttributes,
  ReactNode,
} from "react";

import {
  cn,
} from "@/lib/utils";

export interface ProfileCardProps
  extends HTMLAttributes<HTMLDivElement> {
  children:
    ReactNode;

  interactive?:
    boolean;
}

export function ProfileCard({
  children,
  interactive =
    false,
  className,
  ...props
}: ProfileCardProps) {
  return (
    <section
      {...props}
      className={cn(
        "rounded-2xl border border-[#E3E8EF] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.035)]",
        interactive &&
          "transition-transform duration-200 hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </section>
  );
}
