"use client";

/**
 * Express-Führerschein
 * Full-height mobile hamburger drawer.
 */

import {
  useEffect,
  useRef,
} from "react";

import {
  ClientBrandLogo,
} from "@/components/client-shell/shared/client-brand-logo";

import {
  ClientLogoutButton,
} from "@/components/client-shell/shared/client-logout-button";

import {
  ClientUserSummary,
} from "@/components/client-shell/shared/client-user-summary";

import {
  MobileMenuNavigation,
} from "@/components/client-shell/mobile/mobile-menu-navigation";

import {
  useClientShell,
} from "@/components/client-shell/client-shell-provider";

import type {
  ResolvedClientNavigationItem,
} from "@/types/client-navigation";

import type {
  ClientShellUser,
} from "@/types/client-shell";

export interface MobileMenuDrawerProps {
  user:
    ClientShellUser;

  navigation:
    readonly ResolvedClientNavigationItem[];
}

export function MobileMenuDrawer({
  user,

  navigation,
}: MobileMenuDrawerProps) {
  const {
    isMobileMenuOpen,

    closeMobileMenu,
  } =
    useClientShell();

  const closeButtonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  useEffect(
    () => {
      if (
        isMobileMenuOpen
      ) {
        window.setTimeout(
          () => {
            closeButtonRef
              .current
              ?.focus();
          },
          0,
        );
      }
    },
    [
      isMobileMenuOpen,
    ],
  );

  return (
    <>
      <button
        type="button"
        aria-label="Menü schließen"
        onClick={
          closeMobileMenu
        }
        tabIndex={
          isMobileMenuOpen
            ? 0
            : -1
        }
        className={`fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="client-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Kundenmenü"
        aria-hidden={
          !isMobileMenuOpen
        }
        className={`fixed inset-y-0 left-0 z-[60] flex w-[min(88vw,310px)] flex-col border-r border-white/[0.06] bg-[linear-gradient(180deg,#020B16_0%,#061629_58%,#020B16_100%)] text-white shadow-[20px_0_60px_rgba(0,0,0,0.32)] transition-transform duration-250 ease-out lg:hidden ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div
          className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.08] px-5"
        >
          <ClientBrandLogo
            variant="mobile-drawer"
          />

          <button
            ref={
              closeButtonRef
            }
            type="button"
            onClick={
              closeMobileMenu
            }
            aria-label="Menü schließen"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white outline-none transition hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#1687FF]"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-[22px] w-[22px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div
          className="border-b border-white/[0.08] px-5 py-5"
        >
          <ClientUserSummary
            user={
              user
            }
            inverse
          />
        </div>

        <div
          className="flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <MobileMenuNavigation
            items={
              navigation
            }
            onNavigate={
              closeMobileMenu
            }
          />
        </div>

        <div
          className="shrink-0 border-t border-white/[0.08] p-5"
        >
          <ClientLogoutButton
            variant="drawer"
          />
        </div>
      </aside>
    </>
  );
}
