/**
 * Express-Führerschein
 * Password reset shared layout.
 *
 * Purpose:
 * - keep every password-reset page visually consistent;
 * - reuse the existing Express-Führerschein login visual language;
 * - remain independent from authentication/session logic;
 * - use Next.js internal navigation correctly.
 */

import Link from "next/link";

import type {
  ReactNode,
} from "react";

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface PasswordResetLayoutProps {
  children:
    ReactNode;
}

/* ==========================================================================
   SMALL DECORATIVE ICONS
   ========================================================================== */

function ShieldCheckIcon() {
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
      <path d="M12 3 5.5 5.7v5.6c0 4.2 2.6 7.9 6.5 9.7 3.9-1.8 6.5-5.5 6.5-9.7V5.7L12 3Z" />
      <path d="m9.3 12.2 1.8 1.8 3.8-4" />
    </svg>
  );
}

function ClockIcon() {
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
      <circle
        cx="12"
        cy="12"
        r="8.5"
      />

      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

function LockIcon() {
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
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2.5"
      />

      <path d="M8.5 10V7.8a3.5 3.5 0 1 1 7 0V10" />
    </svg>
  );
}

/* ==========================================================================
   COMPONENT
   ========================================================================== */

export function PasswordResetLayout({
  children,
}: PasswordResetLayoutProps) {
  return (
    <main
      className="
        min-h-screen
        bg-[#F4F7FB]
        lg:grid
        lg:grid-cols-[minmax(0,0.92fr)_minmax(560px,1.08fr)]
      "
    >
      {/* ==================================================================
          DESKTOP BRAND / TRUST PANEL
          ================================================================== */}

      <section
        aria-label="Express-Führerschein Sicherheit"
        className="
          relative
          hidden
          min-h-screen
          overflow-hidden
          bg-[#06111F]
          lg:flex
          lg:flex-col
          lg:justify-between
        "
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(2,11,22,0.72) 0%, rgba(2,11,22,0.86) 54%, rgba(2,11,22,0.98) 100%), url('/images/login/login-berlin-car.webp')",

          backgroundPosition:
            "center",

          backgroundSize:
            "cover",
        }}
      >
        {/* ----------------------------------------------------------------
            Background decoration
            ---------------------------------------------------------------- */}

        <div
          aria-hidden="true"
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_28%_20%,rgba(0,126,255,0.24),transparent_32%)]
          "
        />

        {/* ----------------------------------------------------------------
            Desktop logo
            ---------------------------------------------------------------- */}

        <div
          className="
            relative
            z-10
            px-10
            pt-9
            xl:px-14
            xl:pt-11
          "
        >
          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2

              text-white

              outline-none

              focus-visible:ring-2
              focus-visible:ring-[#1B8CFF]
              focus-visible:ring-offset-4
              focus-visible:ring-offset-[#06111F]
            "
            aria-label="Express-Führerschein Startseite"
          >
            <span
              className="
                text-[23px]
                font-black
                tracking-[-0.04em]
                text-[#1687FF]
              "
            >
              Express-
            </span>

            <span
              className="
                text-[23px]
                font-black
                tracking-[-0.04em]
                text-white
              "
            >
              Führerschein
            </span>
          </Link>
        </div>

        {/* ----------------------------------------------------------------
            Desktop content
            ---------------------------------------------------------------- */}

        <div
          className="
            relative
            z-10
            px-10
            pb-12
            xl:px-14
            xl:pb-16
          "
        >
          <div
            className="
              max-w-[520px]
            "
          >
            <p
              className="
                mb-4
                text-[12px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[#69B3FF]
              "
            >
              Sicherer Kontozugang
            </p>

            <h1
              className="
                max-w-[500px]
                text-[42px]
                font-black
                leading-[1.08]
                tracking-[-0.045em]
                text-white
                xl:text-[50px]
              "
            >
              Sicher zurück.

              <span
                className="
                  block
                  text-[#1687FF]
                "
              >
                Schnell weiterlernen.
              </span>
            </h1>

            <p
              className="
                mt-5
                max-w-[470px]
                text-[15px]
                leading-7
                text-[#B9C7D7]
              "
            >
              Setze dein Passwort in wenigen sicheren Schritten zurück und
              greife danach wieder auf deinen persönlichen Lernbereich zu.
            </p>

            {/* --------------------------------------------------------------
                Trust cards
                -------------------------------------------------------------- */}

            <div
              className="
                mt-9
                grid
                gap-4
                sm:grid-cols-3
                lg:grid-cols-1
                xl:grid-cols-3
              "
            >
              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.07]
                  p-4
                  backdrop-blur-sm
                "
              >
                <div
                  className="
                    mb-3
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#1687FF]/15
                    text-[#65B3FF]
                  "
                >
                  <ShieldCheckIcon />
                </div>

                <div
                  className="
                    text-[13px]
                    font-bold
                    text-white
                  "
                >
                  Sicher geprüft
                </div>

                <div
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-[#9EB0C4]
                  "
                >
                  Zeitlich begrenzter Sicherheitscode
                </div>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.07]
                  p-4
                  backdrop-blur-sm
                "
              >
                <div
                  className="
                    mb-3
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#1687FF]/15
                    text-[#65B3FF]
                  "
                >
                  <ClockIcon />
                </div>

                <div
                  className="
                    text-[13px]
                    font-bold
                    text-white
                  "
                >
                  Schnell erledigt
                </div>

                <div
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-[#9EB0C4]
                  "
                >
                  In wenigen Minuten wieder im Konto
                </div>
              </div>

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.07]
                  p-4
                  backdrop-blur-sm
                "
              >
                <div
                  className="
                    mb-3
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#1687FF]/15
                    text-[#65B3FF]
                  "
                >
                  <LockIcon />
                </div>

                <div
                  className="
                    text-[13px]
                    font-bold
                    text-white
                  "
                >
                  Vertraulich
                </div>

                <div
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-[#9EB0C4]
                  "
                >
                  Deine Zugangsdaten bleiben geschützt
                </div>
              </div>
            </div>

            {/* --------------------------------------------------------------
                Trust footer
                -------------------------------------------------------------- */}

            <div
              className="
                mt-8
                flex
                flex-wrap
                items-center
                gap-x-5
                gap-y-2
                border-t
                border-white/10
                pt-5
                text-[11px]
                font-semibold
                text-[#92A5BA]
              "
            >
              <span>
                SSL-verschlüsselt
              </span>

              <span
                aria-hidden="true"
                className="
                  h-1
                  w-1
                  rounded-full
                  bg-[#55708D]
                "
              />

              <span>
                DSGVO-konform
              </span>

              <span
                aria-hidden="true"
                className="
                  h-1
                  w-1
                  rounded-full
                  bg-[#55708D]
                "
              />

              <span>
                Deutschland
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================
          FORM AREA
          ================================================================== */}

      <section
        className="
          relative
          flex
          min-h-screen
          flex-col
          bg-[#F4F7FB]
        "
      >
        {/* ----------------------------------------------------------------
            Header
            ---------------------------------------------------------------- */}

        <header
          className="
            flex
            h-[72px]
            items-center
            justify-between
            border-b
            border-[#E4EAF1]
            bg-white/95
            px-5
            backdrop-blur
            sm:px-8
            lg:justify-end
            lg:border-b-0
            lg:bg-transparent
            xl:px-12
          "
        >
          {/* --------------------------------------------------------------
              Mobile logo
              -------------------------------------------------------------- */}

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-1.5

              outline-none

              focus-visible:ring-2
              focus-visible:ring-[#0878FF]
              focus-visible:ring-offset-2

              lg:hidden
            "
            aria-label="Express-Führerschein Startseite"
          >
            <span
              className="
                text-[18px]
                font-black
                tracking-[-0.04em]
                text-[#1687FF]
              "
            >
              Express-
            </span>

            <span
              className="
                text-[18px]
                font-black
                tracking-[-0.04em]
                text-[#071426]
              "
            >
              Führerschein
            </span>
          </Link>

          {/* --------------------------------------------------------------
              Locale indicator
              -------------------------------------------------------------- */}

          <div
            aria-label="Aktuelle Sprache Deutsch"
            className="
              inline-flex
              h-9
              items-center
              gap-2
              rounded-lg
              border
              border-[#DCE4ED]
              bg-white
              px-3
              text-[12px]
              font-bold
              text-[#24364A]
              shadow-sm
            "
          >
            <span
              aria-hidden="true"
            >
              🇩🇪
            </span>

            <span>
              DE
            </span>
          </div>
        </header>

        {/* ----------------------------------------------------------------
            Main form content
            ---------------------------------------------------------------- */}

        <div
          className="
            flex
            flex-1
            items-center
            justify-center
            px-4
            py-8
            sm:px-8
            sm:py-12
            xl:px-12
          "
        >
          <div
            className="
              w-full
              max-w-[520px]
            "
          >
            {children}
          </div>
        </div>

        {/* ----------------------------------------------------------------
            Footer
            ---------------------------------------------------------------- */}

        <footer
          className="
            px-5
            pb-7
            text-center
            text-[11px]
            leading-5
            text-[#8796A8]
            sm:px-8
            lg:px-12
          "
        >
          © {new Date().getFullYear()} Express-Führerschein · Sicherer
          Kontozugang
        </footer>
      </section>
    </main>
  );
}