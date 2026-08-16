import {
  PaymentStepCard,
} from "@/components/payments/payment-step-card";

import type {
  PaymentStepView,
} from "@/types/payments";

export interface PaymentStepListProps {
  payments:
    readonly PaymentStepView[];
}

export function PaymentStepList({
  payments,
}: PaymentStepListProps) {
  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Zahlungsplan
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Freigeschaltete Zahlungen
        </h2>

        <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
          Die Verwaltung legt fest, welche Zahlung aktuell fällig ist und welchen Betrag du überweisen sollst.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {payments.map(
          (
            payment,
          ) => (
            <PaymentStepCard
              key={
                payment.id
              }
              payment={
                payment
              }
            />
          ),
        )}
      </div>
    </section>
  );
}
