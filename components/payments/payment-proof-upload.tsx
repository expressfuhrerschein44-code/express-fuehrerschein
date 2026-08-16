"use client";

import {
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  CheckCircle2,
  FileUp,
  Loader2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import type {
  PaymentProofSubmissionResult,
} from "@/types/payments";

export interface PaymentProofUploadProps {
  paymentId:
    string;
  enabled:
    boolean;
}

interface ApiSuccess {
  ok:
    true;
  data:
    PaymentProofSubmissionResult;
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

const MAX_FILE_BYTES =
  10 *
  1024 *
  1024;

const ALLOWED_TYPES =
  new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
  ]);

export function PaymentProofUpload({
  paymentId,
  enabled,
}: PaymentProofUploadProps) {
  const router =
    useRouter();

  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    file,
    setFile,
  ] =
    useState<File | null>(
      null,
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

  function selectFile(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const selected =
      event.target.files?.[0] ??
      null;

    setError(
      null,
    );

    setSuccess(
      false,
    );

    if (!selected) {
      setFile(
        null,
      );
      return;
    }

    if (
      !ALLOWED_TYPES.has(
        selected.type,
      )
    ) {
      setFile(
        null,
      );

      setError(
        "Erlaubt sind PDF-, JPG- und PNG-Dateien.",
      );

      event.target.value =
        "";

      return;
    }

    if (
      selected.size >
      MAX_FILE_BYTES
    ) {
      setFile(
        null,
      );

      setError(
        "Die Datei darf maximal 10 MB groß sein.",
      );

      event.target.value =
        "";

      return;
    }

    setFile(
      selected,
    );
  }

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !enabled ||
      !file ||
      busy
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
      const formData =
        new FormData();

      formData.set(
        "proof",
        file,
      );

      const response =
        await fetch(
          `/api/payments/${encodeURIComponent(paymentId)}`,
          {
            method:
              "POST",
            body:
              formData,
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
            : "Der Zahlungsnachweis konnte nicht eingereicht werden.",
        );
      }

      setSuccess(
        true,
      );

      setFile(
        null,
      );

      if (
        inputRef.current
      ) {
        inputRef.current.value =
          "";
      }

      router.refresh();
    } catch (
      exception
    ) {
      setError(
        exception instanceof
        Error
          ? exception.message
          : "Der Zahlungsnachweis konnte nicht eingereicht werden.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  if (!enabled) {
    return null;
  }

  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.04)] lg:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
          <FileUp
            className="h-4.5 w-4.5"
            aria-hidden="true"
          />
        </span>

        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
            Zahlungsnachweis
          </p>

          <h2 className="mt-1 text-[16px] font-black text-[#081529]">
            Überweisungsbeleg hochladen
          </h2>

          <p className="mt-1 text-[9px] font-medium text-[#718096]">
            PDF, JPG oder PNG · maximal 10 MB
          </p>
        </div>
      </div>

      <form
        onSubmit={
          submit
        }
        className="mt-5"
      >
        <label className="block cursor-pointer rounded-[15px] border border-dashed border-[#C7D4E5] bg-[#F8FAFD] px-4 py-6 text-center transition hover:border-[#AFC3DF]">
          <input
            ref={
              inputRef
            }
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            disabled={
              busy
            }
            onChange={
              selectFile
            }
            className="sr-only"
          />

          <FileUp
            className="mx-auto h-5 w-5 text-[#0B63F6]"
            aria-hidden="true"
          />

          <p className="mt-2 text-[9px] font-extrabold text-[#34445A]">
            {file
              ? file.name
              : "Datei auswählen"}
          </p>

          <p className="mt-1 text-[8px] font-medium text-[#8491A3]">
            Klicke hier, um deinen Zahlungsnachweis auszuwählen.
          </p>
        </label>

        {error ? (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-[#F1CACA] bg-[#FFF7F7] px-3 py-2.5 text-[8px] font-bold leading-4 text-[#A53030]"
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div
            role="status"
            className="mt-3 flex items-center gap-2 rounded-xl border border-[#BFE8D7] bg-[#F7FCF9] px-3 py-2.5 text-[8px] font-bold text-[#0C8B59]"
          >
            <CheckCircle2
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />
            Zahlungsnachweis erfolgreich eingereicht.
          </div>
        ) : null}

        <button
          type="submit"
          disabled={
            busy ||
            !file
          }
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-5 text-[10px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
        >
          {busy ? (
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <FileUp
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}

          {busy
            ? "Wird eingereicht..."
            : "Zahlung einreichen"}
        </button>
      </form>
    </section>
  );
}
