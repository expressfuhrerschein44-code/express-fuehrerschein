"use client";

import {
  BookOpenCheck,
  Plus,
  RefreshCw,
} from "lucide-react";

export interface AdminTheoryHeaderProps {
  onRefresh: () => void;
  refreshing: boolean;
  onCreate?: () => void;
  canCreate?: boolean;
}

export function AdminTheoryHeader({
  onRefresh,
  refreshing,
  onCreate,
  canCreate = true,
}: AdminTheoryHeaderProps) {
  return (
    <section className="rounded-[22px] border border-[#E1E8F2] bg-white px-5 py-5 shadow-[0_14px_38px_rgba(15,35,65,0.05)] sm:px-6 lg:px-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EDF4FF] text-[#0B63F6]">
            <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#0B63F6]">
              Theorieverwaltung
            </p>
            <h1 className="mt-1 text-[26px] font-black tracking-[-0.04em] text-[#071426]">
              Theorie
            </h1>
            <p className="mt-1 max-w-[720px] text-[11px] font-medium leading-5 text-[#708096]">
              Programme, Themen, Lektionen, Fragen, Prüfungskonfigurationen und Lernfortschritt zentral verwalten.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#DCE5F0] bg-white px-4 text-[11px] font-extrabold text-[#52657B] transition hover:bg-[#F8FAFC] disabled:opacity-60"
          >
            <RefreshCw
              className={[
                "h-4 w-4",
                refreshing ? "animate-spin" : "",
              ].join(" ")}
              aria-hidden="true"
            />
            Aktualisieren
          </button>

          {canCreate && onCreate ? (
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#0B63F6] px-4 text-[11px] font-extrabold text-white shadow-[0_10px_24px_rgba(11,99,246,0.22)] transition hover:bg-[#075BE2]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Neu anlegen
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
