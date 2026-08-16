"use client";

/**
 * Express-Führerschein
 * Password reset - choose a new password form.
 */

import {
  useRouter,
} from "next/navigation";
import {
  useState,
} from "react";

import {
  DEFAULT_PASSWORD_RESET_NEW_PASSWORD_FORM,
  PASSWORD_RESET_COPY,
  PASSWORD_RESET_ROUTES,
  PASSWORD_RESET_SETTINGS,
} from "@/data/password-reset";

import {
  validatePasswordResetNewPasswordForm,
} from "@/lib/validation/password-reset";

import type {
  PasswordResetApiResponse,
  PasswordResetFieldErrors,
  PasswordResetNewPasswordFormValues,
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

function EyeIcon({
  hidden,
}: {
  hidden: boolean;
}) {
  if (hidden) {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3 21 21" />
        <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
        <path d="M9.4 5.2A9.9 9.9 0 0 1 12 4.8c5.3 0 8.6 5.2 8.6 5.2a13.4 13.4 0 0 1-2.4 2.9" />
        <path d="M6.2 6.3A14.8 14.8 0 0 0 3.4 10S6.7 15.2 12 15.2c1 0 1.9-.2 2.7-.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.4 12S6.7 6.8 12 6.8 20.6 12 20.6 12 17.3 17.2 12 17.2 3.4 12 3.4 12Z" />
      <circle
        cx="12"
        cy="12"
        r="2.2"
      />
    </svg>
  );
}

/* ===========================================================================
   COMPONENT
   =========================================================================== */

export function PasswordResetNewPasswordForm() {
  const router =
    useRouter();

  const [values, setValues] =
    useState<PasswordResetNewPasswordFormValues>(
      DEFAULT_PASSWORD_RESET_NEW_PASSWORD_FORM,
    );

  const [errors, setErrors] =
    useState<PasswordResetFieldErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  function updateField(
    field:
      keyof PasswordResetNewPasswordFormValues,
    value: string,
  ) {
    setValues(
      (current) => ({
        ...current,
        [field]:
          value,
      }),
    );

    if (
      errors[field] ||
      errors.form
    ) {
      setErrors({});
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setErrors({});

    const validation =
      validatePasswordResetNewPasswordForm(
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
          PASSWORD_RESET_ROUTES.api.complete,
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
        router.replace(
          payload.nextPath ??
          PASSWORD_RESET_ROUTES.success,
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
          "Das neue Passwort konnte gerade nicht gespeichert werden. Bitte versuche es erneut.",
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
          htmlFor="password-reset-new-password"
          className="mb-2 block text-[12px] font-bold text-[#24364A]"
        >
          {PASSWORD_RESET_COPY.newPassword.passwordLabel}
        </label>

        <div className="relative">
          <input
            id="password-reset-new-password"
            name="newPassword"
            type={
              showNewPassword
                ? "text"
                : "password"
            }
            autoComplete="new-password"
            minLength={PASSWORD_RESET_SETTINGS.passwordMinLength}
            maxLength={PASSWORD_RESET_SETTINGS.passwordMaxLength}
            value={values.newPassword}
            onChange={(event) =>
              updateField(
                "newPassword",
                event.target.value,
              )
            }
            aria-invalid={Boolean(errors.newPassword)}
            aria-describedby={
              errors.newPassword
                ? "password-reset-new-password-error"
                : "password-reset-password-help"
            }
            placeholder={PASSWORD_RESET_COPY.newPassword.passwordPlaceholder}
            className="h-[50px] w-full rounded-[9px] border border-[#D4DEE9] bg-white pl-4 pr-12 text-[14px] text-[#17283B] outline-none transition placeholder:text-[#9AA7B6] hover:border-[#BBC9D8] focus:border-[#0878FF] focus:ring-4 focus:ring-[#0878FF]/10 aria-[invalid=true]:border-[#D94A4A] aria-[invalid=true]:focus:ring-[#D94A4A]/10"
          />

          <button
            type="button"
            onClick={() =>
              setShowNewPassword(
                (current) =>
                  !current,
              )
            }
            aria-label={
              showNewPassword
                ? "Passwort ausblenden"
                : "Passwort anzeigen"
            }
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#718196] outline-none transition hover:bg-[#F2F6FA] hover:text-[#34495F] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
          >
            <EyeIcon
              hidden={showNewPassword}
            />
          </button>
        </div>

        <p
          id="password-reset-password-help"
          className="mt-1.5 text-[10px] leading-5 text-[#8391A2]"
        >
          Mindestens {PASSWORD_RESET_SETTINGS.passwordMinLength} Zeichen.
        </p>

        {errors.newPassword ? (
          <p
            id="password-reset-new-password-error"
            role="alert"
            className="mt-1.5 text-[11px] font-medium text-[#C83D3D]"
          >
            {errors.newPassword}
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="password-reset-confirm-password"
          className="mb-2 block text-[12px] font-bold text-[#24364A]"
        >
          {PASSWORD_RESET_COPY.newPassword.confirmPasswordLabel}
        </label>

        <div className="relative">
          <input
            id="password-reset-confirm-password"
            name="confirmPassword"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            autoComplete="new-password"
            maxLength={PASSWORD_RESET_SETTINGS.passwordMaxLength}
            value={values.confirmPassword}
            onChange={(event) =>
              updateField(
                "confirmPassword",
                event.target.value,
              )
            }
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword
                ? "password-reset-confirm-password-error"
                : undefined
            }
            placeholder={PASSWORD_RESET_COPY.newPassword.confirmPasswordPlaceholder}
            className="h-[50px] w-full rounded-[9px] border border-[#D4DEE9] bg-white pl-4 pr-12 text-[14px] text-[#17283B] outline-none transition placeholder:text-[#9AA7B6] hover:border-[#BBC9D8] focus:border-[#0878FF] focus:ring-4 focus:ring-[#0878FF]/10 aria-[invalid=true]:border-[#D94A4A] aria-[invalid=true]:focus:ring-[#D94A4A]/10"
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                (current) =>
                  !current,
              )
            }
            aria-label={
              showConfirmPassword
                ? "Passwort ausblenden"
                : "Passwort anzeigen"
            }
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#718196] outline-none transition hover:bg-[#F2F6FA] hover:text-[#34495F] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
          >
            <EyeIcon
              hidden={showConfirmPassword}
            />
          </button>
        </div>

        {errors.confirmPassword ? (
          <p
            id="password-reset-confirm-password-error"
            role="alert"
            className="mt-1.5 text-[11px] font-medium text-[#C83D3D]"
          >
            {errors.confirmPassword}
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-[50px] w-full items-center justify-center rounded-[9px] bg-[#0878FF] px-5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(8,120,255,0.22)] outline-none transition hover:bg-[#006DEB] focus-visible:ring-2 focus-visible:ring-[#0878FF] focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
      >
        {isSubmitting
          ? PASSWORD_RESET_COPY.newPassword.submittingLabel
          : PASSWORD_RESET_COPY.newPassword.submitLabel}
      </button>
    </form>
  );
}
