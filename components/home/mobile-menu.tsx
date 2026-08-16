"use client";

import { useEffect } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";
import { LanguageSelector } from "@/components/shared/language-selector";
import { Button } from "@/components/ui/button";
import { HOME_HEADER_DATA } from "@/data/navigation";
import { cn } from "@/lib/utils";

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  );
}

export function MobileMenu({
  open,
  onClose,
}: MobileMenuProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Menü schließen"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <aside
        id="mobile-navigation"
        aria-label="Mobile Navigation"
        className={cn(
          "absolute right-0 top-0 flex h-full w-[min(88vw,390px)] flex-col border-l border-white/10 bg-[#030B17] text-white shadow-2xl transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/[0.07] px-5">
          <BrandLogo
            clickable={false}
            imageClassName="w-[190px]"
          />

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#1684FF]"
            aria-label="Menü schließen"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
          <nav aria-label="Mobile Hauptnavigation">
            <ul className="space-y-1">
              {HOME_HEADER_DATA.navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    onClick={onClose}
                    tabIndex={open ? 0 : -1}
                    className="flex min-h-12 items-center rounded-xl px-3 text-[15px] font-semibold text-white/92 outline-none transition-colors hover:bg-white/[0.06] hover:text-[#1684FF] focus-visible:bg-white/[0.06]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 border-t border-white/[0.08] pt-5">
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
              Sprache
            </p>
            <LanguageSelector variant="dark" />
          </div>

          <div className="mt-auto pt-8">
            <Button
              href={HOME_HEADER_DATA.startCta.href}
              aria-label={HOME_HEADER_DATA.startCta.ariaLabel}
              fullWidth
              size="lg"
              onClick={onClose}
            >
              {HOME_HEADER_DATA.startCta.label}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
