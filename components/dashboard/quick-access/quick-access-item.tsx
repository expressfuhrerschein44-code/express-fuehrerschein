/**
 * Express-Führerschein
 * One dashboard quick-access button.
 */

import Link from "next/link";

import {
  ClientNavigationIcon,
} from "@/components/client-shell/shared/client-navigation-icon";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardQuickAccessItem,
} from "@/types/dashboard";

export interface QuickAccessItemProps {
  item:
    DashboardQuickAccessItem;

  compact?:
    boolean;
}

export function QuickAccessItem({
  item,
  compact =
    false,
}: QuickAccessItemProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-w-0 flex-col items-center justify-center rounded-xl border border-[#E4EAF1] bg-white text-center outline-none transition hover:border-[#BFD8F7] hover:bg-[#F7FBFF] focus-visible:ring-2 focus-visible:ring-[#0878FF]",
        compact
          ? "min-h-[72px] gap-1.5 px-2 py-2"
          : "min-h-[86px] gap-2 px-3 py-3",
      )}
    >
      <ClientNavigationIcon
        name={item.icon}
        className={cn(
          "text-[#0878FF]",
          compact
            ? "h-[18px] w-[18px]"
            : "h-5 w-5",
        )}
      />

      <span className="max-w-full truncate text-[9px] font-semibold text-[#39495D]">
        {item.label}
      </span>
    </Link>
  );
}
