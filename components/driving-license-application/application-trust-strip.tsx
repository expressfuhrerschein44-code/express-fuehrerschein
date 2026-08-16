/**
 * Express-Führerschein
 * Compact trust strip used on desktop and mobile.
 */

import Image from "next/image";

import {
  cn,
} from "@/lib/utils";

export interface ApplicationTrustStripProps {
  compact?:
    boolean;

  className?:
    string;
}

const partners = [
  {
    name:
      "DEKRA",

    image:
      "/images/home/partners/dekra.webp",

    subtitle:
      "Geprüfte Qualität",
  },
  {
    name:
      "TÜV",

    image:
      "/images/home/partners/tuv.webp",

    subtitle:
      "Geprüfte Standards",
  },
  {
    name:
      "KBA",

    image:
      "/images/home/partners/kba.webp",

    subtitle:
      "Anerkannte Standards",
  },
] as const;

export function ApplicationTrustStrip({
  compact =
    false,

  className,
}: ApplicationTrustStripProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-[#BFD8FF] bg-[#F8FBFF]",

        compact
          ? "px-4 py-4"
          : "px-5 py-4",

        className,
      )}
    >
      <div
        className={cn(
          "grid items-center",

          compact
            ? "gap-4"
            : "gap-5 lg:grid-cols-[1.35fr_2fr]",
        )}
      >
        <div>
          <p
            className={cn(
              "font-extrabold text-[#075FEA]",

              compact
                ? "text-[12px]"
                : "text-[13px]",
            )}
          >
            Vertrauen durch geprüfte Qualität
          </p>

          {!compact ? (
            <p className="mt-1 text-[11px] leading-5 text-[#53647A]">
              Unsere Inhalte und Prozesse erfüllen hohe Qualitätsstandards.
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-3 items-center divide-x divide-[#E4EAF2]">
          {partners.map(
            (
              partner,
            ) => (
              <div
                key={
                  partner.name
                }
                className="flex min-w-0 flex-col items-center justify-center px-3 text-center"
              >
                <div
                  className={cn(
                    "relative w-full",

                    compact
                      ? "h-7 max-w-[82px]"
                      : "h-8 max-w-[102px]",
                  )}
                >
                  <Image
                    src={
                      partner.image
                    }
                    alt={
                      partner.name
                    }
                    fill
                    sizes={
                      compact
                        ? "82px"
                        : "102px"
                    }
                    className="object-contain"
                  />
                </div>

                {!compact ? (
                  <span className="mt-1.5 truncate text-[10px] text-[#65758A]">
                    {
                      partner.subtitle
                    }
                  </span>
                ) : null}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
