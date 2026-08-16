"use client";

/**
 * Express-Führerschein
 * Compact language selector matching the client header reference.
 *
 * It updates the existing ef_locale cookie and refreshes the current route.
 */

import {
  useRouter,
} from "next/navigation";

import type {
  ChangeEvent,
} from "react";

import {
  LOCALE_COOKIE_NAME,
} from "@/lib/constants";

import {
  cn,
} from "@/lib/utils";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

export interface ClientLanguageSelectorProps {
  locale:
    ClientShellLocale;

  className?:
    string;
}

const OPTIONS:
  readonly {
    value:
      ClientShellLocale;

    flag:
      string;

    label:
      string;
  }[] = [
  {
    value:
      "de",

    flag:
      "🇩🇪",

    label:
      "DE",
  },
  {
    value:
      "fr",

    flag:
      "🇫🇷",

    label:
      "FR",
  },
  {
    value:
      "nl",

    flag:
      "🇳🇱",

    label:
      "NL",
  },
  {
    value:
      "es",

    flag:
      "🇪🇸",

    label:
      "ES",
  },
  {
    value:
      "it",

    flag:
      "🇮🇹",

    label:
      "IT",
  },
  {
    value:
      "en",

    flag:
      "🇬🇧",

    label:
      "EN",
  },
];

export function ClientLanguageSelector({
  locale,
  className,
}: ClientLanguageSelectorProps) {
  const router =
    useRouter();

  function handleChange(
    event:
      ChangeEvent<HTMLSelectElement>,
  ) {
    const nextLocale =
      event
        .target
        .value as
        ClientShellLocale;

    document.cookie =
      `${LOCALE_COOKIE_NAME}=${encodeURIComponent(nextLocale)}; Path=/; Max-Age=31536000; SameSite=Lax`;

    router.refresh();
  }

  const selected =
    OPTIONS.find(
      (option) =>
        option.value ===
        locale,
    ) ??
    OPTIONS[0];

  return (
    <label
      className={cn(
        "relative inline-flex h-10 items-center gap-2 rounded-[9px] border border-[#E0E6EE] bg-white px-3 shadow-[0_2px_8px_rgba(15,23,42,0.025)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="text-[15px]"
      >
        {
          selected.flag
        }
      </span>

      <span
        aria-hidden="true"
        className="text-[11px] font-bold text-[#263548]"
      >
        {
          selected.label
        }
      </span>

      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="h-3.5 w-3.5 text-[#617287]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="m6 8 4 4 4-4" />
      </svg>

      <select
        value={
          locale
        }
        onChange={
          handleChange
        }
        aria-label="Sprache auswählen"
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {OPTIONS.map(
          (
            option,
          ) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
