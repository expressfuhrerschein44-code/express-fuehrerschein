import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CreditCard,
  FileText,
  UserRound,
} from "lucide-react";

import { AdminPaymentCreateForm } from "@/components/admin/payments/admin-payment-create-form";
import { AdminPaymentProofCard } from "@/components/admin/payments/admin-payment-proof-card";
import { AdminPaymentReviewActions } from "@/components/admin/payments/admin-payment-review-actions";
import { AdminPaymentStatusBadge } from "@/components/admin/payments/admin-payment-status-badge";
import { AdminPaymentTimeline } from "@/components/admin/payments/admin-payment-timeline";

import type {
  AdminPaymentDetail,
} from "@/types/admin-payments";

function money(cents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function dateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function InfoLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-b-0">
      <span className="text-xs font-semibold text-slate-500">
        {label}
      </span>
      <span
        className={`max-w-[65%] text-right text-xs ${
          strong
            ? "font-black text-slate-950"
            : "font-bold text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function AdminPaymentDetailPage({
  payment,
}: {
  payment: AdminPaymentDetail;
}) {
  const application = payment.application;
  const bank = payment.bankDetails;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/zahlungen"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-500 transition hover:text-[#0B63F6]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour aux paiements
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black tracking-[-0.03em] text-slate-950">
              {payment.stage}
            </h1>
            <AdminPaymentStatusBadge status={payment.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {payment.reference ?? payment.id}
          </p>
        </div>

        <div className="rounded-2xl bg-[#07111F] px-5 py-4 text-right text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-300">
            Montant
          </p>
          <p className="mt-1 text-2xl font-black">
            {money(payment.amountCents, payment.currency)}
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B63F6]">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                    Client
                  </p>
                  <h2 className="text-base font-black text-slate-950">
                    {payment.client.fullName}
                  </h2>
                </div>
              </div>
              <div className="mt-4">
                <InfoLine label="Email" value={payment.client.email} />
                <InfoLine label="Client ID" value={payment.client.id} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B63F6]">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                    Dossier permis
                  </p>
                  <h2 className="text-base font-black text-slate-950">
                    {application?.reference ?? "Dossier associé"}
                  </h2>
                </div>
              </div>
              <div className="mt-4">
                <InfoLine
                  label="Classes"
                  value={application?.selectedClasses.join(", ") || "—"}
                />
                <InfoLine
                  label="Prix permis"
                  value={
                    application
                      ? money(application.classesTotalCents, application.currency)
                      : "—"
                  }
                />
                <InfoLine
                  label="Frais de dossier"
                  value={
                    application
                      ? money(application.processingFeeCents, application.currency)
                      : "—"
                  }
                />
                <InfoLine
                  label="Total dossier"
                  value={
                    application
                      ? money(application.totalCents, application.currency)
                      : "—"
                  }
                  strong
                />
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B63F6]">
                <CreditCard className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                  Étape de paiement
                </p>
                <h2 className="text-base font-black text-slate-950">
                  Informations financières
                </h2>
              </div>
            </div>
            <div className="mt-4 grid gap-x-6 md:grid-cols-2">
              <InfoLine label="Étape" value={payment.stage} />
              <InfoLine label="Ordre" value={String(payment.stageOrder)} />
              <InfoLine label="Référence" value={payment.reference ?? "—"} />
              <InfoLine label="Provider" value={payment.provider} />
              <InfoLine label="Échéance" value={dateTime(payment.dueAt)} />
              <InfoLine label="Activation" value={dateTime(payment.activatedAt)} />
              <InfoLine label="Vérification" value={dateTime(payment.reviewedAt)} />
              <InfoLine label="Paiement confirmé" value={dateTime(payment.paidAt)} />
            </div>
            {payment.description && (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                {payment.description}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0B63F6]">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">
                  Snapshot bancaire
                </p>
                <h2 className="text-base font-black text-slate-950">
                  Coordonnées attribuées à cette étape
                </h2>
              </div>
            </div>

            {bank ? (
              <div className="mt-4 grid gap-x-6 md:grid-cols-2">
                <InfoLine label="Titulaire" value={bank.accountHolder || "—"} />
                <InfoLine label="Banque" value={bank.bankName || "—"} />
                <InfoLine label="IBAN" value={bank.iban || "—"} />
                <InfoLine label="BIC" value={bank.bic || "—"} />
                <InfoLine label="Pays" value={bank.country || "—"} />
                <InfoLine label="Référence" value={bank.reference || "—"} />
                {bank.instructions && (
                  <div className="md:col-span-2 mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                    {bank.instructions}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                Aucune coordonnée bancaire n’a encore été enregistrée.
              </p>
            )}
          </section>

          {payment.status === "draft" && (
            <AdminPaymentCreateForm mode="edit" payment={payment} />
          )}

          <AdminPaymentProofCard
            paymentId={payment.id}
            proof={payment.proof}
          />

          <AdminPaymentTimeline items={payment.timeline} />
        </div>

        <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
          <AdminPaymentReviewActions payment={payment} />

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CalendarClock className="h-5 w-5 text-[#0B63F6]" aria-hidden="true" />
              <h2 className="text-sm font-black text-slate-950">
                Dates système
              </h2>
            </div>
            <div className="mt-3">
              <InfoLine label="Créé" value={dateTime(payment.createdAt)} />
              <InfoLine label="Mis à jour" value={dateTime(payment.updatedAt)} />
              <InfoLine label="Preuve reçue" value={dateTime(payment.proof?.submittedAt ?? null)} />
            </div>
          </section>

          {payment.rejectionReason && (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-red-600">
                Motif
              </p>
              <p className="mt-2 text-sm leading-6 text-red-800">
                {payment.rejectionReason}
              </p>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
