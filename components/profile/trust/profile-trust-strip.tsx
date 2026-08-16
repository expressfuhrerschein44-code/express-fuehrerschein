/**
 * Express-Führerschein
 * Partner trust strip.
 */

import Image from "next/image";

import {
  ProfileCard,
} from "@/components/profile/shared/profile-card";

import {
  cn,
} from "@/lib/utils";

export interface ProfileTrustStripProps {
  compact?:
    boolean;

  className?:
    string;
}

const PARTNERS = [
  {
    name:
      "DEKRA",

    src:
      "/images/home/partners/dekra.webp",

    subtitle:
      "Geprüfte Qualität",
  },
  {
    name:
      "TÜV",

    src:
      "/images/home/partners/tuv.webp",

    subtitle:
      "Geprüfte Standards",
  },
  {
    name:
      "KBA",

    src:
      "/images/home/partners/kba.webp",

    subtitle:
      "Anerkannt durch die KBA",
  },
] as const;

export function ProfileTrustStrip({
  compact =
    false,
  className,
}: ProfileTrustStripProps) {
  return (
    <ProfileCard
      className={cn(
        compact
          ? "p-4"
          : "px-6 py-5",
        className,
      )}
    >
      {compact ? (
        <>
          <p
            className="text-[11px] font-extrabold text-[#0878FF]"
          >
            Vertrauen durch starke Partner
          </p>

          <div
            className="mt-4 grid grid-cols-3 items-center gap-4"
          >
            {PARTNERS.map(
              (
                partner,
              ) => (
                <div
                  key={
                    partner.name
                  }
                  className="relative h-7"
                >
                  <Image
                    src={
                      partner.src
                    }
                    alt={
                      partner.name
                    }
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>
              ),
            )}
          </div>
        </>
      ) : (
        <div
          className="grid grid-cols-[1.2fr_repeat(3,1fr)] items-center gap-6"
        >
          <div>
            <p
              className="text-[12px] font-extrabold text-[#0878FF]"
            >
              Vertrauen durch starke Partner
            </p>

            <p
              className="mt-2 text-[10px] text-[#607086]"
            >
              Sichere Prozesse und höchste Standards.
            </p>
          </div>

          {PARTNERS.map(
            (
              partner,
            ) => (
              <div
                key={
                  partner.name
                }
                className="min-w-0"
              >
                <div
                  className="relative h-8 w-[92px]"
                >
                  <Image
                    src={
                      partner.src
                    }
                    alt={
                      partner.name
                    }
                    fill
                    sizes="92px"
                    className="object-contain"
                  />
                </div>

                <p
                  className="mt-2 text-[9px] text-[#607086]"
                >
                  {
                    partner.subtitle
                  }
                </p>
              </div>
            ),
          )}
        </div>
      )}
    </ProfileCard>
  );
}
