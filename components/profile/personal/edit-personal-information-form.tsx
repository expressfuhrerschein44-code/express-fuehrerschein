"use client";

/**
 * Express-Führerschein
 * Personal information editor.
 */

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  PROFILE_COUNTRIES,
  PROFILE_LOCALES,
} from "@/data/profile";

import type {
  ProfileData,
} from "@/types/profile";

export interface EditPersonalInformationFormProps {
  data:
    ProfileData;

  onSuccess:
    () => void;
}

const fieldClass =
  "mt-1.5 h-10 w-full rounded-lg border border-[#DCE4ED] bg-white px-3 text-[11px] text-[#172233] outline-none transition focus:border-[#0878FF] focus:ring-2 focus:ring-[#0878FF]/10";

const labelClass =
  "text-[10px] font-semibold text-[#5D6D81]";

export function EditPersonalInformationForm({
  data,
  onSuccess,
}: EditPersonalInformationFormProps) {
  const router =
    useRouter();

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
    form,
    setForm,
  ] =
    useState({
      firstName:
        data
          .identity
          .firstName,

      lastName:
        data
          .identity
          .lastName,

      phone:
        data
          .identity
          .phoneE164,

      countryCode:
        data
          .identity
          .countryCode,

      city:
        data
          .address
          .city ??
        "",

      postalCode:
        data
          .address
          .postalCode ??
        "",

      addressLine1:
        data
          .address
          .addressLine1 ??
        "",

      birthDate:
        data
          .additional
          .birthDate ??
        "",

      birthPlace:
        data
          .additional
          .birthPlace ??
        "",

      drivingLicenseNumber:
        data
          .additional
          .drivingLicenseNumber ??
        "",

      preferredLocale:
        data
          .preferences
          .preferredLocale,

      timezone:
        data
          .preferences
          .timezone,
    });

  function update(
    key:
      keyof typeof form,

    value:
      string,
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,

        [
          key
        ]:
          value,
      }),
    );
  }

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
          "/api/profile/update",
          {
            method:
              "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                form,
              ),
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
            "Die Profildaten konnten nicht gespeichert werden.",
        );

        return;
      }

      onSuccess();

      router
        .refresh();
    } catch {
      setError(
        "Die Profildaten konnten nicht gespeichert werden.",
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
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <label>
          <span
            className={
              labelClass
            }
          >
            Vorname
          </span>

          <input
            value={
              form.firstName
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "firstName",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          />
        </label>

        <label>
          <span
            className={
              labelClass
            }
          >
            Nachname
          </span>

          <input
            value={
              form.lastName
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "lastName",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          />
        </label>

        <label>
          <span
            className={
              labelClass
            }
          >
            Telefonnummer
          </span>

          <input
            value={
              form.phone
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "phone",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          />
        </label>

        <label>
          <span
            className={
              labelClass
            }
          >
            Land
          </span>

          <select
            value={
              form.countryCode
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "countryCode",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          >
            {PROFILE_COUNTRIES.map(
              (
                country,
              ) => (
                <option
                  key={
                    country.code
                  }
                  value={
                    country.code
                  }
                >
                  {
                    country.flag
                  }{" "}
                  {
                    country.label
                  }
                </option>
              ),
            )}
          </select>
        </label>

        <label>
          <span
            className={
              labelClass
            }
          >
            Stadt
          </span>

          <input
            value={
              form.city
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "city",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          />
        </label>

        <label>
          <span
            className={
              labelClass
            }
          >
            Postleitzahl
          </span>

          <input
            value={
              form.postalCode
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "postalCode",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          />
        </label>

        <label
          className="sm:col-span-2"
        >
          <span
            className={
              labelClass
            }
          >
            Adresse
          </span>

          <input
            value={
              form.addressLine1
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "addressLine1",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          />
        </label>

        <label>
          <span
            className={
              labelClass
            }
          >
            Geburtsdatum
          </span>

          <input
            type="date"
            value={
              form.birthDate
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "birthDate",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          />
        </label>

        <label>
          <span
            className={
              labelClass
            }
          >
            Geburtsort
          </span>

          <input
            value={
              form.birthPlace
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "birthPlace",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          />
        </label>

        <label>
          <span
            className={
              labelClass
            }
          >
            Führerscheinnummer
          </span>

          <input
            value={
              form
                .drivingLicenseNumber
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "drivingLicenseNumber",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          />
        </label>

        <label>
          <span
            className={
              labelClass
            }
          >
            Sprache
          </span>

          <select
            value={
              form
                .preferredLocale
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "preferredLocale",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          >
            {PROFILE_LOCALES.map(
              (
                locale,
              ) => (
                <option
                  key={
                    locale.code
                  }
                  value={
                    locale.code
                  }
                >
                  {
                    locale.label
                  }
                </option>
              ),
            )}
          </select>
        </label>

        <label
          className="sm:col-span-2"
        >
          <span
            className={
              labelClass
            }
          >
            Zeitzone
          </span>

          <input
            value={
              form.timezone
            }
            onChange={
              (
                event,
              ) =>
                update(
                  "timezone",
                  event
                    .target
                    .value,
                )
            }
            className={
              fieldClass
            }
          />
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-[#FFF4F4] px-3 py-2 text-[10px] text-[#C03939]"
        >
          {error}
        </p>
      ) : null}

      <div
        className="flex justify-end"
      >
        <button
          type="submit"
          disabled={
            busy
          }
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#0878FF] px-5 text-[11px] font-bold text-white outline-none transition hover:bg-[#006DEB] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-[#0878FF]"
        >
          {
            busy
              ? "Speichern..."
              : "Änderungen speichern"
          }
        </button>
      </div>
    </form>
  );
}
