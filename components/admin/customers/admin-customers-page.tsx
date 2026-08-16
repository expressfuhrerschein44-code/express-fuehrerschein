import {
  AdminCustomersFilters,
} from "@/components/admin/customers/admin-customers-filters";
import {
  AdminCustomersHeader,
} from "@/components/admin/customers/admin-customers-header";
import {
  AdminCustomersPagination,
} from "@/components/admin/customers/admin-customers-pagination";
import {
  AdminCustomersSearch,
} from "@/components/admin/customers/admin-customers-search";
import {
  AdminCustomersStats,
} from "@/components/admin/customers/admin-customers-stats";
import {
  AdminCustomersTable,
} from "@/components/admin/customers/admin-customers-table";

import type {
  AdminCustomersPageData,
} from "@/types/admin-customers";

interface AdminCustomersPageProps {
  data: AdminCustomersPageData;
}

export function AdminCustomersPage({
  data,
}: AdminCustomersPageProps) {
  return (
    <div className="min-h-full bg-[#F4F7FB] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <AdminCustomersHeader
          total={data.stats.total}
          generatedAt={data.generatedAt}
        />

        <AdminCustomersStats stats={data.stats} />

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_minmax(560px,2fr)]">
              <AdminCustomersSearch query={data.query} />
              <AdminCustomersFilters
                query={data.query}
                options={data.filters}
              />
            </div>
          </div>

          <AdminCustomersTable customers={data.customers} />

          <div className="border-t border-slate-100 p-4 sm:p-5">
            <AdminCustomersPagination
              pagination={data.pagination}
              query={data.query}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
