"use client";

import {
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  AdminHeader,
} from "@/components/admin/admin-header";

import {
  AdminMobileNav,
} from "@/components/admin/admin-mobile-nav";

import {
  AdminSidebar,
} from "@/components/admin/admin-sidebar";

import type {
  AdminIdentity,
} from "@/types/admin";

export interface AdminShellProps {
  admin:
    AdminIdentity;
  children:
    ReactNode;
}

export function AdminShell({
  admin,
  children,
}: AdminShellProps) {
  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(
      false,
    );

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <AdminSidebar
        admin={
          admin
        }
      />

      <AdminMobileNav
        admin={
          admin
        }
        open={
          mobileOpen
        }
        onClose={() =>
          setMobileOpen(
            false,
          )
        }
      />

      <div className="min-h-screen lg:pl-[260px]">
        <AdminHeader
          admin={
            admin
          }
          onOpenMobile={() =>
            setMobileOpen(
              true,
            )
          }
        />

        <div id="admin-main-content">
          {children}
        </div>
      </div>
    </div>
  );
}
