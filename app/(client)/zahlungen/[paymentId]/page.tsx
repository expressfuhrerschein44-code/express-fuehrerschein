import {
  notFound,
} from "next/navigation";

import {
  PaymentDetailPage,
} from "@/components/payments/payment-detail-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getPaymentDetail,
} from "@/lib/server/payments/payments-service";

export const dynamic =
  "force-dynamic";

export default async function ZahlungDetailPage(
  {
    params,
  }: {
    params:
      Promise<{
        paymentId: string;
      }>;
  },
) {
  const session =
    await requireClientSession();

  const {
    paymentId:
      rawPaymentId,
  } =
    await params;

  const paymentId =
    decodeURIComponent(
      rawPaymentId,
    ).trim();

  if (!paymentId) {
    notFound();
  }

  const payment =
    await getPaymentDetail({
      userId:
        session.user.id,
      paymentId,
    });

  if (!payment) {
    notFound();
  }

  return (
    <PaymentDetailPage
      payment={
        payment
      }
    />
  );
}
