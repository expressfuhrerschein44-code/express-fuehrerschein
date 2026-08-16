import Link from "next/link";

import {
  ArrowRight,
  BookOpenCheck,
} from "lucide-react";

import type {
  TrainingTopicView,
} from "@/types/training";

export interface TrainingTopicCardProps {
  topic:
    TrainingTopicView;
  ready:
    boolean;
}

export function TrainingTopicCard({
  topic,
  ready,
}: TrainingTopicCardProps) {
  const canTrain =
    ready &&
    topic.questionCount >
      0;

  const cardContent = (
    <>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
          <BookOpenCheck
            className="h-4 w-4"
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[11px] font-extrabold text-[#081529] sm:text-[12px]">
            {topic.title}
          </h3>

          {topic.description ? (
            <p className="mt-1 line-clamp-2 text-[9px] font-medium leading-4 text-[#758499]">
              {topic.description}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[8px] font-bold text-[#6D7C90]">
            <span>
              {topic.questionCount} Fragen
            </span>

            <span aria-hidden="true">
              •
            </span>

            <span>
              {topic.progressPercent} % Fortschritt
            </span>
          </div>

          <div
            className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#E9EEF5]"
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
      </div>

      <span className="ml-3 flex shrink-0 items-center gap-1 text-[8px] font-extrabold text-[#0B63F6]">
        Trainieren
        <ArrowRight
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
      </span>
    </>
  );

  if (!canTrain) {
    return (
      <div
        aria-disabled="true"
        className="flex items-center rounded-[16px] border border-[#E7ECF3] bg-white p-4 opacity-55"
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link
      href={`/theorie/uebungen?mode=topic&topic=${encodeURIComponent(topic.id)}`}
      className="flex items-center rounded-[16px] border border-[#E7ECF3] bg-white p-4 transition hover:border-[#C9D9F2] hover:shadow-[0_8px_22px_rgba(17,40,70,0.05)]"
    >
      {cardContent}
    </Link>
  );
}
