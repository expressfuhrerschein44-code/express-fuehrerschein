"use client";

import {
  Bell,
  Menu,
  ShieldCheck,
} from "lucide-react";

import {
  usePathname,
} from "next/navigation";

import {
  findAdminNavigationLabel,
} from "@/components/admin/admin-navigation";

import type {
  AdminIdentity,
} from "@/types/admin";

export interface AdminHeaderProps {
  admin:
    AdminIdentity;
  onOpenMobile:
    () => void;
}

export function AdminHeader({
  admin,
  onOpenMobile,
}: AdminHeaderProps) {
  const pathname =
    usePathname();

  const title =
    findAdminNavigationLabel(
      pathname,
    );

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5EAF2] bg-white/95 backdrop-blur">
      <div className="flex min-h-[66px] items-center justify-between gap-4 px-4 sm:px-5 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={
              onOpenMobile
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E0E6EE] bg-white text-[#33445A] lg:hidden"
            aria-label="Admin-Menü öffnen"
          >
            <Menu
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-black tracking-[-0.02em] text-[#081529]">
              {title}
            </p>

            <p className="mt-0.5 hidden text-[8px] font-semibold text-[#7B899B] sm:block">
              Express-Führerschein Administration
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#E0E6EE] bg-white text-[#66758A]"
            aria-label="Admin-Benachrichtigungen"
          >
            <Bell
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>

          <div className="hidden items-center gap-2.5 rounded-[11px] border border-[#E5EAF2] bg-[#F8FAFD] px-3 py-2 sm:flex">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAF2FF] text-[#0B63F6]">
              <ShieldCheck
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            </span>

            <div className="max-w-[150px]">
              <p className="truncate text-[8px] font-extrabold text-[#25364B]">
                {admin.firstName}{" "}
                {admin.lastName}
              </p>

              <p className="mt-0.5 text-[7px] font-semibold text-[#8390A0]">
                {admin.role ===
                "super_admin"
                  ? "Super Admin"
                  : "Administrator"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
