"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  Send,
} from "lucide-react";

import type {
  CreatePraxisLessonRequestInput,
} from "@/types/praxis";

export interface LessonRequestFormProps {
  licenseClassCode:
    string | null;
  timezone:
    string;
  disabled?:
    boolean;
  submitting?:
    boolean;
  onSubmit: (
    input:
      CreatePraxisLessonRequestInput,
  ) => Promise<boolean>;
}

function todayForTimeZone(
  timezone: string,
): string {
  try {
    const values =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            timezone,
          year:
            "numeric",
          month:
            "2-digit",
          day:
            "2-digit",
        },
      )
        .formatToParts(
          new Date(),
        )
        .reduce<Record<string, string>>(
          (
            acc,
            part,
          ) => {
            if (
              part.type !==
              "literal"
            ) {
              acc[
                part.type
              ] =
                part.value;
            }

            return acc;
          },
          {},
        );

    return `${values.year ?? ""}-${values.month ?? ""}-${values.day ?? ""}`;
  } catch {
    const now =
      new Date();

    const year =
      now.getFullYear();

    const month =
      String(
        now.getMonth() +
          1,
      ).padStart(
        2,
        "0",
      );

    const day =
      String(
        now.getDate(),
      ).padStart(
        2,
        "0",
      );

    return `${year}-${month}-${day}`;
  }
}

export function LessonRequestForm({
  licenseClassCode,
  timezone,
  disabled = false,
  submitting = false,
  onSubmit,
}: LessonRequestFormProps) {
  const [
    date,
    setDate,
  ] =
    useState(
      "",
    );

  const [
    time,
    setTime,
  ] =
    useState(
      "",
    );

  const [
    location,
    setLocation,
  ] =
    useState(
      "",
    );

  const [
    note,
    setNote,
  ] =
    useState(
      "",
    );

  const minDate =
    useMemo(
      () =>
        todayForTimeZone(
          timezone,
        ),
      [
        timezone,
      ],
    );

  const blocked =
    disabled ||
    submitting ||
    !licenseClassCode;

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      blocked ||
      !date ||
      !time
    ) {
      return;
    }

    const success =
      await onSubmit({
        date,
        time,
        location,
        note,
      });

    if (!success) {
      return;
    }

    setDate(
      "",
    );

    setTime(
      "",
    );

    setLocation(
      "",
    );

    setNote(
      "",
    );
  }

  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Terminwunsch
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Fahrstunde anfragen
        </h2>

        <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
          Sende deinen gewünschten Termin. Die Anfrage wird anschließend geprüft und bestätigt.
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="mt-5 space-y-4"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-[9px] font-extrabold text-[#34445A]">
              <CalendarDays
                className="h-3.5 w-3.5 text-[#0B63F6]"
                aria-hidden="true"
              />
              Gewünschtes Datum
            </span>

            <input
              type="date"
              required
              min={
                minDate
              }
              value={
                date
              }
              disabled={
                blocked
              }
              onChange={(
                event,
              ) =>
                setDate(
                  event.target.value,
                )
              }
              className="min-h-11 w-full rounded-xl border border-[#DCE4EF] bg-white px-3 text-[11px] font-semibold text-[#081529] outline-none transition focus:border-[#0B63F6] focus:ring-2 focus:ring-[#DCEBFF] disabled:cursor-not-allowed disabled:bg-[#F5F7FA] disabled:text-[#94A0B0]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center gap-1.5 text-[9px] font-extrabold text-[#34445A]">
              <Clock3
                className="h-3.5 w-3.5 text-[#0B63F6]"
                aria-hidden="true"
              />
              Gewünschte Uhrzeit
            </span>

            <input
              type="time"
              required
              value={
                time
              }
              disabled={
                blocked
              }
              onChange={(
                event,
              ) =>
                setTime(
                  event.target.value,
                )
              }
              className="min-h-11 w-full rounded-xl border border-[#DCE4EF] bg-white px-3 text-[11px] font-semibold text-[#081529] outline-none transition focus:border-[#0B63F6] focus:ring-2 focus:ring-[#DCEBFF] disabled:cursor-not-allowed disabled:bg-[#F5F7FA] disabled:text-[#94A0B0]"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-1.5 text-[9px] font-extrabold text-[#34445A]">
            <MapPin
              className="h-3.5 w-3.5 text-[#0B63F6]"
              aria-hidden="true"
            />
            Treffpunkt
            <span className="font-medium text-[#8996A7]">
              optional
            </span>
          </span>

          <input
            type="text"
            maxLength={
              255
            }
            value={
              location
            }
            disabled={
              blocked
            }
            onChange={(
              event,
            ) =>
              setLocation(
                event.target.value,
              )
            }
            placeholder="z. B. Fahrschule oder vereinbarter Treffpunkt"
            className="min-h-11 w-full rounded-xl border border-[#DCE4EF] bg-white px-3 text-[11px] font-semibold text-[#081529] outline-none transition placeholder:font-medium placeholder:text-[#9AA6B6] focus:border-[#0B63F6] focus:ring-2 focus:ring-[#DCEBFF] disabled:cursor-not-allowed disabled:bg-[#F5F7FA]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[9px] font-extrabold text-[#34445A]">
            Hinweis
            <span className="ml-1 font-medium text-[#8996A7]">
              optional
            </span>
          </span>

          <textarea
            rows={
              4
            }
            maxLength={
              1500
            }
            value={
              note
            }
            disabled={
              blocked
            }
            onChange={(
              event,
            ) =>
              setNote(
                event.target.value,
              )
            }
            placeholder="Zusätzliche Informationen zu deinem Terminwunsch"
            className="w-full resize-none rounded-xl border border-[#DCE4EF] bg-white px-3 py-3 text-[11px] font-medium leading-5 text-[#081529] outline-none transition placeholder:text-[#9AA6B6] focus:border-[#0B63F6] focus:ring-2 focus:ring-[#DCEBFF] disabled:cursor-not-allowed disabled:bg-[#F5F7FA]"
          />
        </label>

        {!licenseClassCode ? (
          <div className="rounded-xl border border-[#F1D6A6] bg-[#FFF9EE] px-3 py-2.5">
            <p className="text-[9px] font-bold leading-4 text-[#8A6117]">
              Für eine Fahrstunden-Anfrage muss zuerst eine aktive Führerscheinklasse vorhanden sein.
            </p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={
            blocked ||
            !date ||
            !time
          }
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white transition hover:bg-[#0958DC] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#0B63F6] sm:w-auto"
        >
          {submitting ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Send
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}

          {submitting
            ? "Wird gesendet..."
            : "Fahrstunde anfragen"}
        </button>
      </form>
    </section>
  );
}
