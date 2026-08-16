"use client";

/**
 * Express-Führerschein
 * Delete account dialog.
 */

import {
  DeleteAccountForm,
} from "@/components/profile/account/delete-account-form";

export interface DeleteAccountDialogProps {
  open:
    boolean;

  onClose:
    () => void;
}

export function DeleteAccountDialog({
  open,
  onClose,
}: DeleteAccountDialogProps) {
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
        aria-labelledby="delete-account-title"
        className="w-full max-w-[480px] rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div
          className="flex items-center justify-between"
        >
          <h2
            id="delete-account-title"
            className="text-[17px] font-black text-[#B42323]"
          >
            Konto löschen
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
          <DeleteAccountForm
            onSuccess={
              onClose
            }
          />
        </div>
      </div>
    </div>
  );
}
