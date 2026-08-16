import Link from "next/link";

import {
  ArrowRight,
  Timer,
} from "lucide-react";

import {
  AdminTheoryStatusBadge,
} from "@/components/admin/theory/admin-theory-status-badge";

import type {
  AdminTheoryExamView,
} from "@/types/admin-theory";

export function AdminTheoryExamsTable({
  exams,
}: {
  exams: AdminTheoryExamView[];
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#E1E8F2] bg-white">
      <div className="border-b border-[#E8EDF4] px-4 py-3">
        <h2 className="text-[12px] font-black text-[#071426]">
          Prüfungskonfigurationen
        </h2>
      </div>

      <div className="divide-y divide-[#EDF1F6]">
        {exams.length === 0 ? (
          <p className="px-4 py-10 text-center text-[11px] font-semibold text-[#91A0B2]">
            Noch keine Prüfungskonfigurationen vorhanden.
          </p>
        ) : exams.map((exam) => (
          <div
            key={exam.id}
            className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_140px_140px_auto] lg:items-center"
          >
            <div>
              <p className="text-[8px] font-black uppercase tracking-[0.08em] text-[#0B63F6]">
                {exam.countryCode} · Klasse {exam.licenseClassCode}
              </p>
              <p className="mt-1 text-[12px] font-black text-[#12243B]">
                {exam.programCode} · Version {exam.version}
              </p>
              <p className="mt-1 flex items-center gap-2 text-[8px] font-semibold text-[#91A0B2]">
                <span>{exam.questionCount} Fragen</span>
                <span className="inline-flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {Math.round(exam.durationSeconds / 60)} Min.
                </span>
                <span>{exam.attempts} Versuche</span>
              </p>
            </div>

            <span className="text-[9px] font-bold text-[#62748A]">
              {exam.scoringMethod}
            </span>

            <AdminTheoryStatusBadge status={exam.status} />

            <Link
              href={`/admin/theorie/pruefungen/${exam.id}`}
              className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-[#DCE5F0] px-3 text-[9px] font-extrabold text-[#0B63F6]"
            >
              Öffnen
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
