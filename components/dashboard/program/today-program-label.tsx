/**
 * Express-Führerschein
 * Current-day program label.
 */

import {
  cn,
} from "@/lib/utils";

export interface TodayProgramLabelProps {
  className?:
    string;
}

export function TodayProgramLabel({
  className,
}: TodayProgramLabelProps) {
  return (
    <span
      className={cn(
        "mt-1 block text-center text-[9px] font-extrabold text-[#0878FF]",
        className,
      )}
    >
      Heute
    </span>
  );
}
