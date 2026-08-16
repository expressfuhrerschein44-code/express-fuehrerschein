"use client";

import {
  X,
} from "lucide-react";

import {
  AdminSidebar,
} from "@/components/admin/admin-sidebar";

import type {
  AdminIdentity,
} from "@/types/admin";

export interface AdminMobileNavProps {
  admin:
    AdminIdentity;
  open:
    boolean;
  onClose:
    () => void;
}

export function AdminMobileNav({
  admin,
  open,
  onClose,
}: AdminMobileNavProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] lg:hidden">
      <button
        type="button"
        onClick={
          onClose
        }
        className="absolute inset-0 bg-[#020914]/65 backdrop-blur-[2px]"
        aria-label="Admin-Menü schließen"
      />

      <div className="absolute inset-y-0 left-0 w-[286px] max-w-[86vw] shadow-2xl">
        <button
          type="button"
          onClick={
            onClose
          }
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white"
          aria-label="Admin-Menü schließen"
        >
          <X
            className="h-4 w-4"
            aria-hidden="true"
          />
        </button>

        <AdminSidebar
          admin={
            admin
          }
          mobile
          onNavigate={
            onClose
          }
        />
      </div>
    </div>
  );
}
