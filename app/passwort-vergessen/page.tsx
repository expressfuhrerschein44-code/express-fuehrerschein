import type {
  Metadata,
} from "next";

import {
  PasswordResetCard,
} from "@/components/auth/password-reset/password-reset-card";
import {
  PasswordResetLayout,
} from "@/components/auth/password-reset/password-reset-layout";
import {
  PasswordResetRequestForm,
} from "@/components/auth/password-reset/password-reset-request-form";

import {
  PASSWORD_RESET_COPY,
} from "@/data/password-reset";

/* ==========================================================================
   PAGE CONFIGURATION
   ========================================================================== */

export const dynamic =
  "force-dynamic";

export const metadata:
  Metadata = {
  title:
    "Passwort vergessen?",

  description:
    "Setze dein Express-Führerschein Passwort sicher zurück und erhalte einen zeitlich begrenzten Sicherheitscode per E-Mail.",

  robots: {
    index:
      false,

    follow:
      false,
  },
};

/* ==========================================================================
   PAGE
   ========================================================================== */

export default function PasswordResetStartPage() {
  return (
    <PasswordResetLayout>
      <PasswordResetCard
        title={
          PASSWORD_RESET_COPY
            .start
            .title
        }
        subtitle={
          PASSWORD_RESET_COPY
            .start
            .subtitle
        }
      >
        <PasswordResetRequestForm />
      </PasswordResetCard>
    </PasswordResetLayout>
  );
}
