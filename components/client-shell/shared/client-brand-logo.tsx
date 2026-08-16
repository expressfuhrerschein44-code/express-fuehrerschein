/**
 * Express-Führerschein
 * Shared client-area brand logo.
 */

import Image from "next/image";
import Link from "next/link";

import {
  cn,
} from "@/lib/utils";

export type ClientBrandLogoVariant =
  | "sidebar"
  | "mobile-header"
  | "mobile-drawer";

export interface ClientBrandLogoProps {
  variant?:
    ClientBrandLogoVariant;

  className?:
    string;

  href?:
    string;
}

const VARIANT_CLASSNAME:
  Record<
    ClientBrandLogoVariant,
    string
  > = {
  sidebar:
    "h-[42px] w-[184px]",

  "mobile-header":
    "h-[31px] w-[145px]",

  "mobile-drawer":
    "h-[35px] w-[164px]",
};

export function ClientBrandLogo({
  variant =
    "sidebar",

  className,

  href =
    "/dashboard",
}: ClientBrandLogoProps) {
  return (
    <Link
      href={
        href
      }
      aria-label="Express-Führerschein Dashboard"
      className={cn(
        "inline-flex shrink-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-[#1687FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#03101F]",
        className,
      )}
    >
      <span
        className={cn(
          "relative block",
          VARIANT_CLASSNAME[
            variant
          ],
        )}
      >
        <Image
          src="/logos/logo.png"
          alt="Express-Führerschein"
          fill
          priority
          sizes={
            variant ===
            "sidebar"
              ? "184px"
              : "164px"
          }
          className="object-contain"
        />
      </span>
    </Link>
  );
}
