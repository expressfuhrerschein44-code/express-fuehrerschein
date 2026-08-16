"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  REGISTRATION_COPY,
  REGISTRATION_ROUTES,
} from "@/data/registration";

import { cn } from "@/lib/utils";

import type {
  RegistrationApiErrorResponse,
  RegistrationResendResponse,
} from "@/types/registration";

export interface ResendCodeButtonProps {
  initialCooldownSeconds?: number;

  disabled?: boolean;

  className?: string;

  onResent?: (
    data: {
      emailMasked: string;
      cooldownSeconds: number;
    },
  ) => void;
}

function formatSeconds(
  seconds: number,
): string {
  return `0:${String(
    Math.max(0, seconds),
  ).padStart(2, "0")}`;
}

export function ResendCodeButton({
  initialCooldownSeconds = 0,

  disabled = false,

  className,

  onResent,
}: ResendCodeButtonProps) {
  const [
    cooldown,
    setCooldown,
  ] =
    useState(
      Math.max(
        0,
        Math.floor(
          initialCooldownSeconds,
        ),
      ),
    );

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  useEffect(() => {
    if (
      cooldown <= 0
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () => {
          setCooldown(
            (current) =>
              Math.max(
                0,
                current - 1,
              ),
          );
        },
        1000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, [cooldown]);

  const handleResend =
    async () => {
      if (
        disabled ||
        sending ||
        cooldown > 0
      ) {
        return;
      }

      setSending(true);
      setError(null);
      setMessage(null);

      try {
        const response =
          await fetch(
            REGISTRATION_ROUTES
              .api.resend,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              credentials:
                "same-origin",
              body:
                JSON.stringify({}),
            },
          );

        const payload =
          (await response.json()) as
            RegistrationResendResponse;

        if (
          !response.ok ||
          !payload.ok
        ) {
          const failure =
            payload as
              RegistrationApiErrorResponse;

          const retry =
            failure.error
              .retryAfterSeconds;

          if (
            typeof retry ===
              "number" &&
            retry > 0
          ) {
            setCooldown(
              Math.ceil(retry),
            );
          }

          setError(
            failure.error
              .message,
          );

          return;
        }

        const nextCooldown =
          Math.max(
            0,
            payload.data
              .cooldownSeconds,
          );

        setCooldown(
          nextCooldown,
        );

        setMessage(
          "Ein neuer Bestätigungscode wurde gesendet.",
        );

        onResent?.(
          payload.data,
        );
      } catch {
        setError(
          "Der Code konnte nicht erneut gesendet werden. Bitte versuche es erneut.",
        );
      } finally {
        setSending(false);
      }
    };

  const blocked =
    disabled ||
    sending ||
    cooldown > 0;

  return (
    <div
      className={cn(
        "text-center",
        className,
      )}
    >
      <p className="text-[11px] leading-5 text-[#66758A] sm:text-[12px]">
        {
          REGISTRATION_COPY
            .verification
            .resendPrompt
        }{" "}

        <button
          type="button"
          disabled={blocked}
          onClick={
            handleResend
          }
          className={cn(
            "rounded-sm font-semibold outline-none transition-colors",
            "focus-visible:ring-2 focus-visible:ring-[#0878FF]",
            blocked
              ? "cursor-not-allowed text-[#94A1B2]"
              : "text-[#0878FF] hover:text-[#006BEA] hover:underline",
          )}
        >
          {sending
            ? "Wird gesendet..."
            : cooldown > 0
              ? `${REGISTRATION_COPY.verification.resendLabel} (${formatSeconds(cooldown)})`
              : REGISTRATION_COPY.verification.resendLabel}
        </button>
      </p>

      {message ? (
        <p
          role="status"
          className="mt-2 text-[10px] font-medium text-[#087B57] sm:text-[11px]"
        >
          {message}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-2 text-[10px] font-medium text-[#C93439] sm:text-[11px]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
