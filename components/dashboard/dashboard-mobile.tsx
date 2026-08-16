/**
 * Express-Führerschein
 * Complete mobile dashboard composition.
 *
 * Same real DashboardData as desktop.
 */

import {
  NextAppointmentCard,
} from "@/components/dashboard/appointments/next-appointment-card";

import {
  ApplicationStatusCard,
} from "@/components/dashboard/application-status-card";

import {
  CorrectAnswersCard,
} from "@/components/dashboard/overview/correct-answers-card";

import {
  ExamReadinessCard,
} from "@/components/dashboard/overview/exam-readiness-card";

import {
  ExamSimulationsCard,
} from "@/components/dashboard/overview/exam-simulations-card";

import {
  OverallProgressCard,
} from "@/components/dashboard/overview/overall-progress-card";

import {
  PerformanceOverviewCard,
} from "@/components/dashboard/performance/performance-overview-card";

import {
  TwentyOneDayProgram,
} from "@/components/dashboard/program/twenty-one-day-program";

import {
  QuickAccessCard,
} from "@/components/dashboard/quick-access/quick-access-card";

import {
  RecentlyTrainedCard,
} from "@/components/dashboard/recent-training/recently-trained-card";

import {
  TodayForYouCard,
} from "@/components/dashboard/today/today-for-you-card";

import {
  TopicProgressCard,
} from "@/components/dashboard/topics/topic-progress-card";

import type {
  DashboardData,
} from "@/types/dashboard";


export interface DashboardMobileProps {
  data:
    DashboardData;
}


export function DashboardMobile({
  data,
}: DashboardMobileProps) {

  return (
    <div className="lg:hidden">
      <div className="space-y-3 px-3 py-4">
        <OverallProgressCard
          data={data.overview.progress}
          compact
        />

        <div className="grid grid-cols-2 gap-3">
          <ExamReadinessCard
            data={data.overview.readiness}
            compact
          />

          <CorrectAnswersCard
            data={data.overview.answers}
            compact
          />
        </div>

        <ExamSimulationsCard
          data={data.overview.exams}
          compact
        />

        <ApplicationStatusCard
          application={
            data
              .drivingLicenseApplication
          }
        />

        <TwentyOneDayProgram
          data={data.program}
          compact
        />

        <TodayForYouCard
          tasks={data.today}
          compact
        />

        <TopicProgressCard
          topics={data.topics.slice(0, 5)}
          compact
        />

        <RecentlyTrainedCard
          items={data.recentTraining}
          compact
        />

        <NextAppointmentCard
          appointment={data.nextAppointment}
          timezone={data.user.timezone}
          compact
        />

        <PerformanceOverviewCard
          data={data.overview.answers}
          compact
        />

        <QuickAccessCard
          items={data.quickAccess}
          compact
        />
      </div>
    </div>
  );
}
