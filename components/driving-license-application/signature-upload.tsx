"use client";

/**
 * Express-Führerschein
 * Uploaded signature option.
 */

import {
  useRef,
} from "react";

import {
  FileUp,
  Loader2,
} from "lucide-react";

export interface SignatureUploadProps {
  busy:
    boolean;

  onUpload:
    (
      file:
        File,
    ) =>
      Promise<boolean>;
}

export function SignatureUpload({
  busy,

  onUpload,
}: SignatureUploadProps) {
  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
      <input
        ref={
          inputRef
        }
        type="file"
        accept="image/jpeg,image/png,application/pdf"
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
              file,
            );

            event.target.value =
              "";
          }
        }
      />

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
        className="flex w-full items-center gap-3 text-left disabled:opacity-50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F2F6FB] text-[#30465F]">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileUp className="h-4 w-4" />
          )}
        </span>

        <span className="min-w-0">
          <span className="block text-[11px] font-extrabold text-[#15243A]">
            Unterschrift hochladen
          </span>

          <span className="mt-0.5 block text-[9px] text-[#718096]">
            JPG, PNG oder PDF · Max. 5 MB
          </span>
        </span>
      </button>
    </div>
  );
}
