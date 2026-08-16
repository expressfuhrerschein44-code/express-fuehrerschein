import {
  REGISTRATION_PASSWORD_REQUIREMENTS,
} from "@/data/registration";
import {
  getPasswordRuleResult,
} from "@/lib/validation/registration";
import { cn } from "@/lib/utils";
import type {
  PasswordRequirement,
  PasswordRequirementId,
  PasswordRequirementState,
} from "@/types/registration";

export interface PasswordRequirementsProps {
  password?: string;
  state?: PasswordRequirementState;

  requirements?: readonly PasswordRequirement[];

  className?: string;
}

function RequirementIcon({
  valid,
}: {
  valid: boolean;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn(
        "h-3 w-3 shrink-0",
        valid
          ? "text-[#0BA765]"
          : "text-[#9AA6B5]",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3.4 8.1 2.4 2.4 6-6" />
    </svg>
  );
}

export function PasswordRequirements({
  password = "",
  state,
  requirements =
    REGISTRATION_PASSWORD_REQUIREMENTS,
  className,
}: PasswordRequirementsProps) {
  const calculated =
    state ??
    getPasswordRuleResult(
      password,
    );

  return (
    <div
      aria-label="Passwortanforderungen"
      className={cn(
        "flex flex-wrap gap-1.5",
        className,
      )}
    >
      {requirements.map(
        (requirement) => {
          const valid =
            calculated[
              requirement.id as PasswordRequirementId
            ];

          return (
            <span
              key={requirement.id}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-1",
                "text-[9px] font-medium sm:text-[10px]",
                valid
                  ? "bg-[#ECF8F2] text-[#087B57]"
                  : "bg-[#F5F7FA] text-[#66758A]",
              )}
            >
              <RequirementIcon
                valid={valid}
              />

              {requirement.label}
            </span>
          );
        },
      )}
    </div>
  );
}
