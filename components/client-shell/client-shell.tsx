/**
 * Express-Führerschein
 * Complete responsive client-area application shell.
 *
 * Desktop:
 * - fixed dark sidebar;
 * - white client header;
 * - page content.
 *
 * Mobile:
 * - fixed dark header;
 * - hamburger drawer;
 * - fixed five-entry bottom navigation;
 * - page content.
 */

import type {
  ReactNode,
} from "react";

import {
  ClientShellProvider,
} from "@/components/client-shell/client-shell-provider";

import {
  DesktopClientHeader,
} from "@/components/client-shell/desktop/desktop-client-header";

import {
  DesktopSidebar,
} from "@/components/client-shell/desktop/desktop-sidebar";

import {
  MobileBottomNavigation,
} from "@/components/client-shell/mobile/mobile-bottom-navigation";

import {
  MobileClientHeader,
} from "@/components/client-shell/mobile/mobile-client-header";

import {
  MobileMenuDrawer,
} from "@/components/client-shell/mobile/mobile-menu-drawer";

import type {
  ClientShellData,
} from "@/types/client-shell";

export interface ClientShellProps {
  data:
    ClientShellData;

  children:
    ReactNode;
}

export function ClientShell({
  data,

  children,
}: ClientShellProps) {
  return (
    <ClientShellProvider>
      <div
        className="min-h-screen bg-[#F5F7FA] text-[#101B2B]"
      >
        <DesktopSidebar
          navigation={
            data.navigation
          }
        />

        <MobileClientHeader />

        <MobileMenuDrawer
          user={
            data.user
          }
          navigation={
            data.navigation
          }
        />

        <div
          className="min-h-screen pt-[72px] lg:ml-[240px] lg:pt-0"
        >
          <DesktopClientHeader
            user={
              data.user
            }
          />

          <main
            className="min-h-[calc(100vh-72px)] pb-[96px] lg:min-h-[calc(100vh-88px)] lg:pb-0"
          >
            {children}
          </main>
        </div>

        <MobileBottomNavigation
          items={
            data.bottomNavigation
          }
        />
      </div>
    </ClientShellProvider>
  );
}
