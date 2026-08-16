import Image from "next/image";
import Link from "next/link";

import { ASSETS, APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  href?: string;
  clickable?: boolean;
}

export function BrandLogo({
  className,
  imageClassName,
  width = 260,
  height = 66,
  priority = false,
  href = ROUTES.home,
  clickable = true,
}: BrandLogoProps) {
  const image = (
    <Image
      src={ASSETS.logo}
      alt={APP_NAME}
      width={width}
      height={height}
      priority={priority}
      sizes="(max-width: 767px) 190px, 260px"
      className={cn(
        "h-auto w-[190px] object-contain sm:w-[220px] lg:w-[240px]",
        imageClassName,
      )}
    />
  );

  if (!clickable) {
    return <div className={cn("inline-flex", className)}>{image}</div>;
  }

  return (
    <Link
      href={href}
      aria-label={`${APP_NAME} – Startseite`}
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#0878FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030B17]",
        className,
      )}
    >
      {image}
    </Link>
  );
}
