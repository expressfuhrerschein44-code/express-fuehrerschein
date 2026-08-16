import { IconCircle } from "@/components/ui/icon-circle";
import type { HowItWorksStep } from "@/types/home";

export interface HowStepProps {
  step: HowItWorksStep;
}

export function HowStep({
  step,
}: HowStepProps) {
  return (
    <article className="relative flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
      <div className="flex items-center gap-3">
        <IconCircle
          name={step.icon?.name ?? "check"}
          tone="blue"
          size="lg"
        />

        <span className="text-[12px] font-extrabold tracking-[0.12em] text-[#0878FF]">
          {step.number}
        </span>
      </div>

      <h3 className="mt-4 text-[16px] font-extrabold tracking-[-0.02em] text-[#071426] sm:text-[17px]">
        {step.title}
      </h3>

      <p className="mt-2 max-w-[250px] text-[12px] leading-5 text-[#66758A] sm:text-[13px]">
        {step.description}
      </p>
    </article>
  );
}
