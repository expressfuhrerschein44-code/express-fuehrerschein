import {
  AlertCircle,
} from "lucide-react";

import {
  TrainingHeader,
} from "@/components/training/training-header";

import {
  TrainingModes,
} from "@/components/training/training-modes";

import {
  TrainingOverview,
} from "@/components/training/training-overview";

import {
  TrainingTopicList,
} from "@/components/training/training-topic-list";

import type {
  TrainingPageData,
} from "@/types/training";

export interface TrainingPageProps {
  data:
    TrainingPageData;
}

export function TrainingPage({
  data,
}: TrainingPageProps) {
  const ready =
    data.status ===
    "ready";

  const statusMessage =
    data.status ===
    "no_active_license_class"
      ? "Für das Training ist noch keine aktive Führerscheinklasse verfügbar."
      : data.status ===
          "no_published_program"
        ? "Für deine Führerscheinklasse ist aktuell kein veröffentlichtes Theorieprogramm verfügbar."
        : null;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <TrainingHeader
        status={data.status}
        licenseClassCode={
          data.licenseClassCode
        }
      />

      <div className="mt-4">
        <TrainingOverview
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

      <div className="mt-5">
        <TrainingModes
          ready={ready}
          needsReviewCount={
            data.overview
              .needsReviewCount
          }
        />
      </div>

      <div className="mt-5">
        <TrainingTopicList
          topics={data.topics}
          ready={ready}
        />
      </div>
    </main>
  );
}
