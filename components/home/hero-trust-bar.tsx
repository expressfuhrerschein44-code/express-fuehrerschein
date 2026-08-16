import Image from "next/image";

import { cn } from "@/lib/utils";
import type { HomeTrustData, TrustPartner } from "@/types/home";

export interface HeroTrustBarProps {
  data: HomeTrustData;
  className?: string;
}

function PartnerLogo({
  partner,
}: {
  partner: TrustPartner;
}) {
  const trustpilot = partner.key === "trustpilot";

  return (
    <div
      className={cn(
        "flex min-w-0 items-center",
        trustpilot
          ? "col-span-3 justify-center border-t border-white/[0.08] pt-4 sm:col-span-1 sm:justify-start sm:border-l sm:border-t-0 sm:pl-7 sm:pt-0"
          : "justify-center sm:justify-start",
      )}
    >
      <div className="flex min-w-0 flex-col">
        <div
          className={cn(
            "relative",
            trustpilot
              ? "h-[26px] w-[150px]"
              : "h-[28px] w-[94px] lg:w-[112px]",
          )}
        >
          <Image
            src={partner.logo.src}
            alt={partner.logo.alt}
            fill
            sizes={trustpilot ? "150px" : "112px"}
            className="object-contain object-left"
          />
        </div>

        {partner.label ? (
          <p className="mt-1 text-[9px] leading-4 text-white/72 sm:text-[10px]">
            {partner.label}
          </p>
        ) : null}

        {partner.rating ? (
          <p className="mt-1 text-[9px] leading-4 text-white/78 sm:text-[10px]">
            {partner.rating.value}
            {partner.rating.reviewCountLabel
              ? ` ${partner.rating.reviewCountLabel}`
              : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function HeroTrustBar({
  data,
  className,
}: HeroTrustBarProps) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-white/[0.10] bg-[#07182B]/88 px-4 py-4 shadow-[0_16px_45px_rgba(0,0,0,0.22)] backdrop-blur-md sm:px-5 lg:px-7",
        className,
      )}
    >
      <div className="grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-[1.15fr_1fr_1fr_1fr_1.55fr] sm:items-center sm:gap-0">
        <div className="col-span-3 border-b border-white/[0.08] pb-4 sm:col-span-1 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-7">
          <p className="max-w-[150px] text-[13px] font-bold leading-[1.35] text-white sm:text-[14px]">
            {data.title}
          </p>
        </div>

        {data.partners.map((partner, index) => (
          <div
            key={partner.id}
            className={cn(
              "sm:px-6",
              index > 0 &&
                partner.key !== "trustpilot" &&
                "sm:border-l sm:border-white/[0.08]",
            )}
          >
            <PartnerLogo partner={partner} />
          </div>
        ))}
      </div>
    </div>
  );
}
