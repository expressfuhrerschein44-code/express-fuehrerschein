/**
 * Express-Führerschein
 * Admin payment detail page.
 */

import {
  notFound,
  redirect,
} from "next/navigation";

import { AdminPaymentDetailPage } from "@/components/admin/payments/admin-payment-detail-page";
import {
  AdminPaymentsServiceError,
  getAdminPaymentDetail,
} from "@/lib/server/admin/payments/admin-payments-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminPaymentDetailRouteProps {
  params: Promise<{
    paymentId: string;
  }>;
}

export default async function AdminPaymentDetailRoute({
  params,
}: AdminPaymentDetailRouteProps) {
  const { paymentId } = await params;

  try {
    const payment = await getAdminPaymentDetail(paymentId);

    return <AdminPaymentDetailPage payment={payment} />;
  } catch (error) {
    if (error instanceof AdminPaymentsServiceError) {
      if (error.code === "UNAUTHENTICATED") {
        redirect(
          `/admin/login?next=${encodeURIComponent(
            `/admin/zahlungen/${paymentId}`,
          )}`,
        );
      }

      if (error.code === "NOT_FOUND") {
        notFound();
      }
    }

    throw error;
  }
}
