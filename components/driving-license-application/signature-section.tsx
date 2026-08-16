"use client";

/**
 * Express-Führerschein
 * Allows exactly one active signature method:
 * draw manually OR upload a file.
 */

import {
  CheckCircle2,
  Trash2,
} from "lucide-react";

import {
  SignatureCanvas,
} from "@/components/driving-license-application/signature-canvas";

import {
  SignatureUpload,
} from "@/components/driving-license-application/signature-upload";

import type {
  DrivingLicenseApplicationSignatureType,
} from "@/types/driving-license-application";

export interface SignatureSectionProps {
  signatureType:
    DrivingLicenseApplicationSignatureType | null;

  signaturePath:
    string | null;

  busy:
    boolean;

  onUpload:
    (
      signatureType:
        DrivingLicenseApplicationSignatureType,

      file:
        File | Blob,

      filename?:
        string,
    ) =>
      Promise<boolean>;

  onDelete:
    () =>
      Promise<boolean>;
}

export function SignatureSection({
  signatureType,

  signaturePath,

  busy,

  onUpload,

  onDelete,
}: SignatureSectionProps) {
  if (
    signatureType &&
    signaturePath
  ) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#C9E9D7] bg-[#F7FCF9] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E7F7EE] text-[#159257]">
            <CheckCircle2 className="h-5 w-5" />
          </span>

          <div>
            <div className="text-[11px] font-extrabold text-[#173426]">
              Unterschrift gespeichert
            </div>

            <div className="mt-0.5 text-[9px] text-[#648071]">
              {signatureType ===
              "drawn"
                ? "Manuell gezeichnet"
                : "Datei hochgeladen"}
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={
            busy
          }
          onClick={
            () =>
              void onDelete()
          }
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[9px] font-extrabold text-[#C64242] transition hover:bg-[#FFF0F0] disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Löschen
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[0.72fr_1.28fr]">
      <SignatureUpload
        busy={
          busy
        }
        onUpload={
          (
            file,
          ) =>
            onUpload(
              "uploaded",
              file,
              file.name,
            )
        }
      />

      <SignatureCanvas
        busy={
          busy
        }
        onSave={
          (
            blob,
          ) =>
            onUpload(
              "drawn",
              blob,
              "signature.png",
            )
        }
      />
    </div>
  );
}
