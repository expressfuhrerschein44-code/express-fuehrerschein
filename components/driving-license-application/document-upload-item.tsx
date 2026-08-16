"use client";

/**
 * Express-Führerschein
 * Single required document uploader.
 */

import {
  useRef,
} from "react";

import {
  CheckCircle2,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

import {
  cn,
} from "@/lib/utils";

import type {
  DrivingLicenseApplicationDocument,
  DrivingLicenseApplicationDocumentType,
} from "@/types/driving-license-application";

export interface DocumentUploadItemProps {
  documentType:
    DrivingLicenseApplicationDocumentType;

  label:
    string;

  description:
    string;

  accept:
    string;

  document:
    DrivingLicenseApplicationDocument | null;

  busy:
    boolean;

  onUpload:
    (
      documentType:
        DrivingLicenseApplicationDocumentType,

      file:
        File,
    ) =>
      Promise<boolean>;

  onDelete:
    (
      documentType:
        DrivingLicenseApplicationDocumentType,
    ) =>
      Promise<boolean>;
}

export function DocumentUploadItem({
  documentType,

  label,

  description,

  accept,

  document,

  busy,

  onUpload,

  onDelete,
}: DocumentUploadItemProps) {
  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 transition",

        document
          ? "border-[#CBE9D9] bg-[#FBFEFC]"
          : "border-[#E4EAF1] bg-white",
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",

          document
            ? "bg-[#ECF9F2] text-[#14945A]"
            : "bg-[#F3F6FA] text-[#43536A]",
        )}
      >
        {document ? (
          <CheckCircle2 className="h-4.5 w-4.5" />
        ) : (
          <FileText className="h-4.5 w-4.5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[11px] font-extrabold text-[#16253B]">
          {
            label
          }
        </div>

        <div className="mt-0.5 truncate text-[9px] text-[#718096]">
          {document
            ? document
                .originalFilename
            : description}
        </div>
      </div>

      <input
        ref={
          inputRef
        }
        type="file"
        accept={
          accept
        }
        className="hidden"
        onChange={
          async (
            event,
          ) => {
            const file =
              event
                .target
                .files?.[0];

            if (
              !file
            ) {
              return;
            }

            await onUpload(
              documentType,
              file,
            );

            event.target.value =
              "";
          }
        }
      />

      {document ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={
              busy
            }
            onClick={
              () =>
                inputRef
                  .current
                  ?.click()
            }
            className="rounded-lg px-2 py-1.5 text-[9px] font-extrabold text-[#0B63F6] transition hover:bg-[#EEF5FF] disabled:opacity-50"
          >
            Ersetzen
          </button>

          <button
            type="button"
            disabled={
              busy
            }
            aria-label={`${label} löschen`}
            onClick={
              () =>
                void onDelete(
                  documentType,
                )
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7D8997] transition hover:bg-[#FFF0F0] hover:text-[#D64545] disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={
            busy
          }
          onClick={
            () =>
              inputRef
                .current
                ?.click()
          }
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#DCE5F0] bg-white px-3 py-1.5 text-[9px] font-extrabold text-[#0B63F6] transition hover:border-[#AFC9F0] hover:bg-[#F8FBFF] disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}

          Hochladen
        </button>
      )}
    </div>
  );
}
