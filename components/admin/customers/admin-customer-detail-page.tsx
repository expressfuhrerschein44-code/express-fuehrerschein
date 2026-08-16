import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";

import {
  AdminCustomerApplicationCard,
} from "@/components/admin/customers/admin-customer-application-card";
import {
  AdminCustomerDocumentsCard,
} from "@/components/admin/customers/admin-customer-documents-card";
import {
  AdminCustomerLicenseCard,
} from "@/components/admin/customers/admin-customer-license-card";
import {
  AdminCustomerPaymentsCard,
} from "@/components/admin/customers/admin-customer-payments-card";
import {
  AdminCustomerPraxisCard,
} from "@/components/admin/customers/admin-customer-praxis-card";
import {
  AdminCustomerProfileCard,
} from "@/components/admin/customers/admin-customer-profile-card";
import {
  AdminCustomerTheoryCard,
} from "@/components/admin/customers/admin-customer-theory-card";

import type {
  AdminCustomerDetailView,
} from "@/types/admin-customers";

interface AdminCustomerDetailPageProps {
  data: AdminCustomerDetailView;
}

export function AdminCustomerDetailPage({
  data,
}: AdminCustomerDetailPageProps) {
  return (
    <div className="min-h-full bg-[#F4F7FB] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/admin/kunden"
            className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour aux clients
          </Link>

          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-[#0B63F6]">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Consultation administrative
          </span>
        </div>

        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0B63F6]">
                Dossier client
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {data.profile.fullName}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {data.profile.email} • {data.profile.phone}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                {data.profile.countryCode}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-slate-700">
                {data.profile.status}
              </span>
              {data.profile.emailVerifiedAt && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-700">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  E-mail vérifié
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
          <div className="space-y-5">
            <AdminCustomerProfileCard profile={data.profile} />
            <AdminCustomerLicenseCard licenses={data.licenses} />
            <AdminCustomerApplicationCard applications={data.applications} />
            <AdminCustomerDocumentsCard documents={data.documents} />
          </div>

          <div className="space-y-5">
            <AdminCustomerTheoryCard theory={data.theory} />
            <AdminCustomerPraxisCard appointments={data.praxis} />
            <AdminCustomerPaymentsCard payments={data.payments} />
          </div>
        </div>
      </div>
    </div>
  );
}
