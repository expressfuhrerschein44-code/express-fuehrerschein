"use client";

import {
  X,
} from "lucide-react";

import {
  AdminPraxisForm,
} from "@/components/admin/praxis/admin-praxis-form";

import type {
  AdminPraxisClientOption,
} from "@/types/admin-praxis";

export interface AdminPraxisCreateDialogProps {
  open:
    boolean;
  clients:
    AdminPraxisClientOption[];
  onClose:
    () => void;
  onCreated:
    () => void;
}

export function AdminPraxisCreateDialog({
  open,
  clients,
  onClose,
  onCreated,
}: AdminPraxisCreateDialogProps) {
  if (
    !open
  ) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-[#061427]/55 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-praxis-create-title"
        className="max-h-[94dvh] w-full overflow-y-auto rounded-t-[24px] border border-[#DDE6F1] bg-white shadow-[0_28px_90px_rgba(2,12,27,0.28)] sm:max-w-3xl sm:rounded-[24px]"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#E7ECF3] bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#0B63F6]">
              Neue Fahrstunde
            </p>

            <h2
              id="admin-praxis-create-title"
              className="mt-1 text-[20px] font-black tracking-[-0.03em] text-[#081529]"
            >
              Praxistermin planen
            </h2>

            <p className="mt-1 text-[10px] font-medium text-[#758398]">
              Der Termin wird direkt im Kundenkonto gespeichert.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Dialog schließen"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#DFE6EF] bg-white text-[#66758A] transition hover:bg-[#F7F9FC]"
          >
            <X
              aria-hidden="true"
              className="h-4 w-4"
            />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          <AdminPraxisForm
            mode="create"
            clients={
              clients
            }
            onSuccess={
              onCreated
            }
          />
        </div>
      </section>
    </div>
  );
}

export default AdminPraxisCreateDialog;
