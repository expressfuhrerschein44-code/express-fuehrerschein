import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import type {
  AdminTheoryCandidateView,
} from "@/types/admin-theory";

export function AdminTheoryCandidatesTable({
  candidates,
}: {
  candidates: AdminTheoryCandidateView[];
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#E1E8F2] bg-white">
      <div className="border-b border-[#E8EDF4] px-4 py-3">
        <h2 className="text-[12px] font-black text-[#071426]">
          Kandidatenfortschritt
        </h2>
      </div>

      <div className="divide-y divide-[#EDF1F6]">
        {candidates.length === 0 ? (
          <p className="px-4 py-10 text-center text-[11px] font-semibold text-[#91A0B2]">
            Keine Kandidaten gefunden.
          </p>
        ) : candidates.map((candidate) => (
          <div
            key={candidate.userLicenseClassId}
            className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_130px_140px_140px_auto] lg:items-center"
          >
            <div>
              <p className="text-[12px] font-black text-[#12243B]">
                {candidate.fullName}
              </p>
              <p className="mt-0.5 text-[8px] font-semibold text-[#91A0B2]">
                {candidate.email} · {candidate.countryCode}
              </p>
            </div>

            <span className="rounded-lg bg-[#EEF4FF] px-2 py-1.5 text-center text-[9px] font-black text-[#0B63F6]">
              Klasse {candidate.licenseClassCode}
            </span>

            <div>
              <p className="text-[8px] font-bold text-[#91A0B2]">Bereitschaft</p>
              <p className="mt-0.5 text-[13px] font-black text-[#12243B]">
                {candidate.progress.readinessScore} %
              </p>
            </div>

            <div className="text-[8px] font-semibold text-[#62748A]">
              {candidate.metrics.lessonsCompleted} Lektionen · {candidate.metrics.questionsNeedsReview} Fehlerfragen
            </div>

            <Link
              href={`/admin/theorie/kandidaten/${candidate.userLicenseClassId}`}
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
