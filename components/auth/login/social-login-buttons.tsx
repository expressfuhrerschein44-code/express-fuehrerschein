import {
  LOGIN_SOCIAL_PROVIDERS,
} from "@/data/login";

import {
  cn,
} from "@/lib/utils";

import type {
  LoginOAuthProvider,
  SocialLoginProvider,
} from "@/types/login";

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface SocialLoginButtonsProps {
  /**
   * Classes supplémentaires du conteneur.
   */
  className?: string;

  /**
   * Fournisseurs OAuth à afficher.
   *
   * Par défaut :
   * LOGIN_SOCIAL_PROVIDERS.
   */
  providers?:
    readonly SocialLoginProvider[];

  /**
   * Destination après authentification.
   *
   * Exemple :
   * /dashboard
   */
  returnTo?: string;
}

/* ==========================================================================
   GOOGLE ICON
   ========================================================================== */

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="h-5 w-5 shrink-0"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.23c0-.73-.07-1.43-.2-2.1H12v3.98h5.23a4.47 4.47 0 0 1-1.94 2.93v2.58h3.14c1.84-1.69 2.92-4.18 2.92-7.39Z"
      />

      <path
        fill="#34A853"
        d="M12 21.7c2.63 0 4.84-.87 6.43-2.08l-3.14-2.58c-.87.58-1.98.93-3.29.93-2.54 0-4.7-1.72-5.47-4.03H3.29v2.66A9.7 9.7 0 0 0 12 21.7Z"
      />

      <path
        fill="#FBBC05"
        d="M6.53 13.94A5.82 5.82 0 0 1 6.23 12c0-.67.12-1.32.3-1.94V7.4H3.29A9.7 9.7 0 0 0 2.3 12c0 1.66.4 3.23.99 4.6l3.24-2.66Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.03c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.12 14.62 2.3 12 2.3A9.7 9.7 0 0 0 3.29 7.4l3.24 2.66C7.3 7.75 9.46 6.03 12 6.03Z"
      />
    </svg>
  );
}

/* ==========================================================================
   APPLE ICON
   ========================================================================== */

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="h-5 w-5 shrink-0"
      fill="currentColor"
    >
      <path d="M17.05 12.54c.02-2.05 1.68-3.03 1.75-3.07-.95-1.39-2.43-1.58-2.96-1.6-1.26-.13-2.46.74-3.1.74-.64 0-1.63-.72-2.68-.7-1.38.02-2.65.8-3.36 2.04-1.43 2.49-.37 6.17 1.03 8.19.68.99 1.5 2.1 2.57 2.06 1.03-.04 1.42-.67 2.67-.67 1.25 0 1.6.67 2.69.65 1.11-.02 1.82-.99 2.5-1.98.79-1.15 1.11-2.26 1.13-2.32-.02-.01-2.17-.83-2.19-3.34h-.05ZM15.02 6.54c.57-.69.96-1.65.85-2.61-.83.03-1.83.55-2.43 1.24-.53.61-1 1.58-.87 2.51.92.07 1.87-.47 2.45-1.14Z" />
    </svg>
  );
}

/* ==========================================================================
   PROVIDER ICON
   ========================================================================== */

function ProviderIcon({
  provider,
}: {
  provider:
    LoginOAuthProvider;
}) {
  switch (provider) {
    case "google":
      return (
        <GoogleIcon />
      );

    case "apple":
      return (
        <AppleIcon />
      );

    default:
      return null;
  }
}

/* ==========================================================================
   RETURN URL
   ========================================================================== */

function createProviderHref(
  startHref:
    string,

  returnTo?:
    string,
): string {
  if (!returnTo) {
    return startHref;
  }

  const separator =
    startHref.includes("?")
      ? "&"
      : "?";

  return (
    `${startHref}${separator}` +
    `returnTo=${encodeURIComponent(returnTo)}`
  );
}

/* ==========================================================================
   SOCIAL LOGIN BUTTONS
   ========================================================================== */

export function SocialLoginButtons({
  className,

  providers =
    LOGIN_SOCIAL_PROVIDERS,

  returnTo,
}: SocialLoginButtonsProps) {
  /* ------------------------------------------------------------------------
     Enabled providers only
     ------------------------------------------------------------------------ */

  const enabledProviders =
    providers.filter(
      (provider) =>
        provider.enabled,
    );

  /* ------------------------------------------------------------------------
     No provider enabled
     ------------------------------------------------------------------------ */

  /**
   * IMPORTANT:
   *
   * Google et Apple sont actuellement désactivés.
   *
   * Dans ce cas nous ne rendons :
   *
   * - aucun bouton ;
   * - aucun conteneur vide ;
   * - aucun espace inutile.
   */
  if (
    enabledProviders.length ===
    0
  ) {
    return null;
  }

  /* ------------------------------------------------------------------------
     Render
     ------------------------------------------------------------------------ */

  return (
    <div
      className={cn(
        "grid",
        "w-full",
        "gap-3",

        className,
      )}
    >
      {enabledProviders.map(
        (provider) => {
          const href =
            createProviderHref(
              provider.startHref,
              returnTo,
            );

          return (
            <a
              key={
                provider.id
              }
              href={
                href
              }
              aria-label={
                provider.label
              }
              className="
                flex
                min-h-[48px]
                w-full
                items-center
                justify-center
                gap-3

                rounded-[8px]

                border
                border-[#D7DFE8]

                bg-white

                px-4

                text-[13px]
                font-medium
                text-[#1F2D3D]

                outline-none

                transition-[background-color,border-color,box-shadow]
                duration-150

                hover:border-[#B8C5D4]
                hover:bg-[#FAFBFC]

                focus-visible:ring-2
                focus-visible:ring-[#0878FF]
                focus-visible:ring-offset-2

                active:bg-[#F4F6F8]
              "
            >
              <ProviderIcon
                provider={
                  provider.id
                }
              />

              <span>
                {
                  provider.label
                }
              </span>
            </a>
          );
        },
      )}
    </div>
  );
}