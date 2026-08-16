import Link from "next/link";

import {
  ArrowLeft,
  CreditCard,
} from "lucide-react";

import {
  PaymentBankDetails,
} from "@/components/payments/payment-bank-details";

import {
  PaymentInvoiceCard,
} from "@/components/payments/payment-invoice-card";

import {
  PaymentProofUpload,
} from "@/components/payments/payment-proof-upload";

import {
  PaymentStatusCard,
} from "@/components/payments/payment-status-card";

import type {
  PaymentDetailView,
} from "@/types/payments";

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface PaymentDetailPageProps {
  payment:
    PaymentDetailView;
}

/* ==========================================================================
   HELPERS
   ========================================================================== */

function formatMoney(
  cents: number,
  currency: string,
): string {
  const safeCents =
    Number.isFinite(
      cents,
    )
      ? Math.max(
          0,
          cents,
        )
      : 0;

  const safeCurrency =
    currency
      ?.trim()
      .toUpperCase() ||
    "EUR";

  try {
    return new Intl.NumberFormat(
      "de-DE",
      {
        style:
          "currency",

        currency:
          safeCurrency,
      },
    ).format(
      safeCents /
        100,
    );
  } catch {
    return `${(
      safeCents /
      100
    ).toFixed(
      2,
    )} ${safeCurrency}`;
  }
}

/* ==========================================================================
   COMPONENT
   ========================================================================== */

export function PaymentDetailPage({
  payment,
}: PaymentDetailPageProps) {
  /* ------------------------------------------------------------------------
     PAYMENT STATE
     ---------------------------------------------------------------------- */

  const showBankDetails =
    payment.status ===
      "awaiting_payment" ||
    payment.status ===
      "rejected";

  const showInvoice =
    payment.status ===
    "paid";

  /* ------------------------------------------------------------------------
     BANK DETAILS
     ---------------------------------------------------------------------- */

  const bankDetailsReady =
    Boolean(
      payment.bankDetails
        .accountHolder &&
        payment.bankDetails
          .iban &&
        payment.bankDetails
          .reference,
    );

  /* ------------------------------------------------------------------------
     PAGE
     ---------------------------------------------------------------------- */

  return (
    <main className="mx-auto w-full max-w-[920px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      {/* ================================================================
          BACK
          ================================================================ */}

      <Link
        href="/zahlungen"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#DCE4EF] bg-white px-3 text-[8px] font-extrabold text-[#53647A] transition-colors hover:border-[#C8D5E5] hover:bg-[#F8FAFC] hover:text-[#24364D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63F6]/30"
      >
        <ArrowLeft
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />

        Zurück zu Zahlungen
      </Link>

      {/* ================================================================
          PAYMENT SUMMARY
          ================================================================ */}

      <section className="mt-4 rounded-[22px] border border-[#E5EAF2] bg-white p-5 shadow-[0_12px_34px_rgba(17,40,70,0.05)] sm:p-6 lg:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FF] px-3 py-1.5 text-[9px] font-extrabold text-[#0B63F6]">
              <CreditCard
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              {showInvoice
                ? "Zahlung abgeschlossen"
                : "Zahlung durchführen"}
            </span>

            <h1 className="mt-4 break-words text-[22px] font-black tracking-[-0.03em] text-[#081529]">
              {payment.title}
            </h1>

            {payment
              .applicationClasses
              .length > 0 ? (
              <p className="mt-1 text-[9px] font-medium text-[#718096]">
                Klasse{" "}
                {payment.applicationClasses.join(
                  ", ",
                )}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 rounded-[15px] bg-[#F5F8FC] px-5 py-4 sm:min-w-[170px] sm:text-right">
            <p className="text-[8px] font-bold uppercase tracking-[0.06em] text-[#7A899C]">
              {showInvoice
                ? "Bezahlt"
                : "Zu zahlen"}
            </p>

            <p className="mt-1 text-[24px] font-black tracking-[-0.04em] text-[#081529]">
              {formatMoney(
                payment.amountCents,
                payment.currency,
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ================================================================
          STATUS
          ================================================================ */}

      <div className="mt-4">
        <PaymentStatusCard
          payment={
            payment
          }
        />
      </div>

      {/* ================================================================
          INVOICE

          La facture apparaît uniquement après confirmation Admin.
          Aucun montant et aucun statut ne sont envoyés au serveur pour
          générer la facture : seul payment.id est utilisé par la route.
          ================================================================ */}

      {showInvoice ? (
        <div className="mt-4">
          <PaymentInvoiceCard
            paymentId={
              payment.id
            }
            status={
              payment.status
            }
          />
        </div>
      ) : null}

      {/* ================================================================
          BANK TRANSFER
          ================================================================ */}

      {showBankDetails ? (
        <>
          <div className="mt-4">
            <PaymentBankDetails
              bankDetails={
                payment.bankDetails
              }
            />
          </div>

          {/* ============================================================
              PAYMENT PROOF
              ============================================================ */}

          <div className="mt-4">
            <PaymentProofUpload
              paymentId={
                payment.id
              }
              enabled={
                payment.canPay &&
                bankDetailsReady
              }
            />
          </div>
        </>
      ) : null}
    </main>
  );
}

export default PaymentDetailPage;