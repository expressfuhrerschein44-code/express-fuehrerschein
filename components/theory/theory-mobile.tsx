import {
  ContinueLearningCard,
} from "@/components/theory/continue-learning-card";
import {
  ExamSimulationCard,
} from "@/components/theory/exam-simulation-card";
import {
  TheoryHeader,
} from "@/components/theory/theory-header";
import {
  TheoryProgressCard,
} from "@/components/theory/theory-progress-card";
import {
  TheoryRecommendationCard,
} from "@/components/theory/theory-recommendation-card";
import {
  TheoryTopicsSection,
} from "@/components/theory/theory-topics-section";

import type {
  TheoryExamRuleView,
  TheoryOverviewData,
} from "@/types/theory";

export interface TheoryMobileProps {
  data: TheoryOverviewData;
  examRules?: readonly TheoryExamRuleView[];
}

function formatMinutes(
  minutes: number,
): string {
  const safe = Math.max(0, minutes);
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;

  return hours > 0
    ? `${hours}h ${rest.toString().padStart(2, "0")}m`
    : `${rest} Min`;
}

export function TheoryMobile({
  data,
  examRules = [],
}: TheoryMobileProps) {
  return (
    <div className="lg:hidden">
      <TheoryHeader />

      <TheoryProgressCard
        progress={data.progress}
        compact
      />

      <section
        aria-label="Lernstatistik"
        className="mt-3 grid grid-cols-3 divide-x divide-[#E7ECF3] rounded-[16px] border border-[#E5EAF2] bg-white px-2 py-4"
      >
        <div className="px-2">
          <p className="text-[8px] text-[#748398]">Gelernt</p>
          <p className="mt-1 text-[12px] font-extrabold text-[#081529]">
            {data.statistics.uniqueQuestionsLearned}
            <span className="ml-1 text-[8px] font-semibold text-[#718094]">
              / {data.statistics.activeQuestions}
            </span>
          </p>
        </div>

        <div className="px-3">
          <p className="text-[8px] text-[#748398]">Richtig</p>
          <p className="mt-1 text-[12px] font-extrabold text-[#081529]">
            {data.statistics.correctAttempts}
          </p>
        </div>

        <div className="px-3">
          <p className="text-[8px] text-[#748398]">Lernzeit</p>
          <p className="mt-1 text-[12px] font-extrabold text-[#081529]">
            {formatMinutes(data.statistics.totalStudyMinutes)}
          </p>
        </div>
      </section>

      <div className="mt-3">
        <TheoryTopicsSection
          topics={data.topics}
          mobile
        />
      </div>

      <div className="mt-3">
        <ContinueLearningCard item={data.continueLearning} />
      </div>

      <div className="mt-3">
        <ExamSimulationCard rules={examRules} />
      </div>

      {data.recommendations.length > 0 ? (
        <section
          aria-labelledby="theory-mobile-recommendations"
          className="mt-3 rounded-[16px] border border-[#E5EAF2] bg-white p-4"
        >
          <h2
            id="theory-mobile-recommendations"
            className="text-[13px] font-extrabold text-[#081529]"
          >
            Für dich empfohlen
          </h2>

          <div className="mt-3 space-y-2">
            {data.recommendations.slice(0, 2).map((recommendation) => (
              <TheoryRecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
