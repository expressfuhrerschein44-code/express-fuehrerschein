"use client";

import {
  REGISTRATION_COUNTRIES,
  COUNTRY_DETECTION_COPY,
} from "@/data/registration";
import { SelectField } from "@/components/ui/select-field";
import type {
  SupportedCountryCode,
} from "@/types/country";
import type {
  CountryDetectionMethod,
  RegistrationCountry,
} from "@/types/registration";

export interface CountrySelectorProps {
  id?: string;
  value: SupportedCountryCode;
  onChange: (
    countryCode: SupportedCountryCode,
  ) => void;

  method?: CountryDetectionMethod;
  disabled?: boolean;
  error?: string;

  countries?: readonly RegistrationCountry[];
}

function DetectionCheck() {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[#607087]">
      <svg
        viewBox="0 0 18 18"
        aria-hidden="true"
        className="h-3.5 w-3.5 text-[#0BA765]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m4 9.2 3 3 7-7" />
      </svg>

      <span>
        {COUNTRY_DETECTION_COPY.detectedLabel}
      </span>
    </span>
  );
}

export function CountrySelector({
  id = "countryCode",
  value,
  onChange,
  method = "default",
  disabled = false,
  error,
  countries = REGISTRATION_COUNTRIES,
}: CountrySelectorProps) {
  const selected =
    countries.find(
      (country) =>
        country.code === value,
    ) ?? countries[0];

  const options =
    countries
      .filter(
        (country) =>
          country.enabled,
      )
      .map((country) => ({
        value:
          country.code,
        label:
          method === "ip" &&
          country.code === value
            ? `${country.name} (erkannt)`
            : country.name,
      }));

  return (
    <SelectField
      id={id}
      name="countryCode"
      value={value}
      disabled={disabled}
      error={error}
      options={options}
      onChange={(event) => {
        onChange(
          event.target
            .value as SupportedCountryCode,
        );
      }}
      startAdornment={
        <span
          aria-hidden="true"
          className="text-[16px]"
        >
          {selected?.flag ?? "🌍"}
        </span>
      }
      endAdornment={
        method === "ip" ? (
          <DetectionCheck />
        ) : undefined
      }
    />
  );
}
