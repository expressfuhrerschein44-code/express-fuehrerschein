import {
  ShieldCheck,
  UsersRound,
} from "lucide-react";

interface AdminCustomersHeaderProps {
  total: number;
  generatedAt: string;
}

function formatGeneratedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(date);
}

export function AdminCustomersHeader({
  total,
  generatedAt,
}: AdminCustomersHeaderProps) {
  return (
    <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#0B63F6]">
            <UsersRound className="h-6 w-6" aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#0B63F6]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Zone d’administration
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Clients
            </h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
              Consultez les comptes clients, leurs permis, demandes, progression,
              rendez-vous, paiements et documents depuis les données existantes.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            {total.toLocaleString("fr-FR")} clients
          </span>
          <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            Mis à jour {formatGeneratedAt(generatedAt)}
          </span>
        </div>
      </div>
    </header>
  );
}
