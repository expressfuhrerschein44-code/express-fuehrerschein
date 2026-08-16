import type {
  Metadata,
} from "next";

import {
  ShieldCheck,
} from "lucide-react";

import {
  AdminLoginForm,
} from "@/components/admin/auth/admin-login-form";

import {
  redirectAuthenticatedAdmin,
} from "@/lib/server/admin/admin-auth";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

export const metadata:
  Metadata =
  {
    title:
      "Admin-Anmeldung",

    robots: {
      index:
        false,
      follow:
        false,
    },
  };

export default async function AdminLoginPage() {
  await redirectAuthenticatedAdmin();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06101E] px-4 py-10">
      <div className="w-full max-w-[430px]">
        <div className="mb-5 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#0B63F6] text-white shadow-[0_12px_34px_rgba(11,99,246,0.3)]">
            <ShieldCheck
              className="h-6 w-6"
              aria-hidden="true"
            />
          </span>

          <p className="mt-3 text-[15px] font-black tracking-[-0.02em] text-white">
            Express-Führerschein
          </p>

          <p className="mt-1 text-[8px] font-extrabold uppercase tracking-[0.12em] text-[#66A0FF]">
            Administration
          </p>
        </div>

        <section className="rounded-[21px] border border-white/10 bg-white p-5 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:p-6">
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
              Sicherer Zugang
            </p>

            <h1 className="mt-1.5 text-[21px] font-black tracking-[-0.03em] text-[#081529]">
              Admin-Anmeldung
            </h1>

            <p className="mt-2 text-[9px] font-medium leading-4 text-[#718096]">
              Melde dich mit deinem autorisierten Administratorkonto an.
            </p>
          </div>

          <AdminLoginForm />
        </section>
      </div>
    </main>
  );
}
