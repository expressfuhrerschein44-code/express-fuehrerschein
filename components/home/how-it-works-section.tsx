import { HowStep } from "@/components/home/how-step";
import { SectionContainer } from "@/components/layout/section-container";
import { SectionHeading } from "@/components/layout/section-heading";
import { HOME_DATA } from "@/data/home";

export function HowItWorksSection() {
  const section = HOME_DATA.howItWorks;

  return (
    <SectionContainer
      id={section.id}
      tone="light"
      spacing="large"
    >
      <SectionHeading
        eyebrow={section.eyebrow}
        title={section.title}
        subtitle={section.subtitle}
      />

      <div className="relative mt-10 grid gap-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-7">
        <div
          aria-hidden="true"
          className="absolute left-[8%] right-[8%] top-7 hidden border-t border-dashed border-[#CBD8E7] lg:block"
        />

        {section.steps.map((step) => (
          <div
            key={step.id}
            className="relative z-10 rounded-[14px] bg-[#F6F8FB] lg:pr-4"
          >
            <HowStep step={step} />
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
