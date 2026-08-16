import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LoginCard } from "@/components/auth/login/login-card";
import { LoginLayout } from "@/components/auth/login/login-layout";
import { LOGIN_ROUTES } from "@/data/login";
import { sanitizeReturnPath } from "@/lib/server/auth-origin";
import { getAuthSession } from "@/lib/server/auth-session";
import { detectCountryFromHeaders } from "@/lib/server/geo-country";
import { userRepository } from "@/lib/server/repositories/user-repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Anmelden",
  description:
    "Melde dich bei Express-Führerschein an und setze deine Führerscheinvorbereitung fort.",
  robots: {
    index: false,
    follow: false,
  },
};

interface LoginPageProps {
  searchParams?: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
}

function firstParam(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value)
    ? value[0]
    : value;
}

function oauthErrorMessage(
  code: string | undefined,
): string | null {
  switch (code) {
    case "google_configuration":
      return "Google-Anmeldung ist derzeit nicht konfiguriert.";
    case "apple_configuration":
      return "Apple-Anmeldung ist derzeit nicht konfiguriert.";
    case "oauth_cancelled":
      return "Die externe Anmeldung wurde abgebrochen.";
    case "oauth_state":
      return "Die sichere Anmeldesitzung ist abgelaufen. Bitte starte die Anmeldung erneut.";
    case "oauth_exchange":
      return "Die externe Anmeldung konnte nicht abgeschlossen werden. Bitte versuche es erneut.";
    case "oauth_profile_required":
      return "Für dieses externe Konto muss zuerst ein Express-Führerschein Profil erstellt werden.";
    case "oauth_account":
      return "Das externe Konto konnte nicht mit Express-Führerschein verknüpft werden.";
    default:
      return null;
  }
}

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const session =
    await getAuthSession();

  if (session) {
    const user =
      await userRepository.findById(
        session.userId,
      );

    if (
      user &&
      user.status === "active"
    ) {
      redirect(
        LOGIN_ROUTES.afterLogin,
      );
    }
  }

  const requestHeaders =
    new Headers(
      await headers(),
    );

  const detectedCountry =
    detectCountryFromHeaders(
      requestHeaders,
    );

  const params =
    searchParams
      ? await searchParams
      : {};

  const returnTo =
    sanitizeReturnPath(
      firstParam(
        params.returnTo,
      ),
      LOGIN_ROUTES.afterLogin,
    );

  const oauthError =
    oauthErrorMessage(
      firstParam(
        params.oauth_error,
      ),
    );

  return (
    <LoginLayout>
      {oauthError ? (
        <div
          role="alert"
          className="mb-4 rounded-[9px] border border-[#F0C7CA] bg-[#FFF4F4] px-4 py-3 text-[11px] font-medium leading-5 text-[#B4232A] sm:text-[12px]"
        >
          {oauthError}
        </div>
      ) : null}

      <LoginCard
        initialCountryCode={
          detectedCountry.countryCode
        }
        returnTo={returnTo}
      />
    </LoginLayout>
  );
}
