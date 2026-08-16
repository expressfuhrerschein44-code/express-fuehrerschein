import { LoginForm } from "@/components/auth/login/login-form";

import {
  LOGIN_COPY,
} from "@/data/login";

import { cn } from "@/lib/utils";

import type {
  SupportedCountryCode,
} from "@/types/country";

export interface LoginCardProps {
  initialCountryCode?:
    SupportedCountryCode;

  returnTo?:
    string;

  className?:
    string;
}

export function LoginCard({
  initialCountryCode =
    "DE",

  returnTo,

  className,
}: LoginCardProps) {
  return (
    <section
      aria-labelledby="login-card-title"
      className={cn(
        "w-full",
        "rounded-[16px]",
        "border border-[#E1E6ED]",
        "bg-white",
        "px-5 py-8",
        "shadow-[0_18px_50px_rgba(7,20,38,0.08)]",
        "sm:px-8 sm:py-10",
        "lg:px-10 lg:py-12",
        className,
      )}
    >
      <div className="text-center">
        <h1
          id="login-card-title"
          className="
            text-[26px]
            font-extrabold
            tracking-[-0.035em]
            text-[#071426]
            sm:text-[30px]
          "
        >
          {
            LOGIN_COPY
              .card
              .title
          }
        </h1>

        <p className="mt-2 text-[12px] leading-5 text-[#66758A] sm:text-[13px]">
          {
            LOGIN_COPY
              .card
              .subtitle
          }
        </p>
      </div>

      <LoginForm
        initialCountryCode={
          initialCountryCode
        }
        returnTo={
          returnTo
        }
        className="mt-8"
      />
    </section>
  );
}
