"use client";

/**
 * Express-Führerschein
 * Mobile top navigation.
 */

import Link from "next/link";

import {
  ClientBrandLogo,
} from "@/components/client-shell/shared/client-brand-logo";

import {
  useClientShell,
} from "@/components/client-shell/client-shell-provider";

export function MobileClientHeader() {
  const {
    toggleMobileMenu,

    isMobileMenuOpen,
  } =
    useClientShell();

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 flex h-[72px] items-center justify-between border-b border-white/[0.06] bg-[#020B16]/98 px-4 text-white shadow-[0_8px_30px_rgba(3,11,23,0.16)] backdrop-blur lg:hidden"
    >
      <button
        type="button"
        onClick={
          toggleMobileMenu
        }
        aria-label={
          isMobileMenuOpen
            ? "Menü schließen"
            : "Menü öffnen"
        }
        aria-expanded={
          isMobileMenuOpen
        }
        aria-controls="client-mobile-menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full outline-none transition hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#1687FF]"
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
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      <ClientBrandLogo
        variant="mobile-header"
      />

      <Link
        href="/profil"
        aria-label="Profil öffnen"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/65 text-white outline-none transition hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-[#1687FF]"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-[20px] w-[20px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle
            cx="12"
            cy="8"
            r="3"
          />
          <path d="M6.5 20a5.5 5.5 0 0 1 11 0" />
        </svg>
      </Link>
    </header>
  );
}
