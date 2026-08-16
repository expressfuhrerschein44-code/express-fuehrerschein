"use client";

/**
 * Express-Führerschein
 * Secure e-mail change form with two stages:
 * password-confirmed start -> code verification.
 */

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

export interface ChangeEmailFormProps {
  currentEmail:
    string;

  onSuccess:
    () => void;
}

export function ChangeEmailForm({
  currentEmail,
  onSuccess,
}: ChangeEmailFormProps) {
  const router =
    useRouter();

  const [
    newEmail,
    setNewEmail,
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
    requestId,
    setRequestId,
  ] =
    useState<string | null>(
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

  async function start(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event
      .preventDefault();

    setBusy(
      true,
    );

    setError(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/profile/email/change/start",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                newEmail,

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

              data?: {
                requestId?:
                  string;
              };
            }
          | null;

      if (
        !response.ok ||
        !payload?.data
          ?.requestId
      ) {
        setError(
          payload?.message ??
            "Die E-Mail-Änderung konnte nicht gestartet werden.",
        );

        return;
      }

      setRequestId(
        payload.data
          .requestId,
      );
    } catch {
      setError(
        "Die E-Mail-Änderung konnte nicht gestartet werden.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  async function verify(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event
      .preventDefault();

    if (
      !requestId
    ) {
      return;
    }

    setBusy(
      true,
    );

    setError(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/profile/email/change/verify",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                requestId,

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
            "Der Sicherheitscode konnte nicht bestätigt werden.",
        );

        return;
      }

      onSuccess();

      router
        .refresh();
    } catch {
      setError(
        "Der Sicherheitscode konnte nicht bestätigt werden.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  const inputClass =
    "mt-1.5 h-10 w-full rounded-lg border border-[#DCE4ED] px-3 text-[11px] outline-none focus:border-[#0878FF] focus:ring-2 focus:ring-[#0878FF]/10";

  if (
    requestId
  ) {
    return (
      <form
        onSubmit={
          verify
        }
        className="space-y-4"
      >
        <p
          className="text-[10px] leading-5 text-[#607086]"
        >
          Wir haben einen sechsstelligen Sicherheitscode an{" "}
          <strong>
            {newEmail}
          </strong>{" "}
          gesendet.
        </p>

        <label
          className="block"
        >
          <span
            className="text-[10px] font-semibold text-[#5D6D81]"
          >
            Sicherheitscode
          </span>

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
            className={`${inputClass} text-center text-[16px] font-black tracking-[0.28em]`}
          />
        </label>

        {error ? (
          <p
            className="rounded-lg bg-[#FFF4F4] px-3 py-2 text-[10px] text-[#C03939]"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            busy ||
            code.length !==
              6
          }
          className="h-10 w-full rounded-lg bg-[#0878FF] text-[11px] font-bold text-white disabled:opacity-60"
        >
          Code bestätigen
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={
        start
      }
      className="space-y-4"
    >
      <p
        className="text-[10px] leading-5 text-[#607086]"
      >
        Aktuelle E-Mail-Adresse:{" "}
        <strong>
          {currentEmail}
        </strong>
      </p>

      <label
        className="block"
      >
        <span
          className="text-[10px] font-semibold text-[#5D6D81]"
        >
          Neue E-Mail-Adresse
        </span>

        <input
          type="email"
          autoComplete="email"
          value={
            newEmail
          }
          onChange={
            (
              event,
            ) =>
              setNewEmail(
                event
                  .target
                  .value,
              )
          }
          className={
            inputClass
          }
        />
      </label>

      <label
        className="block"
      >
        <span
          className="text-[10px] font-semibold text-[#5D6D81]"
        >
          Aktuelles Passwort
        </span>

        <input
          type="password"
          autoComplete="current-password"
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
          className={
            inputClass
          }
        />
      </label>

      {error ? (
        <p
          className="rounded-lg bg-[#FFF4F4] px-3 py-2 text-[10px] text-[#C03939]"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={
          busy
        }
        className="h-10 w-full rounded-lg bg-[#0878FF] text-[11px] font-bold text-white disabled:opacity-60"
      >
        Sicherheitscode senden
      </button>
    </form>
  );
}
