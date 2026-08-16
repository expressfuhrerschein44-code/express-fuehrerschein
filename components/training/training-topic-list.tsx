import {
  BookOpen,
} from "lucide-react";

import {
  TrainingTopicCard,
} from "@/components/training/training-topic-card";

import type {
  TrainingTopicView,
} from "@/types/training";

export interface TrainingTopicListProps {
  topics:
    readonly TrainingTopicView[];
  ready:
    boolean;
}

export function TrainingTopicList({
  topics,
  ready,
}: TrainingTopicListProps) {
  return (
    <section className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5 lg:p-6">
      <div>
        <p className="text-[9px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
          Themen
        </p>

        <h2 className="mt-1 text-[17px] font-black tracking-[-0.02em] text-[#081529]">
          Nach Thema trainieren
        </h2>

        <p className="mt-1.5 text-[10px] font-medium leading-4 text-[#718096]">
          Wähle ein Thema und starte direkt ein gezieltes Fragentraining.
        </p>
      </div>

      {topics.length ? (
        <div className="mt-5 grid grid-cols-1 gap-3 xl:grid-cols-2">
          {topics.map(
            (
              topic,
            ) => (
              <TrainingTopicCard
                key={topic.id}
                topic={topic}
                ready={ready}
              />
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
            Noch keine Trainingsthemen verfügbar
          </p>

          <p className="mx-auto mt-1 max-w-[340px] text-[9px] font-medium leading-4 text-[#8491A3]">
            Sobald ein veröffentlichtes Theorieprogramm für deine Führerscheinklasse verfügbar ist, erscheinen die Themen hier.
          </p>
        </div>
      )}
    </section>
  );
}
