/**
 * Express-Führerschein
 * Shared password-reset card.
 */

import type {
  ReactNode,
} from "react";

import {
  PASSWORD_RESET_COPY,
} from "@/data/password-reset";

export interface PasswordResetCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  icon?: ReactNode;
  showSecurityNotice?: boolean;
}

function DefaultLockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2.5"
      />
      <path d="M8.5 10V7.8a3.5 3.5 0 1 1 7 0V10" />
    </svg>
  );
}

function SecurityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 5.5 5.7v5.6c0 4.2 2.6 7.9 6.5 9.7 3.9-1.8 6.5-5.5 6.5-9.7V5.7L12 3Z" />
      <path d="m9.3 12.2 1.8 1.8 3.8-4" />
    </svg>
  );
}

export function PasswordResetCard({
  title,
  subtitle,
  children,
  icon,
  showSecurityNotice =
    true,
}: PasswordResetCardProps) {
  return (
    <div className="w-full">
      <section className="rounded-[22px] border border-[#E1E7EF] bg-white px-5 py-7 shadow-[0_20px_55px_rgba(8,24,44,0.09)] sm:px-8 sm:py-9">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#EDF6FF] text-[#0878FF]">
          {icon ?? <DefaultLockIcon />}
        </div>

        <div className="mx-auto max-w-[420px] text-center">
          <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.035em] text-[#09182A] sm:text-[29px]">
            {title}
          </h2>

          <p className="mt-2.5 text-[13px] leading-6 text-[#67778B] sm:text-[14px]">
            {subtitle}
          </p>
        </div>

        <div className="mt-7">
          {children}
        </div>
      </section>

      {showSecurityNotice ? (
        <div className="mx-auto mt-5 flex max-w-[470px] items-start gap-3 px-2 text-[#6E8094]">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EAF4FF] text-[#0878FF]">
            <SecurityIcon />
          </span>

          <div>
            <p className="text-[11px] font-bold leading-5 text-[#40546A]">
              {PASSWORD_RESET_COPY.security.title}
            </p>
            <p className="mt-0.5 text-[10px] leading-[1.7] sm:text-[11px]">
              {PASSWORD_RESET_COPY.security.description}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
