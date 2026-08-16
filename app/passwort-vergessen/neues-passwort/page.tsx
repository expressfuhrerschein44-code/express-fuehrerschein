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
  PasswordResetLayout,
} from "@/components/auth/password-reset/password-reset-layout";
import {
  PasswordResetNewPasswordForm,
} from "@/components/auth/password-reset/password-reset-new-password-form";

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
    "Neues Passwort festlegen",

  description:
    "Lege ein neues sicheres Passwort für dein Express-Führerschein Konto fest.",

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

export default async function PasswordResetNewPasswordPage() {
  const session =
    await getResetSession();

  /**
   * Without a valid temporary reset session, a password change
   * must never be rendered.
   */
  if (!session) {
    redirect(
      PASSWORD_RESET_ROUTES.start,
    );
  }

  /**
   * A challenge session has not yet proved possession of the e-mail.
   * Return to code verification first.
   */
  if (
    session.stage !==
    "verified"
  ) {
    redirect(
      PASSWORD_RESET_ROUTES.verify,
    );
  }

  return (
    <PasswordResetLayout>
      <PasswordResetCard
        title={
          PASSWORD_RESET_COPY
            .newPassword
            .title
        }
        subtitle={
          PASSWORD_RESET_COPY
            .newPassword
            .subtitle
        }
      >
        <PasswordResetNewPasswordForm />
      </PasswordResetCard>
    </PasswordResetLayout>
  );
}
