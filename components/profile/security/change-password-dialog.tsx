"use client";

/**
 * Express-Führerschein
 * Change password dialog.
 */

import {
  ChangePasswordForm,
} from "@/components/profile/security/change-password-form";

export interface ChangePasswordDialogProps {
  open:
    boolean;

  onClose:
    () => void;
}

export function ChangePasswordDialog({
  open,
  onClose,
}: ChangePasswordDialogProps) {
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
        aria-labelledby="change-password-title"
        className="w-full max-w-[460px] rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
      >
        <div
          className="flex items-center justify-between"
        >
          <h2
            id="change-password-title"
            className="text-[17px] font-black text-[#111C2B]"
          >
            Passwort ändern
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
          <ChangePasswordForm
            onSuccess={
              onClose
            }
          />
        </div>
      </div>
    </div>
  );
}
