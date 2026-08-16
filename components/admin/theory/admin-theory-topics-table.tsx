import Link from "next/link";

import {
  ArrowRight,
  CircleCheck,
  CircleOff,
} from "lucide-react";

import type {
  AdminTheoryTopicView,
} from "@/types/admin-theory";

export function AdminTheoryTopicsTable({
  topics,
}: {
  topics: AdminTheoryTopicView[];
}) {
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#E1E8F2] bg-white">
      <div className="border-b border-[#E8EDF4] px-4 py-3">
        <h2 className="text-[12px] font-black text-[#071426]">
          Themen
        </h2>
        <p className="mt-0.5 text-[9px] font-semibold text-[#91A0B2]">
          {topics.length} Einträge
        </p>
      </div>

      {topics.length === 0 ? (
        <p className="px-4 py-10 text-center text-[11px] font-semibold text-[#91A0B2]">
          Noch keine Themen vorhanden.
        </p>
      ) : (
        <div className="divide-y divide-[#EDF1F6]">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#EEF4FF] px-2 py-1 text-[8px] font-black text-[#0B63F6]">
                    {topic.countryCode} · Klasse {topic.licenseClassCode}
                  </span>
                  <span className="text-[8px] font-bold text-[#91A0B2]">
                    Reihenfolge {topic.sortOrder}
                  </span>
                </div>

                <p className="mt-2 text-[12px] font-black text-[#12243B]">
                  {topic.title}
                </p>

                <p className="mt-1 line-clamp-2 text-[9px] font-medium leading-4 text-[#718096]">
                  {topic.description || topic.slug}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-[8px] font-bold text-[#718096]">
                  <span>{topic.counts.lessons} Lektionen</span>
                  <span>{topic.counts.questions} Fragen</span>
                  <span className="inline-flex items-center gap-1">
                    {topic.isActive ? (
                      <CircleCheck className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <CircleOff className="h-3 w-3 text-slate-400" />
                    )}
                    {topic.isActive ? "Aktiv" : "Inaktiv"}
                  </span>
                </div>
              </div>

              <Link
                href={`/admin/theorie/themen/${topic.id}`}
                className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-[#DCE5F0] px-3 text-[9px] font-extrabold text-[#0B63F6]"
              >
                Öffnen
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
