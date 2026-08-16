import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AdminApplicationsFilters } from "@/components/admin/applications/admin-applications-filters";
import { AdminApplicationsHeader } from "@/components/admin/applications/admin-applications-header";
import { AdminApplicationsStats } from "@/components/admin/applications/admin-applications-stats";
import { AdminApplicationsTable } from "@/components/admin/applications/admin-applications-table";
import type { AdminApplicationsPageData } from "@/types/admin-applications";

interface AdminApplicationsPageProps {
  data: AdminApplicationsPageData;
}

function pageHref(data: AdminApplicationsPageData, page: number): string {
  const params = new URLSearchParams();
  if (data.query.search) params.set("q", data.query.search);
  if (data.query.status !== "all") params.set("status", data.query.status);
  if (data.query.licenseClass) params.set("licenseClass", data.query.licenseClass);
  params.set("page", String(page));
  params.set("pageSize", String(data.query.pageSize));
  return `/admin/antraege?${params.toString()}`;
}

export function AdminApplicationsPage({ data }: AdminApplicationsPageProps) {
  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AdminApplicationsHeader />

      <div className="mt-6">
        <AdminApplicationsStats stats={data.stats} />
      </div>

      <div className="mt-5">
        <AdminApplicationsFilters query={data.query} />
      </div>

      <div className="mt-4">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <p className="text-xs font-semibold text-slate-500">
            {data.pagination.total.toLocaleString("de-DE")} Antrag
            {data.pagination.total === 1 ? "" : "e"}
          </p>
          <p className="text-xs font-semibold text-slate-600">
            Seite {data.pagination.page} von {data.pagination.totalPages}
          </p>
        </div>
        <AdminApplicationsTable items={data.items} />
      </div>

      {data.pagination.totalPages > 1 ? (
        <nav className="mt-5 flex items-center justify-between gap-3" aria-label="Seitennavigation">
          {data.pagination.hasPreviousPage ? (
            <Link
              href={pageHref(data, data.pagination.page - 1)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.03] px-4 text-xs font-extrabold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Zurück
            </Link>
          ) : (
            <span />
          )}

          {data.pagination.hasNextPage ? (
            <Link
              href={pageHref(data, data.pagination.page + 1)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.03] px-4 text-xs font-extrabold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              Weiter
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </main>
  );
}

export default AdminApplicationsPage;
