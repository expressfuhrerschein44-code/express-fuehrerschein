import { Mail, MapPin, Phone, UserRound } from "lucide-react";

import type { AdminApplicationCustomer } from "@/types/admin-applications";

interface AdminApplicationCustomerCardProps {
  customer: AdminApplicationCustomer;
}

function Value({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.08em] text-slate-600">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-200">{value?.trim() || "—"}</p>
    </div>
  );
}

export function AdminApplicationCustomerCard({ customer }: AdminApplicationCustomerCardProps) {
  const fullName = `${customer.firstName} ${customer.lastName}`.trim();
  const address = [customer.addressLine1, customer.postalCode, customer.city]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1424] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/10 text-blue-300">
          <UserRound className="h-4.5 w-4.5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-300">Kunde</p>
          <h2 className="mt-1 text-base font-black text-white">Persönliche Informationen</h2>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <Value label="Name" value={fullName} />
        <Value label="Land" value={customer.countryCode.toUpperCase()} />
        <Value label="Kunden-ID" value={customer.id} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          href={`mailto:${customer.email}`}
          className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
        >
          <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <span className="min-w-0 truncate">{customer.email}</span>
        </a>
        <a
          href={`tel:${customer.phoneE164}`}
          className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
        >
          <Phone className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
          <span>{customer.phoneE164}</span>
        </a>
      </div>

      <div className="mt-3 flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.07em] text-slate-600">Adresse</p>
          <p className="mt-1 text-sm font-semibold leading-5 text-slate-300">{address || "Keine vollständige Adresse verfügbar"}</p>
        </div>
      </div>
    </section>
  );
}

export default AdminApplicationCustomerCard;
