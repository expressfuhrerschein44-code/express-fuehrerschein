"use client";

/**
 * Express-Führerschein
 * Password reset - verification code form.
 */

import {
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import {
  DEFAULT_PASSWORD_RESET_VERIFY_FORM,
  PASSWORD_RESET_COPY,
  PASSWORD_RESET_ROUTES,
  PASSWORD_RESET_SETTINGS,
} from "@/data/password-reset";

import {
  normalizePasswordResetCode,
  validatePasswordResetVerifyInput,
} from "@/lib/validation/password-reset";

import type {
  PasswordResetApiResponse,
  PasswordResetFieldErrors,
  PasswordResetVerifyFormValues,
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

/* ===========================================================================
   COMPONENT
   =========================================================================== */

export function PasswordResetCodeForm() {
  const router =
    useRouter();

  const [values, setValues] =
    useState<PasswordResetVerifyFormValues>(
      DEFAULT_PASSWORD_RESET_VERIFY_FORM,
    );

  const [errors, setErrors] =
    useState<PasswordResetFieldErrors>({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isResending, setIsResending] =
    useState(false);

  const [notice, setNotice] =
    useState<string | null>(null);

  const [cooldownSeconds, setCooldownSeconds] =
    useState(0);

  useEffect(() => {
    if (
      cooldownSeconds <= 0
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setCooldownSeconds(
            (current) =>
              Math.max(
                0,
                current - 1,
              ),
          );
        },
        1000,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [cooldownSeconds]);

  function handleCodeChange(
    value: string,
  ) {
    const code =
      normalizePasswordResetCode(
        value,
      );

    setValues({
      code,
    });

    if (
      errors.code ||
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
      validatePasswordResetVerifyInput(
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
          PASSWORD_RESET_ROUTES.api.verify,
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
        router.push(
          payload.nextPath ??
          PASSWORD_RESET_ROUTES.newPassword,
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

        if (
          payload.retryAfterSeconds &&
          payload.retryAfterSeconds > 0
        ) {
          setCooldownSeconds(
            payload.retryAfterSeconds,
          );
        }

        return;
      }

      setErrors({
        form:
          "Der Sicherheitscode konnte gerade nicht geprüft werden. Bitte versuche es erneut.",
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

  async function handleResend() {
    if (
      isResending ||
      cooldownSeconds > 0
    ) {
      return;
    }

    setErrors({});
    setNotice(null);
    setIsResending(true);

    try {
      const response =
        await fetch(
          PASSWORD_RESET_ROUTES.api.resend,
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
              JSON.stringify({}),
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
        setValues(
          DEFAULT_PASSWORD_RESET_VERIFY_FORM,
        );

        setNotice(
          payload.message,
        );

        setCooldownSeconds(
          payload.retryAfterSeconds ??
          PASSWORD_RESET_SETTINGS.resendCooldownSeconds,
        );

        return;
      }

      if (
        payload &&
        !payload.ok
      ) {
        setErrors({
          form:
            payload.message,
        });

        if (
          payload.retryAfterSeconds &&
          payload.retryAfterSeconds > 0
        ) {
          setCooldownSeconds(
            payload.retryAfterSeconds,
          );
        }

        return;
      }

      setErrors({
        form:
          "Der Code konnte gerade nicht erneut gesendet werden. Bitte versuche es später noch einmal.",
      });
    } catch {
      setErrors({
        form:
          "Es konnte keine Verbindung zum Server hergestellt werden. Bitte versuche es erneut.",
      });
    } finally {
      setIsResending(false);
    }
  }

  const resendLabel =
    cooldownSeconds > 0
      ? `Erneut senden in ${cooldownSeconds}s`
      : isResending
        ? PASSWORD_RESET_COPY.verify.resendingLabel
        : PASSWORD_RESET_COPY.verify.resendLabel;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="password-reset-code"
          className="mb-2 block text-center text-[12px] font-bold text-[#24364A]"
        >
          {PASSWORD_RESET_COPY.verify.codeLabel}
        </label>

        <input
          id="password-reset-code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={PASSWORD_RESET_SETTINGS.codeLength}
          value={values.code}
          onChange={(event) =>
            handleCodeChange(
              event.target.value,
            )
          }
          aria-invalid={Boolean(errors.code)}
          aria-describedby={
            errors.code
              ? "password-reset-code-error"
              : "password-reset-code-help"
          }
          placeholder={PASSWORD_RESET_COPY.verify.codePlaceholder}
          className="h-[58px] w-full rounded-[10px] border border-[#D4DEE9] bg-white px-4 text-center text-[24px] font-extrabold tracking-[0.34em] text-[#102237] outline-none transition placeholder:text-[#C2CBD5] hover:border-[#BBC9D8] focus:border-[#0878FF] focus:ring-4 focus:ring-[#0878FF]/10 aria-[invalid=true]:border-[#D94A4A] aria-[invalid=true]:focus:ring-[#D94A4A]/10"
        />

        <p
          id="password-reset-code-help"
          className="mt-2 text-center text-[10px] leading-5 text-[#8391A2]"
        >
          {PASSWORD_RESET_COPY.verify.codeSentNotice}
        </p>

        {errors.code ? (
          <p
            id="password-reset-code-error"
            role="alert"
            className="mt-1.5 text-center text-[11px] font-medium text-[#C83D3D]"
          >
            {errors.code}
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
        disabled={
          isSubmitting ||
          values.code.length !==
            PASSWORD_RESET_SETTINGS.codeLength
        }
        className="flex h-[50px] w-full items-center justify-center rounded-[9px] bg-[#0878FF] px-5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(8,120,255,0.22)] outline-none transition hover:bg-[#006DEB] focus-visible:ring-2 focus-visible:ring-[#0878FF] focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-65"
      >
        {isSubmitting
          ? PASSWORD_RESET_COPY.verify.submittingLabel
          : PASSWORD_RESET_COPY.verify.submitLabel}
      </button>

      <div className="text-center">
        <p className="text-[11px] text-[#7D8C9E]">
          Keine E-Mail erhalten?
        </p>

        <button
          type="button"
          onClick={handleResend}
          disabled={
            isResending ||
            cooldownSeconds > 0
          }
          className="mt-1 inline-flex min-h-8 items-center justify-center text-[12px] font-bold text-[#0878FF] outline-none transition hover:text-[#0067D8] focus-visible:ring-2 focus-visible:ring-[#0878FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-[#9AA7B6]"
        >
          {resendLabel}
        </button>
      </div>
    </form>
  );
}
