"use client";

import {
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import { LoginIdentifierField } from "@/components/auth/login/login-identifier-field";
import { LoginPasswordField } from "@/components/auth/login/login-password-field";
import { SocialLoginButtons } from "@/components/auth/login/social-login-buttons";
import { RegistrationField } from "@/components/auth/registration/registration-field";
import { Button } from "@/components/ui/button";

import {
  DEFAULT_LOGIN_FORM_VALUES,
  LOGIN_COPY,
  LOGIN_ROUTES,
} from "@/data/login";

import { cn } from "@/lib/utils";

import type {
  SupportedCountryCode,
} from "@/types/country";

import type {
  LoginApiErrorResponse,
  LoginFieldErrors,
  LoginFormField,
  LoginFormValues,
  LoginResponse,
} from "@/types/login";

export interface LoginFormProps {
  initialCountryCode?:
    SupportedCountryCode;

  returnTo?: string;

  className?: string;
}

/* ==========================================================================
   ICON
   ========================================================================== */

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

/* ==========================================================================
   CLIENT VALIDATION
   ========================================================================== */

function validateBeforeSubmit(
  values:
    LoginFormValues,
): LoginFieldErrors {
  const errors:
    LoginFieldErrors = {};

  if (
    values.identifier
      .trim()
      .length < 3
  ) {
    errors.identifier =
      "Bitte gib deine E-Mail-Adresse oder Telefonnummer ein.";
  }

  if (
    values.password
      .length < 1
  ) {
    errors.password =
      "Bitte gib dein Passwort ein.";
  }

  return errors;
}

/* ==========================================================================
   COMPONENT
   ========================================================================== */

export function LoginForm({
  initialCountryCode =
    "DE",

  returnTo,

  className,
}: LoginFormProps) {
  const router =
    useRouter();

  const [
    values,
    setValues,
  ] =
    useState<LoginFormValues>({
      ...DEFAULT_LOGIN_FORM_VALUES,

      countryCode:
        initialCountryCode,
    });

  const [
    errors,
    setErrors,
  ] =
    useState<LoginFieldErrors>(
      {},
    );

  const [
    submitError,
    setSubmitError,
  ] =
    useState<
      string | null
    >(null);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const setField = <
    K extends keyof LoginFormValues,
  >(
    field: K,
    value:
      LoginFormValues[K],
  ) => {
    setValues(
      (current) => ({
        ...current,
        [field]:
          value,
      }),
    );

    if (
      errors[
        field as LoginFormField
      ]
    ) {
      setErrors(
        (current) => {
          const next = {
            ...current,
          };

          delete next[
            field as LoginFormField
          ];

          return next;
        },
      );
    }

    if (submitError) {
      setSubmitError(
        null,
      );
    }
  };

  const applyApiError = (
    payload:
      LoginApiErrorResponse,
  ) => {
    const nextErrors:
      LoginFieldErrors = {};

    payload.error
      .details
      ?.forEach(
        (detail) => {
          if (detail.field) {
            nextErrors[
              detail.field
            ] =
              detail.message;
          }
        },
      );

    setErrors(
      nextErrors,
    );

    setSubmitError(
      payload.error
        .message,
    );

    if (
      payload.error
        .nextPath
    ) {
      /**
       * Keep the message visible.
       * The user can be redirected by a dedicated CTA later.
       */
    }
  };

  const handleSubmit =
    async (
      event:
        FormEvent<HTMLFormElement>,
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
        Object.keys(
          localErrors,
        ).length > 0
      ) {
        setErrors(
          localErrors,
        );

        return;
      }

      setSubmitting(
        true,
      );

      setSubmitError(
        null,
      );

      try {
        const response =
          await fetch(
            LOGIN_ROUTES
              .api.login,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              credentials:
                "same-origin",

              body:
                JSON.stringify({
                  identifier:
                    values.identifier,

                  password:
                    values.password,

                  countryCode:
                    values.countryCode,

                  returnTo,
                }),
            },
          );

        const payload =
          (await response
            .json()) as
            LoginResponse;

        if (
          !response.ok ||
          !payload.ok
        ) {
          applyApiError(
            payload as
              LoginApiErrorResponse,
          );

          return;
        }

        router.replace(
          payload.data
            .nextPath ||
            returnTo ||
            LOGIN_ROUTES
              .afterLogin,
        );

        router.refresh();
      } catch {
        setSubmitError(
          "Die Anmeldung konnte nicht durchgeführt werden. Bitte versuche es erneut.",
        );
      } finally {
        setSubmitting(
          false,
        );
      }
    };

  return (
    <form
      noValidate
      onSubmit={
        handleSubmit
      }
      className={cn(
        "w-full",
        className,
      )}
    >
      {/* Identifier */}

      <RegistrationField
        htmlFor="identifier"
        label={
          LOGIN_COPY
            .form
            .identifierLabel
        }
      >
        <LoginIdentifierField
          value={
            values.identifier
          }
          disabled={
            submitting
          }
          error={
            errors.identifier
          }
          onChange={(value) =>
            setField(
              "identifier",
              value,
            )
          }
        />
      </RegistrationField>

      {/* Password */}

      <RegistrationField
        htmlFor="password"
        label={
          LOGIN_COPY
            .form
            .passwordLabel
        }
        className="mt-5"
      >
        <LoginPasswordField
          value={
            values.password
          }
          disabled={
            submitting
          }
          error={
            errors.password
          }
          onChange={(value) =>
            setField(
              "password",
              value,
            )
          }
        />
      </RegistrationField>

      {/* Forgot password */}

      <div className="mt-3 flex justify-end">
        <Link
          href={
            LOGIN_ROUTES
              .forgotPassword
          }
          className="
            rounded-sm
            text-[11px]
            font-semibold
            text-[#0878FF]
            outline-none
            underline-offset-2
            hover:underline
            focus-visible:ring-2
            focus-visible:ring-[#0878FF]
            sm:text-[12px]
          "
        >
          {
            LOGIN_COPY
              .form
              .forgotPassword
          }
        </Link>
      </div>

      {/* Global error */}

      {submitError ? (
        <div
          role="alert"
          className="
            mt-4
            rounded-[8px]
            border border-[#F0C7CA]
            bg-[#FFF4F4]
            px-3.5 py-3
            text-[11px]
            font-medium
            leading-5
            text-[#B4232A]
          "
        >
          {submitError}
        </div>
      ) : null}

      {/* Submit */}

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={
          submitting
        }
        iconRight={
          submitting
            ? undefined
            : (
                <ArrowRightIcon />
              )
        }
        className="mt-6 min-h-[48px]"
      >
        {submitting
          ? LOGIN_COPY
              .form
              .submittingLabel
          : LOGIN_COPY
              .form
              .submitLabel}
      </Button>

      {/* Separator */}

      <div className="my-6 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="h-px flex-1 bg-[#E1E7EE]"
        />

        <span className="text-[11px] text-[#66758A] sm:text-[12px]">
          {
            LOGIN_COPY
              .form
              .separator
          }
        </span>

        <span
          aria-hidden="true"
          className="h-px flex-1 bg-[#E1E7EE]"
        />
      </div>

      {/* Social login */}

      <SocialLoginButtons
        returnTo={
          returnTo
        }
      />

      {/* Register */}

      <p
        className="
          mt-8
          text-center
          text-[11px]
          leading-5
          text-[#66758A]
          sm:text-[12px]
        "
      >
        {
          LOGIN_COPY
            .form
            .noAccountPrompt
        }{" "}

        <Link
          href={
            LOGIN_ROUTES
              .register
          }
          className="
            rounded-sm
            font-semibold
            text-[#0878FF]
            outline-none
            underline-offset-2
            hover:underline
            focus-visible:ring-2
            focus-visible:ring-[#0878FF]
          "
        >
          {
            LOGIN_COPY
              .form
              .registerLabel
          }
        </Link>
      </p>
    </form>
  );
}
