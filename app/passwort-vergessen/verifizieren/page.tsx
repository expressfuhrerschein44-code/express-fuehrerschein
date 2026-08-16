import type {
  Metadata,
} from "next";
import {
  cookies,
} from "next/headers";
import {
  redirect,
} from "next/navigation";

import {
  PasswordResetCard,
} from "@/components/auth/password-reset/password-reset-card";
import {
  PasswordResetCodeForm,
} from "@/components/auth/password-reset/password-reset-code-form";
import {
  PasswordResetLayout,
} from "@/components/auth/password-reset/password-reset-layout";

import {
  PASSWORD_RESET_COPY,
  PASSWORD_RESET_ROUTES,
} from "@/data/password-reset";

import {
  PASSWORD_RESET_SESSION_COOKIE_NAME,
  verifyPasswordResetSessionToken,
} from "@/lib/server/password-reset-session";

/* ==========================================================================
   PAGE CONFIGURATION
   ========================================================================== */

export const dynamic =
  "force-dynamic";

export const metadata:
  Metadata = {
  title:
    "Sicherheitscode bestätigen",

  description:
    "Bestätige den Sicherheitscode für die sichere Wiederherstellung deines Express-Führerschein Kontos.",

  robots: {
    index:
      false,

    follow:
      false,
  },
};

/* ==========================================================================
   RESET SESSION
   ========================================================================== */

async function getResetSession() {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      PASSWORD_RESET_SESSION_COOKIE_NAME,
    )?.value;

  if (!token) {
    return null;
  }

  return verifyPasswordResetSessionToken(
    token,
  );
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default async function PasswordResetVerifyPage() {
  const session =
    await getResetSession();

  /**
   * No valid reset request exists.
   * The user has to start the recovery process again.
   */
  if (!session) {
    redirect(
      PASSWORD_RESET_ROUTES.start,
    );
  }

  /**
   * If the code has already been verified, never send the user
   * back to the challenge step. Continue directly to the password step.
   */
  if (
    session.stage ===
    "verified"
  ) {
    redirect(
      PASSWORD_RESET_ROUTES.newPassword,
    );
  }

  return (
    <PasswordResetLayout>
      <PasswordResetCard
        title={
          PASSWORD_RESET_COPY
            .verify
            .title
        }
        subtitle={
          PASSWORD_RESET_COPY
            .verify
            .subtitle
        }
      >
        <PasswordResetCodeForm />
      </PasswordResetCard>
    </PasswordResetLayout>
  );
}
