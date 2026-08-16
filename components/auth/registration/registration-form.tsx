"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import { CountryDetectionNotice } from "@/components/auth/registration/country-detection-notice";
import { CountrySelector } from "@/components/auth/registration/country-selector";
import { RegistrationField } from "@/components/auth/registration/registration-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormInput } from "@/components/ui/form-input";

import {
  DEFAULT_REGISTRATION_FORM_VALUES,
  REGISTRATION_COPY,
  REGISTRATION_COUNTRIES,
  REGISTRATION_FORM_COPY,
  REGISTRATION_PASSWORD_REQUIREMENTS,
  REGISTRATION_ROUTES,
} from "@/data/registration";

import {
  getPasswordRuleResult,
} from "@/lib/validation/registration";

import {
  cn,
} from "@/lib/utils";

import type {
  SupportedCountryCode,
} from "@/types/country";

import type {
  CountryDetectionMethod,
  PasswordRequirementId,
  RegistrationApiErrorResponse,
  RegistrationFormField,
  RegistrationFormValues,
  RegistrationStartResponse,
} from "@/types/registration";

export interface RegistrationFormProps {
  initialCountryCode?: SupportedCountryCode;
  countryDetectionMethod?: CountryDetectionMethod;
  className?: string;
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m14 7 5 5-5 5" />
    </svg>
  );
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
          <circle cx="12" cy="12" r="2.5" />
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

function RequirementCheck({
  valid,
  children,
}: {
  valid: boolean;
  children: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[9px] font-medium sm:text-[10px]",
        valid
          ? "bg-[#ECF8F2] text-[#087B57]"
          : "bg-[#F5F7FA] text-[#66758A]",
      )}
    >
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className={cn(
          "h-3 w-3",
          valid
            ? "text-[#0BA765]"
            : "text-[#9AA6B5]",
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m3.4 8.1 2.4 2.4 6-6" />
      </svg>

      {children}
    </span>
  );
}

function validateBeforeSubmit(
  values: RegistrationFormValues,
) {
  const errors:
    Partial<
      Record<
        RegistrationFormField,
        string
      >
    > = {};

  if (
    values.firstName.trim().length < 2
  ) {
    errors.firstName =
      "Bitte gib deinen Vornamen ein.";
  }

  if (
    values.lastName.trim().length < 2
  ) {
    errors.lastName =
      "Bitte gib deinen Nachnamen ein.";
  }

  if (
    values.phone
      .replace(/\D/g, "")
      .length < 6
  ) {
    errors.phone =
      "Bitte gib eine gültige Telefonnummer ein.";
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(
      values.email.trim(),
    )
  ) {
    errors.email =
      "Bitte gib eine gültige E-Mail-Adresse ein.";
  }

  const password =
    getPasswordRuleResult(
      values.password,
    );

  if (
    !password.minLength ||
    !password.uppercase ||
    !password.number ||
    !password.specialCharacter
  ) {
    errors.password =
      "Das Passwort erfüllt nicht alle Anforderungen.";
  }

  if (!values.acceptedTerms) {
    errors.acceptedTerms =
      "Bitte akzeptiere die AGB und die Datenschutzrichtlinie.";
  }

  return errors;
}

