"use client";

/**
 * Express-Führerschein
 * Password change form.
 */

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

export interface ChangePasswordFormProps {
  onSuccess:
    () => void;
}

const inputClass =
  "mt-1.5 h-10 w-full rounded-lg border border-[#DCE4ED] px-3 text-[11px] outline-none transition focus:border-[#0878FF] focus:ring-2 focus:ring-[#0878FF]/10";

export function ChangePasswordForm({
  onSuccess,
}: ChangePasswordFormProps) {
  const router =
    useRouter();

  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState(
      "",
    );

  const [
    newPassword,
    setNewPassword,
  ] =
    useState(
      "",
    );

  const [
    confirmPassword,
    setConfirmPassword,
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

  async function submit(
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
          "/api/profile/password/change",
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

                newPassword,

                confirmPassword,
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
            "Das Passwort konnte nicht geändert werden.",
        );

        return;
      }

      onSuccess();

      router
        .replace(
          "/login",
        );

      router
        .refresh();
    } catch {
      setError(
        "Das Passwort konnte nicht geändert werden.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  return (
    <form
      onSubmit={
        submit
      }
      className="space-y-4"
    >
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

      <label
        className="block"
      >
        <span
          className="text-[10px] font-semibold text-[#5D6D81]"
        >
          Neues Passwort
        </span>

        <input
          type="password"
          autoComplete="new-password"
          value={
            newPassword
          }
          onChange={
            (
              event,
            ) =>
              setNewPassword(
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
          Neues Passwort bestätigen
        </span>

        <input
          type="password"
          autoComplete="new-password"
          value={
            confirmPassword
          }
          onChange={
            (
              event,
            ) =>
              setConfirmPassword(
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

      <p
        className="text-[9px] leading-4 text-[#7A899A]"
      >
        Nach einer Passwortänderung werden deine bestehenden Sitzungen aus Sicherheitsgründen beendet.
      </p>

      {error ? (
        <p
          role="alert"
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
        className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#0878FF] px-4 text-[11px] font-bold text-white outline-none transition hover:bg-[#006DEB] disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#0878FF]"
      >
        {
          busy
            ? "Ändern..."
            : "Passwort ändern"
        }
      </button>
    </form>
  );
}
