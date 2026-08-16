import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";
import { ROUTES } from "@/lib/constants";

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m10 7-5 5 5 5" />
    </svg>
  );
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020914] px-4 py-12 text-white">
      <div className="w-full max-w-xl text-center">
        <div className="flex justify-center">
          <BrandLogo
            priority
            imageClassName="w-[220px]"
          />
        </div>

        <p className="mt-10 text-[12px] font-extrabold uppercase tracking-[0.16em] text-[#1684FF]">
          Fehler 404
        </p>

        <h1 className="mt-3 text-[34px] font-extrabold tracking-[-0.04em] sm:text-[44px]">
          Seite nicht gefunden
        </h1>

        <p className="mx-auto mt-4 max-w-md text-[14px] leading-6 text-white/64">
          Die gewünschte Seite existiert nicht oder wurde verschoben.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href={ROUTES.home}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#0878FF] bg-[#0878FF] px-6 text-[14px] font-bold text-white shadow-[0_8px_24px_rgba(8,120,255,0.22)] outline-none transition-colors hover:bg-[#006BEA] focus-visible:ring-2 focus-visible:ring-[#1684FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#020914]"
          >
            <ArrowLeftIcon />
            Zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
