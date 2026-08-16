import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { HomeLicenseClass } from "@/types/license-class";

export interface LicenseClassCardProps {
  item: HomeLicenseClass;
  selected?: boolean;
  compact?: boolean;
}

function SelectedCheck() {
  return (
    <span
      aria-label="Ausgewählt"
      className="absolute -right-2 -top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0878FF] text-white shadow-[0_5px_16px_rgba(8,120,255,0.28)]"
    >
      <svg
        viewBox="0 0 18 18"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m4.2 9.2 2.8 2.8 6.4-6.4" />
      </svg>
    </span>
  );
}

export function LicenseClassCard({
  item,
  selected = item.selectedByDefault ?? false,
  compact = false,
}: LicenseClassCardProps) {
  const href = item.href ?? "#";

  return (
    <Link
      href={href}
      aria-current={selected ? "true" : undefined}
      className={cn(
        "ef-interactive relative flex shrink-0 flex-col items-center justify-between rounded-[10px] border bg-white text-center outline-none hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(17,40,70,0.08)] focus-visible:ring-2 focus-visible:ring-[#0878FF] focus-visible:ring-offset-2",
        selected
          ? "border-[#0878FF] shadow-[0_6px_20px_rgba(8,120,255,0.08)]"
          : "border-[#E1E7EF]",
        compact
          ? "h-[112px] w-[128px] px-2 py-2"
          : "h-[132px] w-full px-3 py-3 lg:h-[142px]",
      )}
    >
      {selected ? <SelectedCheck /> : null}

      <div
        className={cn(
          "relative w-full",
          compact ? "h-[54px]" : "h-[66px] lg:h-[72px]",
        )}
      >
        {item.image ? (
          <Image
            src={item.image.src}
            alt={item.image.alt ?? item.name}
            fill
            sizes={compact ? "128px" : "(max-width: 1200px) 160px, 180px"}
            className="object-contain"
          />
        ) : null}
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            "truncate font-bold text-[#071426]",
            compact ? "text-[11px]" : "text-[12px] lg:text-[13px]",
          )}
        >
          {item.name}
        </p>

        <p
          className={cn(
            "mt-0.5 truncate text-[#66758A]",
            compact ? "text-[9px]" : "text-[10px] lg:text-[11px]",
          )}
        >
          {item.vehicleLabel}
        </p>
      </div>
    </Link>
  );
}
