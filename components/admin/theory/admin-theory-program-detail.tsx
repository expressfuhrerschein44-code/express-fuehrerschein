import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  CircleHelp,
  FileText,
} from "lucide-react";

import {
  AdminTheoryProgramForm,
} from "@/components/admin/theory/admin-theory-program-form";

import {
  AdminTheoryStatusBadge,
} from "@/components/admin/theory/admin-theory-status-badge";

import type {
  AdminTheoryPageData,
  AdminTheoryProgramView,
} from "@/types/admin-theory";

export function AdminTheoryProgramDetail({
  program,
  pageData,
}: {
  program: AdminTheoryProgramView;
  pageData: AdminTheoryPageData;
}) {
  const topics =
    pageData.topics.filter(
      (row) => row.programId === program.id,
    );
  const exams =
    pageData.exams.filter(
      (row) => row.programId === program.id,
    );

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 py-6 lg:px-6">
      <Link
        href="/admin/theorie"
        className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#60738A]"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Theorieverwaltung
      </Link>

      <section className="mt-4 rounded-[22px] border border-[#E1E8F2] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#0B63F6]">
              {program.countryCode} · Klasse {program.licenseClassCode}
            </p>
            <h1 className="mt-1 text-[24px] font-black tracking-[-0.04em] text-[#071426]">
              {program.code}
            </h1>
            <p className="mt-1 text-[10px] font-semibold text-[#718096]">
              Version {program.version}
            </p>
          </div>
          <AdminTheoryStatusBadge status={program.status} />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Themen", value: program.counts.topics, icon: BookOpen },
            { label: "Lektionen", value: program.counts.lessons, icon: FileText },
            { label: "Fragen", value: program.counts.questions, icon: CircleHelp },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-[#E5EBF3] bg-[#F8FAFD] p-4"
              >
                <Icon className="h-4 w-4 text-[#0B63F6]" />
                <p className="mt-2 text-[9px] font-bold text-[#718096]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[20px] font-black text-[#071426]">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-4">
        <AdminTheoryProgramForm program={program} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="rounded-[18px] border border-[#E1E8F2] bg-white p-5">
          <h2 className="text-[12px] font-black text-[#071426]">
            Themen dieses Programms
          </h2>
          <div className="mt-3 space-y-2">
            {topics.length ? topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/admin/theorie/themen/${topic.id}`}
                className="block rounded-xl border border-[#E6EBF2] px-3 py-3"
              >
                <p className="text-[10px] font-black text-[#12243B]">
                  {topic.title}
                </p>
                <p className="mt-1 text-[8px] font-semibold text-[#91A0B2]">
                  {topic.counts.lessons} Lektionen · {topic.counts.questions} Fragen
                </p>
              </Link>
            )) : (
              <p className="text-[10px] font-semibold text-[#91A0B2]">
                Noch keine Themen.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[18px] border border-[#E1E8F2] bg-white p-5">
          <h2 className="text-[12px] font-black text-[#071426]">
            Prüfungskonfigurationen
          </h2>
          <div className="mt-3 space-y-2">
            {exams.length ? exams.map((exam) => (
              <Link
                key={exam.id}
                href={`/admin/theorie/pruefungen/${exam.id}`}
                className="block rounded-xl border border-[#E6EBF2] px-3 py-3"
              >
                <p className="text-[10px] font-black text-[#12243B]">
                  Version {exam.version}
                </p>
                <p className="mt-1 text-[8px] font-semibold text-[#91A0B2]">
                  {exam.questionCount} Fragen · {Math.round(exam.durationSeconds / 60)} Min.
                </p>
              </Link>
            )) : (
              <p className="text-[10px] font-semibold text-[#91A0B2]">
                Noch keine Prüfungen.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
