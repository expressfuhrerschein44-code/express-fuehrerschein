"use client";

import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import {
  REGISTRATION_FORM_COPY,
} from "@/data/registration";

export interface TermsCheckboxProps {
  id?: string;

  checked: boolean;

  onChange: (
    checked: boolean,
  ) => void;

  error?: string;
  disabled?: boolean;
}

export function TermsCheckbox({
  id = "acceptedTerms",

  checked,
  onChange,

  error,
  disabled = false,
}: TermsCheckboxProps) {
  const terms =
    REGISTRATION_FORM_COPY.terms;

  return (
    <Checkbox
      id={id}
      name="acceptedTerms"
      checked={checked}
      disabled={disabled}
      error={error}
      onChange={(event) =>
        onChange(
          event.target.checked,
        )
      }
      label={
        <>
          {terms.prefix}{" "}

          <Link
            href={terms.termsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#0878FF] underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0878FF]"
          >
            {terms.termsLabel}
          </Link>{" "}

          {terms.conjunction}{" "}

          <Link
            href={
              terms.privacyHref
            }
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#0878FF] underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0878FF]"
          >
            {terms.privacyLabel}
          </Link>
          .
        </>
      }
    />
  );
}
