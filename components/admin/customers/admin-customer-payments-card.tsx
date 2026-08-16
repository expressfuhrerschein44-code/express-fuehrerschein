import Link from "next/link";
import {
  CreditCard,
} from "lucide-react";

import type {
  AdminCustomerPaymentView,
} from "@/types/admin-customers";

interface AdminCustomerPaymentsCardProps {
  payments: AdminCustomerPaymentView[];
}

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "Europe/Berlin",
  }).format(date);
}

export function AdminCustomerPaymentsCard({
  payments,
}: AdminCustomerPaymentsCardProps) {
  const paidTotal = payments
    .filter((payment) => payment.status === "paid")
    .reduce((total, payment) => total + payment.amountCents, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-700">
            Paiements
          </p>
          <h2 className="text-lg font-black text-slate-950">
            Historique financier
          </h2>
        </div>
        <CreditCard className="h-5 w-5 text-emerald-700" />
      </div>

      <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.08em] text-emerald-700">
          Total confirmé visible
        </p>
        <p className="mt-1 text-xl font-black text-emerald-900">
          {money(paidTotal, payments[0]?.currency ?? "EUR")}
        </p>
      </div>

      {payments.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Aucun paiement enregistré.
        </p>
      ) : (
        <div className="mt-4 space-y-2">
          {payments.slice(0, 10).map((payment) => (
            <Link
              key={payment.id}
              href={`/admin/zahlungen/${payment.id}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-blue-200 hover:bg-blue-50/50"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-900">
                  {payment.stage ?? "Paiement"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {payment.reference ?? "Sans référence"} •{" "}
                  {formatDate(payment.createdAt)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-black text-slate-950">
                  {money(payment.amountCents, payment.currency)}
                </p>
                <p className="mt-1 text-[10px] font-extrabold text-slate-500">
                  {payment.status}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
