import {
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export function AdminPaymentsHeader() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0B63F6]">
          <CreditCard className="h-5 w-5" aria-hidden="true" />
        </div>

        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#0B63F6]">
            Administration financière
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.03em] text-slate-950">
            Paiements
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Créez les étapes, contrôlez les preuves et validez les paiements clients.
          </p>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 sm:self-auto">
        <ShieldCheck className="h-4 w-4 text-[#0B63F6]" aria-hidden="true" />
        Validation réservée à l’administration
      </div>
    </div>
  );
}
