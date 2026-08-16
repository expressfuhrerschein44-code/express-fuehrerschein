import "server-only";

import type {
  TheoryLearningProgressResult,
} from "@/lib/server/theory/learning-progress-service";

import type {
  TheoryOverviewRepositorySnapshot,
} from "@/lib/server/theory/theory-repository";

export interface ExamReadinessBreakdown {
  readinessPercent: number;
  label: "weiter_ueben" | "fast_bereit" | "sehr_gut";
  topicMasteryPercent: number;
  recentPerformancePercent: number;
  mockExamPercent: number;
  errorReductionPercent: number;
  courseCompletionPercent: number;
}

export const EXAM_READINESS_WEIGHTS = {
  topicMastery: 0.30,
  recentPerformance: 0.25,
  mockExam: 0.25,
  errorReduction: 0.10,
  courseCompletion: 0.10,
} as const;

function pct(value: number): number {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? Math.round(value) : 0));
}

function average(values: readonly number[]): number {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

export function calculateExamReadiness(
  snapshot: TheoryOverviewRepositorySnapshot,
  progress: TheoryLearningProgressResult,
): ExamReadinessBreakdown {
  const topicMasteryPercent = pct(
    average(snapshot.topics.map((topic) => topic.masteryScore)),
  );

  const recentPerformancePercent = pct(
    average(
      snapshot.recentTraining
        .filter((session) => session.completedAt !== null)
        .slice(0, 5)
        .map((session) => session.scorePercent ?? (
          session.questionsAnswered > 0
            ? (session.correctAnswers / session.questionsAnswered) * 100
            : 0
        )),
    ),
  );

  const mockExamPercent = pct(
    average(
      snapshot.recentExams
        .filter(
          (exam) => exam.status === "completed" && exam.scorePercent !== null,
        )
        .slice(0, 5)
        .map((exam) => exam.scorePercent ?? 0),
    ),
  );

  const errorReductionPercent = snapshot.questionStats.uniqueQuestionsAnswered
    ? pct(
        (
          1 - (
            snapshot.questionStats.questionsToReview
            / snapshot.questionStats.uniqueQuestionsAnswered
          )
        ) * 100,
      )
    : 0;

  const courseCompletionPercent = progress.overallPercent;

  const readinessPercent = pct(
    topicMasteryPercent * EXAM_READINESS_WEIGHTS.topicMastery
      + recentPerformancePercent * EXAM_READINESS_WEIGHTS.recentPerformance
      + mockExamPercent * EXAM_READINESS_WEIGHTS.mockExam
      + errorReductionPercent * EXAM_READINESS_WEIGHTS.errorReduction
      + courseCompletionPercent * EXAM_READINESS_WEIGHTS.courseCompletion,
  );

  return {
    readinessPercent,
    label: readinessPercent >= 80
      ? "sehr_gut"
      : readinessPercent >= 60
        ? "fast_bereit"
        : "weiter_ueben",
    topicMasteryPercent,
    recentPerformancePercent,
    mockExamPercent,
    errorReductionPercent,
    courseCompletionPercent,
  };
}
