import "server-only";

import {
  redirect,
} from "next/navigation";

import {
  getCurrentAdminSession,
} from "@/lib/server/admin/admin-session";

import type {
  AdminSessionView,
} from "@/types/admin";

export async function requireAdminSession():
  Promise<AdminSessionView> {
  const session =
    await getCurrentAdminSession();

  if (!session) {
    redirect(
      "/admin/login",
    );
  }

  return session;
}

export async function redirectAuthenticatedAdmin():
  Promise<void> {
  const session =
    await getCurrentAdminSession();

  if (session) {
    redirect(
      "/admin",
    );
  }
}
