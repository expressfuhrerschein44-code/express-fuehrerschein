"use client";

/**
 * Express-Führerschein
 * TOTP two-factor setup / disable dialog.
 */

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

export interface TwoFactorDialogProps {
  open:
    boolean;

  enabled:
    boolean;

  onClose:
    () => void;
}

export function TwoFactorDialog({
  open,
  enabled,
  onClose,
}: TwoFactorDialogProps) {
  const router =
    useRouter();

  const [
    setup,
    setSetup,
  ] =
    useState<{
      secret:
        string;

      otpauthUri:
        string;
    } | null>(
      null,
    );

  const [
    code,
    setCode,
  ] =
    useState(
      "",
    );

  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState(
      "",
    );

  const [
    busy,
    setBusy,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  if (
    !open
  ) {
    return null;
  }

  async function start() {
    setBusy(
      true,
    );

    setError(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/profile/two-factor/setup",
          {
            method:
              "POST",
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () =>
              null,
          ) as
          | {
              message?:
                string;

              data?: {
                secret?:
                  string;

                otpauthUri?:
                  string;
              };
            }
          | null;

      if (
        !response.ok ||
        !payload?.data
          ?.secret ||
        !payload.data
          .otpauthUri
      ) {
        setError(
          payload?.message ??
            "Die Zwei-Faktor-Authentifizierung konnte nicht gestartet werden.",
        );

        return;
      }

      setSetup({
        secret:
          payload.data
            .secret,

        otpauthUri:
          payload.data
            .otpauthUri,
      });
    } catch {
      setError(
        "Die Zwei-Faktor-Authentifizierung konnte nicht gestartet werden.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  async function verify() {
    setBusy(
      true,
    );

    setError(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/profile/two-factor/verify",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                code,
              }),
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () =>
              null,
          ) as
          | {
              message?:
                string;
            }
          | null;

      if (
        !response.ok
      ) {
        setError(
          payload?.message ??
            "Der Code konnte nicht bestätigt werden.",
        );

        return;
      }

      onClose();

      router
        .refresh();
    } catch {
      setError(
        "Der Code konnte nicht bestätigt werden.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  async function disable() {
    setBusy(
      true,
    );

    setError(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/profile/two-factor/disable",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                currentPassword,
              }),
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () =>
              null,
          ) as
          | {
              message?:
                string;
            }
          | null;

      if (
        !response.ok
      ) {
        setError(
          payload?.message ??
            "Die Zwei-Faktor-Authentifizierung konnte nicht deaktiviert werden.",
        );

        return;
      }

      onClose();

      router
        .refresh();
    } catch {
      setError(
        "Die Zwei-Faktor-Authentifizierung konnte nicht deaktiviert werden.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08111F]/55 p-4"
      onMouseDown={
        (
          event,
        ) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="two-factor-title"
        className="w-full max-w-[520px] rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div
          className="flex items-center justify-between gap-4"
        >
          <div>
            <h2
              id="two-factor-title"
              className="text-[17px] font-black text-[#111C2B]"
            >
              Zwei-Faktor-Authentifizierung
            </h2>

            <p
              className="mt-1 text-[10px] text-[#738195]"
            >
              Schütze dein Konto mit einem zusätzlichen TOTP-Code.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="h-9 w-9 rounded-lg text-[#64758A] hover:bg-[#F3F6F9]"
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <div
          className="mt-5"
        >
          {enabled ? (
            <>
              <p
                className="text-[11px] leading-5 text-[#56677C]"
              >
                Die Zwei-Faktor-Authentifizierung ist aktiv. Zum Deaktivieren bestätige dein aktuelles Passwort.
              </p>

              <input
                type="password"
                value={
                  currentPassword
                }
                onChange={
                  (
                    event,
                  ) =>
                    setCurrentPassword(
                      event
                        .target
                        .value,
                    )
                }
                placeholder="Aktuelles Passwort"
                className="mt-4 h-10 w-full rounded-lg border border-[#DCE4ED] px-3 text-[11px] outline-none focus:border-[#0878FF]"
              />

              <button
                type="button"
                disabled={
                  busy
                }
                onClick={
                  () =>
                    void disable()
                }
                className="mt-4 h-10 w-full rounded-lg bg-[#F04444] text-[11px] font-bold text-white disabled:opacity-60"
              >
                Deaktivieren
              </button>
            </>
          ) : setup ? (
            <>
              <p
                className="text-[10px] leading-5 text-[#56677C]"
              >
                Öffne deine Authenticator-App und füge dieses Konto hinzu. Falls deine App keinen Link übernehmen kann, verwende den Schlüssel.
              </p>

              <a
                href={
                  setup.otpauthUri
                }
                className="mt-4 inline-flex h-9 items-center rounded-lg border border-[#D9E2EC] px-3 text-[10px] font-bold text-[#0878FF]"
              >
                Authenticator-App öffnen
              </a>

              <div
                className="mt-4 rounded-xl bg-[#F6F9FC] p-3"
              >
                <p
                  className="text-[9px] text-[#718095]"
                >
                  Setup-Schlüssel
                </p>

                <code
                  className="mt-1 block break-all text-[11px] font-bold text-[#172233]"
                >
                  {
                    setup.secret
                  }
                </code>
              </div>

              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={
                  6
                }
                value={
                  code
                }
                onChange={
                  (
                    event,
                  ) =>
                    setCode(
                      event
                        .target
                        .value
                        .replace(
                          /\D/g,
                          "",
                        )
                        .slice(
                          0,
                          6,
                        ),
                    )
                }
                placeholder="6-stelliger Code"
                className="mt-4 h-11 w-full rounded-lg border border-[#DCE4ED] px-3 text-center text-[16px] font-black tracking-[0.28em] outline-none focus:border-[#0878FF]"
              />

              <button
                type="button"
                disabled={
                  busy ||
                  code.length !==
                    6
                }
                onClick={
                  () =>
                    void verify()
                }
                className="mt-4 h-10 w-full rounded-lg bg-[#0878FF] text-[11px] font-bold text-white disabled:opacity-60"
              >
                Aktivieren
              </button>
            </>
          ) : (
            <>
              <p
                className="text-[11px] leading-5 text-[#56677C]"
              >
                Verwende eine Authenticator-App, um bei der Anmeldung einen zusätzlichen Sicherheitscode einzugeben.
              </p>

              <button
                type="button"
                disabled={
                  busy
                }
                onClick={
                  () =>
                    void start()
                }
                className="mt-4 h-10 w-full rounded-lg bg-[#0878FF] text-[11px] font-bold text-white disabled:opacity-60"
              >
                Einrichtung starten
              </button>
            </>
          )}

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-[#FFF4F4] px-3 py-2 text-[10px] text-[#C03939]"
            >
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
