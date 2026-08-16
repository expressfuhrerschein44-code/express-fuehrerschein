"use client";

import { useState } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";
import { LanguageSelector } from "@/components/shared/language-selector";
import { Button } from "@/components/ui/button";
import { SiteContainer } from "@/components/layout/site-container";
import { MobileMenu } from "@/components/home/mobile-menu";
import { HOME_HEADER_DATA } from "@/data/navigation";
import { cn } from "@/lib/utils";

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="relative block h-5 w-6"
    >
      <span
        className={cn(
          "absolute left-0 top-[3px] h-[2px] w-6 rounded-full bg-current transition-all duration-200",
          open && "top-[9px] rotate-45",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-[9px] h-[2px] w-6 rounded-full bg-current transition-all duration-200",
          open && "opacity-0",
        )}
      />
      <span
        className={cn(
          "absolute left-0 top-[15px] h-[2px] w-6 rounded-full bg-current transition-all duration-200",
          open && "top-[9px] -rotate-45",
        )}
      />
    </span>
  );
}

export function HomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-[80] w-full border-b border-white/[0.055] bg-[#020914]/95 text-white backdrop-blur-xl"
      >
        <SiteContainer className="flex h-[68px] items-center justify-between gap-4 lg:h-[72px]">
          <BrandLogo
            priority
            imageClassName="w-[184px] sm:w-[210px] xl:w-[235px]"
          />

          <nav
            aria-label="Hauptnavigation"
            className="hidden flex-1 items-center justify-center lg:flex"
          >
            <ul className="flex items-center gap-7 xl:gap-9">
              {HOME_HEADER_DATA.navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="rounded-md px-1 py-2 text-[13px] font-medium text-white/92 outline-none transition-colors hover:text-[#1684FF] focus-visible:ring-2 focus-visible:ring-[#1684FF]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <LanguageSelector variant="dark" />

            <Button
              href={HOME_HEADER_DATA.startCta.href}
              aria-label={HOME_HEADER_DATA.startCta.ariaLabel}
              size="md"
              className="min-w-[118px]"
            >
              {HOME_HEADER_DATA.startCta.label}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#1684FF] lg:hidden"
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </SiteContainer>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
}
