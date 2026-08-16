"use client";

import {
  useState,
} from "react";

import { PasswordRequirements } from "@/components/auth/registration/password-requirements";
import { FormInput } from "@/components/ui/form-input";
import {
  REGISTRATION_FORM_COPY,
} from "@/data/registration";

export interface PasswordFieldProps {
  id?: string;
  name?: string;

  value: string;
  onChange: (value: string) => void;

  error?: string;
  disabled?: boolean;

  showRequirements?: boolean;
  autoComplete?: "new-password" | "current-password";
}

function EyeIcon({
  visible,
}: {
  visible: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {visible ? (
        <>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle
            cx="12"
            cy="12"
            r="2.5"
          />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 6.2A10.6 10.6 0 0 1 12 6c6 0 9.5 6 9.5 6a15.7 15.7 0 0 1-2.1 2.8M6.1 6.1C3.8 7.7 2.5 12 2.5 12s3.5 6 9.5 6a9.9 9.9 0 0 0 3.4-.6" />
        </>
      )}
    </svg>
  );
}

export function PasswordField({
  id = "password",
  name = "password",

  value,
  onChange,

  error,
  disabled = false,

  showRequirements = true,

  autoComplete =
    "new-password",
}: PasswordFieldProps) {
  const [
    visible,
    setVisible,
  ] = useState(false);

  const copy =
    REGISTRATION_FORM_COPY.password;

  return (
    <div className="w-full">
      <FormInput
        id={id}
        name={name}
        type={
          visible
            ? "text"
            : "password"
        }
        value={value}
        disabled={disabled}
        error={error}
        autoComplete={autoComplete}
        placeholder={
          copy.placeholder
        }
        maxLength={128}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        endAdornment={
          <button
            type="button"
            disabled={disabled}
            aria-label={
              visible
                ? copy.hide
                : copy.show
            }
            aria-pressed={visible}
            onClick={() =>
              setVisible(
                (current) =>
                  !current,
              )
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#64748B] outline-none transition-colors hover:bg-[#F1F5F9] focus-visible:ring-2 focus-visible:ring-[#0878FF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <EyeIcon
              visible={visible}
            />
          </button>
        }
      />

      {showRequirements ? (
        <PasswordRequirements
          password={value}
          className="mt-2"
        />
      ) : null}
    </div>
  );
}
