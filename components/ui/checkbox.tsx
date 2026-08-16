"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  /**
   * Contenu placé à droite de la case.
   * Peut contenir du texte et des liens.
   */
  label?: ReactNode;

  /**
   * Message d'erreur facultatif.
   */
  error?: string;

  /**
   * Classes du wrapper complet.
   */
  wrapperClassName?: string;
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 18 18"
      aria-hidden="true"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 9.2 3 3 7-7" />
    </svg>
  );
}

export const Checkbox = forwardRef<
  HTMLInputElement,
  CheckboxProps
>(function Checkbox(
  {
    id,
    label,
    error,
    className,
    wrapperClassName,
    disabled,
    checked,
    defaultChecked,
    "aria-describedby": ariaDescribedBy,
    ...props
  },
  ref,
) {
  const errorId = id
    ? `${id}-error`
    : undefined;

  const describedBy = [
    ariaDescribedBy,
    error
      ? errorId
      : undefined,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div
      className={cn(
        "w-full",
        wrapperClassName,
      )}
    >
      <label
        className={cn(
          "group flex items-start gap-2.5",
          disabled
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer",
        )}
      >
        <span className="relative mt-[2px] inline-flex h-[18px] w-[18px] shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            disabled={disabled}
            checked={checked}
            defaultChecked={defaultChecked}
            aria-invalid={
              error
                ? true
                : undefined
            }
            aria-describedby={describedBy}
            className={cn(
              "peer absolute inset-0 h-full w-full cursor-pointer opacity-0",
              "disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />

          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border bg-white text-transparent",
              "border-[#C9D3E0]",
              "transition-[background-color,border-color,box-shadow,color] duration-150",
              "peer-focus-visible:border-[#0878FF]",
              "peer-focus-visible:shadow-[0_0_0_3px_rgba(8,120,255,0.12)]",
              "peer-checked:border-[#0878FF]",
              "peer-checked:bg-[#0878FF]",
              "peer-checked:text-white",
              error &&
                "border-[#E5484D]",
            )}
          >
            <CheckIcon />
          </span>
        </span>

        {label ? (
          <span className="text-[11px] leading-[1.65] text-[#59697D] sm:text-[12px]">
            {label}
          </span>
        ) : null}
      </label>

      {error ? (
        <p
          id={errorId}
          className="mt-1.5 pl-[28px] text-[10px] font-medium leading-4 text-[#C93439] sm:text-[11px]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
});

Checkbox.displayName =
  "Checkbox";
