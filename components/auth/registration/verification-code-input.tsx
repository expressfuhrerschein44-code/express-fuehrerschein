"use client";

import {
  useEffect,
  useMemo,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/utils";

export interface VerificationCodeInputProps {
  value: string;

  onChange: (
    value: string,
  ) => void;

  length?: number;

  disabled?: boolean;
  autoFocus?: boolean;

  error?: string;

  className?: string;

  /**
   * Optional callback once all digits are entered.
   */
  onComplete?: (
    value: string,
  ) => void;
}

function onlyDigits(
  value: string,
  length: number,
): string {
  return value
    .replace(/\D/g, "")
    .slice(0, length);
}

export function VerificationCodeInput({
  value,
  onChange,

  length = 6,

  disabled = false,
  autoFocus = true,

  error,

  className,

  onComplete,
}: VerificationCodeInputProps) {
  const refs =
    useRef<
      Array<HTMLInputElement | null>
    >([]);

  const normalized =
    useMemo(
      () =>
        onlyDigits(
          value,
          length,
        ),
      [value, length],
    );

  const digits =
    Array.from(
      { length },
      (_, index) =>
        normalized[index] ?? "",
    );

  useEffect(() => {
    if (
      autoFocus &&
      !disabled
    ) {
      refs.current[0]?.focus();
    }
  }, [
    autoFocus,
    disabled,
  ]);

  const commit = (
    nextValue: string,
  ) => {
    const next =
      onlyDigits(
        nextValue,
        length,
      );

    onChange(next);

    if (
      next.length === length
    ) {
      onComplete?.(next);
    }
  };

  const setDigit = (
    index: number,
    rawValue: string,
  ) => {
    const incoming =
      onlyDigits(
        rawValue,
        length,
      );

    if (!incoming) {
      const next =
        digits
          .map(
            (digit, digitIndex) =>
              digitIndex === index
                ? ""
                : digit,
          )
          .join("");

      commit(next);
      return;
    }

    /**
     * Mobile keyboards sometimes send multiple digits at once.
     * Treat that exactly like a paste operation starting at this field.
     */
    const nextDigits =
      [...digits];

    incoming
      .split("")
      .forEach(
        (
          digit,
          offset,
        ) => {
          const target =
            index + offset;

          if (
            target < length
          ) {
            nextDigits[target] =
              digit;
          }
        },
      );

    const next =
      nextDigits.join("");

    commit(next);

    const focusIndex =
      Math.min(
        index +
          incoming.length,
        length - 1,
      );

    refs.current[
      focusIndex
    ]?.focus();
  };

  const handleKeyDown = (
    event:
      KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (
      event.key ===
        "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      refs.current[
        index - 1
      ]?.focus();

      return;
    }

    if (
      event.key ===
        "ArrowLeft" &&
      index > 0
    ) {
      event.preventDefault();

      refs.current[
        index - 1
      ]?.focus();
    }

    if (
      event.key ===
        "ArrowRight" &&
      index <
        length - 1
    ) {
      event.preventDefault();

      refs.current[
        index + 1
      ]?.focus();
    }

    if (
      event.key ===
      "Home"
    ) {
      event.preventDefault();

      refs.current[0]
        ?.focus();
    }

    if (
      event.key ===
      "End"
    ) {
      event.preventDefault();

      refs.current[
        length - 1
      ]?.focus();
    }
  };

  const handlePaste = (
    event:
      ClipboardEvent<HTMLInputElement>,
  ) => {
    event.preventDefault();

    const pasted =
      onlyDigits(
        event.clipboardData
          .getData("text"),
        length,
      );

    if (!pasted) {
      return;
    }

    commit(pasted);

    refs.current[
      Math.min(
        pasted.length,
        length,
      ) - 1
    ]?.focus();
  };

  return (
    <div
      className={cn(
        "w-full",
        className,
      )}
    >
      <div
        role="group"
        aria-label={`${length}-stelliger Bestätigungscode`}
        className="grid grid-cols-6 gap-2 sm:gap-3"
      >
        {digits.map(
          (digit, index) => (
            <input
              key={index}
              ref={(element) => {
                refs.current[
                  index
                ] = element;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={
                index === 0
                  ? "one-time-code"
                  : "off"
              }
              disabled={disabled}
              value={digit}
              maxLength={1}
              aria-label={`Ziffer ${index + 1} von ${length}`}
              aria-invalid={
                error
                  ? true
                  : undefined
              }
              onFocus={(event) =>
                event.currentTarget
                  .select()
              }
              onChange={(event) =>
                setDigit(
                  index,
                  event.target.value,
                )
              }
              onKeyDown={(event) =>
                handleKeyDown(
                  event,
                  index,
                )
              }
              onPaste={
                handlePaste
              }
              className={cn(
                "h-[52px] min-w-0 rounded-[9px] border bg-white text-center",
                "text-[20px] font-extrabold text-[#071426]",
                "outline-none transition-[border-color,box-shadow,background-color] duration-150",
                "focus:border-[#0878FF] focus:shadow-[0_0_0_3px_rgba(8,120,255,0.10)]",
                "disabled:cursor-not-allowed disabled:bg-[#F4F6F8] disabled:opacity-70",
                error
                  ? "border-[#E5484D]"
                  : digit
                    ? "border-[#9EC8FF]"
                    : "border-[#D8E0EA]",
                "sm:h-[58px] sm:text-[23px]",
              )}
            />
          ),
        )}
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-2 text-center text-[10px] font-medium leading-4 text-[#C93439] sm:text-[11px]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
