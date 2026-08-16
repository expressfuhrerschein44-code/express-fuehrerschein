"use client";

import { useEffect, useRef, useState } from "react";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SupportedLocale } from "@/types/country";

export interface LanguageSelectorProps {
  className?: string;
  initialLocale?: SupportedLocale;
  variant?: "dark" | "light";
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={cn(
        "h-3.5 w-3.5 transition-transform duration-200",
        open && "rotate-180",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

function readLocaleCookie(): SupportedLocale | null {
  if (typeof document === "undefined") {
    return null;
  }

  const value = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${LOCALE_COOKIE_NAME}=`))
    ?.split("=")[1];

  return SUPPORTED_LOCALES.includes(value as SupportedLocale)
    ? (value as SupportedLocale)
    : null;
}

export function LanguageSelector({
  className,
  initialLocale = DEFAULT_LOCALE,
  variant = "dark",
}: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<SupportedLocale>(initialLocale);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cookieLocale = readLocaleCookie();

    if (cookieLocale) {
      setLocale(cookieLocale);
    }
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        open &&
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const selectLocale = (nextLocale: SupportedLocale) => {
    if (nextLocale === locale) {
      setOpen(false);
      return;
    }

    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = nextLocale;

    setLocale(nextLocale);
    setOpen(false);

    /**
     * Reload is intentional for the current architecture:
     * middleware/server components can then resolve the new locale.
     */
    window.location.reload();
  };

  const dark = variant === "dark";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Sprache auswählen"
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 text-sm font-semibold outline-none transition-colors",
          dark
            ? "text-white hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#0878FF]"
            : "text-[#071426] hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-[#0878FF]",
        )}
      >
        <GlobeIcon />
        <span>{LOCALE_LABELS[locale].short}</span>
        <ChevronIcon open={open} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Sprachen"
          className={cn(
            "absolute right-0 z-[100] mt-2 min-w-44 overflow-hidden rounded-xl border p-1.5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] ef-animate-slide-down",
            dark
              ? "border-white/10 bg-[#081525] text-white"
              : "border-[#E2E8F0] bg-white text-[#071426]",
          )}
        >
          {SUPPORTED_LOCALES.map((item) => {
            const selected = item === locale;

            return (
              <button
                key={item}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => selectLocale(item)}
                className={cn(
                  "flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm outline-none transition-colors",
                  dark
                    ? "hover:bg-white/[0.07] focus-visible:bg-white/[0.07]"
                    : "hover:bg-[#F3F6FA] focus-visible:bg-[#F3F6FA]",
                  selected && (dark ? "bg-white/[0.07]" : "bg-[#EEF5FF]"),
                )}
              >
                <span>{LOCALE_LABELS[item].native}</span>
                <span
                  className={cn(
                    "text-xs font-bold",
                    selected
                      ? "text-[#1684FF]"
                      : dark
                        ? "text-white/45"
                        : "text-[#7C899C]",
                  )}
                >
                  {LOCALE_LABELS[item].short}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
