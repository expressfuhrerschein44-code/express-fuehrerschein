import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeading } from "@/components/layout/section-heading";
import { Accordion } from "@/components/ui/accordion";
import { HOME_DATA } from "@/data/home";

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
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

export function FaqSection() {
  const section = HOME_DATA.faq;

  return (
    <SectionContainer
      id={section.id}
      tone="white"
      spacing="large"
      containerSize="content"
    >
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        subtitle={section.subtitle}
      />

      <div className="mt-8 rounded-[16px] border border-[#E2E8F0] bg-white px-5 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:px-7">
        <Accordion
          items={section.items}
        />
      </div>

      <div className="mt-6 flex justify-center">
        <a
          href={section.viewAll.href}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-[12px] font-semibold text-[#0878FF] outline-none transition-colors hover:text-[#006BEA] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
        >
          {section.viewAll.label}
          <ArrowRightIcon />
        </a>
      </div>
    </SectionContainer>
  );
}
