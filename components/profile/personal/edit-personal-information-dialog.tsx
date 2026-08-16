"use client";

/**
 * Express-Führerschein
 * Personal information dialog.
 */

import {
  EditPersonalInformationForm,
} from "@/components/profile/personal/edit-personal-information-form";

import type {
  ProfileData,
} from "@/types/profile";

export interface EditPersonalInformationDialogProps {
  open:
    boolean;

  data:
    ProfileData;

  onClose:
    () => void;
}

export function EditPersonalInformationDialog({
  open,
  data,
  onClose,
}: EditPersonalInformationDialogProps) {
  if (
    !open
  ) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08111F]/55 p-4"
      role="presentation"
      onMouseDown={
        (
          event,
        ) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onClose();
          }
        }
      }
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div
          className="flex items-center justify-between gap-4"
        >
          <div>
            <h2
              id="edit-profile-title"
              className="text-[17px] font-black text-[#111C2B]"
            >
              Persönliche Informationen bearbeiten
            </h2>

            <p
              className="mt-1 text-[10px] text-[#738195]"
            >
              Aktualisiere deine persönlichen Angaben.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#64758A] outline-none transition hover:bg-[#F3F6F9] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <div
          className="mt-6"
        >
          <EditPersonalInformationForm
            data={
              data
            }
            onSuccess={
              onClose
            }
          />
        </div>
      </div>
    </div>
  );
}
