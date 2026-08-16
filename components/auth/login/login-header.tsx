"use client";

import { BrandLogo } from "@/components/shared/brand-logo";
import { LanguageSelector } from "@/components/shared/language-selector";
import { cn } from "@/lib/utils";

export interface LoginHeaderProps {
  className?: string;
}

/**
 * Authentication header.
 *
 * Mobile:
 * - dark bar;
 * - centered brand;
 * - language selector on the right.
 *
 * Desktop:
 * - brand lives inside LoginSidePanel;
 * - only the language selector remains visible above the login card.
 */
export function LoginHeader({
  className,
}: LoginHeaderProps) {
  return (
    <header
      className={cn(
        "flex w-full items-center justify-between",
        "bg-[#020914] px-4 py-4 text-white",
        "sm:px-5",
        "lg:bg-transparent lg:px-0 lg:py-0",
        className,
      )}
    >
      <div className="min-w-0 lg:hidden">
        <BrandLogo
          priority
          imageClassName="w-[188px] sm:w-[210px]"
        />
      </div>

      <div className="ml-auto">
        <LanguageSelector
          variant="dark"
          className="shrink-0 lg:text-[#071426]"
        />
      </div>
    </header>
  );
}
