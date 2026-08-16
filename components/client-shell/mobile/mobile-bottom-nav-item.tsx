"use client";

/**
 * Express-Führerschein
 * One item in the five-entry mobile bottom navigation.
 */

import Link from "next/link";

import {
  ClientNavigationIcon,
} from "@/components/client-shell/shared/client-navigation-icon";

import {
  ClientNotificationBadge,
} from "@/components/client-shell/shared/client-notification-badge";

import {
  useActiveClientRoute,
} from "@/hooks/use-active-client-route";

import {
  cn,
} from "@/lib/utils";

import type {
  ResolvedClientNavigationItem,
} from "@/types/client-navigation";

export interface MobileBottomNavItemProps {
  item:
    ResolvedClientNavigationItem;
}

export function MobileBottomNavItem({
  item,
}: MobileBottomNavItemProps) {
  const {
    isActive,
  } =
    useActiveClientRoute();

  const active =
    isActive(
      item,
    );

  if (
    item.prominentOnMobile
  ) {
    return (
      <Link
        href={
          item.href
        }
        aria-current={
          active
            ? "page"
            : undefined
        }
        className="relative flex min-w-0 flex-1 flex-col items-center justify-end pb-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-[#0878FF]"
      >
        <span
          className={cn(
            "absolute -top-[19px] flex h-[52px] w-[52px] items-center justify-center rounded-full border-[5px] border-white bg-[#0878FF] text-white shadow-[0_8px_22px_rgba(8,120,255,0.32)]",
            active &&
              "bg-[#006DEB]",
          )}
        >
          <ClientNavigationIcon
            name={
              item.icon
            }
            className="h-[22px] w-[22px]"
          />
        </span>

        <span
          className={cn(
            "mt-auto max-w-[64px] truncate text-[8.5px] font-semibold",
            active
              ? "text-[#0878FF]"
              : "text-[#5E6D80]",
          )}
        >
          Mein Führerschein
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={
        item.href
      }
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={cn(
        "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 px-1 text-center outline-none focus-visible:ring-2 focus-visible:ring-[#0878FF]",
        active
          ? "text-[#0878FF]"
          : "text-[#617185]",
      )}
    >
      <span
        className="relative"
      >
        <ClientNavigationIcon
          name={
            item.icon
          }
          className="h-[20px] w-[20px]"
        />

        {item.badgeCount ? (
          <ClientNotificationBadge
            count={
              item.badgeCount
            }
            className="absolute -right-3 -top-2 min-w-4 px-1 text-[8px]"
          />
        ) : null}
      </span>

      <span
        className="max-w-[62px] truncate text-[8.5px] font-semibold"
      >
        {item.label}
      </span>
    </Link>
  );
}
