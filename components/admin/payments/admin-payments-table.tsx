import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
} from "lucide-react";

import { AdminPaymentStatusBadge } from "@/components/admin/payments/admin-payment-status-badge";

import type {
  AdminPaymentListItem,
} from "@/types/admin-payments";

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function shortDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function AdminPaymentsTable({
  payments,
}: {
  payments: AdminPaymentListItem[];
}) {
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p className="text-sm font-black text-slate-800">
          Aucun paiement trouvé
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Modifiez les filtres ou créez une nouvelle étape de paiement.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse text-left">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Dossier</th>
              <th className="px-4 py-3">Étape</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Preuve</th>
              <th className="px-4 py-3">Échéance</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => (
              <tr key={payment.id} className="text-sm text-slate-700 hover:bg-slate-50/70">
                <td className="px-4 py-4">
                  <p className="font-extrabold text-slate-950">
                    {payment.client.fullName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {payment.client.email}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold text-slate-800">
                    {payment.application?.reference ?? "Sans référence"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {payment.application?.selectedClasses.join(", ") || "—"}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-bold text-slate-800">
                    {payment.stage}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Étape {payment.stageOrder}
                  </p>
                </td>
                <td className="px-4 py-4 font-black text-slate-950">
                  {money(payment.amountCents, payment.currency)}
                </td>
                <td className="px-4 py-4">
                  <AdminPaymentStatusBadge status={payment.status} />
                </td>
                <td className="px-4 py-4">
                  {payment.hasProof ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                      {shortDate(payment.proofSubmittedAt)}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-xs font-semibold text-slate-600">
                  {shortDate(payment.dueAt)}
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    href={`/admin/zahlungen/${payment.id}`}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0B63F6]"
                  >
                    Ouvrir
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
