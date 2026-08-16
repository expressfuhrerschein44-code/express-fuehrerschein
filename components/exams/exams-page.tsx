import {
  AlertCircle,
} from "lucide-react";

import {
  ExamHistoryList,
} from "@/components/exams/exam-history-list";

import {
  ExamStartCard,
} from "@/components/exams/exam-start-card";

import {
  ExamsHeader,
} from "@/components/exams/exams-header";

import {
  ExamsOverview,
} from "@/components/exams/exams-overview";

import type {
  ExamsPageData,
} from "@/types/exams";

export interface ExamsPageProps {
  data:
    ExamsPageData;
}

export function ExamsPage({
  data,
}: ExamsPageProps) {
  const trainingOnly =
    data.configuration
      ?.trainingOnly ??
    false;

  const statusMessage =
    data.status ===
    "no_active_license_class"
      ? "Für eine Prüfungssimulation ist noch keine aktive Führerscheinklasse verfügbar."
      : data.status ===
          "no_published_program"
        ? "Für deine Führerscheinklasse ist aktuell kein veröffentlichtes Theorieprogramm verfügbar."
        : data.status ===
            "no_exam_configuration"
          ? "Für deine Führerscheinklasse ist aktuell keine veröffentlichte Prüfungskonfiguration verfügbar."
          : null;

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <ExamsHeader
        status={data.status}
        licenseClassCode={
          data.licenseClassCode
        }
        trainingOnly={
          trainingOnly
        }
      />

      <div className="mt-4">
        <ExamsOverview
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

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <ExamStartCard
          configuration={
            data.configuration
          }
          activeAttemptId={
            data.activeAttemptId
          }
          disabled={
            data.status !==
            "ready"
          }
        />

        <ExamHistoryList
          history={
            data.history
          }
          trainingOnly={
            trainingOnly
          }
        />
      </div>
    </main>
  );
}
