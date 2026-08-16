"use client";

import Link from "next/link";

import {
  TheoryTopicCard,
} from "@/components/theory/theory-topic-card";

import type {
  TheoryTopicView,
} from "@/types/theory";

export interface TheoryTopicsSectionProps {
  topics: readonly TheoryTopicView[];
  mobile?: boolean;
}

export function TheoryTopicsSection({
  topics,
  mobile = false,
}: TheoryTopicsSectionProps) {
  return (
    <section
      aria-labelledby="theory-topics-title"
      className="rounded-[16px] border border-[#E5EAF2] bg-white p-4 shadow-[0_8px_24px_rgba(17,40,70,0.04)] lg:p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <h2
          id="theory-topics-title"
          className="text-[13px] font-extrabold text-[#081529]"
        >
          Themenbereiche
        </h2>

        <Link
          href="/theorie"
          className="text-[9px] font-extrabold text-[#0B63F6] transition hover:text-[#084EC2]"
        >
          Alle Themen anzeigen
        </Link>
      </div>

      {topics.length === 0 ? (
        <div className="mt-4 rounded-xl bg-[#F7F9FC] px-4 py-8 text-center">
          <p className="text-[11px] font-extrabold text-[#081529]">
            Noch keine Themen verfügbar.
          </p>
          <p className="mt-1 text-[9px] text-[#66758A]">
            Sobald dein Theorieprogramm freigeschaltet ist, erscheinen die Themen hier.
          </p>
        </div>
      ) : mobile ? (
        <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="snap-start"
            >
              <TheoryTopicCard
                topic={topic}
                compact
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <TheoryTopicCard
              key={topic.id}
              topic={topic}
            />
          ))}
        </div>
      )}
    </section>
  );
}
