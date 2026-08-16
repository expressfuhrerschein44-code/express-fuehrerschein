import Link from "next/link";
import {
  ArrowUpRight,
  FileCheck2,
} from "lucide-react";

import type {
  AdminCustomerApplicationView,
} from "@/types/admin-customers";

interface AdminCustomerApplicationCardProps {
  applications: AdminCustomerApplicationView[];
}

function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "Europe/Berlin",
  }).format(date);
}

export function AdminCustomerApplicationCard({
  applications,
}: AdminCustomerApplicationCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
          <FileCheck2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-violet-700">
            Demandes
          </p>
          <h2 className="text-lg font-black text-slate-950">
            Historique des dossiers
          </h2>
        </div>
      </div>

      {applications.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Aucune demande de permis n’a encore été créée.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {applications.map((application) => (
            <article
              key={application.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black text-slate-950">
                    {application.reference ?? application.id.slice(0, 8)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {application.selectedClasses.map((code) => (
                      <span
                        key={`${application.id}-${code}`}
                        className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-black text-[#0B63F6]"
                      >
                        {code}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black text-slate-700">
                    {application.status}
                  </span>
                  <p className="mt-2 text-lg font-black text-slate-950">
                    {money(application.totalCents, application.currency)}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-bold text-slate-400">Soumise</p>
                  <p className="mt-1 font-extrabold text-slate-800">
                    {formatDate(application.submittedAt)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-bold text-slate-400">Théorie réussie</p>
                  <p className="mt-1 font-extrabold text-slate-800">
                    {application.theoryPassed === null
                      ? "—"
                      : application.theoryPassed
                        ? "Oui"
                        : "Non"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-bold text-slate-400">Pratique réussie</p>
                  <p className="mt-1 font-extrabold text-slate-800">
                    {application.practicalPassed === null
                      ? "—"
                      : application.practicalPassed
                        ? "Oui"
                        : "Non"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href={`/admin/antraege/${application.id}`}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-extrabold text-slate-700 transition hover:bg-slate-50"
                >
                  Ouvrir la demande
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
