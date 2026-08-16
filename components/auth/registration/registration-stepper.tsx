import {
  REGISTRATION_STEPS,
} from "@/data/registration";
import { cn } from "@/lib/utils";
import type {
  RegistrationStep,
  RegistrationStepId,
} from "@/types/registration";

export interface RegistrationStepperProps {
  currentStep: RegistrationStepId;
  className?: string;
  steps?: readonly RegistrationStep[];
}

function getStepState(
  step: RegistrationStep,
  currentStep: RegistrationStepId,
) {
  const order: Record<
    RegistrationStepId,
    number
  > = {
    account: 1,
    verification: 2,
    success: 3,
  };

  const current =
    order[currentStep];

  if (step.number < current) {
    return "completed" as const;
  }

  if (step.number === current) {
    return "active" as const;
  }

  return "upcoming" as const;
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 18 18"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 9.2 3 3 7-7" />
    </svg>
  );
}

export function RegistrationStepper({
  currentStep,
  className,
  steps = REGISTRATION_STEPS,
}: RegistrationStepperProps) {
  return (
    <nav
      aria-label="Registrierungsfortschritt"
      className={cn(
        "mx-auto w-full max-w-[560px]",
        className,
      )}
    >
      <ol className="grid grid-cols-3">
        {steps.map((step, index) => {
          const state =
            getStepState(
              step,
              currentStep,
            );

          return (
            <li
              key={step.id}
              className="relative flex min-w-0 flex-col items-center"
              aria-current={
                state === "active"
                  ? "step"
                  : undefined
              }
            >
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute right-1/2 top-[15px] h-px w-full",
                    state === "active" ||
                      state === "completed"
                      ? "bg-[#9EC8FF]"
                      : "bg-[#DDE4EC]",
                  )}
                />
              ) : null}

              <span
                className={cn(
                  "relative z-10 inline-flex h-[31px] w-[31px] items-center justify-center rounded-full border bg-white text-[11px] font-extrabold transition-colors",
                  state === "active" &&
                    "border-[#0878FF] bg-[#0878FF] text-white",
                  state === "completed" &&
                    "border-[#0878FF] bg-[#0878FF] text-white",
                  state === "upcoming" &&
                    "border-[#D7DFE8] text-[#66758A]",
                )}
              >
                {state === "completed" ? (
                  <CheckIcon />
                ) : (
                  step.number
                )}
              </span>

              <span
                className={cn(
                  "relative z-10 mt-2 max-w-[110px] truncate px-1 text-center text-[10px] font-medium sm:text-[11px]",
                  state === "active"
                    ? "font-bold text-[#0878FF]"
                    : state === "completed"
                      ? "text-[#4C6480]"
                      : "text-[#66758A]",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
