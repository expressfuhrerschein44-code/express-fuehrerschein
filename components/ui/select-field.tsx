import {
  forwardRef,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  /**
   * Liste des options du select.
   */
  options: readonly SelectOption[];

  /**
   * Élément placé à gauche.
   *
   * Exemples :
   * - drapeau ;
   * - icône ;
   * - préfixe visuel.
   */
  startAdornment?: ReactNode;

  /**
   * Élément placé à droite.
   *
   * Exemple :
   * "IP-basiert erkannt"
   */
  endAdornment?: ReactNode;

  /**
   * Message d'erreur.
   */
  error?: string;

  /**
   * Message d'aide affiché
   * lorsqu'il n'y a pas d'erreur.
   */
  helperText?: string;

  /**
   * Classes du conteneur externe.
   */
  wrapperClassName?: string;

  /**
   * Classes du conteneur visuel
   * contenant le select.
   */
  selectWrapperClassName?: string;
}

/* ==========================================================================
   ICON
   ========================================================================== */

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 7.5 5 5 5-5" />
    </svg>
  );
}

/* ==========================================================================
   SELECT FIELD
   ========================================================================== */

export const SelectField = forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(function SelectField(
  {
    id,

    options,

    className,

    startAdornment,
    endAdornment,

    error,
    helperText,

    wrapperClassName,
    selectWrapperClassName,

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
     STATES
     ------------------------------------------------------------------------ */

  const hasError =
    Boolean(error);

  const hasStartAdornment =
    startAdornment != null;

  const hasEndAdornment =
    endAdornment != null;

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
          SELECT CONTAINER
         ================================================================ */}

      <div
        className={cn(
          "group",
          "flex",
          "min-h-[44px]",
          "w-full",
          "items-center",

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

          selectWrapperClassName,
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

              pl-3
              pr-1

              text-[13px]
            "
          >
            {startAdornment}
          </div>
        ) : null}

        {/* ==============================================================
            SELECT
           ============================================================== */}

        <div className="relative min-w-0 flex-1">
          <select
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
              "w-full",

              "appearance-none",

              "border-0",
              "bg-transparent",

              "pr-9",

              "text-[12px]",
              "font-medium",
              "text-[#071426]",

              "outline-none",

              "sm:text-[13px]",

              "disabled:cursor-not-allowed",

              /**
               * IMPORTANT :
               *
               * startAdornment est un ReactNode.
               *
               * Il ne faut donc pas utiliser :
               *
               * startAdornment && "pl-1.5"
               *
               * car ReactNode peut contenir :
               * string | number | element | null...
               *
               * On utilise un booléen normalisé.
               */
              hasStartAdornment
                ? "pl-1.5"
                : "pl-3",

              className,
            )}
            {...props}
          >
            {options.map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                  disabled={
                    option.disabled
                  }
                >
                  {option.label}
                </option>
              ),
            )}
          </select>

          {/* ============================================================
              CHEVRON
             ============================================================ */}

          <span
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              right-2.5
              top-1/2

              -translate-y-1/2

              text-[#5F6E82]
            "
          >
            <ChevronDownIcon />
          </span>
        </div>

        {/* ==============================================================
            END ADORNMENT
           ============================================================== */}

        {hasEndAdornment ? (
          <div
            className="
              hidden
              min-h-[44px]
              shrink-0
              items-center

              border-l
              border-[#E3E8EF]

              px-3

              text-[10px]
              font-medium
              text-[#66758A]

              sm:flex
              sm:text-[11px]
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

SelectField.displayName =
  "SelectField";