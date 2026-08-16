import Image from "next/image";

import { RegistrationTrustBar } from "@/components/auth/registration/registration-trust-bar";
import { BrandLogo } from "@/components/shared/brand-logo";
import {
  REGISTRATION_ASSETS,
  REGISTRATION_BENEFITS,
  REGISTRATION_COPY,
} from "@/data/registration";
import { cn } from "@/lib/utils";
import type { RegistrationBenefit } from "@/types/registration";

export interface RegistrationSidePanelProps {
  className?: string;
}

function BenefitIcon({
  icon,
}: {
  icon: RegistrationBenefit["icon"];
}) {
  const common = (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icon === "shield" ? (
        <>
          <path d="M12 3 5 6v5c0 4.7 2.7 8 7 10 4.3-2 7-5.3 7-10V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      ) : null}

      {icon === "timer" ? (
        <>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 1.5M9 2h6M12 5V2" />
        </>
      ) : null}

      {icon === "monitor" ? (
        <>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </>
      ) : null}

      {icon === "headphones" ? (
        <>
          <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
          <path d="M4 13h3v6H5.5A1.5 1.5 0 0 1 4 17.5V13ZM20 13h-3v6h1.5a1.5 1.5 0 0 0 1.5-1.5V13Z" />
        </>
      ) : null}
    </svg>
  );

  return common;
}

export function RegistrationSidePanel({
  className,
}: RegistrationSidePanelProps) {
  const copy =
    REGISTRATION_COPY.sidePanel;

  return (
    <aside
      className={cn(
        "relative hidden min-h-screen overflow-hidden bg-[#020914] text-white lg:flex lg:w-[40%] xl:w-[38%]",
        className,
      )}
    >
      <Image
        src={REGISTRATION_ASSETS.sidePanel}
        alt=""
        fill
        priority
        sizes="(min-width: 1280px) 38vw, 40vw"
        className="object-cover object-center"
        aria-hidden="true"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,9,20,0.98)_0%,rgba(2,9,20,0.88)_37%,rgba(2,9,20,0.44)_66%,rgba(2,9,20,0.72)_100%)]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_25%_52%,rgba(8,120,255,0.12),transparent_40%)]"
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col px-8 py-7 xl:px-10 xl:py-8">
        <BrandLogo
          priority
          imageClassName="w-[225px] xl:w-[250px]"
        />

        <div className="mt-[72px] max-w-[420px] xl:mt-[82px]">
          <h1 className="text-[32px] font-extrabold leading-[1.25] tracking-[-0.035em] xl:text-[38px]">
            <span className="block">
              {copy.titleLine1}
            </span>

            <span className="block">
              <span className="text-[#0878FF]">
                {copy.titleHighlight}
              </span>{" "}
              {copy.titleLine2}
            </span>
          </h1>

          <p className="mt-5 max-w-[390px] text-[14px] leading-7 text-white/78 xl:text-[15px]">
            {copy.description}
          </p>

          <div className="mt-7 space-y-5 xl:mt-8">
            {REGISTRATION_BENEFITS.map((benefit) => (
              <div
                key={benefit.id}
                className="flex items-start gap-4"
              >
                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#15426F] bg-[#071D36]/88 text-[#1684FF] shadow-[0_8px_22px_rgba(0,0,0,0.14)]">
                  <BenefitIcon
                    icon={benefit.icon}
                  />
                </div>

                <div className="pt-0.5">
                  <h2 className="text-[14px] font-extrabold leading-5 text-white">
                    {benefit.title}
                  </h2>

                  <p className="mt-1 text-[12px] leading-5 text-white/66">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <RegistrationTrustBar
          className="mt-auto"
        />
      </div>
    </aside>
  );
}
