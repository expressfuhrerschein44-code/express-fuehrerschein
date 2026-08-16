import {
  AlertCircle,
} from "lucide-react";

import {
  Progress21DayCard,
} from "@/components/progress/progress-21-day-card";

import {
  ProgressExamCard,
} from "@/components/progress/progress-exam-card";

import {
  ProgressHeader,
} from "@/components/progress/progress-header";

import {
  ProgressOverview,
} from "@/components/progress/progress-overview";

import {
  ProgressTheoryCard,
} from "@/components/progress/progress-theory-card";

import {
  ProgressTopicList,
} from "@/components/progress/progress-topic-list";

import {
  ProgressTrainingCard,
} from "@/components/progress/progress-training-card";

import type {
  ProgressPageData,
} from "@/types/progress";

export interface ProgressPageProps {
  data:
    ProgressPageData;
}

export function ProgressPage({
  data,
}: ProgressPageProps) {
  const statusMessage =
    data.status ===
    "no_active_license_class"
      ? "Für den Fortschritt ist noch keine aktive Führerscheinklasse verfügbar."
      : data.status ===
          "no_published_program"
        ? "Für deine Führerscheinklasse ist aktuell kein veröffentlichtes Theorieprogramm verfügbar."
        : null;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <ProgressHeader
        status={
          data.status
        }
        licenseClassCode={
          data.licenseClassCode
        }
      />

      <div className="mt-4">
        <ProgressOverview
          overview={
            data.overview
          }
        />
      </div>

      {statusMessage ? (
        <div
          role="status"
          className="mt-4 flex items-start gap-2.5 rounded-[14px] border border-[#F1D6A6] bg-[#FFF9EE] px-4 py-3"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#B7791F]"
            aria-hidden="true"
          />

          <p className="text-[9px] font-bold leading-4 text-[#8A6117]">
            {statusMessage}
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <Progress21DayCard
          currentDay={
            data.overview
              .currentDay
          }
          completedDays={
            data.overview
              .completedDays
          }
          totalDays={
            data.overview
              .totalDays
          }
          days={
            data.days
          }
        />

        <ProgressTheoryCard
          theory={
            data.theory
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProgressTrainingCard
          training={
            data.training
          }
        />

        <ProgressExamCard
          exam={
            data.exam
          }
        />
      </div>

      <div className="mt-4">
        <ProgressTopicList
          topics={
            data.topics
          }
        />
      </div>
    </main>
  );
}
