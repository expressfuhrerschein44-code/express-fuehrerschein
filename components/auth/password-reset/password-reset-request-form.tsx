"use client";

/**
 * Express-Führerschein
 * Password reset - request security code form.
 */

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";
import {
  useState,
} from "react";

import {
  DEFAULT_PASSWORD_RESET_START_FORM,
  PASSWORD_RESET_COPY,
  PASSWORD_RESET_ROUTES,
  PASSWORD_RESET_SETTINGS,
} from "@/data/password-reset";

import {
  validatePasswordResetStartInput,
} from "@/lib/validation/password-reset";

import type {
  PasswordResetApiResponse,
  PasswordResetFieldErrors,
  PasswordResetStartFormValues,
} from "@/types/password-reset";

/* ===========================================================================
   HELPERS
   =========================================================================== */

async function readApiResponse(
  response: Response,
): Promise<PasswordResetApiResponse | null> {
  try {
    return await response.json() as PasswordResetApiResponse;
  } catch {
    return null;
  }
}

function BackArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

/* ===========================================================================
   COMPONENT
   =========================================================================== */

export function PasswordResetRequestForm() {
  const router =
    useRouter();

  const [values, setValues] =
    useState<PasswordResetStartFormValues>(
      DEFAULT_PASSWORD_RESET_START_FORM,
    );

  const [errors, setErrors] =
    useState<PasswordResetFieldErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [notice, setNotice] =
    useState<string | null>(null);

  function handleEmailChange(
    value: string,
  ) {
    setValues({
      email:
        value,
    });

    if (
      errors.email ||
      errors.form
    ) {
      setErrors({});
    }

    setNotice(null);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrors({});
    setNotice(null);

    const validation =
      validatePasswordResetStartInput(
        values,
      );

    if (!validation.success) {
      setErrors(
        validation.errors,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          PASSWORD_RESET_ROUTES.api.start,
          {
            method:
              "POST",
            credentials:
              "same-origin",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                validation.data,
              ),
          },
        );

      const payload =
        await readApiResponse(
          response,
        );

      if (
        response.ok &&
        payload?.ok
      ) {
        setNotice(
          payload.message ||
          PASSWORD_RESET_COPY.start.genericSuccess,
        );

        router.push(
          payload.nextPath ??
          PASSWORD_RESET_ROUTES.verify,
        );

        return;
      }

      if (
        payload &&
        !payload.ok
      ) {
        setErrors({
          ...payload.fields,
          form:
            payload.message,
        });
        return;
      }

      setErrors({
        form:
          "Die Anfrage konnte gerade nicht verarbeitet werden. Bitte versuche es erneut.",
      });
    } catch {
      setErrors({
        form:
          "Es konnte keine Verbindung zum Server hergestellt werden. Bitte versuche es erneut.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="password-reset-email"
          className="mb-2 block text-[12px] font-bold text-[#24364A]"
        >
          {PASSWORD_RESET_COPY.start.emailLabel}
        </label>

        <input
          id="password-reset-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={PASSWORD_RESET_SETTINGS.emailMaxLength}
          value={values.email}
          onChange={(event) =>
            handleEmailChange(
              event.target.value,
            )
          }
          aria-invalid={Boolean(errors.email)}
          aria-describedby={
            errors.email
              ? "password-reset-email-error"
              : undefined
          }
          placeholder={PASSWORD_RESET_COPY.start.emailPlaceholder}
          className="h-[50px] w-full rounded-[9px] border border-[#D4DEE9] bg-white px-4 text-[14px] text-[#17283B] outline-none transition placeholder:text-[#9AA7B6] hover:border-[#BBC9D8] focus:border-[#0878FF] focus:ring-4 focus:ring-[#0878FF]/10 aria-[invalid=true]:border-[#D94A4A] aria-[invalid=true]:focus:ring-[#D94A4A]/10"
        />

        {errors.email ? (
          <p
            id="password-reset-email-error"
            role="alert"
            className="mt-1.5 text-[11px] font-medium text-[#C83D3D]"
          >
            {errors.email}
          </p>
        ) : null}
      </div>

      {errors.form ? (
        <div
          role="alert"
          className="rounded-[9px] border border-[#F1CACA] bg-[#FFF5F5] px-3.5 py-3 text-[11px] font-medium leading-5 text-[#A43838]"
        >
          {errors.form}
        </div>
      ) : null}

      {notice ? (
        <div
          role="status"
          className="rounded-[9px] border border-[#CDE7D6] bg-[#F3FBF6] px-3.5 py-3 text-[11px] font-medium leading-5 text-[#287245]"
        >
          {notice}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-[50px] w-full items-center justify-center rounded-[9px] bg-[#0878FF] px-5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(8,120,255,0.22)] outline-none transition hover:bg-[#006DEB] focus-visible:ring-2 focus-visible:ring-[#0878FF] focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
      >
        {isSubmitting
          ? PASSWORD_RESET_COPY.start.submittingLabel
          : PASSWORD_RESET_COPY.start.submitLabel}
      </button>

      <div className="pt-1 text-center">
        <Link
          href={PASSWORD_RESET_ROUTES.login}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#52657B] outline-none transition hover:text-[#0878FF] focus-visible:ring-2 focus-visible:ring-[#0878FF] focus-visible:ring-offset-2"
        >
          <BackArrowIcon />
          {PASSWORD_RESET_COPY.start.backToLogin}
        </Link>
      </div>
    </form>
  );
}
