import {
  ContinueLearningCard,
} from "@/components/theory/continue-learning-card";
import {
  ExamReadinessCard,
} from "@/components/theory/exam-readiness-card";
import {
  ExamSimulationCard,
} from "@/components/theory/exam-simulation-card";
import {
  NextExamCard,
} from "@/components/theory/next-exam-card";
import {
  QuickAccessCard,
} from "@/components/theory/quick-access-card";
import {
  TheoryHeader,
} from "@/components/theory/theory-header";
import {
  TheoryPartnersStrip,
} from "@/components/theory/theory-partners-strip";
import {
  TheoryProgressCard,
} from "@/components/theory/theory-progress-card";
import {
  TheoryRecommendationCard,
} from "@/components/theory/theory-recommendation-card";
import {
  TheoryStatisticsCard,
} from "@/components/theory/theory-statistics-card";
import {
  TheoryTipsCard,
} from "@/components/theory/theory-tips-card";
import {
  TheoryTopicsSection,
} from "@/components/theory/theory-topics-section";

import type {
  TheoryExamRuleView,
  TheoryOverviewData,
} from "@/types/theory";

export interface TheoryDesktopProps {
  data: TheoryOverviewData;
  examRules?: readonly TheoryExamRuleView[];
}

export function TheoryDesktop({
  data,
  examRules = [],
}: TheoryDesktopProps) {
  return (
    <div className="hidden lg:block">
      <TheoryHeader />

      <div className="grid grid-cols-4 gap-3">
        <TheoryProgressCard progress={data.progress} />
        <TheoryStatisticsCard statistics={data.statistics} />
        <ExamReadinessCard readiness={data.readiness} />
        <NextExamCard recommendation={data.nextExamRecommendation ?? null} />
      </div>

      <div className="mt-3">
        <TheoryTopicsSection topics={data.topics} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <ContinueLearningCard item={data.continueLearning} />
        <QuickAccessCard />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <ExamSimulationCard rules={examRules} />

        <div className="grid gap-3">
          <TheoryTipsCard />

          {data.recommendations[0] ? (
            <TheoryRecommendationCard
              recommendation={data.recommendations[0]}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        <TheoryPartnersStrip />
      </div>
    </div>
  );
}
