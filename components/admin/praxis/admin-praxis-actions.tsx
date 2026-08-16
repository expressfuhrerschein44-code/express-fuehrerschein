"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  AlertCircle,
  Ban,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import type {
  AdminPraxisApiResponse,
  AdminPraxisAppointmentDetailView,
} from "@/types/admin-praxis";

export interface AdminPraxisActionsProps {
  appointment:
    AdminPraxisAppointmentDetailView;
}

export function AdminPraxisActions({
  appointment,
}: AdminPraxisActionsProps) {
  const router =
    useRouter();

  const [
    busyAction,
    setBusyAction,
  ] =
    useState<
      "confirm" | "cancel" | null
    >(
      null,
    );

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
    refreshing,
    startRefresh,
  ] =
    useTransition();

  async function mutate(
    action:
      "confirm" | "cancel",
  ) {
    if (
      busyAction ||
      refreshing
    ) {
      return;
    }

    let reason:
      string | null =
        null;

    if (
      action ===
      "cancel"
    ) {
      const confirmed =
        window.confirm(
          "Möchtest du diese Fahrstunde wirklich absagen?",
        );

      if (
        !confirmed
      ) {
        return;
      }

      reason =
        window
          .prompt(
            "Optionaler Grund für die Absage:",
            "",
          )
          ?.trim() ||
        null;
    }

    setBusyAction(
      action,
    );

    setErrorMessage(
      null,
    );

    try {
      const response =
        await fetch(
          `/api/admin/praxis/${encodeURIComponent(
            appointment.id,
          )}`,
          {
            method:
              "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                action ===
                  "cancel"
                  ? {
                      action,
                      reason,
                    }
                  : {
                      action,
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
        throw new Error(
          payload &&
          !payload.ok
            ? payload.message
            : "Die Aktion konnte nicht ausgeführt werden.",
        );
      }

      startRefresh(
        () => {
          router.refresh();
        },
      );
    } catch (
      error
    ) {
      setErrorMessage(
        error instanceof
          Error
          ? error.message
          : "Die Aktion konnte nicht ausgeführt werden.",
      );
    } finally {
      setBusyAction(
        null,
      );
    }
  }

  const busy =
    Boolean(
      busyAction ||
        refreshing,
    );

  return (
    <section className="rounded-[18px] border border-[#E3E9F2] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.03)]">
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#7A899C]">
        Verwaltung
      </p>

      <h2 className="mt-1 text-[15px] font-black text-[#0A172A]">
        Termin steuern
      </h2>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-[12px] border border-red-200 bg-red-50 p-3 text-[10px] font-semibold leading-5 text-red-700"
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

      <div className="mt-5 grid gap-2">
        {appointment
          .capabilities
          .canConfirm ? (
          <button
            type="button"
            disabled={
              busy
            }
            onClick={() =>
              void mutate(
                "confirm",
              )
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-emerald-600 px-4 text-[10px] font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction ===
            "confirm" ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
              />
            ) : (
              <CheckCircle2
                aria-hidden="true"
                className="h-4 w-4"
              />
            )}
            Fahrstunde bestätigen
          </button>
        ) : null}

        {appointment
          .capabilities
          .canCancel ? (
          <button
            type="button"
            disabled={
              busy
            }
            onClick={() =>
              void mutate(
                "cancel",
              )
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-red-200 bg-red-50 px-4 text-[10px] font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busyAction ===
            "cancel" ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
              />
            ) : (
              <Ban
                aria-hidden="true"
                className="h-4 w-4"
              />
            )}
            Termin absagen
          </button>
        ) : null}

        {!appointment
          .capabilities
          .canConfirm &&
        !appointment
          .capabilities
          .canCancel ? (
          <p className="rounded-[12px] bg-[#F7F9FC] px-3 py-3 text-center text-[10px] font-semibold text-[#718096]">
            Für diesen Termin sind keine weiteren Statusaktionen verfügbar.
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default AdminPraxisActions;
