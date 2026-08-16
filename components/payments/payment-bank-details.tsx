import {
  Building2,
  Copy,
} from "lucide-react";

import type {
  PaymentBankDetailsView,
} from "@/types/payments";

export interface PaymentBankDetailsProps {
  bankDetails:
    PaymentBankDetailsView;
}

function DetailRow({
  label,
  value,
}: {
  label:
    string;
  value:
    string | null;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 border-b border-[#EDF1F6] py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-[8px] font-bold text-[#758499]">
        {label}
      </span>

      <span className="break-all text-[9px] font-extrabold text-[#081529]">
        {value}
      </span>
    </div>
  );
}

export function PaymentBankDetails({
  bankDetails,
}: PaymentBankDetailsProps) {
  const hasBankDetails =
    Boolean(
      bankDetails.accountHolder ||
      bankDetails.bankName ||
      bankDetails.iban ||
      bankDetails.bic ||
      bankDetails.reference,
    );

  if (!hasBankDetails) {
    return (
      <section className="rounded-[20px] border border-[#F1D6A6] bg-[#FFF9EE] p-5">
        <p className="text-[10px] font-extrabold text-[#8A6117]">
          Bankverbindung noch nicht verfügbar
        </p>

        <p className="mt-1 text-[9px] font-medium leading-4 text-[#9A742E]">
          Für diese Zahlung wurden noch keine Bankdaten hinterlegt. Bitte führe noch keine Überweisung durch.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-5 shadow-[0_10px_28px_rgba(17,40,70,0.04)] lg:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
          <Building2
            className="h-4.5 w-4.5"
            aria-hidden="true"
          />
        </span>

        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
            Bankverbindung
          </p>

          <h2 className="mt-1 text-[16px] font-black text-[#081529]">
            Überweisungsdaten
          </h2>
        </div>
      </div>

      <div className="mt-4 rounded-[15px] border border-[#E7ECF3] bg-[#FAFBFD] px-4">
        <DetailRow
          label="Kontoinhaber"
          value={
            bankDetails.accountHolder
          }
        />

        <DetailRow
          label="Bank"
          value={
            bankDetails.bankName
          }
        />

        <DetailRow
          label="IBAN"
          value={
            bankDetails.iban
          }
        />

        <DetailRow
          label="BIC / SWIFT"
          value={
            bankDetails.bic
          }
        />

        <DetailRow
          label="Land"
          value={
            bankDetails.country
          }
        />

        <DetailRow
          label="Verwendungszweck"
          value={
            bankDetails.reference
          }
        />
      </div>

      {bankDetails.instructions ? (
        <div className="mt-4 rounded-xl border border-[#DCE7F7] bg-[#F5F9FF] px-4 py-3">
          <p className="text-[8px] font-extrabold text-[#0B63F6]">
            Hinweis
          </p>

          <p className="mt-1 whitespace-pre-line text-[9px] font-medium leading-4 text-[#53647A]">
            {bankDetails.instructions}
          </p>
        </div>
      ) : null}

      <p className="mt-3 flex items-center gap-1.5 text-[7px] font-medium text-[#8A97A8]">
        <Copy
          className="h-3 w-3"
          aria-hidden="true"
        />
        Bitte übernimm IBAN und Verwendungszweck exakt wie angezeigt.
      </p>
    </section>
  );
}
