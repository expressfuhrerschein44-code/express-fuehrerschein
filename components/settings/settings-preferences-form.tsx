"use client";

import {
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  Languages,
  Loader2,
  Save,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import type {
  FormEvent,
} from "react";

import type {
  SettingsLocale,
  SettingsPreferencesView,
  UpdateSettingsResult,
} from "@/types/settings";

export interface SettingsPreferencesFormProps {
  preferences:
    SettingsPreferencesView;
}

interface ApiSuccess {
  ok:
    true;
  data:
    UpdateSettingsResult;
}

interface ApiError {
  ok:
    false;
  error: {
    code:
      string;
    message:
      string;
  };
}

type ApiResponse =
  | ApiSuccess
  | ApiError;

const LANGUAGES:
  readonly {
    value:
      SettingsLocale;
    label:
      string;
  }[] =
  [
    {
      value:
        "de",
      label:
        "Deutsch",
    },
    {
      value:
        "fr",
      label:
        "Français",
    },
    {
      value:
        "nl",
      label:
        "Nederlands",
    },
    {
      value:
        "es",
      label:
        "Español",
    },
    {
      value:
        "it",
      label:
        "Italiano",
    },
    {
      value:
        "en",
      label:
        "English",
    },
  ];

const COMMON_TIMEZONES =
  [
    {
      value:
        "Europe/Berlin",
      label:
        "Deutschland – Europe/Berlin",
    },
    {
      value:
        "Europe/Vienna",
      label:
        "Österreich – Europe/Vienna",
    },
    {
      value:
        "Europe/Zurich",
      label:
        "Schweiz – Europe/Zurich",
    },
    {
      value:
        "Europe/Brussels",
      label:
        "Belgien – Europe/Brussels",
    },
    {
      value:
        "Europe/Madrid",
      label:
        "Spanien – Europe/Madrid",
    },
  ] as const;

export function SettingsPreferencesForm({
  preferences,
}: SettingsPreferencesFormProps) {
  const router =
    useRouter();

  const [
    preferredLocale,
    setPreferredLocale,
  ] =
    useState<SettingsLocale>(
      preferences.preferredLocale,
    );

  const [
    timezone,
    setTimezone,
  ] =
    useState(
      preferences.timezone,
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

  const [
    success,
    setSuccess,
  ] =
    useState(
      false,
    );

  const timezoneOptions =
    COMMON_TIMEZONES.some(
      (
        option,
      ) =>
        option.value ===
        timezone,
    )
      ? COMMON_TIMEZONES
      : [
          {
            value:
              timezone,
            label:
              timezone,
          },
          ...COMMON_TIMEZONES,
        ];

  const changed =
    preferredLocale !==
      preferences.preferredLocale ||
    timezone !==
      preferences.timezone;

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      busy ||
      !changed
    ) {
      return;
    }

    setBusy(
      true,
    );

    setError(
      null,
    );

    setSuccess(
      false,
    );

    try {
      const response =
        await fetch(
          "/api/settings",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                preferredLocale,
                timezone,
              }),
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () => null,
          ) as
          | ApiResponse
          | null;

      if (
        !response.ok ||
        !payload ||
        !payload.ok
      ) {
        throw new Error(
          payload &&
          !payload.ok
            ? payload.error
                .message
            : "Die Einstellungen konnten nicht gespeichert werden.",
        );
      }

      setPreferredLocale(
        payload.data
          .preferences
          .preferredLocale,
      );

      setTimezone(
        payload.data
          .preferences
          .timezone,
      );

      setSuccess(
        true,
      );

      router.refresh();
    } catch (
      exception
    ) {
      setError(
        exception instanceof
        Error
          ? exception.message
          : "Die Einstellungen konnten nicht gespeichert werden.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.04)] lg:p-6">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Sprache & Region
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Plattform-Einstellungen
        </h2>

        <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
          Deine Auswahl wird direkt in deinem Kundenprofil gespeichert.
        </p>
      </div>

      <form
        onSubmit={
          submit
        }
        className="mt-5 space-y-4"
      >
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-[9px] font-extrabold text-[#34445A]">
            <Languages
              className="h-3.5 w-3.5 text-[#0B63F6]"
              aria-hidden="true"
            />
            Sprache
          </span>

          <select
            value={
              preferredLocale
            }
            disabled={
              busy
            }
            onChange={(
              event,
            ) => {
              setPreferredLocale(
                event.target.value as
                SettingsLocale,
              );

              setSuccess(
                false,
              );
            }}
            className="min-h-11 w-full rounded-xl border border-[#DCE4EF] bg-white px-3 text-[10px] font-semibold text-[#223248] outline-none transition focus:border-[#0B63F6] focus:ring-2 focus:ring-[#DCEBFF] disabled:bg-[#F7F9FC]"
          >
            {LANGUAGES.map(
              (
                language,
              ) => (
                <option
                  key={
                    language.value
                  }
                  value={
                    language.value
                  }
                >
                  {language.label}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-[9px] font-extrabold text-[#34445A]">
            <Clock3
              className="h-3.5 w-3.5 text-[#0B63F6]"
              aria-hidden="true"
            />
            Zeitzone
          </span>

          <select
            value={
              timezone
            }
            disabled={
              busy
            }
            onChange={(
              event,
            ) => {
              setTimezone(
                event.target.value,
              );

              setSuccess(
                false,
              );
            }}
            className="min-h-11 w-full rounded-xl border border-[#DCE4EF] bg-white px-3 text-[10px] font-semibold text-[#223248] outline-none transition focus:border-[#0B63F6] focus:ring-2 focus:ring-[#DCEBFF] disabled:bg-[#F7F9FC]"
          >
            {timezoneOptions.map(
              (
                option,
              ) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </label>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-[#F1CACA] bg-[#FFF7F7] px-3 py-2.5 text-[8px] font-bold leading-4 text-[#A53030]"
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-[#BFE8D7] bg-[#F7FCF9] px-3 py-2.5 text-[8px] font-bold text-[#0C8B59]"
          >
            <CheckCircle2
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            Einstellungen erfolgreich gespeichert.
          </div>
        ) : null}

        <div className="pt-1 sm:text-right">
          <button
            type="submit"
            disabled={
              busy ||
              !changed
            }
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-5 text-[9px] font-extrabold text-white transition hover:bg-[#0958DC] disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
          >
            {busy ? (
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Save
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}

            {busy
              ? "Wird gespeichert..."
              : "Änderungen speichern"}
          </button>
        </div>
      </form>
    </section>
  );
}
