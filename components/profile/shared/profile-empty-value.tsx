/**
 * Express-Führerschein
 * Consistent display for empty optional profile values.
 */

import {
  PROFILE_COPY,
} from "@/data/profile";

import {
  cn,
} from "@/lib/utils";

export interface ProfileEmptyValueProps {
  className?:
    string;
}

export function ProfileEmptyValue({
  className,
}: ProfileEmptyValueProps) {
  return (
    <span
      className={cn(
        "text-[#98A4B3]",
        className,
      )}
    >
      {
        PROFILE_COPY
          .notSpecified
      }
    </span>
  );
}
