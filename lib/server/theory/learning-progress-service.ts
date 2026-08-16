import "server-only";

import {
  createTheoryStudySession,
  finishTheoryStudySession,
  getTheoryOverviewRepositorySnapshot,
  touchTheoryStudySession,
  updateStoredLearningAggregate,
  upsertTheoryLessonProgress,
} from "@/lib/server/theory/theory-repository";

import type {
  TheoryContext,
  TheoryOverviewRepositorySnapshot,
} from "@/lib/server/theory/theory-repository";

export const LEARNING_PROGRESS_WEIGHTS = {
  lessons: 0.30,
  questionCoverage: 0.30,
  topics: 0.25,
  mockExamActivity: 0.15,
} as const;

export interface TheoryLearningProgressResult {
  overallPercent: number;
  lessonCompletionPercent: number;
  questionCoveragePercent: number;
  averageTopicProgressPercent: number;
  mockExamActivityPercent: number;
  completedTopics: number;
  totalTopics: number;
  completedLessons: number;
  totalLessons: number;
  currentDay: number;
  completedDays: number;
  lastActivityAt: Date | null;
}

function pct(value: number): number {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? Math.round(value) : 0));
}

function average(values: readonly number[]): number {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
}

export function calculateTheoryLearningProgress(
  snapshot: TheoryOverviewRepositorySnapshot,
): TheoryLearningProgressResult {
  const lessonCompletionPercent = snapshot.lessonStats.totalLessons
    ? pct((snapshot.lessonStats.completedLessons / snapshot.lessonStats.totalLessons) * 100)
    : 0;

  const questionCoveragePercent = snapshot.questionStats.activeQuestions
    ? pct((snapshot.questionStats.uniqueQuestionsAnswered / snapshot.questionStats.activeQuestions) * 100)
    : 0;

  const averageTopicProgressPercent = pct(
    average(snapshot.topics.map((topic) => topic.progressPercent)),
  );

  const completedExamCount = snapshot.recentExams.filter(
    (exam) => exam.status === "completed",
  ).length;

  const mockExamActivityPercent = pct(Math.min(100, completedExamCount * 25));

  const overallPercent = pct(
    lessonCompletionPercent * LEARNING_PROGRESS_WEIGHTS.lessons
      + questionCoveragePercent * LEARNING_PROGRESS_WEIGHTS.questionCoverage
      + averageTopicProgressPercent * LEARNING_PROGRESS_WEIGHTS.topics
      + mockExamActivityPercent * LEARNING_PROGRESS_WEIGHTS.mockExamActivity,
  );

  return {
    overallPercent,
    lessonCompletionPercent,
    questionCoveragePercent,
    averageTopicProgressPercent,
    mockExamActivityPercent,
    completedTopics: snapshot.topics.filter((topic) => topic.progressPercent >= 100).length,
    totalTopics: snapshot.topics.length,
    completedLessons: snapshot.lessonStats.completedLessons,
    totalLessons: snapshot.lessonStats.totalLessons,
    currentDay: Math.max(1, snapshot.learningProgress?.currentDay ?? 1),
    completedDays: Math.max(0, snapshot.learningProgress?.completedDays ?? 0),
    lastActivityAt: snapshot.learningProgress?.lastActivityAt ?? null,
  };
}

export async function saveTheoryLessonProgress(
  context: TheoryContext,
  input: {
    lessonId: string;
    progressPercent: number;
    currentBlockIndex: number;
    completed: boolean;
    activeSecondsDelta?: number;
  },
) {
  return upsertTheoryLessonProgress(context, input);
}

export async function startTheoryStudySession(
  context: TheoryContext,
  input: {
    lessonId?: string | null;
    sessionType?: "lesson" | "practice" | "review" | "other";
  },
) {
  return createTheoryStudySession(context, input);
}

export async function registerTheoryStudyActivity(
  context: TheoryContext,
  input: { sessionId: string; activeSecondsDelta: number },
) {
  return touchTheoryStudySession(
    context,
    input.sessionId,
    input.activeSecondsDelta,
  );
}

export async function completeTheoryStudySession(
  context: TheoryContext,
  input: {
    sessionId: string;
    activeSecondsDelta?: number;
    abandoned?: boolean;
  },
) {
  return finishTheoryStudySession(
    context,
    input.sessionId,
    input.activeSecondsDelta ?? 0,
    input.abandoned ?? false,
  );
}

export async function syncTheoryLearningAggregate(
  snapshot: TheoryOverviewRepositorySnapshot,
  readinessScore: number,
): Promise<void> {
  const activeStudyMinutes = Math.floor(snapshot.lessonStats.activeStudySeconds / 60);
  const practiceMinutes = Math.floor(
    snapshot.recentTraining.reduce(
      (sum, session) => sum + Math.max(0, session.durationSeconds),
      0,
    ) / 60,
  );

  await updateStoredLearningAggregate(snapshot.context, {
    completedLessons: snapshot.lessonStats.completedLessons,
    answeredQuestions: snapshot.questionStats.totalAttempts,
    correctAnswers: snapshot.questionStats.correctAttempts,
    readinessScore,
    totalStudyMinutes: Math.max(
      snapshot.learningProgress?.totalStudyMinutes ?? 0,
      activeStudyMinutes + practiceMinutes,
    ),
    lastActivityAt: new Date(),
  });
}

export async function recalculateTheoryLearningAggregateForContext(
  context: TheoryContext,
  readinessScore: number,
): Promise<void> {
  const snapshot = await getTheoryOverviewRepositorySnapshot(
    context.userId,
    context.locale,
  );
  await syncTheoryLearningAggregate(snapshot, readinessScore);
}
