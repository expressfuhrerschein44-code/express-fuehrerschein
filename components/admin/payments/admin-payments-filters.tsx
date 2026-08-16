import {
  Search,
} from "lucide-react";

import type {
  AdminPaymentsFilters,
} from "@/types/admin-payments";

export function AdminPaymentsFilters({
  filters,
}: {
  filters: AdminPaymentsFilters;
}) {
  return (
    <form
      action="/admin/zahlungen"
      method="get"
      className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto]"
    >
      <label className="relative block">
        <span className="sr-only">Rechercher</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          type="search"
          name="q"
          defaultValue={filters.query}
          placeholder="Client, email, référence, étape..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <select
        name="status"
        defaultValue={filters.status}
        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
      >
        <option value="all">Tous les statuts</option>
        <option value="to_review">À vérifier</option>
        <option value="awaiting_payment">En attente</option>
        <option value="proof_submitted">Preuve reçue</option>
        <option value="under_review">En vérification</option>
        <option value="paid">Payés</option>
        <option value="rejected">Refusés</option>
        <option value="draft">Brouillons</option>
        <option value="cancelled">Annulés</option>
      </select>

      <button
        type="submit"
        className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-extrabold text-white transition hover:bg-slate-800"
      >
        Filtrer
      </button>
    </form>
  );
}
