import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface FormInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Message d'erreur associé au champ.
   */
  error?: string;

  /**
   * Texte d'aide affiché sous le champ
   * lorsqu'il n'y a pas d'erreur.
   */
  helperText?: string;

  /**
   * Élément placé à gauche dans le champ.
   *
   * Exemples :
   * - drapeau ;
   * - indicatif téléphonique ;
   * - icône.
   */
  startAdornment?: ReactNode;

  /**
   * Élément placé à droite dans le champ.
   *
   * Exemples :
   * - bouton afficher/masquer le mot de passe ;
   * - icône ;
   * - indicateur.
   */
  endAdornment?: ReactNode;

  /**
   * Classes appliquées au conteneur externe.
   */
  wrapperClassName?: string;

  /**
   * Classes appliquées au conteneur visuel
   * contenant l'input.
   */
  inputWrapperClassName?: string;
}

/* ==========================================================================
   FORM INPUT
   ========================================================================== */

export const FormInput = forwardRef<
  HTMLInputElement,
  FormInputProps
>(function FormInput(
  {
    id,

    className,

    error,
    helperText,

    startAdornment,
    endAdornment,

    wrapperClassName,
    inputWrapperClassName,

    disabled,

    "aria-describedby":
      ariaDescribedBy,

    "aria-invalid":
      ariaInvalid,

    ...props
  },
  ref,
) {
  /* ------------------------------------------------------------------------
     MESSAGE ID
     ------------------------------------------------------------------------ */

  const messageId =
    id && (error || helperText)
      ? `${id}-message`
      : undefined;

  /* ------------------------------------------------------------------------
     ARIA DESCRIBED BY
     ------------------------------------------------------------------------ */

  const describedBy = [
    ariaDescribedBy,
    messageId,
  ]
    .filter(
      (
        value,
      ): value is string =>
        typeof value ===
          "string" &&
        value.length > 0,
    )
    .join(" ");

  /* ------------------------------------------------------------------------
     STATES
     ------------------------------------------------------------------------ */

  const hasError =
    Boolean(error);

  const hasStartAdornment =
    startAdornment != null;

  const hasEndAdornment =
    endAdornment != null;

  /* ------------------------------------------------------------------------
     RENDER
     ------------------------------------------------------------------------ */

  return (
    <div
      className={cn(
        "w-full",
        wrapperClassName,
      )}
    >
      {/* ================================================================
          INPUT CONTAINER
         ================================================================ */}

      <div
        className={cn(
          "group",
          "flex",
          "min-h-[44px]",
          "w-full",
          "items-center",
          "overflow-hidden",
          "rounded-[8px]",
          "border",
          "bg-white",

          "transition-[border-color,box-shadow,background-color]",
          "duration-150",

          "focus-within:border-[#0878FF]",
          "focus-within:shadow-[0_0_0_3px_rgba(8,120,255,0.10)]",

          hasError
            ? [
                "border-[#E5484D]",
                "focus-within:border-[#E5484D]",
                "focus-within:shadow-[0_0_0_3px_rgba(229,72,77,0.10)]",
              ].join(" ")
            : "border-[#D8E0EA]",

          disabled
            ? "cursor-not-allowed bg-[#F4F6F8] opacity-70"
            : undefined,

          inputWrapperClassName,
        )}
      >
        {/* ==============================================================
            START ADORNMENT
           ============================================================== */}

        {hasStartAdornment ? (
          <div
            className="
              flex
              min-h-[44px]
              shrink-0
              items-center

              border-r
              border-[#E3E8EF]

              px-3

              text-[12px]
              text-[#071426]
            "
          >
            {startAdornment}
          </div>
        ) : null}

        {/* ==============================================================
            INPUT
           ============================================================== */}

        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={
            hasError
              ? true
              : ariaInvalid
          }
          aria-describedby={
            describedBy ||
            undefined
          }
          className={cn(
            "min-h-[44px]",
            "min-w-0",
            "flex-1",

            "border-0",
            "bg-transparent",

            "px-3.5",

            "text-[13px]",
            "font-medium",
            "text-[#071426]",

            "outline-none",

            "placeholder:font-normal",
            "placeholder:text-[#8A97A8]",

            "disabled:cursor-not-allowed",

            /*
             * IMPORTANT :
             *
             * On utilise volontairement un ternaire.
             *
             * startAdornment est un ReactNode.
             * L'expression :
             *
             * startAdornment && "pl-3"
             *
             * peut produire un ReactNode et provoquer
             * une erreur TypeScript dans cn().
             */
            hasStartAdornment
              ? "pl-3"
              : undefined,

            hasEndAdornment
              ? "pr-2"
              : undefined,

            className,
          )}
          {...props}
        />

        {/* ==============================================================
            END ADORNMENT
           ============================================================== */}

        {hasEndAdornment ? (
          <div
            className="
              flex
              min-h-[44px]
              shrink-0
              items-center
              justify-center

              pr-2

              text-[#64748B]
            "
          >
            {endAdornment}
          </div>
        ) : null}
      </div>

      {/* ================================================================
          ERROR / HELPER MESSAGE
         ================================================================ */}

      {error || helperText ? (
        <p
          id={messageId}
          role={
            error
              ? "alert"
              : undefined
          }
          aria-live={
            error
              ? "polite"
              : undefined
          }
          className={cn(
            "mt-1.5",
            "text-[10px]",
            "leading-4",

            "sm:text-[11px]",

            error
              ? "font-medium text-[#C93439]"
              : "text-[#66758A]",
          )}
        >
          {error ?? helperText}
        </p>
      ) : null}
    </div>
  );
});

/* ==========================================================================
   DISPLAY NAME
   ========================================================================== */

FormInput.displayName =
  "FormInput";