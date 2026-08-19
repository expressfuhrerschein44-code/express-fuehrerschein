"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Loader2,
  Play,
} from "lucide-react";

import type {
  ExamApiResponse,
} from "@/types/exams";

interface StartExamResponse {
  attemptId:
    string;
}

export function StartExamButton() {
  const router =
    useRouter();

  const [
    starting,
    setStarting,
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

  async function startExam() {
    if (starting) {
      return;
    }

    setStarting(
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
        throw new Error(
          payload &&
          !payload.ok
            ? payload.error
                .message
            : "Die Prüfungssimulation konnte nicht gestartet werden.",
        );
      }

      const attemptId =
        payload.data
          .attemptId
          .trim();

      if (!attemptId) {
        throw new Error(
          "Die Prüfungssimulation konnte nicht geöffnet werden.",
        );
      }

      router.push(
        `/theorie/pruefungssimulation/${encodeURIComponent(
          attemptId,
        )}`,
      );
    } catch (
      exception
    ) {
      setError(
        exception instanceof
        Error
          ? exception.message
          : "Die Prüfungssimulation konnte nicht gestartet werden.",
      );

      setStarting(
        false,
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={
          starting
        }
        onClick={() =>
          void startExam()
        }
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0B63F6] px-4 text-[10px] font-extrabold text-white transition hover:bg-[#0958DC] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {starting ? (
          <Loader2
            className="h-3.5 w-3.5 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Play
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        )}

        {starting
          ? "Simulation wird gestartet..."
          : "Prüfung starten"}
      </button>

      {error ? (
        <p
          role="alert"
          className="text-center text-[8px] font-bold leading-4 text-[#C43737]"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
