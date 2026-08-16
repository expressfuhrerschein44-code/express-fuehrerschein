/**
 * Express-Führerschein
 * Five-entry mobile bottom navigation.
 */

import {
  MobileBottomNavItem,
} from "@/components/client-shell/mobile/mobile-bottom-nav-item";

import type {
  ResolvedClientNavigationItem,
} from "@/types/client-navigation";

export interface MobileBottomNavigationProps {
  items:
    readonly ResolvedClientNavigationItem[];
}

export function MobileBottomNavigation({
  items,
}: MobileBottomNavigationProps) {
  return (
    <nav
      aria-label="Schnellnavigation"
      className="fixed inset-x-0 bottom-0 z-40 flex h-[72px] items-stretch border-t border-[#E3E8EF] bg-white/98 px-1 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
    >
      {items.map(
        (
          item,
        ) => (
          <MobileBottomNavItem
            key={
              item.id
            }
            item={
              item
            }
          />
        ),
      )}
    </nav>
  );
}
