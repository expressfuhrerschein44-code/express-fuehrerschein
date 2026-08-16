"use client";

/**
 * Express-Führerschein
 * Change e-mail dialog.
 */

import {
  ChangeEmailForm,
} from "@/components/profile/account/change-email-form";

export interface ChangeEmailDialogProps {
  open:
    boolean;

  currentEmail:
    string;

  onClose:
    () => void;
}

export function ChangeEmailDialog({
  open,
  currentEmail,
  onClose,
}: ChangeEmailDialogProps) {
  if (
    !open
  ) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08111F]/55 p-4"
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
        aria-labelledby="change-email-title"
        className="w-full max-w-[480px] rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div
          className="flex items-center justify-between"
        >
          <h2
            id="change-email-title"
            className="text-[17px] font-black text-[#111C2B]"
          >
            E-Mail-Adresse ändern
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            className="h-9 w-9 rounded-lg text-[#64758A] hover:bg-[#F3F6F9]"
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        <div
          className="mt-5"
        >
          <ChangeEmailForm
            currentEmail={
              currentEmail
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
