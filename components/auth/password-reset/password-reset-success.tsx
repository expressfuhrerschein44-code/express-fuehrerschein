/**
 * Express-Führerschein
 * Password reset success content.
 */

import Link from "next/link";

import {
  PASSWORD_RESET_COPY,
  PASSWORD_RESET_ROUTES,
} from "@/data/password-reset";

function SuccessIcon() {
  return (
    <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#EAF9F0] text-[#1E9A55] ring-8 ring-[#F5FCF7]">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 12.5 4.2 4.2L19 7" />
      </svg>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

export function PasswordResetSuccess() {
  return (
    <div className="text-center">
      <SuccessIcon />

      <h2 className="mt-6 text-[27px] font-extrabold leading-tight tracking-[-0.035em] text-[#09182A] sm:text-[30px]">
        {PASSWORD_RESET_COPY.success.title}
      </h2>

      <p className="mx-auto mt-3 max-w-[410px] text-[13px] leading-6 text-[#67778B] sm:text-[14px]">
        {PASSWORD_RESET_COPY.success.description}
      </p>

      <div className="mt-7 rounded-[12px] border border-[#D9EBDD] bg-[#F7FCF8] px-4 py-3.5 text-left">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E4F6EA] text-[#27854D]">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3 5.5 5.7v5.6c0 4.2 2.6 7.9 6.5 9.7 3.9-1.8 6.5-5.5 6.5-9.7V5.7L12 3Z" />
              <path d="m9.3 12.2 1.8 1.8 3.8-4" />
            </svg>
          </span>

          <div>
            <p className="text-[11px] font-bold text-[#31573F]">
              Passwort sicher aktualisiert
            </p>
            <p className="mt-1 text-[10px] leading-5 text-[#688072] sm:text-[11px]">
              Verwende ab jetzt ausschließlich dein neues Passwort für die Anmeldung bei Express-Führerschein.
            </p>
          </div>
        </div>
      </div>

      <Link
        href={PASSWORD_RESET_ROUTES.login}
        className="mt-7 inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-[9px] bg-[#0878FF] px-5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(8,120,255,0.22)] outline-none transition hover:bg-[#006DEB] focus-visible:ring-2 focus-visible:ring-[#0878FF] focus-visible:ring-offset-2 active:translate-y-px"
      >
        {PASSWORD_RESET_COPY.success.loginLabel}
        <ArrowRightIcon />
      </Link>
    </div>
  );
}
