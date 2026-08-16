/**
 * Express-Führerschein
 * Admin payments list page.
 */

import { redirect } from "next/navigation";

import { AdminPaymentsPage } from "@/components/admin/payments/admin-payments-page";
import {
  AdminPaymentsServiceError,
  getAdminPaymentsPageData,
} from "@/lib/server/admin/payments/admin-payments-service";
import {
  parseAdminPaymentFilters,
} from "@/lib/server/admin/payments/admin-payments-validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface AdminPaymentsRouteProps {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
  }>;
}

export default async function AdminPaymentsRoute({
  searchParams,
}: AdminPaymentsRouteProps) {
  const filters = parseAdminPaymentFilters(
    await searchParams,
  );

  try {
    const data = await getAdminPaymentsPageData(filters);

    return <AdminPaymentsPage data={data} />;
  } catch (error) {
    if (
      error instanceof AdminPaymentsServiceError &&
      error.code === "UNAUTHENTICATED"
    ) {
      redirect("/admin/login?next=/admin/zahlungen");
    }

    throw error;
  }
}
