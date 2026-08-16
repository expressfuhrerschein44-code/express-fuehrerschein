import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import {
  AdminTheoryStatusBadge,
} from "@/components/admin/theory/admin-theory-status-badge";

import type {
  AdminTheoryProgramView,
} from "@/types/admin-theory";

export function AdminTheoryProgramsTable({
  programs,
}: {
  programs: AdminTheoryProgramView[];
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#E1E8F2] bg-white">
      <div className="border-b border-[#E8EDF4] px-4 py-3">
        <h2 className="text-[12px] font-black text-[#071426]">
          Theorieprogramme
        </h2>
        <p className="mt-0.5 text-[9px] font-semibold text-[#91A0B2]">
          {programs.length} Einträge
        </p>
      </div>

      {programs.length === 0 ? (
        <p className="px-4 py-10 text-center text-[11px] font-semibold text-[#91A0B2]">
          Noch keine Theorieprogramme vorhanden.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#F7F9FC] text-[9px] font-black uppercase tracking-[0.08em] text-[#718096]">
              <tr>
                <th className="px-4 py-3">Programm</th>
                <th className="px-4 py-3">Land</th>
                <th className="px-4 py-3">Klasse</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Inhalt</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aktion</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EDF1F6]">
              {programs.map((program) => (
                <tr key={program.id} className="text-[10px] text-[#40546D]">
                  <td className="px-4 py-3.5">
                    <p className="font-black text-[#12243B]">
                      {program.code}
                    </p>
                    {program.isCurrent ? (
                      <p className="mt-0.5 text-[8px] font-extrabold text-[#0B63F6]">
                        Aktuelle Version
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3.5 font-bold">
                    {program.countryCode}
                  </td>
                  <td className="px-4 py-3.5 font-bold">
                    {program.licenseClassCode}
                  </td>
                  <td className="px-4 py-3.5">
                    {program.version}
                  </td>
                  <td className="px-4 py-3.5 text-[9px] text-[#718096]">
                    {program.counts.topics} Themen · {program.counts.lessons} Lektionen · {program.counts.questions} Fragen
                  </td>
                  <td className="px-4 py-3.5">
                    <AdminTheoryStatusBadge status={program.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/admin/theorie/programme/${program.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#DCE5F0] px-3 py-2 text-[9px] font-extrabold text-[#0B63F6]"
                    >
                      Öffnen
                      <ArrowRight className="h-3 w-3" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
