import Link from "next/link";

import {
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  RotateCcw,
  XCircle,
} from "lucide-react";

import type {
  PaymentStatusView,
  PaymentStepView,
} from "@/types/payments";

export interface PaymentStepCardProps {
  payment:
    PaymentStepView;
}

function formatMoney(
  cents: number,
  currency: string,
): string {
  return new Intl.NumberFormat(
    "de-DE",
    {
      style:
        "currency",
      currency:
        currency ||
        "EUR",
    },
  ).format(
    Math.max(
      0,
      cents,
    ) /
      100,
  );
}

function formatDate(
  value:
    string | null,
): string | null {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day:
        "2-digit",
      month:
        "2-digit",
      year:
        "numeric",
    },
  ).format(
    date,
  );
}

function statusConfig(
  status:
    PaymentStatusView,
) {
  switch (
    status
  ) {
    case "awaiting_payment":
      return {
        label:
          "Zahlung ausstehend",
        classes:
          "bg-[#FFF9EE] text-[#A66B13]",
        icon:
          CreditCard,
      };

    case "proof_submitted":
      return {
        label:
          "Nachweis eingereicht",
        classes:
          "bg-[#F2F7FF] text-[#0B63F6]",
        icon:
          FileCheck2,
      };

    case "under_review":
      return {
        label:
          "Wird geprüft",
        classes:
          "bg-[#F2F7FF] text-[#0B63F6]",
        icon:
          Clock3,
      };

    case "paid":
      return {
        label:
          "Zahlung erhalten",
        classes:
          "bg-[#F1FBF6] text-[#0C8B59]",
        icon:
          CheckCircle2,
      };

    case "rejected":
      return {
        label:
          "Nicht bestätigt",
        classes:
          "bg-[#FFF5F5] text-[#C43737]",
        icon:
          RotateCcw,
      };

    case "cancelled":
      return {
        label:
          "Storniert",
        classes:
          "bg-[#F4F6F9] text-[#718096]",
        icon:
          XCircle,
      };

    default:
      return {
        label:
          "Zahlung",
        classes:
          "bg-[#F4F6F9] text-[#718096]",
        icon:
          Clock3,
      };
  }
}

export function PaymentStepCard({
  payment,
}: PaymentStepCardProps) {
  const config =
    statusConfig(
      payment.status,
    );

  const Icon =
    config.icon;

  const dueDate =
    formatDate(
      payment.dueAt,
    );

  const paidDate =
    formatDate(
      payment.paidAt,
    );

  return (
    <article className="rounded-[17px] border border-[#E6EBF2] bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[8px] font-extrabold ${config.classes}`}>
            <Icon
              className="h-3 w-3"
              aria-hidden="true"
            />
            {config.label}
          </span>

          <h3 className="mt-3 text-[13px] font-black text-[#081529]">
            {payment.title}
          </h3>

          {dueDate &&
          payment.status ===
            "awaiting_payment" ? (
            <p className="mt-1 text-[8px] font-medium text-[#718096]">
              Fällig bis {dueDate}
            </p>
          ) : null}

          {paidDate &&
          payment.status ===
            "paid" ? (
            <p className="mt-1 text-[8px] font-medium text-[#0C8B59]">
              Bestätigt am {paidDate}
            </p>
          ) : null}
        </div>

        <p className="shrink-0 text-[20px] font-black tracking-[-0.03em] text-[#081529]">
          {formatMoney(
            payment.amountCents,
            payment.currency,
          )}
        </p>
      </div>

      {payment.status ===
        "rejected" &&
      payment.rejectionReason ? (
        <div className="mt-4 rounded-xl border border-[#F1CACA] bg-[#FFF7F7] px-3 py-2.5">
          <p className="text-[8px] font-extrabold text-[#B53535]">
            Hinweis
          </p>

          <p className="mt-1 whitespace-pre-line text-[8px] font-medium leading-4 text-[#8A5050]">
            {payment.rejectionReason}
          </p>
        </div>
      ) : null}

      <div className="mt-4">
        {payment.canPay ? (
          <Link
            href={`/zahlungen/${encodeURIComponent(payment.id)}`}
            className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-[#0B63F6] px-5 text-[9px] font-extrabold text-white sm:w-auto"
          >
            {payment.status ===
            "rejected"
              ? "Nachweis erneut einreichen"
              : "Jetzt bezahlen"}
          </Link>
        ) : (
          <Link
            href={`/zahlungen/${encodeURIComponent(payment.id)}`}
            className="inline-flex min-h-9 w-full items-center justify-center rounded-lg border border-[#DCE4EF] bg-white px-4 text-[8px] font-extrabold text-[#53647A] sm:w-auto"
          >
            Details ansehen
          </Link>
        )}
      </div>
    </article>
  );
}
