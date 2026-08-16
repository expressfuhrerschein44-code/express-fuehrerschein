"use client";

/**
 * Express-Führerschein
 * Shared navigation link renderer.
 */

import Link from "next/link";

import {
  useActiveClientRoute,
} from "@/hooks/use-active-client-route";

import {
  cn,
} from "@/lib/utils";

import type {
  ResolvedClientNavigationItem,
} from "@/types/client-navigation";

import {
  ClientNavigationIcon,
} from "@/components/client-shell/shared/client-navigation-icon";

import {
  ClientNotificationBadge,
} from "@/components/client-shell/shared/client-notification-badge";

export type ClientNavigationItemVariant =
  | "desktop"
  | "drawer";

export interface ClientNavigationItemProps {
  item:
    ResolvedClientNavigationItem;

  variant?:
    ClientNavigationItemVariant;

  onNavigate?:
    () => void;
}

export function ClientNavigationItem({
  item,
  variant =
    "desktop",

  onNavigate,
}: ClientNavigationItemProps) {
  const {
    isActive,
  } =
    useActiveClientRoute();

  const active =
    isActive(
      item,
    );

  return (
    <Link
      href={
        item.href
      }
      onClick={
        onNavigate
      }
      aria-current={
        active
          ? "page"
          : undefined
      }
      className={cn(
        "group flex min-h-[44px] w-full items-center gap-3 rounded-[8px] px-3.5 text-[13px] font-medium outline-none transition-[background-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-[#1687FF] focus-visible:ring-offset-2",
        variant ===
          "desktop"
          ? "text-[#D8E1EC] focus-visible:ring-offset-[#03101F]"
          : "text-[#EAF0F7] focus-visible:ring-offset-[#04111F]",
        active
          ? "bg-[#0878FF] text-white shadow-[0_8px_18px_rgba(8,120,255,0.22)]"
          : "hover:bg-white/[0.075] hover:text-white",
      )}
    >
      <ClientNavigationIcon
        name={
          item.icon
        }
        className={cn(
          "h-[19px] w-[19px]",
          active
            ? "text-white"
            : "text-[#E4EBF3] group-hover:text-white",
        )}
      />

      <span
        className="min-w-0 flex-1 truncate"
      >
        {item.label}
      </span>

      <ClientNotificationBadge
        count={
          item.badgeCount
        }
      />
    </Link>
  );
}
