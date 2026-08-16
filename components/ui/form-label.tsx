import type {
  LabelHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export interface FormLabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;

  /**
   * Affiche une étoile visuelle pour les champs obligatoires.
   * L'attribut required du champ reste la source d'accessibilité.
   */
  requiredMark?: boolean;

  /**
   * Texte complémentaire facultatif aligné à droite.
   */
  hint?: ReactNode;
}

export function FormLabel({
  children,
  className,
  requiredMark = false,
  hint,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={cn(
        "mb-2 flex items-center justify-between gap-3",
        "text-[12px] font-bold leading-5 text-[#071426]",
        "sm:text-[13px]",
        className,
      )}
      {...props}
    >
      <span className="min-w-0">
        {children}

        {requiredMark ? (
          <span
            aria-hidden="true"
            className="ml-1 text-[#0878FF]"
          >
            *
          </span>
        ) : null}
      </span>

      {hint ? (
        <span className="shrink-0 text-[10px] font-medium text-[#7A889B] sm:text-[11px]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
