import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Mail,
} from "lucide-react";

import type {
  AdminCustomerListItem,
} from "@/types/admin-customers";

interface AdminCustomerRowProps {
  customer: AdminCustomerListItem;
}

function initials(customer: AdminCustomerListItem): string {
  return `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`
    .toUpperCase()
    .slice(0, 2);
}

function statusLabel(value: string | null): string {
  if (!value) return "Aucun dossier";

  return value
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function AdminCustomerRow({
  customer,
}: AdminCustomerRowProps) {
  return (
    <tr className="border-b border-slate-100 align-middle transition last:border-b-0 hover:bg-blue-50/30">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FF] text-xs font-black text-[#0B63F6]">
            {initials(customer)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950">
              {customer.fullName}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {customer.email}
              {customer.emailVerified && (
                <BadgeCheck
                  className="h-3.5 w-3.5 text-emerald-600"
                  aria-label="E-mail vérifié"
                />
              )}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4 text-sm text-slate-700">
        <p className="font-semibold">{customer.phone}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {customer.countryCode}
        </p>
      </td>

      <td className="px-4 py-4">
        <div className="flex max-w-52 flex-wrap gap-1.5">
          {customer.licenseClasses.length > 0 ? (
            customer.licenseClasses.map((licenseClass) => (
              <span
                key={`${customer.id}-${licenseClass.code}`}
                className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-1 text-[11px] font-extrabold text-[#0B63F6]"
              >
                {licenseClass.code}
                {licenseClass.isPrimary ? " •" : ""}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400">Aucune classe</span>
          )}
        </div>
      </td>

      <td className="px-4 py-4">
        <p className="text-sm font-bold text-slate-800">
          {statusLabel(customer.applicationStatus)}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {customer.applicationReference ?? "—"}
        </p>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#0B63F6]"
              style={{
                width: `${Math.min(
                  Math.max(customer.readinessScore ?? 0, 0),
                  100,
                )}%`,
              }}
            />
          </div>
          <span className="text-xs font-black text-slate-700">
            {customer.readinessScore ?? 0}%
          </span>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">
          {customer.status}
        </span>
      </td>

      <td className="px-5 py-4 text-right">
        <Link
          href={`/admin/kunden/${customer.id}`}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B63F6]"
        >
          Ouvrir
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </td>
    </tr>
  );
}
