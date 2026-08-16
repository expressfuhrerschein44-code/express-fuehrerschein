import Link from "next/link";

import {
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";

import {
  AdminTheoryStatusBadge,
} from "@/components/admin/theory/admin-theory-status-badge";

import type {
  AdminTheoryQuestionView,
} from "@/types/admin-theory";

export function AdminTheoryQuestionsTable({
  questions,
}: {
  questions: AdminTheoryQuestionView[];
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#E1E8F2] bg-white">
      <div className="border-b border-[#E8EDF4] px-4 py-3">
        <h2 className="text-[12px] font-black text-[#071426]">
          Fragen
        </h2>
        <p className="mt-0.5 text-[9px] font-semibold text-[#91A0B2]">
          {questions.length} Einträge
        </p>
      </div>

      <div className="divide-y divide-[#EDF1F6]">
        {questions.length === 0 ? (
          <p className="px-4 py-10 text-center text-[11px] font-semibold text-[#91A0B2]">
            Noch keine Fragen vorhanden.
          </p>
        ) : questions.map((question) => (
          <div
            key={question.id}
            className="grid gap-3 px-4 py-4 xl:grid-cols-[1fr_150px_120px_120px_auto] xl:items-center"
          >
            <div className="min-w-0">
              <p className="text-[8px] font-bold text-[#0B63F6]">
                {question.programCode} · {question.topicTitle}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] font-black leading-4 text-[#12243B]">
                {question.prompt}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-3 text-[8px] font-semibold text-[#91A0B2]">
                <span>Version {question.version}</span>
                <span>{question.penaltyPoints} Fehlerpunkte</span>
                <span>{question.counts.answers} Fortschrittsdatensätze</span>
                <span>{question.counts.reports} Meldungen</span>
                {question.mediaStoragePath ? (
                  <span className="inline-flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    Medium
                  </span>
                ) : null}
              </div>
            </div>

            <span className="text-[9px] font-bold text-[#62748A]">
              {question.questionType}
            </span>

            <span className="text-[9px] font-bold text-[#62748A]">
              {question.difficulty}
            </span>

            <AdminTheoryStatusBadge status={question.status} />

            <Link
              href={`/admin/theorie/fragen/${question.id}`}
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
