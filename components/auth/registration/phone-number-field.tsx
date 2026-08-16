"use client";

import { FormInput } from "@/components/ui/form-input";
import {
  REGISTRATION_COUNTRIES,
} from "@/data/registration";
import type {
  SupportedCountryCode,
} from "@/types/country";
import type {
  RegistrationCountry,
} from "@/types/registration";

export interface PhoneNumberFieldProps {
  id?: string;
  name?: string;

  countryCode: SupportedCountryCode;
  value: string;

  onChange: (value: string) => void;

  error?: string;
  disabled?: boolean;

  placeholder?: string;
  helperText?: string;

  countries?: readonly RegistrationCountry[];
}

export function PhoneNumberField({
  id = "phone",
  name = "phone",

  countryCode,
  value,

  onChange,

  error,
  disabled = false,

  placeholder = "Deine Telefonnummer",
  helperText,

  countries = REGISTRATION_COUNTRIES,
}: PhoneNumberFieldProps) {
  const country =
    countries.find(
      (item) =>
        item.code ===
        countryCode,
    ) ??
    countries[0];

  return (
    <FormInput
      id={id}
      name={name}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      disabled={disabled}
      value={value}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      startAdornment={
        <span className="inline-flex min-w-[66px] items-center gap-2 whitespace-nowrap">
          <span
            aria-hidden="true"
            className="text-[16px]"
          >
            {country?.flag ?? "🌍"}
          </span>

          <span className="font-semibold text-[#071426]">
            {country?.dialCode ?? ""}
          </span>
        </span>
      }
      onChange={(event) => {
        /**
         * Keep common telephone characters while removing
         * arbitrary letters from the field.
         */
        const sanitized =
          event.target.value
            .replace(
              /[^0-9+\s()./-]/g,
              "",
            )
            .slice(0, 30);

        onChange(sanitized);
      }}
    />
  );
}
