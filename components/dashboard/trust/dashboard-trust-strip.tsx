/**
 * Express-Führerschein
 * Desktop trust/security strip.
 *
 * Uses existing project partner assets.
 */

import Image from "next/image";

import {
  cn,
} from "@/lib/utils";

export interface DashboardTrustStripProps {
  className?:
    string;
}

const PARTNERS = [
  {
    name:
      "DEKRA",

    src:
      "/images/home/partners/dekra.webp",
  },
  {
    name:
      "TÜV",

    src:
      "/images/home/partners/tuv.webp",
  },
  {
    name:
      "KBA",

    src:
      "/images/home/partners/kba.webp",
  },
] as const;

export function DashboardTrustStrip({
  className,
}: DashboardTrustStripProps) {
  return (
    <section
      aria-label="Sicherheit und Vertrauen"
      className={cn(
        "rounded-2xl border border-[#E3E8EF] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(15,23,42,0.03)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold text-[#172233]">
            Sicher. Professionell. Vertrauenswürdig.
          </p>

          <p className="mt-1 text-[9px] text-[#768598]">
            Datenschutzorientierte Plattform für deine Führerscheinausbildung.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-5">
          {PARTNERS.map(
            (
              partner,
            ) => (
              <div
                key={partner.name}
                className="relative h-7 w-[74px]"
                title={partner.name}
              >
                <Image
                  src={partner.src}
                  alt={partner.name}
                  fill
                  sizes="74px"
                  className="object-contain"
                />
              </div>
            ),
          )}

          <div className="flex items-center gap-2 rounded-lg border border-[#E1E7EE] px-3 py-2">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-[#00A86B]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="5" y="10" width="14" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>

            <span className="text-[9px] font-bold text-[#39495D]">
              SSL / DSGVO
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
