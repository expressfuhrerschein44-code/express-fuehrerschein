import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import {
  AdminTheoryStatusBadge,
} from "@/components/admin/theory/admin-theory-status-badge";

import type {
  AdminTheoryLessonView,
} from "@/types/admin-theory";

export function AdminTheoryLessonsTable({
  lessons,
}: {
  lessons: AdminTheoryLessonView[];
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#E1E8F2] bg-white">
      <div className="border-b border-[#E8EDF4] px-4 py-3">
        <h2 className="text-[12px] font-black text-[#071426]">
          Lektionen
        </h2>
        <p className="mt-0.5 text-[9px] font-semibold text-[#91A0B2]">
          {lessons.length} Einträge
        </p>
      </div>

      <div className="divide-y divide-[#EDF1F6]">
        {lessons.length === 0 ? (
          <p className="px-4 py-10 text-center text-[11px] font-semibold text-[#91A0B2]">
            Noch keine Lektionen vorhanden.
          </p>
        ) : lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="grid gap-3 px-4 py-4 lg:grid-cols-[1fr_150px_140px_auto] lg:items-center"
          >
            <div>
              <p className="text-[9px] font-bold text-[#0B63F6]">
                {lesson.programCode} · {lesson.topicTitle}
              </p>
              <p className="mt-1 text-[12px] font-black text-[#12243B]">
                {lesson.title}
              </p>
              <p className="mt-1 text-[8px] font-semibold text-[#91A0B2]">
                Version {lesson.version} · {lesson.counts.blocks} Blöcke · {lesson.counts.learners} Lernende
              </p>
            </div>

            <div className="text-[9px] font-semibold text-[#62748A]">
              {lesson.estimatedDurationMinutes
                ? `${lesson.estimatedDurationMinutes} Min.`
                : "Keine Dauer"}
            </div>

            <AdminTheoryStatusBadge status={lesson.status} />

            <Link
              href={`/admin/theorie/lektionen/${lesson.id}`}
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
