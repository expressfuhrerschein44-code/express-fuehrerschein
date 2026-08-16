/**
 * Express-Führerschein
 * Mobile drawer navigation.
 */

import {
  ClientNavigationItem,
} from "@/components/client-shell/shared/client-navigation-item";

import type {
  ResolvedClientNavigationItem,
} from "@/types/client-navigation";

export interface MobileMenuNavigationProps {
  items:
    readonly ResolvedClientNavigationItem[];

  onNavigate:
    () => void;
}

export function MobileMenuNavigation({
  items,

  onNavigate,
}: MobileMenuNavigationProps) {
  const visibleItems =
    items.filter(
      (item) =>
        item.showInMainNavigation,
    );

  return (
    <nav
      aria-label="Mobiles Kundenmenü"
      className="space-y-1"
    >
      {visibleItems.map(
        (
          item,
        ) => (
          <ClientNavigationItem
            key={
              item.id
            }
            item={
              item
            }
            variant="drawer"
            onNavigate={
              onNavigate
            }
          />
        ),
      )}
    </nav>
  );
}
