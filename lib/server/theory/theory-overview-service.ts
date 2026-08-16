import "server-only";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  calculateExamReadiness,
} from "@/lib/server/theory/exam-readiness-service";

import {
  calculateTheoryLearningProgress,
  syncTheoryLearningAggregate,
} from "@/lib/server/theory/learning-progress-service";

import {
  buildTheoryRecommendations,
} from "@/lib/server/theory/theory-recommendation-service";

import {
  getTheoryOverviewRepositorySnapshot,
} from "@/lib/server/theory/theory-repository";

import {
  buildTheoryStatistics,
} from "@/lib/server/theory/theory-statistics-service";

import type {
  TheoryOverviewData,
} from "@/types/theory";

export class TheoryOverviewServiceError extends Error {
  readonly code:
    | "UNAUTHENTICATED"
    | "ACCOUNT_UNAVAILABLE";

  constructor(
    code: TheoryOverviewServiceError["code"],
    message: string,
  ) {
    super(message);
    this.name = "TheoryOverviewServiceError";
    this.code = code;
  }
}

function iso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

export async function getTheoryOverviewData():
  Promise<TheoryOverviewData> {
  let session;

  try {
    session = await requireClientSession();
  } catch {
    throw new TheoryOverviewServiceError(
      "UNAUTHENTICATED",
      "Bitte melde dich an, um Theorie zu lernen.",
    );
  }

  try {
    const snapshot = await getTheoryOverviewRepositorySnapshot(
      session.user.id,
      session.user.preferredLocale,
    );

    const progress = calculateTheoryLearningProgress(snapshot);
    const statistics = buildTheoryStatistics(snapshot);
    const readiness = calculateExamReadiness(snapshot, progress);
    const recommendations = buildTheoryRecommendations(
      snapshot,
      progress,
      readiness,
    );

    if (snapshot.context.userLicenseClassId) {
      try {
        await syncTheoryLearningAggregate(
          snapshot,
          readiness.readinessPercent,
        );
      } catch (error) {
        console.error("[THEORY_AGGREGATE_SYNC_ERROR]", error);
      }
    }

    const status: TheoryOverviewData["status"] =
      !snapshot.context.userLicenseClassId
        ? "license_class_required"
        : !snapshot.context.programId
          ? "country_program_unavailable"
          : "ready";

    const continueTopic = [...snapshot.topics]
      .filter((topic) => topic.progressPercent < 100)
      .sort(
        (a, b) =>
          (b.lastTrainedAt?.getTime() ?? 0)
          - (a.lastTrainedAt?.getTime() ?? 0),
      )[0] ?? null;

    return {
      status,
      countryCode: snapshot.context.countryCode,
      licenseClassCode: snapshot.context.licenseClassCode,
      progress: {
        overallPercent: progress.overallPercent,
        questionCoveragePercent: progress.questionCoveragePercent,
        averageTopicProgressPercent: progress.averageTopicProgressPercent,
        completedTopics: progress.completedTopics,
        totalTopics: progress.totalTopics,
        completedLessons: progress.completedLessons,
        currentDay: progress.currentDay,
        completedDays: progress.completedDays,
        lastActivityAt: iso(progress.lastActivityAt),
      },
      statistics,
      readiness,
      topics: snapshot.topics.map((topic) => ({
        id: topic.id,
        slug: topic.slug,
        title: topic.title,
        description: topic.description,
        sortOrder: topic.sortOrder,
        totalQuestions: topic.totalQuestions,
        answeredQuestions: topic.answeredQuestions,
        correctAnswers: topic.correctAnswers,
        incorrectAnswers: topic.incorrectAnswers,
        progressPercent: topic.progressPercent,
        masteryScore: topic.masteryScore,
        state:
          topic.progressPercent === 0
            ? "not_started"
            : topic.progressPercent >= 100 && topic.masteryScore >= 70
              ? "completed"
              : topic.masteryScore < 60 && topic.answeredQuestions > 0
                ? "review"
                : "in_progress",
        lastTrainedAt: iso(topic.lastTrainedAt),
      })),
      continueLearning: continueTopic
        ? {
            topicId: continueTopic.id,
            title: continueTopic.title,
            href: `/theorie/${encodeURIComponent(continueTopic.slug)}`,
            progressPercent: continueTopic.progressPercent,
            lastActivityAt: iso(continueTopic.lastTrainedAt),
          }
        : null,
      recommendations,
      recentExams: snapshot.recentExams.map((exam) => ({
        id: exam.id,
        passed: exam.passed,
        scorePercent: exam.scorePercent,
        startedAt: exam.startedAt.toISOString(),
        completedAt: iso(exam.completedAt),
      })),
      nextExamRecommendation: null,
    };
  } catch (error) {
    if (error instanceof TheoryOverviewServiceError) {
      throw error;
    }

    console.error("[THEORY_OVERVIEW_ERROR]", error);

    throw new TheoryOverviewServiceError(
      "ACCOUNT_UNAVAILABLE",
      "Die Theorie-Daten konnten nicht geladen werden.",
    );
  }
}
