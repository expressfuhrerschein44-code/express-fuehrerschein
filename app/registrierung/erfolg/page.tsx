import type {
  Metadata,
} from "next";

import {
  redirect,
} from "next/navigation";

import { RegistrationLayout } from "@/components/auth/registration/registration-layout";
import { RegistrationSuccess } from "@/components/auth/registration/registration-success";

import {
  REGISTRATION_COPY,
  REGISTRATION_ROUTES,
} from "@/data/registration";

import {
  getRegistrationSession,
} from "@/lib/server/registration-session";

import {
  userRepository,
} from "@/lib/server/repositories/user-repository";

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
    "Registrierung erfolgreich",

  description:
    "Dein Express-Führerschein Konto wurde erfolgreich verifiziert.",

  robots: {
    index: false,
    follow: false,
  },
};

/* ==========================================================================
   PAGE
   ========================================================================== */

export default async function RegistrationSuccessPage() {
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
    user.status !== "active" ||
    !user.emailVerifiedAt
  ) {
    redirect(
      REGISTRATION_ROUTES
        .verification,
    );
  }

  return (
    <RegistrationLayout
      currentStep="success"
      title={
        REGISTRATION_COPY
          .success.title
      }
      subtitle={
        REGISTRATION_COPY
          .success.subtitle
      }
      showMobileBackButton={
        false
      }
    >
      <RegistrationSuccess
        title="E-Mail erfolgreich bestätigt"
        subtitle={`Willkommen ${user.firstName}. Dein Konto ist jetzt aktiviert und bereit.`}
        ctaHref={
          REGISTRATION_ROUTES
            .login
        }
        ctaLabel="Jetzt anmelden"
      />
    </RegistrationLayout>
  );
}
