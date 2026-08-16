import Link from "next/link";
import { ChevronRight, FileText, FolderOpen } from "lucide-react";

import { AdminApplicationStatusBadge } from "@/components/admin/applications/admin-application-status-badge";
import type { AdminApplicationListItem } from "@/types/admin-applications";

interface AdminApplicationsTableProps {
  items: AdminApplicationListItem[];
}

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency || "EUR",
  }).format(Math.max(0, cents) / 100);
}

function date(value: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
}

function customerName(item: AdminApplicationListItem): string {
  return `${item.customer.firstName} ${item.customer.lastName}`.trim() || item.customer.email;
}

export function AdminApplicationsTable({ items }: AdminApplicationsTableProps) {
  if (items.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-[#0B1424] px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-400">
          <FolderOpen className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-base font-black text-white">Keine Anträge gefunden</h2>
        <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
          Für die aktuelle Suche oder Filterauswahl liegen keine passenden Führerscheinanträge vor.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1424]">
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="border-b border-white/[0.08] bg-white/[0.02]">
            <tr className="text-[10px] font-black uppercase tracking-[0.09em] text-slate-500">
              <th className="px-5 py-4">Antrag</th>
              <th className="px-5 py-4">Kunde</th>
              <th className="px-5 py-4">Klasse</th>
              <th className="px-5 py-4">Betrag</th>
              <th className="px-5 py-4">Dokumente</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Eingereicht</th>
              <th className="px-5 py-4 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {items.map((item) => (
              <tr key={item.id} className="transition hover:bg-white/[0.025]">
                <td className="px-5 py-4">
                  <p className="font-mono text-xs font-extrabold text-blue-300">{item.reference}</p>
                  <p className="mt-1 font-mono text-[9px] text-slate-600">{item.id.slice(0, 8)}…</p>
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm font-extrabold text-slate-100">{customerName(item)}</p>
                  <p className="mt-1 max-w-[220px] truncate text-xs text-slate-500">{item.customer.email}</p>
                </td>
                <td className="px-5 py-4 text-sm font-black text-white">
                  {item.selectedClasses.length ? item.selectedClasses.join(", ") : "—"}
                </td>
                <td className="px-5 py-4 text-sm font-extrabold text-slate-200">
                  {money(item.totalCents, item.currency)}
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    {item.documentCount}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <AdminApplicationStatusBadge status={item.status} compact />
                </td>
                <td className="px-5 py-4 text-xs font-semibold text-slate-400">{date(item.submittedAt)}</td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/antraege/${encodeURIComponent(item.id)}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 text-xs font-extrabold text-blue-300 transition hover:bg-blue-500/15 hover:text-blue-200"
                  >
                    Öffnen
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-white/[0.06] lg:hidden">
        {items.map((item) => (
          <article key={item.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11px] font-extrabold text-blue-300">{item.reference}</p>
                <h3 className="mt-1 truncate text-sm font-black text-white">{customerName(item)}</h3>
                <p className="mt-0.5 truncate text-xs text-slate-500">{item.customer.email}</p>
              </div>
              <AdminApplicationStatusBadge status={item.status} compact />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-white/[0.025] p-3">
              <div>
                <p className="text-[9px] font-bold uppercase text-slate-600">Klasse</p>
                <p className="mt-1 text-xs font-black text-slate-200">{item.selectedClasses.join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase text-slate-600">Betrag</p>
                <p className="mt-1 text-xs font-black text-slate-200">{money(item.totalCents, item.currency)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase text-slate-600">Datum</p>
                <p className="mt-1 text-xs font-black text-slate-200">{date(item.submittedAt)}</p>
              </div>
            </div>

            <Link
              href={`/admin/antraege/${encodeURIComponent(item.id)}`}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-black text-white transition hover:bg-blue-500"
            >
              Antrag öffnen
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

export default AdminApplicationsTable;
