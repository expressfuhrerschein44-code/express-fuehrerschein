/**
 * Express-Führerschein
 * Complete desktop dashboard composition.
 *
 * Same real DashboardData as mobile.
 * No Prisma access occurs inside this component.
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

import {
  DashboardTrustStrip,
} from "@/components/dashboard/trust/dashboard-trust-strip";

import type {
  DashboardData,
} from "@/types/dashboard";


export interface DashboardDesktopProps {
  data:
    DashboardData;
}


export function DashboardDesktop({
  data,
}: DashboardDesktopProps) {

  return (
    <div className="hidden lg:block">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-6 xl:px-7">
        <section
          aria-label="Dashboard Übersicht"
          className="grid grid-cols-4 gap-4"
        >
          <OverallProgressCard
            data={data.overview.progress}
          />

          <ExamReadinessCard
            data={data.overview.readiness}
          />

          <CorrectAnswersCard
            data={data.overview.answers}
          />

          <ExamSimulationsCard
            data={data.overview.exams}
          />
        </section>

        <div className="mt-5 grid grid-cols-[minmax(0,2fr)_minmax(280px,0.8fr)] gap-4">
          <div className="space-y-4">
            <TwentyOneDayProgram
              data={data.program}
            />

            <TodayForYouCard
              tasks={data.today}
            />

            <TopicProgressCard
              topics={data.topics.slice(0, 5)}
            />

            <RecentlyTrainedCard
              items={data.recentTraining}
            />
          </div>

          <div className="space-y-4">
            <ApplicationStatusCard
              application={
                data
                  .drivingLicenseApplication
              }
            />

            <NextAppointmentCard
              appointment={data.nextAppointment}
              timezone={data.user.timezone}
            />

            <QuickAccessCard
              items={data.quickAccess}
            />

            <PerformanceOverviewCard
              data={data.overview.answers}
            />
          </div>
        </div>

        <DashboardTrustStrip
          className="mt-4"
        />
      </div>
    </div>
  );
}
