/**
 * Express-Führerschein
 * Desktop navigation row.
 */

import {
  ClientNavigationItem,
} from "@/components/client-shell/shared/client-navigation-item";

import type {
  ResolvedClientNavigationItem,
} from "@/types/client-navigation";

export interface DesktopSidebarItemProps {
  item:
    ResolvedClientNavigationItem;
}

export function DesktopSidebarItem({
  item,
}: DesktopSidebarItemProps) {
  return (
    <ClientNavigationItem
      item={
        item
      }
      variant="desktop"
    />
  );
}
