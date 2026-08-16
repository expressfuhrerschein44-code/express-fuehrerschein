import {
  ApplicationPaymentSummary,
} from "@/components/payments/application-payment-summary";

import {
  PaymentsEmptyState,
} from "@/components/payments/payments-empty-state";

import {
  PaymentsHeader,
} from "@/components/payments/payments-header";

import {
  PaymentStepList,
} from "@/components/payments/payment-step-list";

import type {
  PaymentsPageData,
} from "@/types/payments";

export interface PaymentsPageProps {
  data:
    PaymentsPageData;
}

export function PaymentsPage({
  data,
}: PaymentsPageProps) {
  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <PaymentsHeader
        selectedClasses={
          data.application
            ?.selectedClasses ??
          []
        }
      />

      {!data.application ? (
        <div className="mt-4">
          <PaymentsEmptyState
            hasApplication={
              false
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-4">
            <ApplicationPaymentSummary
              application={
                data.application
              }
            />
          </div>

          <div className="mt-4">
            {data.payments.length ? (
              <PaymentStepList
                payments={
                  data.payments
                }
              />
            ) : (
              <PaymentsEmptyState
                hasApplication={
                  true
                }
              />
            )}
          </div>
        </>
      )}
    </main>
  );
}
