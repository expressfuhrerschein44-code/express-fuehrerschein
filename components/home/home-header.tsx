"use client";

import {
  useState,
} from "react";

import {
  BrandLogo,
} from "@/components/shared/brand-logo";

import {
  LanguageSelector,
} from "@/components/shared/language-selector";

import {
  Button,
} from "@/components/ui/button";

import {
  SiteContainer,
} from "@/components/layout/site-container";

import {
  MobileMenu,
} from "@/components/home/mobile-menu";

import {
  HOME_HEADER_DATA,
} from "@/data/navigation";

import {
  cn,
} from "@/lib/utils";

const LOGIN_HREF =
  "/login";

function MenuIcon({
  open,
}: {
  open:
    boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className="relative block h-5 w-6"
    >
      <span
        className={cn(
          "absolute left-0 top-[3px] h-[2px] w-6 rounded-full bg-current transition-all duration-200",
          open &&
            "top-[9px] rotate-45",
        )}
      />

      <span
        className={cn(
          "absolute left-0 top-[9px] h-[2px] w-6 rounded-full bg-current transition-all duration-200",
          open &&
            "opacity-0",
        )}
      />

      <span
        className={cn(
          "absolute left-0 top-[15px] h-[2px] w-6 rounded-full bg-current transition-all duration-200",
          open &&
            "top-[9px] -rotate-45",
        )}
      />
    </span>
  );
}

export function HomeHeader() {
  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(
      false,
    );

  return (
    <>
      <header
        className="sticky top-0 z-[80] w-full border-b border-white/[0.055] bg-[#020914]/95 text-white backdrop-blur-xl"
      >
        <SiteContainer className="flex h-[68px] items-center justify-between gap-3 lg:h-[72px] lg:gap-4">
          {/* =========================================================
              LOGO
              ========================================================= */}
          <BrandLogo
            priority
            imageClassName="w-[138px] sm:w-[180px] lg:w-[205px] xl:w-[235px]"
          />

          {/* =========================================================
              DESKTOP NAVIGATION
              ========================================================= */}
          <nav
            aria-label="Hauptnavigation"
            className="hidden flex-1 items-center justify-center lg:flex"
          >
            <ul className="flex items-center gap-6 xl:gap-9">
              {HOME_HEADER_DATA.navigation.map(
                (
                  item,
                ) => (
                  <li
                    key={
                      item.id
                    }
                  >
                    <a
                      href={
                        item.href
                      }
                      className="rounded-md px-1 py-2 text-[13px] font-medium text-white/92 outline-none transition-colors hover:text-[#1684FF] focus-visible:ring-2 focus-visible:ring-[#1684FF]"
                    >
                      {
                        item.label
                      }
                    </a>
                  </li>
                ),
              )}
            </ul>
          </nav>

          {/* =========================================================
              DESKTOP ACTIONS
              ========================================================= */}
          <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
            <LanguageSelector
              variant="dark"
            />

            <a
              href={
                LOGIN_HREF
              }
              aria-label="Anmelden"
              className="inline-flex min-h-10 min-w-[104px] items-center justify-center rounded-lg border border-white/20 bg-white/[0.035] px-4 text-[13px] font-bold text-white outline-none transition-all hover:border-[#1684FF]/70 hover:bg-[#1684FF]/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#1684FF]"
            >
              Anmelden
            </a>

            <Button
              href={
                HOME_HEADER_DATA
                  .startCta
                  .href
              }
              aria-label={
                HOME_HEADER_DATA
                  .startCta
                  .ariaLabel
              }
              size="md"
              className="min-w-[118px]"
            >
              {
                HOME_HEADER_DATA
                  .startCta
                  .label
              }
            </Button>
          </div>

          {/* =========================================================
              MOBILE ACTIONS
              ========================================================= */}
          <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
            <a
              href={
                LOGIN_HREF
              }
              aria-label="Anmelden"
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-white/20 bg-white/[0.04] px-3 text-[11px] font-extrabold text-white outline-none transition-colors hover:border-[#1684FF]/70 hover:bg-[#1684FF]/10 focus-visible:ring-2 focus-visible:ring-[#1684FF] sm:min-h-10 sm:px-4 sm:text-[12px]"
            >
              Anmelden
            </a>

            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  (
                    current,
                  ) =>
                    !current,
                )
              }
              aria-label={
                mobileOpen
                  ? "Menü schließen"
                  : "Menü öffnen"
              }
              aria-expanded={
                mobileOpen
              }
              aria-controls="mobile-navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#1684FF] sm:h-11 sm:w-11"
            >
              <MenuIcon
                open={
                  mobileOpen
                }
              />
            </button>
          </div>
        </SiteContainer>
      </header>

      <MobileMenu
        open={
          mobileOpen
        }
        onClose={() =>
          setMobileOpen(
            false,
          )
        }
      />
    </>
  );
}