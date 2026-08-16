"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Clock3,
  FileQuestion,
  Loader2,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";

import type {
  ExamApiResponse,
  ExamConfigurationView,
} from "@/types/exams";

export interface ExamStartCardProps {
  configuration:
    ExamConfigurationView | null;
  activeAttemptId:
    string | null;
  disabled?:
    boolean;
}

interface StartExamResponse {
  attemptId:
    string;
}

export function ExamStartCard({
  configuration,
  activeAttemptId,
  disabled = false,
}: ExamStartCardProps) {
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
    useState<
      string | null
    >(
      null,
    );

  async function start() {
    if (
      busy ||
      disabled
    ) {
      return;
    }

    if (
      activeAttemptId
    ) {
      router.push(
        `/pruefungen/${encodeURIComponent(activeAttemptId)}`,
      );

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
          "/api/theory/exams",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                action:
                  "start",
              }),
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () => null,
          ) as
          | ExamApiResponse<StartExamResponse>
          | null;

      if (
        !response.ok ||
        !payload ||
        !payload.ok
      ) {
        setError(
          payload &&
          !payload.ok
            ? payload.error
                .message
            : "Die Prüfung konnte nicht gestartet werden.",
        );

        return;
      }

      router.push(
        `/pruefungen/${encodeURIComponent(payload.data.attemptId)}`,
      );
    } catch {
      setError(
        "Die Prüfung konnte gerade nicht gestartet werden.",
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
          {activeAttemptId
            ? "Laufende Simulation"
            : "Neue Simulation"}
        </p>

        <h2 className="mt-1 text-[18px] font-black tracking-[-0.02em] text-[#081529]">
          {activeAttemptId
            ? "Prüfung fortsetzen"
            : configuration?.trainingOnly
              ? "Trainingssimulation starten"
              : "Prüfungssimulation starten"}
        </h2>

        <p className="mt-1.5 max-w-[560px] text-[10px] font-medium leading-5 text-[#718096]">
          Während der Simulation werden keine richtigen Antworten eingeblendet. Die vollständige Auswertung erscheint erst nach der Abgabe.
        </p>
      </div>

      {configuration ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-[14px] border border-[#E8EDF4] bg-[#FAFBFD] p-3.5">
            <FileQuestion
              className="h-4 w-4 text-[#0B63F6]"
              aria-hidden="true"
            />
            <p className="mt-2 text-[8px] font-bold text-[#8290A2]">
              Fragen
            </p>
            <p className="mt-0.5 text-[13px] font-black text-[#081529]">
              {configuration.questionCount}
            </p>
          </div>

          <div className="rounded-[14px] border border-[#E8EDF4] bg-[#FAFBFD] p-3.5">
            <Clock3
              className="h-4 w-4 text-[#0B63F6]"
              aria-hidden="true"
            />
            <p className="mt-2 text-[8px] font-bold text-[#8290A2]">
              Zeit
            </p>
            <p className="mt-0.5 text-[13px] font-black text-[#081529]">
              {configuration.durationMinutes} Min
            </p>
          </div>

          <div className="col-span-2 rounded-[14px] border border-[#E8EDF4] bg-[#FAFBFD] p-3.5 sm:col-span-1">
            <ShieldCheck
              className="h-4 w-4 text-[#0B63F6]"
              aria-hidden="true"
            />
            <p className="mt-2 text-[8px] font-bold text-[#8290A2]">
              Auswertung
            </p>
            <p className="mt-0.5 text-[10px] font-black text-[#081529]">
              Serverseitig
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-[#F1CACA] bg-[#FFF7F7] px-3.5 py-3 text-[9px] font-bold leading-4 text-[#A53030]"
        >
          {error}
        </div>
      ) : null}

      <button
        type="button"
        disabled={
          disabled ||
          busy ||
          !configuration
        }
        onClick={() =>
          void start()
        }
        className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white transition hover:bg-[#0958DC] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {busy ? (
          <Loader2
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <PlayCircle
            className="h-4 w-4"
            aria-hidden="true"
          />
        )}

        {busy
          ? "Wird vorbereitet..."
          : activeAttemptId
            ? "Prüfung fortsetzen"
            : "Simulation starten"}
      </button>
    </section>
  );
}
