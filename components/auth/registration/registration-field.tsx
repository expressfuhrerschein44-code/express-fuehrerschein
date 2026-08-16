import type {
  ReactNode,
} from "react";

import { FormLabel } from "@/components/ui/form-label";
import { cn } from "@/lib/utils";

export interface RegistrationFieldProps {
  htmlFor?: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function RegistrationField({
  htmlFor,
  label,
  required = false,
  hint,
  children,
  className,
}: RegistrationFieldProps) {
  return (
    <div
      className={cn(
        "min-w-0",
        className,
      )}
    >
      <FormLabel
        htmlFor={htmlFor}
        requiredMark={required}
        hint={hint}
      >
        {label}
      </FormLabel>

      {children}
    </div>
  );
}
