import {
  Search,
} from "lucide-react";

import type {
  AdminCustomersQuery,
} from "@/types/admin-customers";

interface AdminCustomersSearchProps {
  query: AdminCustomersQuery;
}

export function AdminCustomersSearch({
  query,
}: AdminCustomersSearchProps) {
  return (
    <form action="/admin/kunden" method="get" className="flex gap-2">
      <input type="hidden" name="country" value={query.country} />
      <input
        type="hidden"
        name="accountStatus"
        value={query.accountStatus}
      />
      <input
        type="hidden"
        name="licenseClass"
        value={query.licenseClass}
      />
      <input
        type="hidden"
        name="applicationStatus"
        value={query.applicationStatus}
      />
      <input type="hidden" name="pageSize" value={query.pageSize} />

      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Rechercher un client</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          name="search"
          defaultValue={query.search}
          placeholder="Nom, prénom, e-mail ou téléphone"
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <button
        type="submit"
        className="h-11 rounded-xl bg-[#0B63F6] px-4 text-sm font-extrabold text-white transition hover:bg-[#0957D7]"
      >
        Rechercher
      </button>
    </form>
  );
}
