"use client";

/**
 * Express-Führerschein
 * Selectable driving-license class card.
 */

import Image from "next/image";

import {
  Check,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

import type {
  DrivingLicenseClassOption,
} from "@/types/driving-license-application";

export interface LicenseClassCardProps {
  item:
    DrivingLicenseClassOption;

  selected:
    boolean;

  onToggle:
    () =>
      void;

  compact?:
    boolean;
}

function formatPrice(
  cents:
    number,
): string {
  return new Intl.NumberFormat(
    "de-DE",
    {
      style:
        "currency",

      currency:
        "EUR",

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        0,
    },
  ).format(
    cents /
    100,
  );
}

export function LicenseClassCard({
  item,

  selected,

  onToggle,

  compact =
    false,
}: LicenseClassCardProps) {
  return (
    <button
      type="button"
      aria-pressed={
        selected
      }
      onClick={
        onToggle
      }
      className={cn(
        "group relative flex min-w-0 flex-col items-center rounded-xl border bg-white text-center transition",

        compact
          ? "min-h-[122px] px-2 py-3"
          : "min-h-[136px] px-3 py-3.5",

        selected
          ? "border-[#1677FF] bg-[#F8FBFF] shadow-[0_0_0_1px_rgba(22,119,255,0.08)]"
          : "border-[#E4EAF1] hover:border-[#B8C9DD] hover:bg-[#FBFCFE]",
      )}
    >
      <span
        className={cn(
          "absolute right-2 top-2 flex items-center justify-center rounded-md border",

          compact
            ? "h-4 w-4"
            : "h-[18px] w-[18px]",

          selected
            ? "border-[#0B63F6] bg-[#0B63F6] text-white"
            : "border-[#DDE5EE] bg-white text-transparent",
        )}
      >
        <Check
          className={
            compact
              ? "h-3 w-3"
              : "h-3.5 w-3.5"
          }
          strokeWidth={
            3
          }
        />
      </span>

      <div
        className={cn(
          "relative mt-2 w-full",

          compact
            ? "h-9"
            : "h-11",
        )}
      >
        <Image
          src={
            item.image
          }
          alt=""
          fill
          sizes={
            compact
              ? "92px"
              : "130px"
          }
          className="object-contain transition duration-200 group-hover:scale-[1.03]"
        />
      </div>

      <div
        className={cn(
          "mt-2 font-extrabold text-[#122039]",

          compact
            ? "text-[10px]"
            : "text-[11px]",
        )}
      >
        {
          item.label
        }
      </div>

      <div className="mt-0.5 text-[9px] font-medium text-[#68788D]">
        {
          item.vehicle
        }
      </div>

      <div
        className={cn(
          "mt-2 font-black text-[#075FEA]",

          compact
            ? "text-[11px]"
            : "text-[13px]",
        )}
      >
        {
          formatPrice(
            item.priceCents,
          )
        }
      </div>
    </button>
  );
}
