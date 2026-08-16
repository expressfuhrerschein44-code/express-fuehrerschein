import {
  BarChart3,
  GraduationCap,
} from "lucide-react";

import type {
  ProgressPageStatus,
} from "@/types/progress";

export interface ProgressHeaderProps {
  status:
    ProgressPageStatus;
  licenseClassCode:
    string | null;
}

export function ProgressHeader({
  status,
  licenseClassCode,
}: ProgressHeaderProps) {
  return (
    <header className="overflow-hidden rounded-[22px] border border-[#E5EAF2] bg-white shadow-[0_12px_34px_rgba(17,40,70,0.05)]">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FF] px-3 py-1.5 text-[10px] font-extrabold text-[#0B63F6]">
              <BarChart3
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              Fortschritt
            </span>

            {licenseClassCode ? (
              <span className="rounded-full border border-[#DFE7F1] bg-[#F8FAFD] px-3 py-1.5 text-[10px] font-extrabold text-[#34445A]">
                Klasse {licenseClassCode}
              </span>
            ) : null}
          </div>

          <h1 className="mt-4 text-[24px] font-black tracking-[-0.03em] text-[#081529] sm:text-[28px]">
            Dein Fortschritt
          </h1>

          <p className="mt-2 max-w-[680px] text-[12px] font-medium leading-5 text-[#66758A] sm:text-[13px]">
            Verfolge deine Lernentwicklung, Trainingsleistung und Prüfungsvorbereitung an einem Ort.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-[16px] border border-[#E7EDF5] bg-[#F8FAFD] px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#0B63F6] shadow-[0_4px_14px_rgba(17,40,70,0.06)]">
            <GraduationCap
              className="h-4.5 w-4.5"
              aria-hidden="true"
            />
          </span>

          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-[0.06em] text-[#718096]">
              Lernstatus
            </p>

            <p className="mt-0.5 text-[10px] font-extrabold text-[#081529]">
              {status === "ready"
                ? "Fortschritt aktiv"
                : status === "no_active_license_class"
                  ? "Keine aktive Führerscheinklasse"
                  : "Kein veröffentlichtes Theorieprogramm"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
