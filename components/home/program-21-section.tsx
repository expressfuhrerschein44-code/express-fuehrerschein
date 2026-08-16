import { ProgramPhaseCard } from "@/components/home/program-phase-card";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeading } from "@/components/layout/section-heading";
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

export function Program21Section() {
  const section = HOME_DATA.program21;

  return (
    <SectionContainer
      id={section.id}
      tone="white"
      spacing="large"
    >
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        subtitle={section.subtitle}
      />

      <div className="relative mt-10 lg:mt-12">
        <div
          aria-hidden="true"
          className="absolute left-[16.666%] right-[16.666%] top-[28px] hidden h-px bg-[#D9E4F0] lg:block"
        />

        <div className="relative grid gap-5 md:grid-cols-3">
          {section.phases.map((phase, index) => (
            <ProgramPhaseCard
              key={phase.id}
              phase={phase}
              active={index === 1}
            />
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          href={section.cta.href}
          size="lg"
          iconRight={<ArrowRightIcon />}
        >
          {section.cta.label}
        </Button>
      </div>
    </SectionContainer>
  );
}
