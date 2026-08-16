"use client";

import {
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import {
  LessonRequestForm,
} from "@/components/praxis/lesson-request-form";

import {
  LessonRequestList,
} from "@/components/praxis/lesson-request-list";

import {
  PraxisHeader,
} from "@/components/praxis/praxis-header";

import {
  PraxisOverview,
} from "@/components/praxis/praxis-overview";

import type {
  CreatePraxisLessonRequestInput,
  PraxisApiResponse,
  PraxisPageData,
} from "@/types/praxis";

export interface PraxisPageProps {
  initialData:
    PraxisPageData;
}

export function PraxisPage({
  initialData,
}: PraxisPageProps) {
  const [
    data,
    setData,
  ] =
    useState<PraxisPageData>(
      initialData,
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    );

  const [
    successMessage,
    setSuccessMessage,
  ] =
    useState<string | null>(
      null,
    );

  async function submitRequest(
    input:
      CreatePraxisLessonRequestInput,
  ): Promise<boolean> {
    if (
      submitting
    ) {
      return false;
    }

    setSubmitting(
      true,
    );

    setErrorMessage(
      null,
    );

    setSuccessMessage(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/praxis",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                input,
              ),
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () => null,
          ) as
          | PraxisApiResponse<PraxisPageData>
          | null;

      if (
        !response.ok ||
        !payload ||
        !payload.ok
      ) {
        setErrorMessage(
          payload &&
          !payload.ok
            ? payload.error.message
            : "Die Fahrstunden-Anfrage konnte nicht gespeichert werden.",
        );

        return false;
      }

      setData(
        payload.data,
      );

      setSuccessMessage(
        "Deine Fahrstunden-Anfrage wurde erfolgreich gesendet.",
      );

      return true;
    } catch {
      setErrorMessage(
        "Die Fahrstunden-Anfrage konnte gerade nicht gesendet werden.",
      );

      return false;
    } finally {
      setSubmitting(
        false,
      );
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <PraxisHeader
        licenseClassCode={
          data.licenseClassCode
        }
        canRequestLesson={
          data.canRequestLesson
        }
      />

      <div className="mt-4">
        <PraxisOverview
          overview={
            data.overview
          }
          timezone={
            data.timezone
          }
        />
      </div>

      {errorMessage ? (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2.5 rounded-[14px] border border-[#F1CACA] bg-[#FFF7F7] px-4 py-3"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#D64545]"
            aria-hidden="true"
          />

          <p className="text-[9px] font-bold leading-4 text-[#A53030]">
            {errorMessage}
          </p>
        </div>
      ) : null}

      {successMessage ? (
        <div
          role="status"
          className="mt-4 flex items-start gap-2.5 rounded-[14px] border border-[#BFE8D7] bg-[#F2FBF7] px-4 py-3"
        >
          <CheckCircle2
            className="mt-0.5 h-4 w-4 shrink-0 text-[#0C8B59]"
            aria-hidden="true"
          />

          <p className="text-[9px] font-bold leading-4 text-[#087A50]">
            {successMessage}
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <LessonRequestForm
          licenseClassCode={
            data.licenseClassCode
          }
          timezone={
            data.timezone
          }
          disabled={
            !data.canRequestLesson
          }
          submitting={
            submitting
          }
          onSubmit={
            submitRequest
          }
        />

        <LessonRequestList
          appointments={
            data.appointments
          }
          timezone={
            data.timezone
          }
        />
      </div>
    </main>
  );
}
