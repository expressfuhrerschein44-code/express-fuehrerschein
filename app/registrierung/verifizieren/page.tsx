import type {
  Metadata,
} from "next";

import {
  redirect,
} from "next/navigation";

import { RegistrationLayout } from "@/components/auth/registration/registration-layout";
import { VerificationForm } from "@/components/auth/registration/verification-form";

import {
  REGISTRATION_COPY,
  REGISTRATION_ROUTES,
  REGISTRATION_SETTINGS,
} from "@/data/registration";

import {
  getRegistrationSession,
} from "@/lib/server/registration-session";

import {
  userRepository,
} from "@/lib/server/repositories/user-repository";

import {
  verificationRepository,
} from "@/lib/server/repositories/verification-repository";

/* ==========================================================================
   ROUTE CONFIG
   ========================================================================== */

export const dynamic =
  "force-dynamic";

/* ==========================================================================
   METADATA
   ========================================================================== */

export const metadata:
  Metadata = {
  title:
    "E-Mail verifizieren",

  description:
    "Bestätige deine E-Mail-Adresse mit deinem 6-stelligen Express-Führerschein Code.",

  robots: {
    index: false,
    follow: false,
  },
};

/* ==========================================================================
   HELPERS
   ========================================================================== */

function maskEmail(
  email: string,
): string {
  const [
    local,
    domain,
  ] = email.split("@");

  if (!local || !domain) {
    return email;
  }

  if (local.length <= 2) {
    return `${local[0] ?? "*"}***@${domain}`;
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

function getConfiguredResendCooldown():
  number {
  const raw =
    Number(
      process.env
        .REGISTRATION_RESEND_COOLDOWN_SECONDS,
    );

  if (
    Number.isInteger(raw) &&
    raw >= 30 &&
    raw <= 300
  ) {
    return raw;
  }

  return (
    REGISTRATION_SETTINGS
      .resendCooldownSeconds
  );
}

function calculateRemainingCooldown(
  lastSentAt: string | undefined,
): number {
  if (!lastSentAt) {
    return 0;
  }

  const cooldown =
    getConfiguredResendCooldown();

  const elapsed =
    Math.max(
      0,
      Math.floor(
        (
          Date.now() -
          new Date(
            lastSentAt,
          ).getTime()
        ) / 1000,
      ),
    );

  return Math.max(
    0,
    cooldown - elapsed,
  );
}

function calculateRemainingMinutes(
  expiresAt: string | undefined,
): number {
  if (!expiresAt) {
    return (
      REGISTRATION_SETTINGS
        .verificationCodeTtlMinutes
    );
  }

  const remainingMs =
    new Date(
      expiresAt,
    ).getTime() -
    Date.now();

  if (remainingMs <= 0) {
    return 1;
  }

  return Math.max(
    1,
    Math.ceil(
      remainingMs /
        60_000,
    ),
  );
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default async function VerificationPage() {
  const session =
    await getRegistrationSession();

  if (!session) {
    redirect(
      REGISTRATION_ROUTES
        .account,
    );
  }

  const user =
    await userRepository
      .findById(
        session.userId,
      );

  if (!user) {
    redirect(
      REGISTRATION_ROUTES
        .account,
    );
  }

  if (
    user.status === "active"
  ) {
    redirect(
      REGISTRATION_ROUTES
        .success,
    );
  }

  const verification =
    await verificationRepository
      .findActiveByUserId(
        user.id,
      );

  const emailMasked =
    maskEmail(user.email);

  const initialCooldown =
    calculateRemainingCooldown(
      verification?.lastSentAt,
    );

  const expiresInMinutes =
    calculateRemainingMinutes(
      verification?.expiresAt,
    );

  return (
    <RegistrationLayout
      currentStep="verification"
      title={
        REGISTRATION_COPY
          .verification.title
      }
      subtitle={
        REGISTRATION_COPY
          .verification.subtitle
      }
    >
      <VerificationForm
        emailMasked={
          emailMasked
        }
        expiresInMinutes={
          expiresInMinutes
        }
        initialResendCooldownSeconds={
          initialCooldown
        }
      />
    </RegistrationLayout>
  );
}
