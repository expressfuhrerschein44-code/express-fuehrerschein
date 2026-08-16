/**
 * Express-Führerschein
 * Read-only profile field.
 */

import type {
  ReactNode,
} from "react";

import {
  ProfileEmptyValue,
} from "@/components/profile/shared/profile-empty-value";

import {
  cn,
} from "@/lib/utils";

export interface ProfileFieldProps {
  label:
    string;

  value?:
    ReactNode;

  className?:
    string;
}

export function ProfileField({
  label,
  value,
  className,
}: ProfileFieldProps) {
  const empty =
    value ===
      null ||
    value ===
      undefined ||
    value ===
      "";

  return (
    <div
      className={cn(
        "min-w-0 border-b border-[#E8EDF3] pb-3",
        className,
      )}
    >
      <p
        className="text-[10px] font-medium text-[#68788B]"
      >
        {label}
      </p>

      <div
        className="mt-2 break-words text-[11px] font-semibold leading-5 text-[#172233]"
      >
        {empty ? (
          <ProfileEmptyValue />
        ) : (
          value
        )}
      </div>
    </div>
  );
}
