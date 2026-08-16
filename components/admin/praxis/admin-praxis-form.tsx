"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  AlertCircle,
  CalendarCheck2,
  LoaderCircle,
  Save,
} from "lucide-react";

import type {
  AdminPraxisAppointmentDetailView,
  AdminPraxisApiResponse,
  AdminPraxisClientOption,
} from "@/types/admin-praxis";

export interface AdminPraxisFormProps {
  mode:
    "create" | "edit";
  clients:
    AdminPraxisClientOption[];
  appointment?:
    AdminPraxisAppointmentDetailView;
  onSuccess?:
    () => void;
}

type FormState = {
  userId:
    string;
  userLicenseClassId:
    string;
  title:
    string;
  location:
    string;
  startsAt:
    string;
  endsAt:
    string;
  notes:
    string;
  adminNotes:
    string;
};

function toLocalInputValue(
  iso:
    string | null,
): string {
  if (
    !iso
  ) {
    return "";
  }

  const date =
    new Date(
      iso,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const pad = (
    value:
      number,
  ) =>
    String(
      value,
    ).padStart(
      2,
      "0",
    );

  return `${date.getFullYear()}-${pad(
    date.getMonth() +
      1,
  )}-${pad(
    date.getDate(),
  )}T${pad(
    date.getHours(),
  )}:${pad(
    date.getMinutes(),
  )}`;
}

function initialState(
  appointment?:
    AdminPraxisAppointmentDetailView,
): FormState {
  if (
    appointment
  ) {
    return {
      userId:
        appointment.customer.id,
      userLicenseClassId:
        appointment.licenseClass?.id ??
        "",
      title:
        appointment.title,
      location:
        appointment.location ??
        "",
      startsAt:
        toLocalInputValue(
          appointment.startsAt,
        ),
      endsAt:
        toLocalInputValue(
          appointment.endsAt,
        ),
      notes:
        appointment.notes ??
        "",
      adminNotes:
        appointment.adminNotes ??
        "",
    };
  }

  const now =
    new Date();

  now.setMinutes(
    Math.ceil(
      now.getMinutes() /
        15,
    ) *
      15,
    0,
    0,
  );

  now.setHours(
    now.getHours() +
      1,
  );

  const end =
    new Date(
      now.getTime() +
        60 *
          60 *
          1000,
    );

  return {
    userId:
      "",
    userLicenseClassId:
      "",
    title:
      "Fahrstunde",
    location:
      "",
    startsAt:
      toLocalInputValue(
        now.toISOString(),
      ),
    endsAt:
      toLocalInputValue(
        end.toISOString(),
      ),
    notes:
      "",
    adminNotes:
      "",
  };
}

function toIsoOrNull(
  value:
    string,
): string | null {
  if (
    !value
  ) {
    return null;
  }

  const date =
    new Date(
      value,
    );

  return Number.isNaN(
    date.getTime(),
  )
    ? null
    : date.toISOString();
}

export function AdminPraxisForm({
  mode,
  clients,
  appointment,
  onSuccess,
}: AdminPraxisFormProps) {
  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      () =>
        initialState(
          appointment,
        ),
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    fieldErrors,
    setFieldErrors,
  ] =
    useState<
      Record<
        string,
        string
      >
    >(
      {},
    );

  const selectedClient =
    useMemo(
      () =>
        clients.find(
          (
            client,
          ) =>
            client.userId ===
            form.userId,
        ) ??
        null,
      [
        clients,
        form.userId,
      ],
    );

  const licenseClasses =
    selectedClient?.licenseClasses ??
    [];

  function update<K extends keyof FormState>(
    key:
      K,
    value:
      FormState[K],
  ) {
    setForm(
      (
        current,
      ) => ({
        ...current,
        [key]:
          value,
      }),
    );

    setFieldErrors(
      (
        current,
      ) => {
        if (
          !current[
            key
          ]
        ) {
          return current;
        }

        const next = {
          ...current,
        };

        delete next[
          key
        ];

        return next;
      },
    );
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      submitting
    ) {
      return;
    }

    setSubmitting(
      true,
    );

    setErrorMessage(
      null,
    );

    setFieldErrors(
      {},
    );

    try {
      const startsAt =
        toIsoOrNull(
          form.startsAt,
        );

      const endsAt =
        toIsoOrNull(
          form.endsAt,
        );

      const common = {
        userLicenseClassId:
          form.userLicenseClassId ||
          null,
        title:
          form.title,
        location:
          form.location ||
          null,
        startsAt:
          startsAt ??
          form.startsAt,
        endsAt:
          form.endsAt
            ? endsAt ??
              form.endsAt
            : null,
        notes:
          form.notes ||
          null,
        adminNotes:
          form.adminNotes ||
          null,
      };

      const response =
        await fetch(
          mode ===
            "create"
            ? "/api/admin/praxis"
            : `/api/admin/praxis/${encodeURIComponent(
                appointment?.id ??
                  "",
              )}`,
          {
            method:
              mode ===
              "create"
                ? "POST"
                : "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                mode ===
                  "create"
                  ? {
                      userId:
                        form.userId,
                      ...common,
                    }
                  : {
                      action:
                        "update",
                      data:
                        common,
                    },
              ),
          },
        );

      const payload =
        (await response
          .json()
          .catch(
            () => null,
          )) as
          | AdminPraxisApiResponse<AdminPraxisAppointmentDetailView>
          | null;

      if (
        !response.ok ||
        !payload ||
        !payload.ok
      ) {
        if (
          payload &&
          !payload.ok
        ) {
          setFieldErrors(
            payload.fields ??
              {},
          );

          throw new Error(
            payload.message,
          );
        }

        throw new Error(
          "Der Praxistermin konnte nicht gespeichert werden.",
        );
      }

      onSuccess?.();
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof
          Error
          ? error.message
          : "Der Praxistermin konnte nicht gespeichert werden.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <form
      onSubmit={
        submit
      }
      className="space-y-5"
    >
      {errorMessage ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-[13px] border border-red-200 bg-red-50 px-3.5 py-3 text-[10px] font-semibold leading-5 text-red-700"
        >
          <AlertCircle
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0"
          />
          {
            errorMessage
          }
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.09em] text-[#6F7F93]">
            Kunde
          </span>

          <select
            value={
              form.userId
            }
            disabled={
              mode ===
              "edit"
            }
            onChange={(
              event,
            ) => {
              const userId =
                event.target
                  .value;

              const client =
                clients.find(
                  (
                    item,
                  ) =>
                    item.userId ===
                    userId,
                );

              const preferred =
                client?.licenseClasses.find(
                  (
                    item,
                  ) =>
                    item.isPrimary,
                ) ??
                client?.licenseClasses[0];

              setForm(
                (
                  current,
                ) => ({
                  ...current,
                  userId,
                  userLicenseClassId:
                    preferred?.id ??
                    "",
                }),
              );
            }}
            className="h-11 w-full rounded-[12px] border border-[#DCE5EF] bg-[#FBFCFE] px-3 text-[11px] font-bold text-[#223148] outline-none focus:border-[#8DB8FF] focus:ring-2 focus:ring-[#0B63F6]/10 disabled:cursor-not-allowed disabled:bg-[#F1F4F8] disabled:text-[#8A97A8]"
          >
            <option value="">
              Kunde auswählen
            </option>

            {clients.map(
              (
                client,
              ) => (
                <option
                  key={
                    client.userId
                  }
                  value={
                    client.userId
                  }
                >
                  {
                    client.fullName
                  }{" "}
                  —{" "}
                  {
                    client.email
                  }
                </option>
              ),
            )}
          </select>

          {fieldErrors.userId ? (
            <span className="mt-1 block text-[9px] font-semibold text-red-600">
              {
                fieldErrors.userId
              }
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.09em] text-[#6F7F93]">
            Führerscheinklasse
          </span>

          <select
            value={
              form.userLicenseClassId
            }
            disabled={
              !form.userId
            }
            onChange={(
              event,
            ) =>
              update(
                "userLicenseClassId",
                event.target
                  .value,
              )
            }
            className="h-11 w-full rounded-[12px] border border-[#DCE5EF] bg-[#FBFCFE] px-3 text-[11px] font-bold text-[#223148] outline-none focus:border-[#8DB8FF] focus:ring-2 focus:ring-[#0B63F6]/10 disabled:cursor-not-allowed disabled:bg-[#F1F4F8]"
          >
            <option value="">
              Keine Klasse
            </option>

            {licenseClasses.map(
              (
                licenseClass,
              ) => (
                <option
                  key={
                    licenseClass.id
                  }
                  value={
                    licenseClass.id
                  }
                >
                  Klasse{" "}
                  {
                    licenseClass.code
                  }
                  {licenseClass.isPrimary
                    ? " · Primär"
                    : ""}
                </option>
              ),
            )}
          </select>

          {fieldErrors.userLicenseClassId ? (
            <span className="mt-1 block text-[9px] font-semibold text-red-600">
              {
                fieldErrors.userLicenseClassId
              }
            </span>
          ) : null}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.09em] text-[#6F7F93]">
            Titel
          </span>

          <input
            type="text"
            maxLength={
              160
            }
            value={
              form.title
            }
            onChange={(
              event,
            ) =>
              update(
                "title",
                event.target
                  .value,
              )
            }
            className="h-11 w-full rounded-[12px] border border-[#DCE5EF] bg-[#FBFCFE] px-3 text-[11px] font-semibold text-[#223148] outline-none focus:border-[#8DB8FF] focus:ring-2 focus:ring-[#0B63F6]/10"
          />

          {fieldErrors.title ? (
            <span className="mt-1 block text-[9px] font-semibold text-red-600">
              {
                fieldErrors.title
              }
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.09em] text-[#6F7F93]">
            Ort
          </span>

          <input
            type="text"
            maxLength={
              255
            }
            value={
              form.location
            }
            onChange={(
              event,
            ) =>
              update(
                "location",
                event.target
                  .value,
              )
            }
            placeholder="z. B. Fahrschule Berlin"
            className="h-11 w-full rounded-[12px] border border-[#DCE5EF] bg-[#FBFCFE] px-3 text-[11px] font-semibold text-[#223148] outline-none placeholder:text-[#9AA6B5] focus:border-[#8DB8FF] focus:ring-2 focus:ring-[#0B63F6]/10"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.09em] text-[#6F7F93]">
            Beginn
          </span>

          <input
            type="datetime-local"
            value={
              form.startsAt
            }
            onChange={(
              event,
            ) =>
              update(
                "startsAt",
                event.target
                  .value,
              )
            }
            className="h-11 w-full rounded-[12px] border border-[#DCE5EF] bg-[#FBFCFE] px-3 text-[11px] font-semibold text-[#223148] outline-none focus:border-[#8DB8FF] focus:ring-2 focus:ring-[#0B63F6]/10"
          />

          {fieldErrors.startsAt ? (
            <span className="mt-1 block text-[9px] font-semibold text-red-600">
              {
                fieldErrors.startsAt
              }
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.09em] text-[#6F7F93]">
            Ende
          </span>

          <input
            type="datetime-local"
            value={
              form.endsAt
            }
            onChange={(
              event,
            ) =>
              update(
                "endsAt",
                event.target
                  .value,
              )
            }
            className="h-11 w-full rounded-[12px] border border-[#DCE5EF] bg-[#FBFCFE] px-3 text-[11px] font-semibold text-[#223148] outline-none focus:border-[#8DB8FF] focus:ring-2 focus:ring-[#0B63F6]/10"
          />

          {fieldErrors.endsAt ? (
            <span className="mt-1 block text-[9px] font-semibold text-red-600">
              {
                fieldErrors.endsAt
              }
            </span>
          ) : null}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.09em] text-[#6F7F93]">
            Kundennotiz
          </span>

          <textarea
            rows={
              5
            }
            maxLength={
              5000
            }
            value={
              form.notes
            }
            onChange={(
              event,
            ) =>
              update(
                "notes",
                event.target
                  .value,
              )
            }
            placeholder="Informationen zum Termin..."
            className="w-full resize-y rounded-[12px] border border-[#DCE5EF] bg-[#FBFCFE] px-3 py-3 text-[11px] font-medium leading-5 text-[#223148] outline-none placeholder:text-[#9AA6B5] focus:border-[#8DB8FF] focus:ring-2 focus:ring-[#0B63F6]/10"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.09em] text-[#6F7F93]">
            Interne Admin-Notiz
          </span>

          <textarea
            rows={
              5
            }
            maxLength={
              5000
            }
            value={
              form.adminNotes
            }
            onChange={(
              event,
            ) =>
              update(
                "adminNotes",
                event.target
                  .value,
              )
            }
            placeholder="Nur für die Verwaltung..."
            className="w-full resize-y rounded-[12px] border border-[#DCE5EF] bg-[#FBFCFE] px-3 py-3 text-[11px] font-medium leading-5 text-[#223148] outline-none placeholder:text-[#9AA6B5] focus:border-[#8DB8FF] focus:ring-2 focus:ring-[#0B63F6]/10"
          />
        </label>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#E7ECF3] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[9px] font-semibold text-[#728196]">
          <CalendarCheck2
            aria-hidden="true"
            className="h-4 w-4 text-[#0B63F6]"
          />
          Änderungen werden in der Admin-Aktivität protokolliert.
        </div>

        <button
          type="submit"
          disabled={
            submitting
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0B63F6] px-5 text-[11px] font-black text-white shadow-[0_10px_26px_rgba(11,99,246,0.20)] transition hover:bg-[#075BE2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <LoaderCircle
              aria-hidden="true"
              className="h-4 w-4 animate-spin"
            />
          ) : (
            <Save
              aria-hidden="true"
              className="h-4 w-4"
            />
          )}

          {mode ===
          "create"
            ? "Fahrstunde planen"
            : "Änderungen speichern"}
        </button>
      </div>
    </form>
  );
}

export default AdminPraxisForm;
