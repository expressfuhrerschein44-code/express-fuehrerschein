"use client";

/**
 * Express-Führerschein
 * Destructive account deletion confirmation.
 */

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

export interface DeleteAccountFormProps {
  onSuccess:
    () => void;
}

export function DeleteAccountForm({
  onSuccess,
}: DeleteAccountFormProps) {
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
    confirmation,
    setConfirmation,
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

  const ready =
    confirmation ===
    "LÖSCHEN";

  async function submit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event
      .preventDefault();

    if (
      !ready
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
          "/api/profile/account/delete",
          {
            method:
              "DELETE",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                currentPassword,

                confirmation,
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
            "Das Konto konnte nicht gelöscht werden.",
        );

        return;
      }

      onSuccess();

      router
        .replace(
          "/",
        );

      router
        .refresh();
    } catch {
      setError(
        "Das Konto konnte nicht gelöscht werden.",
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
      <div
        className="rounded-xl border border-[#FFD6D6] bg-[#FFF7F7] p-4"
      >
        <p
          className="text-[11px] font-extrabold text-[#C03939]"
        >
          Diese Aktion ist endgültig.
        </p>

        <p
          className="mt-1 text-[9px] leading-5 text-[#875A5A]"
        >
          Dein Konto und die damit verbundenen persönlichen Daten werden gemäß den technischen und gesetzlichen Aufbewahrungsregeln entfernt.
        </p>
      </div>

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
          className="mt-1.5 h-10 w-full rounded-lg border border-[#DCE4ED] px-3 text-[11px] outline-none focus:border-[#F04444]"
        />
      </label>

      <label
        className="block"
      >
        <span
          className="text-[10px] font-semibold text-[#5D6D81]"
        >
          Tippe LÖSCHEN zur Bestätigung
        </span>

        <input
          value={
            confirmation
          }
          onChange={
            (
              event,
            ) =>
              setConfirmation(
                event
                  .target
                  .value,
              )
          }
          className="mt-1.5 h-10 w-full rounded-lg border border-[#DCE4ED] px-3 text-[11px] outline-none focus:border-[#F04444]"
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
          !ready
        }
        className="h-10 w-full rounded-lg bg-[#F04444] text-[11px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Konto endgültig löschen
      </button>
    </form>
  );
}
