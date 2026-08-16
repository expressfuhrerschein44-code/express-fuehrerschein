/**
 * Express-Führerschein
 * Desktop sidebar navigation.
 */

import {
  DesktopSidebarItem,
} from "@/components/client-shell/desktop/desktop-sidebar-item";

import type {
  ResolvedClientNavigationItem,
} from "@/types/client-navigation";

export interface DesktopSidebarNavigationProps {
  items:
    readonly ResolvedClientNavigationItem[];
}

export function DesktopSidebarNavigation({
  items,
}: DesktopSidebarNavigationProps) {
  const visibleItems =
    items.filter(
      (item) =>
        item.showInMainNavigation,
    );

  return (
    <nav
      aria-label="Kundenbereich"
      className="flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div
        className="space-y-1"
      >
        {visibleItems.map(
          (
            item,
          ) => (
            <DesktopSidebarItem
              key={
                item.id
              }
              item={
                item
              }
            />
          ),
        )}
      </div>
    </nav>
  );
}
