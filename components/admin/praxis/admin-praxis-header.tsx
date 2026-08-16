"use client";

import {
  CalendarPlus2,
  CarFront,
  RefreshCw,
} from "lucide-react";

export interface AdminPraxisHeaderProps {
  onCreate:
    () => void;
  onRefresh:
    () => void;
  refreshing?:
    boolean;
}

export function AdminPraxisHeader({
  onCreate,
  onRefresh,
  refreshing = false,
}: AdminPraxisHeaderProps) {
  return (
    <section className="flex flex-col gap-4 rounded-[22px] border border-[#E1E8F1] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.045)] sm:p-6 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EAF2FF] text-[#0B63F6]">
          <CarFront
            aria-hidden="true"
            className="h-5 w-5"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0B63F6]">
            Praxisverwaltung
          </p>

          <h1 className="mt-1 text-[24px] font-black tracking-[-0.035em] text-[#071426] sm:text-[28px]">
            Praxis
          </h1>

          <p className="mt-1 max-w-[720px] text-[11px] font-medium leading-5 text-[#6C7B90]">
            Fahrstunden planen, bestätigen und mit dem Kundenbereich synchron verwalten.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={
            onRefresh
          }
          disabled={
            refreshing
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[#DDE5EF] bg-white px-4 text-[11px] font-extrabold text-[#53647A] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            aria-hidden="true"
            className={[
              "h-4 w-4",
              refreshing
                ? "animate-spin"
                : "",
            ].join(
              " ",
            )}
          />
          Aktualisieren
        </button>

        <button
          type="button"
          onClick={
            onCreate
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0B63F6] px-4 text-[11px] font-black text-white shadow-[0_10px_28px_rgba(11,99,246,0.20)] transition hover:bg-[#075BE2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B63F6]/30 focus-visible:ring-offset-2"
        >
          <CalendarPlus2
            aria-hidden="true"
            className="h-4 w-4"
          />
          Fahrstunde planen
        </button>
      </div>
    </section>
  );
}

export default AdminPraxisHeader;
