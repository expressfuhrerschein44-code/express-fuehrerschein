import { Button } from "@/components/ui/button";
import {
  REGISTRATION_COPY,
} from "@/data/registration";
import { cn } from "@/lib/utils";

export interface RegistrationSuccessProps {
  title?: string;
  subtitle?: string;

  ctaLabel?: string;
  ctaHref?: string;

  className?: string;
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="h-9 w-9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 16.5 5 5L24.5 10" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
}

export function RegistrationSuccess({
  title =
    REGISTRATION_COPY
      .success.title,

  subtitle =
    REGISTRATION_COPY
      .success.subtitle,

  ctaLabel =
    REGISTRATION_COPY
      .success.ctaLabel,

  ctaHref = "/",

  className,
}: RegistrationSuccessProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[520px] text-center",
        className,
      )}
    >
      <div className="mx-auto inline-flex h-[74px] w-[74px] items-center justify-center rounded-full border border-[#BCE7D3] bg-[#EAF9F3] text-[#0BA765] shadow-[0_10px_28px_rgba(11,167,101,0.12)]">
        <CheckIcon />
      </div>

      <h2 className="mt-6 text-[24px] font-extrabold tracking-[-0.035em] text-[#071426] sm:text-[28px]">
        {title}
      </h2>

      <p className="mx-auto mt-3 max-w-[440px] text-[12px] leading-6 text-[#66758A] sm:text-[13px]">
        {subtitle}
      </p>

      <div className="mt-7">
        <Button
          href={ctaHref}
          size="lg"
          fullWidth
          iconRight={
            <ArrowRightIcon />
          }
          className="min-h-[48px] sm:mx-auto sm:w-auto sm:min-w-[220px]"
        >
          {ctaLabel}
        </Button>
      </div>

      <p className="mt-4 text-[10px] leading-5 text-[#8A97A8] sm:text-[11px]">
        Deine E-Mail-Adresse wurde erfolgreich bestätigt.
      </p>
    </div>
  );
}
