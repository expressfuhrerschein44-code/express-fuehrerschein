"use client";

import {
  useState,
} from "react";

import {
  Check,
  Loader2,
  Plus,
  Save,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  AdminPaymentBankDetailsForm,
} from "@/components/admin/payments/admin-payment-bank-details-form";

import type {
  AdminPaymentApiResponse,
  AdminPaymentCreationApplication,
  AdminPaymentDetail,
} from "@/types/admin-payments";


interface CreateModeProps {
  mode?: "create";

  applications:
    AdminPaymentCreationApplication[];

  payment?: never;
}


interface EditModeProps {
  mode: "edit";

  applications?: never;

  payment:
    AdminPaymentDetail;
}


type AdminPaymentCreateFormProps =
  | CreateModeProps
  | EditModeProps;


function eurosToCents(
  value:
    FormDataEntryValue
    | null,
): number {
  const raw =
    String(
      value ??
        "",
    )
      .trim()
      .replace(
        /\s/g,
        "",
      )
      .replace(
        ",",
        ".",
      );

  const amount =
    Number(
      raw,
    );

  if (
    !Number.isFinite(
      amount,
    )
  ) {
    return 0;
  }

  return Math.round(
    amount *
      100,
  );
}


function toApiPayload(
  formData:
    FormData,

  applicationId:
    string
    | null,
) {
  return {
    ...(applicationId
      ? {
          applicationId,
        }
      : {}),

    paymentStage:
      String(
        formData.get(
          "paymentStage",
        ) ??
          "",
      ),

    amountCents:
      eurosToCents(
        formData.get(
          "amount",
        ),
      ),

    stageOrder:
      Number(
        formData.get(
          "stageOrder",
        ) ??
          0,
      ),

    paymentReference:
      String(
        formData.get(
          "paymentReference",
        ) ??
          "",
      ).trim() ||
      String(
        formData.get(
          "bankReference",
        ) ??
          "",
      ).trim() ||
      null,

    description:
      String(
        formData.get(
          "description",
        ) ??
          "",
      ).trim() ||
      null,

    dueAt:
      String(
        formData.get(
          "dueAt",
        ) ??
          "",
      ).trim() ||
      null,

    bankDetails: {
      accountHolder:
        String(
          formData.get(
            "accountHolder",
          ) ??
            "",
        ),

      bankName:
        String(
          formData.get(
            "bankName",
          ) ??
            "",
        ),

      iban:
        String(
          formData.get(
            "iban",
          ) ??
            "",
        ),

      bic:
        String(
          formData.get(
            "bic",
          ) ??
            "",
        ),

      country:
        String(
          formData.get(
            "bankCountry",
          ) ??
            "",
        ),

      reference:
        String(
          formData.get(
            "bankReference",
          ) ??
            "",
        ).trim() ||
        String(
          formData.get(
            "paymentReference",
          ) ??
            "",
        ).trim() ||
        null,

      instructions:
        String(
          formData.get(
            "bankInstructions",
          ) ??
            "",
        ),
    },
  };
}


