import { AdminPaymentCreateForm } from "@/components/admin/payments/admin-payment-create-form";
import { AdminPaymentsFilters } from "@/components/admin/payments/admin-payments-filters";
import { AdminPaymentsHeader } from "@/components/admin/payments/admin-payments-header";
import { AdminPaymentsStats } from "@/components/admin/payments/admin-payments-stats";
import { AdminPaymentsTable } from "@/components/admin/payments/admin-payments-table";

import type {
  AdminPaymentsPageData,
} from "@/types/admin-payments";

export function AdminPaymentsPage({
  data,
}: {
  data: AdminPaymentsPageData;
}) {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 p-4 sm:p-5 lg:p-6">
      <AdminPaymentsHeader />
      <AdminPaymentsStats stats={data.stats} />

      <details className="group rounded-2xl">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-extrabold text-blue-800 transition hover:bg-blue-100">
          <span>+ Créer une nouvelle étape de paiement</span>
          <span className="text-xs text-blue-500 group-open:hidden">
            Ouvrir
          </span>
          <span className="hidden text-xs text-blue-500 group-open:inline">
            Fermer
          </span>
        </summary>
        <div className="mt-3">
          <AdminPaymentCreateForm applications={data.applications} />
        </div>
      </details>

      <AdminPaymentsFilters filters={data.filters} />
      <AdminPaymentsTable payments={data.payments} />
    </div>
  );
}
