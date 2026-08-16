import { SiteContainer } from "@/components/layout/site-container";
import { Button } from "@/components/ui/button";
import { HOME_DATA } from "@/data/home";

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
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

export function FinalCta() {
  const section = HOME_DATA.finalCta;

  return (
    <section
      id={section.id}
      className="relative overflow-hidden bg-[#041326] py-14 text-white sm:py-16 lg:py-20"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 -translate-y-[55%] rounded-full bg-[#0878FF]/20 blur-[90px]"
      />

      <SiteContainer className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[28px] font-extrabold tracking-[-0.04em] sm:text-[34px] lg:text-[42px]">
            {section.title}
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-white/72 sm:text-base">
            {section.subtitle}
          </p>

          <div className="mt-7 flex justify-center">
            <Button
              href={section.cta.href}
              aria-label={section.cta.ariaLabel}
              size="lg"
              iconRight={<ArrowRightIcon />}
              className="w-full sm:w-auto sm:min-w-[180px]"
            >
              {section.cta.label}
            </Button>
          </div>

          {section.note ? (
            <p className="mt-3 text-[11px] text-white/50">
              {section.note}
            </p>
          ) : null}
        </div>
      </SiteContainer>
    </section>
  );
}
