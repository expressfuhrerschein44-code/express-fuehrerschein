"use client";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

interface AdminLoginApiResponse {
  ok:
    boolean;
  error?: {
    code:
      string;
    message:
      string;
  };
}

export function AdminLoginForm() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] =
    useState(
      "",
    );

  const [
    password,
    setPassword,
  ] =
    useState(
      "",
    );

  const [
    rememberMe,
    setRememberMe,
  ] =
    useState(
      false,
    );

  const [
    showPassword,
    setShowPassword,
  ] =
    useState(
      false,
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
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy) {
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
          "/api/admin/auth/login",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                email,
                password,
                rememberMe,
              }),
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () => null,
          ) as
          | AdminLoginApiResponse
          | null;

      if (
        !response.ok ||
        !payload?.ok
      ) {
        throw new Error(
          payload?.error
            ?.message ??
          "Die Anmeldung konnte nicht durchgeführt werden.",
        );
      }

      router.replace(
        "/admin",
      );

      router.refresh();
    } catch (
      exception
    ) {
      setError(
        exception instanceof
        Error
          ? exception.message
          : "Die Anmeldung konnte nicht durchgeführt werden.",
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
      className="mt-6 space-y-4"
    >
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-[9px] font-extrabold text-[#34445A]">
          <Mail
            className="h-3.5 w-3.5 text-[#0B63F6]"
            aria-hidden="true"
          />
          E-Mail-Adresse
        </span>

        <input
          type="email"
          required
          autoComplete="username"
          value={
            email
          }
          disabled={
            busy
          }
          onChange={(
            event,
          ) =>
            setEmail(
              event.target.value,
            )
          }
          className="min-h-11 w-full rounded-xl border border-[#DCE4EF] bg-white px-3 text-[10px] font-semibold text-[#223248] outline-none transition placeholder:text-[#A1ACBA] focus:border-[#0B63F6] focus:ring-2 focus:ring-[#DCEBFF]"
          placeholder="admin@express-fuhrerscheine.de"
        />
      </label>

      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-[9px] font-extrabold text-[#34445A]">
          <LockKeyhole
            className="h-3.5 w-3.5 text-[#0B63F6]"
            aria-hidden="true"
          />
          Passwort
        </span>

        <span className="relative block">
          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            required
            autoComplete="current-password"
            value={
              password
            }
            disabled={
              busy
            }
            onChange={(
              event,
            ) =>
              setPassword(
                event.target.value,
              )
            }
            className="min-h-11 w-full rounded-xl border border-[#DCE4EF] bg-white px-3 pr-11 text-[10px] font-semibold text-[#223248] outline-none transition placeholder:text-[#A1ACBA] focus:border-[#0B63F6] focus:ring-2 focus:ring-[#DCEBFF]"
            placeholder="••••••••••••"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (
                  current,
                ) =>
                  !current,
              )
            }
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[#7F8C9D]"
            aria-label={
              showPassword
                ? "Passwort ausblenden"
                : "Passwort anzeigen"
            }
          >
            {showPassword ? (
              <EyeOff
                className="h-4 w-4"
                aria-hidden="true"
              />
            ) : (
              <Eye
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}
          </button>
        </span>
      </label>

      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={
            rememberMe
          }
          disabled={
            busy
          }
          onChange={(
            event,
          ) =>
            setRememberMe(
              event.target.checked,
            )
          }
          className="h-3.5 w-3.5 rounded border-[#C9D2DE]"
        />

        <span className="text-[8px] font-semibold text-[#657489]">
          Angemeldet bleiben
        </span>
      </label>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-[#F2CACA] bg-[#FFF7F7] px-3 py-2.5 text-[8px] font-bold leading-4 text-[#A53030]"
        >
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={
          busy
        }
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-4 text-[9px] font-extrabold text-white transition hover:bg-[#0958DC] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? (
          <Loader2
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <ShieldCheck
            className="h-4 w-4"
            aria-hidden="true"
          />
        )}

        {busy
          ? "Anmeldung..."
          : "Anmelden"}
      </button>

      <p className="text-center text-[7px] font-medium leading-4 text-[#8A96A6]">
        Nur für autorisierte Administratoren von Express-Führerschein.
      </p>
    </form>
  );
}
