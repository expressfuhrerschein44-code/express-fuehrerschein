/**
 * Express-Führerschein
 * Desktop sidebar support card.
 */

import Link from "next/link";

import {
  CLIENT_SUPPORT,
} from "@/data/client-navigation";

export function DesktopSupportCard() {
  return (
    <div
      className="mx-4 mb-5 rounded-[10px] border border-white/[0.11] bg-[#061628]/75 p-4"
    >
      <p
        className="text-[11px] font-bold text-white"
      >
        {
          CLIENT_SUPPORT.title
        }
      </p>

      <p
        className="mt-1.5 text-[10px] leading-5 text-[#A9B9CB]"
      >
        {
          CLIENT_SUPPORT.description
        }
      </p>

      <Link
        href={
          CLIENT_SUPPORT.href
        }
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[7px] border border-[#0878FF] text-[11px] font-semibold text-[#38A0FF] outline-none transition hover:bg-[#0878FF]/10 focus-visible:ring-2 focus-visible:ring-[#1687FF]"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
          <path d="M4 14h3v6H5a1 1 0 0 1-1-1v-5ZM20 14h-3v6h2a1 1 0 0 0 1-1v-5Z" />
          <path d="M17 20c0 1-1 2-3 2" />
        </svg>

        {
          CLIENT_SUPPORT.actionLabel
        }
      </Link>
    </div>
  );
}
