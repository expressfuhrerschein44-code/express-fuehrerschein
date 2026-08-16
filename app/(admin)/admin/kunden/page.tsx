import {
  ShieldCheck,
} from "lucide-react";

export const dynamic =
  "force-dynamic";

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-5 lg:px-7 lg:py-7">
      <section className="rounded-[19px] border border-[#E3E8F0] bg-white p-5 shadow-[0_8px_26px_rgba(17,40,70,0.04)] sm:p-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FF] px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#0B63F6]">
          <ShieldCheck
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
          Admin-Bereich
        </span>

        <h1 className="mt-3 text-[22px] font-black tracking-[-0.03em] text-[#081529]">
          Kunden
        </h1>

        <p className="mt-2 max-w-[760px] text-[9px] font-medium leading-5 text-[#718096]">
          Kundenkonten, Führerscheinklassen und interne Kundennotizen verwalten.
        </p>

        <div className="mt-5 rounded-[14px] border border-[#E5EAF2] bg-[#F8FAFD] px-4 py-4">
          <p className="text-[8px] font-extrabold uppercase tracking-[0.05em] text-[#718096]">
            Datenquelle
          </p>

          <p className="mt-1 text-[9px] font-black text-[#26374D]">
            users
          </p>

          <p className="mt-2 text-[8px] font-medium leading-4 text-[#7D8A9B]">
            Die sichere Admin-Grundlage ist aktiv. Die konkreten Verwaltungsaktionen dieses Moduls werden als nächster Schritt direkt an diese bestehende Datenquelle angeschlossen.
          </p>
        </div>
      </section>
    </main>
  );
}
