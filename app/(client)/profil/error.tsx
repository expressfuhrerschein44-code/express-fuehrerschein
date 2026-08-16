"use client";

/**
 * Express-Führerschein
 * Profile route error boundary.
 *
 * Sensitive database/storage details are never rendered to the user.
 */

import {
  useEffect,
} from "react";

import Link from "next/link";

export default function ProfileError({
  error,
  reset,
}: {
  error:
    Error & {
      digest?:
        string;
    };

  reset:
    () => void;
}) {
  useEffect(
    () => {
      console.error(
        "[PROFILE_ROUTE_ERROR_BOUNDARY]",
        {
          message:
            error.message,

          digest:
            error.digest,
        },
      );
    },
    [
      error,
    ],
  );

  return (
    <div
      className="mx-auto flex min-h-[460px] w-full max-w-[1440px] items-center justify-center px-4 py-10 lg:px-7"
    >
      <section
        aria-labelledby="profile-error-title"
        className="w-full max-w-[560px] rounded-2xl border border-[#E3E8EF] bg-white px-6 py-8 text-center shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:px-8"
      >
        <span
          aria-hidden="true"
          className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4F4] text-[#E5484D]"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle
              cx="12"
              cy="8"
              r="4"
            />

            <path
              d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6"
            />

            <path
              d="M19 4v4"
            />

            <path
              d="M17 6h4"
            />
          </svg>
        </span>

        <h1
          id="profile-error-title"
          className="mt-5 text-[20px] font-black tracking-[-0.025em] text-[#111C2B]"
        >
          Profil konnte nicht geladen werden
        </h1>

        <p
          className="mx-auto mt-2 max-w-[440px] text-[12px] leading-6 text-[#6D7C8F]"
        >
          Deine Profildaten konnten gerade nicht vollständig geladen werden.
          Bitte versuche es erneut. Deine gespeicherten Kontodaten werden dadurch
          nicht verändert.
        </p>

        <div
          className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <button
            type="button"
            onClick={
              reset
            }
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0878FF] px-5 text-[12px] font-extrabold text-white outline-none transition hover:bg-[#006DEB] focus-visible:ring-2 focus-visible:ring-[#0878FF] focus-visible:ring-offset-2"
          >
            Erneut versuchen
          </button>

          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#D9E2EC] bg-white px-5 text-[12px] font-bold text-[#33445A] outline-none transition hover:bg-[#F7F9FC] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
          >
            Zum Dashboard
          </Link>

          <Link
            href="/hilfe-support"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#D9E2EC] bg-white px-5 text-[12px] font-bold text-[#33445A] outline-none transition hover:bg-[#F7F9FC] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
          >
            Hilfe &amp; Support
          </Link>
        </div>
      </section>
    </div>
  );
}