function formatDefaultDate(
  value:
    string
    | null,
): string {
  if (
    !value
  ) {
    return "";
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const local =
    new Date(
      date.getTime() -
        date.getTimezoneOffset() *
          60_000,
    );

  return local
    .toISOString()
    .slice(
      0,
      16,
    );
}


export function AdminPaymentCreateForm(
  props:
    AdminPaymentCreateFormProps,
) {
  const router =
    useRouter();

  const editing =
    props.mode ===
    "edit";

  const payment =
    props.mode ===
    "edit"
      ? props.payment
      : undefined;

  const applications:
    AdminPaymentCreationApplication[] =
    props.mode ===
    "edit"
      ? []
      : props.applications;

  const [
    selectedApplicationId,
    setSelectedApplicationId,
  ] =
    useState(
      () =>
        applications[0]
          ?.id ??
        "",
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    message,
    setMessage,
  ] =
    useState<
      string
      | null
    >(
      null,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string
      | null
    >(
      null,
    );

  /**
   * No useMemo is needed here.
   *
   * The list is small and a direct find keeps the component simpler while
   * avoiding an unstable-array dependency in edit mode.
   */
  const selectedApplication =
    applications.find(
      (
        application,
      ) =>
        application.id ===
        selectedApplicationId,
    ) ??
    null;

  const defaultStageOrder =
    payment?.stageOrder ??
    selectedApplication
      ?.nextStageOrder ??
    1;


  async function submitForm(
    form:
      HTMLFormElement,

    activate:
      boolean,
  ) {
    setSubmitting(
      true,
    );

    setError(
      null,
    );

    setMessage(
      null,
    );

    try {
      const formData =
        new FormData(
          form,
        );

      const payload =
        toApiPayload(
          formData,
          editing
            ? null
            : selectedApplicationId,
        );

      const response =
        await fetch(
          payment
            ? `/api/admin/payments/${payment.id}`
            : "/api/admin/payments",
          {
            method:
              payment
                ? "PATCH"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payment
                  ? {
                      action:
                        "update",

                      data:
                        payload,
                    }
                  : {
                      ...payload,

                      activate,
                    },
              ),
          },
        );

      const result =
        (await response
          .json()
          .catch(
            () =>
              null,
          )) as
          | AdminPaymentApiResponse<AdminPaymentDetail>
          | null;

      if (
        !response.ok ||
        !result?.ok
      ) {
        throw new Error(
          result &&
          !result.ok
            ? result.message
            : "Impossible d’enregistrer le paiement.",
        );
      }

      setMessage(
        result.message,
      );

      router.refresh();

      if (
        !payment
      ) {
        form.reset();
      }
    } catch (
      cause
    ) {
      setError(
        cause instanceof
          Error
          ? cause.message
          : "Impossible d’enregistrer le paiement.",
      );
    } finally {
      setSubmitting(
        false,
      );
    }
  }


  if (
    !editing &&
    applications.length ===
      0
  ) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-500">
        Aucun dossier soumis
        n’est disponible pour
        créer une nouvelle
        étape de paiement.
      </div>
    );
  }


  return (
    <form
      onSubmit={(
        event,
      ) => {
        event.preventDefault();

        void submitForm(
          event.currentTarget,
          false,
        );
      }}
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#0B63F6]">
            {editing
              ? "Brouillon"
              : "Nouvelle étape"}
          </p>

          <h2 className="mt-1 text-lg font-black text-slate-950">
            {editing
              ? "Modifier l’étape de paiement"
              : "Créer une étape de paiement"}
          </h2>
        </div>

        {!editing ? (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0B63F6]">
            <Plus
              className="h-4 w-4"
              aria-hidden="true"
            />
          </span>
        ) : null}
      </div>


      {!editing ? (
        <label className="block text-xs font-bold text-slate-600">
          Dossier client

          <select
            value={
              selectedApplicationId
            }
            onChange={(
              event,
            ) => {
              setSelectedApplicationId(
                event.target
                  .value,
              );
            }}
            className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            {applications.map(
              (
                application,
              ) => (
                <option
                  key={
                    application.id
                  }
                  value={
                    application.id
                  }
                >
                  {
                    application
                      .client
                      .fullName
                  }
                  {" — "}
                  {application
                    .reference ??
                    application.id.slice(
                      0,
                      8,
                    )}
                  {" — "}
                  {application.selectedClasses.join(
                    ", ",
                  )}
                </option>
              ),
            )}
          </select>
        </label>
      ) : null}


      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-bold text-slate-600 xl:col-span-2">
          Étape

          <input
            name="paymentStage"
            required
            maxLength={
              64
            }
            defaultValue={
              payment
                ?.stage ??
              ""
            }
            placeholder="Bearbeitungsgebühr / Erste Rate / Restbetrag"
            className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>


        <label className="text-xs font-bold text-slate-600">
          Montant (€)

          <input
            name="amount"
            required
            inputMode="decimal"
            defaultValue={
              payment
                ? (
                    payment.amountCents /
                    100
                  ).toFixed(
                    2,
                  )
                : ""
            }
            placeholder="249,00"
            className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>


        <label className="text-xs font-bold text-slate-600">
          Ordre

          <input
            name="stageOrder"
            type="number"
            min={
              0
            }
            max={
              10000
            }
            key={
              defaultStageOrder
            }
            defaultValue={
              defaultStageOrder
            }
            className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>


        <label className="text-xs font-bold text-slate-600 xl:col-span-2">
          Référence

          <input
            name="paymentReference"
            maxLength={
              128
            }
            defaultValue={
              payment
                ?.reference ??
              ""
            }
            placeholder="Automatique si vide"
            className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>


        <label className="text-xs font-bold text-slate-600 xl:col-span-2">
          Échéance

          <input
            name="dueAt"
            type="datetime-local"
            defaultValue={formatDefaultDate(
              payment
                ?.dueAt ??
                null,
            )}
            className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>


      <label className="block text-xs font-bold text-slate-600">
        Description interne
        / client

        <input
          name="description"
          maxLength={
            255
          }
          defaultValue={
            payment
              ?.description ??
            ""
          }
          className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </label>


      <AdminPaymentBankDetailsForm
        initialValue={
          payment
            ?.bankDetails
        }
      />


      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}


      {message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          {message}
        </p>
      ) : null}


      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="submit"
          disabled={
            submitting
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {submitting ? (
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

          {editing
            ? "Enregistrer"
            : "Enregistrer en brouillon"}
        </button>


        {!editing ? (
          <button
            type="button"
            disabled={
              submitting
            }
            onClick={(
              event,
            ) => {
              const form =
                event
                  .currentTarget
                  .form;

              if (
                !form
              ) {
                return;
              }

              void submitForm(
                form,
                true,
              );
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-4 text-sm font-extrabold text-white transition hover:bg-[#0957D7] disabled:opacity-60"
          >
            <Check
              className="h-4 w-4"
              aria-hidden="true"
            />

            Créer et activer
          </button>
        ) : null}
      </div>
    </form>
  );
}