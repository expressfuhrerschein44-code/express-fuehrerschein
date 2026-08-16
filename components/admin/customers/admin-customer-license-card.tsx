import {
  CarFront,
  CheckCircle2,
  Target,
} from "lucide-react";

import type {
  AdminCustomerLicenseDetailView,
} from "@/types/admin-customers";

interface AdminCustomerLicenseCardProps {
  licenses: AdminCustomerLicenseDetailView[];
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

export function AdminCustomerLicenseCard({
  licenses,
}: AdminCustomerLicenseCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
          <CarFront className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-cyan-700">
            Permis
          </p>
          <h2 className="text-lg font-black text-slate-950">
            Catégories du client
          </h2>
        </div>
      </div>

      {licenses.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Aucune catégorie de permis n’est encore rattachée à ce client.
        </p>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {licenses.map((licenseClass) => (
            <article
              key={licenseClass.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-black text-slate-950">
                    Classe {licenseClass.code}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {licenseClass.status}
                  </p>
                </div>
                {licenseClass.isPrimary && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Principale
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="font-bold text-slate-400">Début</p>
                  <p className="mt-1 font-extrabold text-slate-800">
                    {formatDate(licenseClass.startedAt)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="flex items-center gap-1 font-bold text-slate-400">
                    <Target className="h-3.5 w-3.5" /> Examen cible
                  </p>
                  <p className="mt-1 font-extrabold text-slate-800">
                    {formatDate(licenseClass.targetExamDate)}
                  </p>
                </div>
              </div>

              <div className="mt-3 rounded-xl bg-blue-50 p-3">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                  <span>Préparation</span>
                  <span>{licenseClass.progress?.readinessScore ?? 0}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-[#0B63F6]"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          licenseClass.progress?.readinessScore ?? 0,
                          0,
                        ),
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
