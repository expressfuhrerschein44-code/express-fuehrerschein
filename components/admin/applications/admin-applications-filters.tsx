import Link from "next/link";
import { Filter, Search, X } from "lucide-react";

import type { AdminApplicationsQuery } from "@/types/admin-applications";

interface AdminApplicationsFiltersProps {
  query: AdminApplicationsQuery;
}

export function AdminApplicationsFilters({ query }: AdminApplicationsFiltersProps) {
  return (
    <form
      method="get"
      action="/admin/antraege"
      className="rounded-2xl border border-white/[0.08] bg-[#0B1424] p-4"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_160px_auto]">
        <label className="relative block">
          <span className="sr-only">Anträge durchsuchen</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
          <input
            type="search"
            name="q"
            defaultValue={query.search}
            placeholder="Name, E-Mail oder Referenz..."
            className="h-11 w-full rounded-xl border border-white/[0.09] bg-[#070F1D] pl-10 pr-3 text-sm font-medium text-white outline-none placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
          />
        </label>

        <label>
          <span className="sr-only">Status</span>
          <select
            name="status"
            defaultValue={query.status}
            className="h-11 w-full rounded-xl border border-white/[0.09] bg-[#070F1D] px-3 text-sm font-semibold text-slate-200 outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
          >
            <option value="all">Alle Status</option>
            <option value="draft">Entwurf</option>
            <option value="submitted">Neu eingereicht</option>
            <option value="under_review">In Prüfung</option>
            <option value="approved">Bestätigt</option>
            <option value="rejected">Abgelehnt</option>
            <option value="other">Sonstige</option>
          </select>
        </label>

        <label>
          <span className="sr-only">Führerscheinklasse</span>
          <input
            name="licenseClass"
            defaultValue={query.licenseClass}
            placeholder="Klasse, z. B. B"
            maxLength={8}
            className="h-11 w-full rounded-xl border border-white/[0.09] bg-[#070F1D] px-3 text-sm font-semibold uppercase text-slate-200 outline-none placeholder:normal-case placeholder:text-slate-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/15"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white transition hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 lg:flex-none"
          >
            <Filter className="h-4 w-4" aria-hidden="true" />
            Filtern
          </button>

          <Link
            href="/admin/antraege"
            aria-label="Filter zurücksetzen"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.03] text-slate-400 transition hover:bg-white/[0.07] hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <input type="hidden" name="pageSize" value={query.pageSize} />
    </form>
  );
}

export default AdminApplicationsFilters;
