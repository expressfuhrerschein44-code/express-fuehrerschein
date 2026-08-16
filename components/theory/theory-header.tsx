"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface TheoryHeaderProps {
  title?: string;
  subtitle?: string;
}

export function TheoryHeader({
  title = "Theorie lernen",
  subtitle = "Lerne Schritt für Schritt und bereite dich optimal auf deine Theorieprüfung vor.",
}: TheoryHeaderProps) {
  return (
    <header className="mb-5 lg:mb-6">
      <nav
        aria-label="Breadcrumb"
        className="hidden items-center gap-2 text-[11px] font-medium text-[#6E7D91] lg:flex"
      >
        <Link
          href="/theorie"
          className="transition hover:text-[#0B63F6]"
        >
          Theorie lernen
        </Link>

        <ChevronRight
          aria-hidden="true"
          className="h-3.5 w-3.5"
        />

        <span aria-current="page">
          Übersicht
        </span>
      </nav>

      <div className="mt-0 lg:mt-3">
        <h1 className="text-[22px] font-extrabold tracking-[-0.02em] text-[#081529] lg:text-[26px]">
          {title}
        </h1>

        <p className="mt-1 max-w-[760px] text-[12px] leading-5 text-[#66758A] lg:text-[13px]">
          {subtitle}
        </p>
      </div>
    </header>
  );
}
