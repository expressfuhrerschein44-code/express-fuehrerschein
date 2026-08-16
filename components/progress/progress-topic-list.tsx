import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
} from "lucide-react";

import type {
  ProgressTopicView,
} from "@/types/progress";

export interface ProgressTopicListProps {
  topics:
    readonly ProgressTopicView[];
}

export function ProgressTopicList({
  topics,
}: ProgressTopicListProps) {
  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Themen
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Fortschritt nach Thema
        </h2>

        <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
          Sieh auf einen Blick, welche Themen bereits sicher sitzen und wo noch Übung sinnvoll ist.
        </p>
      </div>

      {topics.length ? (
        <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {topics.map(
            (
              topic,
            ) => (
              <Link
                key={
                  topic.id
                }
                href={`/theorie/${encodeURIComponent(topic.slug)}`}
                className="rounded-[16px] border border-[#E7ECF3] bg-white p-4 transition hover:border-[#C9D9F2] hover:shadow-[0_8px_22px_rgba(17,40,70,0.05)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[11px] font-extrabold text-[#081529] sm:text-[12px]">
                      {topic.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[8px] font-bold text-[#6D7C90]">
                      <span>
                        {topic.answeredQuestions} / {topic.questionCount} Fragen
                      </span>

                      <span aria-hidden="true">
                        •
                      </span>

                      <span>
                        {topic.correctAnswers} richtig
                      </span>

                      {topic.incorrectAnswers >
                      0 ? (
                        <>
                          <span aria-hidden="true">
                            •
                          </span>
                          <span>
                            {topic.incorrectAnswers} falsch
                          </span>
                        </>
                      ) : null}
                    </div>

                    <div
                      className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#E9EEF5]"
                      role="progressbar"
                      aria-label={`Fortschritt ${topic.title}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={topic.progressPercent}
                    >
                      <div
                        className="h-full rounded-full bg-[#0B63F6]"
                        style={{
                          width:
                            `${topic.progressPercent}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[14px] font-black text-[#081529]">
                      {topic.progressPercent} %
                    </p>

                    <span className="mt-2 inline-flex items-center gap-1 text-[8px] font-extrabold text-[#0B63F6]">
                      Öffnen
                      <ArrowRight
                        className="h-3 w-3"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ),
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-[16px] border border-dashed border-[#D7E0EB] bg-[#F8FAFD] px-5 py-8 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#7E8DA1] shadow-[0_5px_16px_rgba(17,40,70,0.05)]">
            <BookOpen
              className="h-4.5 w-4.5"
              aria-hidden="true"
            />
          </span>

          <p className="mt-3 text-[11px] font-extrabold text-[#34445A]">
            Noch keine Themenfortschritte
          </p>

          <p className="mx-auto mt-1 max-w-[340px] text-[9px] font-medium leading-4 text-[#8491A3]">
            Sobald du mit Theorie und Training beginnst, werden deine Fortschritte hier angezeigt.
          </p>
        </div>
      )}
    </section>
  );
}
