/**
 * Express-Führerschein
 * 2FA status label.
 */

import {
  cn,
} from "@/lib/utils";

export interface TwoFactorStatusProps {
  enabled:
    boolean;

  className?:
    string;
}

export function TwoFactorStatus({
  enabled,
  className,
}: TwoFactorStatusProps) {
  return (
    <span
      className={cn(
        "text-[9px] font-bold",
        enabled
          ? "text-[#00A86B]"
          : "text-[#9A6B00]",
        className,
      )}
    >
      {
        enabled
          ? "Aktiv"
          : "Nicht aktiv"
      }
    </span>
  );
}
