import Image from "next/image";

import { BrandLogo } from "@/components/shared/brand-logo";
import { LoginTrustBar } from "@/components/auth/login/login-trust-bar";

import {
  LOGIN_ASSETS,
  LOGIN_BENEFITS,
  LOGIN_COPY,
} from "@/data/login";

import { cn } from "@/lib/utils";

import type {
  LoginBenefit,
} from "@/types/login";

export interface LoginSidePanelProps {
  className?: string;
}

function BenefitIcon({
  icon,
}: {
  icon: LoginBenefit["icon"];
}) {
  return (
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
      {icon === "graduation-cap" ? (
        <>
          <path d="m3 9 9-5 9 5-9 5-9-5Z" />
          <path d="M7 11.5V16c2.8 2.1 7.2 2.1 10 0v-4.5" />
        </>
      ) : null}

      {icon === "timer" ? (
        <>
          <circle
            cx="12"
            cy="13"
            r="8"
          />
          <path d="M12 9v4l2.5 1.5M9 2h6M12 5V2" />
        </>
      ) : null}

      {icon === "shield" ? (
        <>
          <path d="M12 3 5 6v5c0 4.7 2.7 8 7 10 4.3-2 7-5.3 7-10V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
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
}

export function LoginSidePanel({
  className,
}: LoginSidePanelProps) {
  const copy =
    LOGIN_COPY.sidePanel;

  return (
    <aside
      className={cn(
        "relative hidden min-h-screen overflow-hidden",
        "bg-[#020914] text-white",
        "lg:flex lg:w-[50%]",
        "xl:w-[50%]",
        className,
      )}
    >
      {/* Background image */}

      <Image
        src={LOGIN_ASSETS.sidePanel}
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover object-center"
        aria-hidden="true"
      />

      {/* Dark readability overlays */}

      <div
        aria-hidden="true"
        className="
          absolute inset-0
          bg-[linear-gradient(180deg,rgba(2,9,20,0.98)_0%,rgba(2,9,20,0.92)_30%,rgba(2,9,20,0.50)_62%,rgba(2,9,20,0.64)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_18%_45%,rgba(8,120,255,0.11),transparent_38%)]
        "
      />

      <div
        className="
          relative z-10
          flex min-h-screen w-full flex-col
          px-8 py-7
          xl:px-12 xl:py-8
        "
      >
        {/* Brand */}

        <BrandLogo
          priority
          imageClassName="w-[250px] xl:w-[285px]"
        />

        {/* Copy */}

        <div className="mt-[74px] max-w-[440px] xl:mt-[88px]">
          <h1
            className="
              text-[34px]
              font-extrabold
              leading-[1.26]
              tracking-[-0.038em]
              xl:text-[38px]
            "
          >
            <span className="block">
              {copy.titleLine1}
            </span>

            <span className="mt-1 block">
              {copy.titleLine2}
            </span>

            <span className="mt-1 block text-[#0878FF]">
              {copy.titleHighlight}
            </span>
          </h1>

          <p
            className="
              mt-5 max-w-[400px]
              text-[14px] leading-7
              text-white/78
              xl:text-[15px]
            "
          >
            {copy.description}
          </p>

          {/* Benefits */}

          <div className="mt-7 space-y-5 xl:mt-8">
            {LOGIN_BENEFITS.map((benefit) => (
              <div
                key={benefit.id}
                className="flex items-start gap-4"
              >
                <div
                  className="
                    inline-flex h-11 w-11 shrink-0 items-center justify-center
                    rounded-full border border-[#15426F]
                    bg-[#071D36]/88
                    text-[#1684FF]
                    shadow-[0_8px_22px_rgba(0,0,0,0.14)]
                  "
                >
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

        {/* Trust */}

        <LoginTrustBar
          className="mt-auto"
        />
      </div>
    </aside>
  );
}
