import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  AdminShell,
} from "@/components/admin/admin-shell";

import {
  requireAdminSession,
} from "@/lib/server/admin/admin-auth";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const metadata:
  Metadata =
  {
    title: {
      default:
        "Administration | Express-Führerschein",
      template:
        "%s | Express-Führerschein Admin",
    },

    robots: {
      index:
        false,
      follow:
        false,
    },
  };

export default async function AdminLayout({
  children,
}: Readonly<{
  children:
    ReactNode;
}>) {
  const session =
    await requireAdminSession();

  return (
    <AdminShell
      admin={
        session.admin
      }
    >
      {children}
    </AdminShell>
  );
}
