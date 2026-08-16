import { FormInput } from "@/components/ui/form-input";

import {
  LOGIN_COPY,
  LOGIN_SETTINGS,
} from "@/data/login";

export interface LoginIdentifierFieldProps {
  id?: string;
  name?: string;

  value: string;

  onChange:
    (value: string) => void;

  error?: string;

  disabled?: boolean;
}

/* ==========================================================================
   ICON
   ========================================================================== */

function IdentifierIcon() {
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
      <rect
        x="3.5"
        y="5.5"
        width="17"
        height="13"
        rx="2"
      />

      <path d="m5 7 7 5 7-5" />
    </svg>
  );
}

/* ==========================================================================
   FIELD
   ========================================================================== */

export function LoginIdentifierField({
  id = "identifier",
  name = "identifier",

  value,
  onChange,

  error,

  disabled = false,
}: LoginIdentifierFieldProps) {
  return (
    <FormInput
      id={id}
      name={name}
      type="text"
      inputMode="text"
      autoComplete="username"
      spellCheck={false}
      autoCapitalize="none"
      disabled={disabled}
      maxLength={
        LOGIN_SETTINGS
          .identifierMaxLength
      }
      value={value}
      error={error}
      placeholder={
        LOGIN_COPY
          .form
          .identifierPlaceholder
      }
      startAdornment={
        <span className="text-[#718096]">
          <IdentifierIcon />
        </span>
      }
      onChange={(event) =>
        onChange(
          event.target.value,
        )
      }
    />
  );
}
