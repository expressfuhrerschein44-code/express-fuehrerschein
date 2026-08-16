import {
  FileCheck2,
} from "lucide-react";

import type {
  PaymentApplicationSummaryView,
} from "@/types/payments";

export interface ApplicationPaymentSummaryProps {
  application:
    PaymentApplicationSummaryView;
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

export function ApplicationPaymentSummary({
  application,
}: ApplicationPaymentSummaryProps) {
  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.04)] lg:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
          <FileCheck2
            className="h-4.5 w-4.5"
            aria-hidden="true"
          />
        </span>

        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
            Führerscheinantrag
          </p>

          <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
            Klasse {application.selectedClasses.join(", ")}
          </h2>

          <p className="mt-1 text-[9px] font-medium text-[#718096]">
            Die Beträge stammen direkt aus deinem eingereichten Antrag.
          </p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-[#EDF1F6] rounded-[15px] border border-[#E7ECF3] bg-[#FAFBFD] px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <span className="text-[9px] font-semibold text-[#66758A]">
            Führerscheinklasse(n)
          </span>

          <strong className="text-[10px] font-black text-[#081529]">
            {formatMoney(
              application.classesTotalCents,
              application.currency,
            )}
          </strong>
        </div>

        <div className="flex items-center justify-between gap-4 py-3">
          <span className="text-[9px] font-semibold text-[#66758A]">
            Bearbeitungsgebühr
          </span>

          <strong className="text-[10px] font-black text-[#081529]">
            {formatMoney(
              application.processingFeeCents,
              application.currency,
            )}
          </strong>
        </div>

        <div className="flex items-center justify-between gap-4 py-3.5">
          <span className="text-[10px] font-extrabold text-[#081529]">
            Gesamtbetrag des Antrags
          </span>

          <strong className="text-[14px] font-black text-[#0B63F6]">
            {formatMoney(
              application.totalCents,
              application.currency,
            )}
          </strong>
        </div>
      </div>
    </section>
  );
}
