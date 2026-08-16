/**
 * Express-Führerschein
 * Fixed desktop client sidebar.
 */

import {
  DesktopSidebarLogo,
} from "@/components/client-shell/desktop/desktop-sidebar-logo";

import {
  DesktopSidebarNavigation,
} from "@/components/client-shell/desktop/desktop-sidebar-navigation";

import {
  DesktopSupportCard,
} from "@/components/client-shell/desktop/desktop-support-card";

import type {
  ResolvedClientNavigationItem,
} from "@/types/client-navigation";

export interface DesktopSidebarProps {
  navigation:
    readonly ResolvedClientNavigationItem[];
}

export function DesktopSidebar({
  navigation,
}: DesktopSidebarProps) {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-white/[0.05] bg-[linear-gradient(180deg,#020B16_0%,#041426_55%,#020B16_100%)] text-white shadow-[8px_0_30px_rgba(3,11,23,0.06)] lg:flex"
    >
      <DesktopSidebarLogo />

      <DesktopSidebarNavigation
        items={
          navigation
        }
      />

      <DesktopSupportCard />
    </aside>
  );
}
