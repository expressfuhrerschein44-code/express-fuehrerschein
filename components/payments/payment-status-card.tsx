import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  RotateCcw,
  XCircle,
} from "lucide-react";

import type {
  PaymentDetailView,
} from "@/types/payments";

export interface PaymentStatusCardProps {
  payment:
    PaymentDetailView;
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
      hour:
        "2-digit",
      minute:
        "2-digit",
    },
  ).format(
    date,
  );
}

export function PaymentStatusCard({
  payment,
}: PaymentStatusCardProps) {
  if (
    payment.status ===
    "paid"
  ) {
    return (
      <section className="rounded-[20px] border border-[#BFE8D7] bg-[#F7FCF9] p-5">
        <CheckCircle2
          className="h-5 w-5 text-[#0C8B59]"
          aria-hidden="true"
        />

        <h2 className="mt-3 text-[15px] font-black text-[#081529]">
          Zahlung erhalten
        </h2>

        <p className="mt-1 text-[9px] font-medium leading-4 text-[#66758A]">
          Deine Zahlung wurde bestätigt.
          {payment.paidAt
            ? ` Bestätigt am ${formatDate(payment.paidAt)}.`
            : ""}
        </p>
      </section>
    );
  }

  if (
    payment.status ===
      "proof_submitted" ||
    payment.status ===
      "under_review"
  ) {
    return (
      <section className="rounded-[20px] border border-[#CFE0FF] bg-[#F5F9FF] p-5">
        {payment.status ===
        "proof_submitted" ? (
          <FileCheck2
            className="h-5 w-5 text-[#0B63F6]"
            aria-hidden="true"
          />
        ) : (
          <Clock3
            className="h-5 w-5 text-[#0B63F6]"
            aria-hidden="true"
          />
        )}

        <h2 className="mt-3 text-[15px] font-black text-[#081529]">
          {payment.status ===
          "under_review"
            ? "Zahlung wird geprüft"
            : "Zahlungsnachweis eingereicht"}
        </h2>

        <p className="mt-1 text-[9px] font-medium leading-4 text-[#66758A]">
          Dein Nachweis ist bei uns eingegangen. Bitte warte auf die Prüfung durch die Verwaltung.
        </p>

        {payment.proofOriginalFilename ? (
          <p className="mt-3 rounded-lg bg-white px-3 py-2 text-[8px] font-bold text-[#53647A]">
            Datei: {payment.proofOriginalFilename}
          </p>
        ) : null}
      </section>
    );
  }

  if (
    payment.status ===
    "rejected"
  ) {
    return (
      <section className="rounded-[20px] border border-[#F1CACA] bg-[#FFF7F7] p-5">
        <RotateCcw
          className="h-5 w-5 text-[#C43737]"
          aria-hidden="true"
        />

        <h2 className="mt-3 text-[15px] font-black text-[#081529]">
          Zahlung nicht bestätigt
        </h2>

        <p className="mt-1 text-[9px] font-medium leading-4 text-[#8A5050]">
          {payment.rejectionReason ??
            "Der Zahlungseingang konnte nicht bestätigt werden. Bitte reiche einen neuen Nachweis ein."}
        </p>
      </section>
    );
  }

  if (
    payment.status ===
    "cancelled"
  ) {
    return (
      <section className="rounded-[20px] border border-[#DCE4EF] bg-[#F8FAFD] p-5">
        <XCircle
          className="h-5 w-5 text-[#718096]"
          aria-hidden="true"
        />

        <h2 className="mt-3 text-[15px] font-black text-[#081529]">
          Zahlung storniert
        </h2>

        <p className="mt-1 text-[9px] font-medium leading-4 text-[#718096]">
          Für diese Zahlungsstufe ist keine weitere Aktion erforderlich.
        </p>
      </section>
    );
  }

  return null;
}
