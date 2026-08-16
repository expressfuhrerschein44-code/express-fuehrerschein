import { cn } from "@/lib/utils";
import type { ProgramPhase } from "@/types/home";

export interface ProgramPhaseCardProps {
  phase: ProgramPhase;
  active?: boolean;
}

export function ProgramPhaseCard({
  phase,
  active = false,
}: ProgramPhaseCardProps) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-[16px] border bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.05)] transition-all duration-200 sm:p-6",
        active
          ? "border-[#0878FF] shadow-[0_16px_38px_rgba(8,120,255,0.10)]"
          : "border-[#E2E8F0]",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex min-h-7 items-center rounded-full bg-[#EEF6FF] px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0878FF]">
          {phase.days}
        </span>

        <span
          aria-hidden="true"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-extrabold",
            active
              ? "border-[#0878FF] bg-[#0878FF] text-white"
              : "border-[#DCE5F0] bg-[#F8FAFD] text-[#75849A]",
          )}
        >
          {phase.step}
        </span>
      </div>

      <h3 className="mt-5 text-[18px] font-extrabold tracking-[-0.025em] text-[#071426] sm:text-[20px]">
        {phase.title}
      </h3>

      <p className="mt-2 text-[13px] leading-6 text-[#66758A] sm:text-[14px]">
        {phase.description}
      </p>
    </article>
  );
}
