"use client";

import {
  useState,
  type FormEvent,
} from "react";

import {
  useRouter,
} from "next/navigation";

import { ResendCodeButton } from "@/components/auth/registration/resend-code-button";
import { VerificationCodeInput } from "@/components/auth/registration/verification-code-input";
import { Button } from "@/components/ui/button";

import {
  REGISTRATION_COPY,
  REGISTRATION_ROUTES,
  REGISTRATION_SETTINGS,
} from "@/data/registration";

import type {
  RegistrationApiErrorResponse,
  RegistrationVerifyResponse,
} from "@/types/registration";

export interface VerificationFormProps {
  emailMasked?: string;

  expiresInMinutes?: number;

  initialResendCooldownSeconds?: number;

  autoSubmitOnComplete?: boolean;
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

function MailIcon() {
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
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function VerificationForm({
  emailMasked,

  expiresInMinutes =
    REGISTRATION_SETTINGS
      .verificationCodeTtlMinutes,

  initialResendCooldownSeconds = 0,

  autoSubmitOnComplete = false,
}: VerificationFormProps) {
  const router =
    useRouter();

  const [
    code,
    setCode,
  ] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const verifyCode =
    async (
      nextCode = code,
    ) => {
      if (
        submitting ||
        nextCode.length !==
          REGISTRATION_SETTINGS
            .verificationCodeLength
      ) {
        return;
      }

      setSubmitting(true);
      setError(null);

      try {
        const response =
          await fetch(
            REGISTRATION_ROUTES
              .api.verify,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              credentials:
                "same-origin",
              body:
                JSON.stringify({
                  code:
                    nextCode,
                }),
            },
          );

        const payload =
          (await response.json()) as
            RegistrationVerifyResponse;

        if (
          !response.ok ||
          !payload.ok
        ) {
          const failure =
            payload as
              RegistrationApiErrorResponse;

          setError(
            failure.error
              .message,
          );

          return;
        }

        router.replace(
          payload.data
            .nextPath ||
            REGISTRATION_ROUTES
              .success,
        );
      } catch {
        setError(
          "Der Bestätigungscode konnte nicht geprüft werden. Bitte versuche es erneut.",
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleSubmit = (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    void verifyCode();
  };

  return (
    <form
      noValidate
      onSubmit={
        handleSubmit
      }
      className="w-full"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#D7E9FF] bg-[#EEF6FF] text-[#0878FF]">
        <MailIcon />
      </div>

      <div className="mt-4 text-center">
        {emailMasked ? (
          <p className="text-[12px] leading-5 text-[#66758A] sm:text-[13px]">
            Wir haben einen
            6-stelligen Code an{" "}
            <strong className="font-bold text-[#071426]">
              {emailMasked}
            </strong>{" "}
            gesendet.
          </p>
        ) : (
          <p className="text-[12px] leading-5 text-[#66758A] sm:text-[13px]">
            Wir haben dir einen
            6-stelligen Code per
            E-Mail gesendet.
          </p>
        )}

        <p className="mt-1 text-[10px] text-[#8290A2] sm:text-[11px]">
          Der Code ist{" "}
          {expiresInMinutes} Minuten
          gültig.
        </p>
      </div>

      <div className="mt-7">
        <VerificationCodeInput
          value={code}
          disabled={submitting}
          error={
            error ?? undefined
          }
          onChange={(value) => {
            setCode(value);

            if (error) {
              setError(null);
            }
          }}
          onComplete={
            autoSubmitOnComplete
              ? (value) => {
                  void verifyCode(
                    value,
                  );
                }
              : undefined
          }
        />
      </div>

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={
          submitting ||
          code.length !==
            REGISTRATION_SETTINGS
              .verificationCodeLength
        }
        iconRight={
          submitting
            ? undefined
            : <ArrowRightIcon />
        }
        className="mt-6 min-h-[48px]"
      >
        {submitting
          ? "Wird geprüft..."
          : REGISTRATION_COPY
              .verification
              .verifyLabel}
      </Button>

      <ResendCodeButton
        initialCooldownSeconds={
          initialResendCooldownSeconds
        }
        disabled={
          submitting
        }
        className="mt-5"
      />
    </form>
  );
}
