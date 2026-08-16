import type {
  Metadata,
} from "next";

import {
  PasswordResetLayout,
} from "@/components/auth/password-reset/password-reset-layout";
import {
  PasswordResetSuccess,
} from "@/components/auth/password-reset/password-reset-success";

/* ==========================================================================
   PAGE CONFIGURATION
   ========================================================================== */

export const dynamic =
  "force-dynamic";

export const metadata:
  Metadata = {
  title:
    "Passwort erfolgreich geändert",

  description:
    "Dein Express-Führerschein Passwort wurde erfolgreich aktualisiert.",

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

export default function PasswordResetSuccessPage() {
  return (
    <PasswordResetLayout>
      <section className="rounded-[22px] border border-[#E1E7EF] bg-white px-5 py-8 shadow-[0_20px_55px_rgba(8,24,44,0.09)] sm:px-8 sm:py-10">
        <PasswordResetSuccess />
      </section>
    </PasswordResetLayout>
  );
}
