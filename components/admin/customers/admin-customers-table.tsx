import {
  UsersRound,
} from "lucide-react";

import {
  AdminCustomerRow,
} from "@/components/admin/customers/admin-customer-row";

import type {
  AdminCustomerListItem,
} from "@/types/admin-customers";

interface AdminCustomersTableProps {
  customers: AdminCustomerListItem[];
}

export function AdminCustomersTable({
  customers,
}: AdminCustomersTableProps) {
  if (customers.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <UsersRound className="h-6 w-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-base font-black text-slate-900">
          Aucun client trouvé
        </h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          Modifiez la recherche ou les filtres pour afficher d’autres comptes.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[1080px] w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
            <th className="px-5 py-3">Client</th>
            <th className="px-4 py-3">Téléphone / pays</th>
            <th className="px-4 py-3">Permis</th>
            <th className="px-4 py-3">Dossier</th>
            <th className="px-4 py-3">Progression</th>
            <th className="px-4 py-3">Compte</th>
            <th className="px-5 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <AdminCustomerRow key={customer.id} customer={customer} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
