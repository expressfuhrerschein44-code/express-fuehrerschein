"use client";

import { useRouter } from "next/navigation";

import { BrandLogo } from "@/components/shared/brand-logo";
import { LanguageSelector } from "@/components/shared/language-selector";
import { cn } from "@/lib/utils";

export interface RegistrationHeaderProps {
  className?: string;
  showBackButton?: boolean;
  backHref?: string;
}

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

export function RegistrationHeader({
  className,
  showBackButton = true,
  backHref = "/",
}: RegistrationHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(backHref);
  };

  return (
    <header
      className={cn(
        "flex h-[72px] w-full items-center justify-between border-b border-white/[0.07] bg-[#020914] px-4 text-white sm:px-5 lg:hidden",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {showBackButton ? (
          <button
            type="button"
            onClick={handleBack}
            aria-label="Zurück"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/90 outline-none transition-colors hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#1684FF]"
          >
            <ArrowLeftIcon />
          </button>
        ) : null}

        <BrandLogo
          priority
          imageClassName="w-[176px] sm:w-[195px]"
        />
      </div>

      <LanguageSelector
        variant="dark"
        className="shrink-0"
      />
    </header>
  );
}
