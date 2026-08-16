import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import type {
  AdminCustomersPagination as PaginationData,
  AdminCustomersQuery,
} from "@/types/admin-customers";

interface AdminCustomersPaginationProps {
  pagination: PaginationData;
  query: AdminCustomersQuery;
}

function pageHref(
  query: AdminCustomersQuery,
  page: number,
): string {
  const params = new URLSearchParams();

  if (query.search) params.set("search", query.search);
  if (query.country) params.set("country", query.country);
  if (query.accountStatus) {
    params.set("accountStatus", query.accountStatus);
  }
  if (query.licenseClass) {
    params.set("licenseClass", query.licenseClass);
  }
  if (query.applicationStatus) {
    params.set("applicationStatus", query.applicationStatus);
  }

  params.set("page", String(page));
  params.set("pageSize", String(query.pageSize));

  return `/admin/kunden?${params.toString()}`;
}

export function AdminCustomersPagination({
  pagination,
  query,
}: AdminCustomersPaginationProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold text-slate-500">
        Page {pagination.page} sur {pagination.totalPages} •{" "}
        {pagination.totalItems.toLocaleString("fr-FR")} résultat(s)
      </p>

      <div className="flex items-center gap-2">
        {pagination.hasPreviousPage ? (
          <Link
            href={pageHref(query, pagination.page - 1)}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Précédent
          </Link>
        ) : (
          <span className="inline-flex h-9 items-center gap-1 rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-extrabold text-slate-300">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Précédent
          </span>
        )}

        {pagination.hasNextPage ? (
          <Link
            href={pageHref(query, pagination.page + 1)}
            className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#0B63F6] px-3 text-xs font-extrabold text-white hover:bg-[#0957D7]"
          >
            Suivant
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex h-9 items-center gap-1 rounded-xl bg-slate-100 px-3 text-xs font-extrabold text-slate-300">
            Suivant
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </div>
  );
}