export function RegistrationForm({
  initialCountryCode = "DE",
  countryDetectionMethod = "default",
  className,
}: RegistrationFormProps) {
  const router =
    useRouter();

  const [values, setValues] =
    useState<RegistrationFormValues>({
      ...DEFAULT_REGISTRATION_FORM_VALUES,
      countryCode:
        initialCountryCode,
    });

  const [errors, setErrors] =
    useState<
      Partial<
        Record<
          RegistrationFormField,
          string
        >
      >
    >({});

  const [submitting, setSubmitting] =
    useState(false);

  const [
    submitError,
    setSubmitError,
  ] = useState<
    string | null
  >(null);

  const [
    passwordVisible,
    setPasswordVisible,
  ] = useState(false);

  const [
    countryMethod,
    setCountryMethod,
  ] =
    useState<CountryDetectionMethod>(
      countryDetectionMethod,
    );

  const selectedCountry =
    useMemo(
      () =>
        REGISTRATION_COUNTRIES.find(
          (country) =>
            country.code ===
            values.countryCode,
        ) ??
        REGISTRATION_COUNTRIES[0],
      [values.countryCode],
    );

  const passwordRules =
    getPasswordRuleResult(
      values.password,
    );

  const setField = <
    K extends keyof RegistrationFormValues,
  >(
    field: K,
    value:
      RegistrationFormValues[K],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((current) => {
        const next = {
          ...current,
        };

        delete next[field];

        return next;
      });
    }

    if (submitError) {
      setSubmitError(null);
    }
  };

  const applyApiErrors = (
    response:
      RegistrationApiErrorResponse,
  ) => {
    const nextErrors:
      Partial<
        Record<
          RegistrationFormField,
          string
        >
      > = {};

    response.error.details?.forEach(
      (detail) => {
        if (detail.field) {
          nextErrors[
            detail.field
          ] =
            detail.message;
        }
      },
    );

    setErrors(nextErrors);

    setSubmitError(
      response.error.message,
    );
  };

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      if (submitting) {
        return;
      }

      const localErrors =
        validateBeforeSubmit(
          values,
        );

      if (
        Object.keys(localErrors)
          .length > 0
      ) {
        setErrors(localErrors);
        return;
      }

      setSubmitting(true);
      setSubmitError(null);

      try {
        const response =
          await fetch(
            REGISTRATION_ROUTES
              .api.start,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              credentials:
                "same-origin",
              body: JSON.stringify({
                firstName:
                  values.firstName,
                lastName:
                  values.lastName,
                countryCode:
                  values.countryCode,
                phone:
                  values.phone,
                email:
                  values.email,
                password:
                  values.password,
                acceptedTerms:
                  true,
              }),
            },
          );

        const payload =
          (await response.json()) as
            RegistrationStartResponse;

        if (
          !response.ok ||
          !payload.ok
        ) {
          applyApiErrors(
            payload as
              RegistrationApiErrorResponse,
          );

          return;
        }

        router.push(
          payload.data.nextPath ||
            REGISTRATION_ROUTES
              .verification,
        );
      } catch {
        setSubmitError(
          "Die Registrierung konnte nicht gestartet werden. Bitte versuche es erneut.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={cn(
        "w-full",
        className,
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <RegistrationField
          htmlFor="firstName"
          label={
            REGISTRATION_FORM_COPY
              .firstName.label
          }
          required
        >
          <FormInput
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            placeholder={
              REGISTRATION_FORM_COPY
                .firstName.placeholder
            }
            value={
              values.firstName
            }
            error={
              errors.firstName
            }
            onChange={(event) =>
              setField(
                "firstName",
                event.target.value,
              )
            }
          />
        </RegistrationField>

        <RegistrationField
          htmlFor="lastName"
          label={
            REGISTRATION_FORM_COPY
              .lastName.label
          }
          required
        >
          <FormInput
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            placeholder={
              REGISTRATION_FORM_COPY
                .lastName.placeholder
            }
            value={
              values.lastName
            }
            error={
              errors.lastName
            }
            onChange={(event) =>
              setField(
                "lastName",
                event.target.value,
              )
            }
          />
        </RegistrationField>
      </div>

      <RegistrationField
        htmlFor="countryCode"
        label={
          REGISTRATION_FORM_COPY
            .country.label
        }
        className="mt-4"
        required
      >
        <CountrySelector
          value={
            values.countryCode
          }
          method={
            countryMethod
          }
          error={
            errors.countryCode
          }
          onChange={(
            countryCode,
          ) => {
            setField(
              "countryCode",
              countryCode,
            );

            setCountryMethod(
              "manual",
            );
          }}
        />

        <CountryDetectionNotice
          method={countryMethod}
          className="mt-2.5"
        />
      </RegistrationField>

      <RegistrationField
        htmlFor="phone"
        label="Telefonnummer"
        className="mt-4"
        required
      >
        <FormInput
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Deine Telefonnummer"
          value={
            values.phone
          }
          error={
            errors.phone
          }
          startAdornment={
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <span
                aria-hidden="true"
                className="text-[15px]"
              >
                {selectedCountry.flag}
              </span>

              <span className="font-semibold">
                {selectedCountry.dialCode}
              </span>
            </span>
          }
          onChange={(event) =>
            setField(
              "phone",
              event.target.value,
            )
          }
        />
      </RegistrationField>

      <RegistrationField
        htmlFor="email"
        label="E-Mail"
        className="mt-4"
        required
      >
        <FormInput
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Deine E-Mail-Adresse"
          value={
            values.email
          }
          error={
            errors.email
          }
          helperText="An diese Adresse senden wir deinen 6-stelligen Bestätigungscode."
          onChange={(event) =>
            setField(
              "email",
              event.target.value,
            )
          }
        />
      </RegistrationField>

      <RegistrationField
        htmlFor="password"
        label={
          REGISTRATION_FORM_COPY
            .password.label
        }
        className="mt-4"
        required
      >
        <FormInput
          id="password"
          name="password"
          type={
            passwordVisible
              ? "text"
              : "password"
          }
          autoComplete="new-password"
          placeholder={
            REGISTRATION_FORM_COPY
              .password.placeholder
          }
          value={
            values.password
          }
          error={
            errors.password
          }
          endAdornment={
            <button
              type="button"
              aria-label={
                passwordVisible
                  ? REGISTRATION_FORM_COPY
                      .password.hide
                  : REGISTRATION_FORM_COPY
                      .password.show
              }
              onClick={() =>
                setPasswordVisible(
                  (current) =>
                    !current,
                )
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-md outline-none transition-colors hover:bg-[#F1F5F9] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
            >
              <EyeIcon
                visible={
                  passwordVisible
                }
              />
            </button>
          }
          onChange={(event) =>
            setField(
              "password",
              event.target.value,
            )
          }
        />

        <div className="mt-2 flex flex-wrap gap-1.5">
          {REGISTRATION_PASSWORD_REQUIREMENTS.map(
            (requirement) => (
              <RequirementCheck
                key={
                  requirement.id
                }
                valid={
                  passwordRules[
                    requirement.id as PasswordRequirementId
                  ]
                }
              >
                {
                  requirement.label
                }
              </RequirementCheck>
            ),
          )}
        </div>
      </RegistrationField>

      <div className="mt-5">
        <Checkbox
          id="acceptedTerms"
          name="acceptedTerms"
          checked={
            values.acceptedTerms
          }
          error={
            errors.acceptedTerms
          }
          onChange={(event) =>
            setField(
              "acceptedTerms",
              event.target.checked,
            )
          }
          label={
            <>
              {
                REGISTRATION_FORM_COPY
                  .terms.prefix
              }{" "}
              <Link
                href={
                  REGISTRATION_FORM_COPY
                    .terms.termsHref
                }
                target="_blank"
                className="font-semibold text-[#0878FF] hover:underline"
              >
                {
                  REGISTRATION_FORM_COPY
                    .terms.termsLabel
                }
              </Link>{" "}
              {
                REGISTRATION_FORM_COPY
                  .terms.conjunction
              }{" "}
              <Link
                href={
                  REGISTRATION_FORM_COPY
                    .terms.privacyHref
                }
                target="_blank"
                className="font-semibold text-[#0878FF] hover:underline"
              >
                {
                  REGISTRATION_FORM_COPY
                    .terms.privacyLabel
                }
              </Link>
              .
            </>
          }
        />
      </div>

      {submitError ? (
        <div
          role="alert"
          className="mt-4 rounded-[8px] border border-[#F0C7CA] bg-[#FFF4F4] px-3.5 py-3 text-[11px] font-medium leading-5 text-[#B4232A]"
        >
          {submitError}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={submitting}
        iconRight={
          submitting
            ? undefined
            : <ArrowRightIcon />
        }
        className="mt-5 min-h-[48px]"
      >
        {submitting
          ? "Wird erstellt..."
          : REGISTRATION_COPY
              .account
              .submitLabel}
      </Button>

      <p className="mt-6 text-center text-[11px] leading-5 text-[#66758A] sm:text-[12px]">
        {
          REGISTRATION_COPY
            .account.loginPrompt
        }{" "}
        <Link
          href={
            REGISTRATION_ROUTES.login
          }
          className="font-semibold text-[#0878FF] hover:underline"
        >
          {
            REGISTRATION_COPY
              .account.loginLabel
          }
        </Link>
      </p>
    </form>
  );
}
