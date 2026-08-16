import {
  BadgeCheck,
  CarFront,
} from "lucide-react";

import type {
  AdminPraxisLicenseClassView,
} from "@/types/admin-praxis";

export interface AdminPraxisLicenseCardProps {
  licenseClass:
    AdminPraxisLicenseClassView | null;
}

export function AdminPraxisLicenseCard({
  licenseClass,
}: AdminPraxisLicenseCardProps) {
  return (
    <section className="rounded-[18px] border border-[#E3E9F2] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.03)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#EEF5FF] text-[#0B63F6]">
          <CarFront
            aria-hidden="true"
            className="h-4.5 w-4.5"
          />
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#7A899C]">
            Führerscheinklasse
          </p>

          <h2 className="mt-1 text-[15px] font-black text-[#0A172A]">
            {licenseClass
              ? `Klasse ${licenseClass.code}`
              : "Keine Klasse zugeordnet"}
          </h2>
        </div>
      </div>

      {licenseClass ? (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-[#EDF1F6] pt-4">
          <span className="rounded-full bg-[#F2F5F9] px-2.5 py-1.5 text-[9px] font-black text-[#66758A]">
            Status:{" "}
            {
              licenseClass.status
            }
          </span>

          {licenseClass.isPrimary ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[9px] font-black text-emerald-700">
              <BadgeCheck
                aria-hidden="true"
                className="h-3 w-3"
              />
              Primäre Klasse
            </span>
          ) : null}
        </div>
      ) : (
        <p className="mt-4 text-[10px] font-medium leading-5 text-[#718096]">
          Dieser Praxistermin ist aktuell keiner Führerscheinklasse zugeordnet.
        </p>
      )}
    </section>
  );
}

export default AdminPraxisLicenseCard;
