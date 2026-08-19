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

/**
 * Single weighting source for the global Theorie progress.
 *
 * IMPORTANT:
 * - this is learning progress, not the 21-day calendar position;
 * - every server consumer (Theorie, Dashboard, Fortschritt) should reuse
 *   calculateUnifiedTheoryLearningProgress() instead of rebuilding its own
 *   overall percentage.
 */
export const LEARNING_PROGRESS_WEIGHTS = {
  lessons: 0.30,
  questionCoverage: 0.30,
  topics: 0.25,
  mockExamActivity: 0.15,
} as const;

export const THEORY_PROGRAM_DAYS = 21;

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

/**
 * Minimal metrics required to calculate exactly the same progress from
 * another server module, especially the Dashboard.
 *
 * No Prisma type is exposed here.
 */
export interface UnifiedTheoryLearningProgressInput {
  totalLessons: number;

  completedLessons: number;

  activeQuestions: number;

  uniqueQuestionsAnswered: number;

  topicProgressPercents:
    readonly number[];

  completedExamCount: number;

  currentDay?:
    number | null;

  completedDays?:
    number | null;

  lastActivityAt?:
    Date | null;
}

export interface TheoryLearningAggregateSyncOptions {
  /**
   * Use true only after a real learner action.
   *
   * A simple page read must not fake a new activity date.
   */
  touchActivity?: boolean;

  /**
   * Explicit activity timestamp when the caller already knows it.
   */
  activityAt?:
    Date | null;
}

function pct(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(
      100,
      Number.isFinite(
        value,
      )
        ? Math.round(
            value,
          )
        : 0,
    ),
  );
}

function nonNegativeInteger(
  value: number,
): number {
  return Number.isFinite(
    value,
  )
    ? Math.max(
        0,
        Math.round(
          value,
        ),
      )
    : 0;
}

function average(
  values:
    readonly number[],
): number {
  return values.length
    ? values.reduce(
        (
          sum,
          value,
        ) =>
          sum +
          value,
        0,
      ) /
        values.length
    : 0;
}

function programDay(
  value: number,
): number {
  return Math.max(
    1,
    Math.min(
      THEORY_PROGRAM_DAYS,
      Number.isFinite(
        value,
      )
        ? Math.round(
            value,
          )
        : 1,
    ),
  );
}

function completedProgramDays(
  value: number,
  currentDay: number,
): number {
  return Math.max(
    0,
    Math.min(
      currentDay,
      Number.isFinite(
        value,
      )
        ? Math.round(
            value,
          )
        : 0,
    ),
  );
}

function validDateOrNull(
  value:
    | Date
    | null
    | undefined,
): Date | null {
  return (
    value instanceof Date &&
    Number.isFinite(
      value.getTime(),
    )
  )
    ? value
    : null;
}

/**
 * Canonical Theorie progress calculator.
 *
 * The complete learning progress is:
 *
 * 30% lessons
 * 30% unique question coverage
 * 25% topic progress
 * 15% mock-exam activity
 *
 * The 21-day calendar is deliberately independent.
 */
export function calculateUnifiedTheoryLearningProgress(
  input:
    UnifiedTheoryLearningProgressInput,
): TheoryLearningProgressResult {
  const totalLessons =
    nonNegativeInteger(
      input.totalLessons,
    );

  const completedLessons =
    Math.min(
      totalLessons,
      nonNegativeInteger(
        input.completedLessons,
      ),
    );

  const activeQuestions =
    nonNegativeInteger(
      input.activeQuestions,
    );

  const uniqueQuestionsAnswered =
    Math.min(
      activeQuestions,
      nonNegativeInteger(
        input.uniqueQuestionsAnswered,
      ),
    );

  const topicProgressPercents =
    input
      .topicProgressPercents
      .map(
        pct,
      );

  const completedExamCount =
    nonNegativeInteger(
      input.completedExamCount,
    );

  const lessonCompletionPercent =
    totalLessons >
    0
      ? pct(
          (
            completedLessons /
            totalLessons
          ) *
            100,
        )
      : 0;

  const questionCoveragePercent =
    activeQuestions >
    0
      ? pct(
          (
            uniqueQuestionsAnswered /
            activeQuestions
          ) *
            100,
        )
      : 0;

  const averageTopicProgressPercent =
    pct(
      average(
        topicProgressPercents,
      ),
    );

  /**
   * Four completed mock exams give 100% of the exam component.
   *
   * This component itself represents 15% of the total learning progress.
   */
  const mockExamActivityPercent =
    pct(
      Math.min(
        100,
        completedExamCount *
          25,
      ),
    );

  const overallPercent =
    pct(
      (
        lessonCompletionPercent *
        LEARNING_PROGRESS_WEIGHTS
          .lessons
      ) +
        (
          questionCoveragePercent *
          LEARNING_PROGRESS_WEIGHTS
            .questionCoverage
        ) +
        (
          averageTopicProgressPercent *
          LEARNING_PROGRESS_WEIGHTS
            .topics
        ) +
        (
          mockExamActivityPercent *
          LEARNING_PROGRESS_WEIGHTS
            .mockExamActivity
        ),
    );

  const currentDay =
    programDay(
      input.currentDay ??
        1,
    );

  const completedDays =
    completedProgramDays(
      input.completedDays ??
        0,
      currentDay,
    );

  return {
    overallPercent,

    lessonCompletionPercent,

    questionCoveragePercent,

    averageTopicProgressPercent,

    mockExamActivityPercent,

    completedTopics:
      topicProgressPercents
        .filter(
          (
            value,
          ) =>
            value >=
            100,
        )
        .length,

    totalTopics:
      topicProgressPercents
        .length,

    completedLessons,

    totalLessons,

    currentDay,

    completedDays,

    lastActivityAt:
      validDateOrNull(
        input.lastActivityAt,
      ),
  };
}

/**
 * Existing Theorie overview adapter.
 *
 * Signature intentionally preserved so existing callers keep working.
 */
export function calculateTheoryLearningProgress(
  snapshot:
    TheoryOverviewRepositorySnapshot,
): TheoryLearningProgressResult {
  /**
   * Prefer the complete aggregate produced by the repository.
   *
   * recentExams is intentionally limited for UI display,
   * so it must only be used as a compatibility fallback.
   */
  const completedExamCount =
    snapshot
      .completedExamCount ??
    snapshot
      .recentExams
      .filter(
        (
          exam,
        ) =>
          exam.status ===
          "completed",
      )
      .length;

  return calculateUnifiedTheoryLearningProgress(
    {
      totalLessons:
        snapshot
          .lessonStats
          .totalLessons,

      completedLessons:
        snapshot
          .lessonStats
          .completedLessons,

      activeQuestions:
        snapshot
          .questionStats
          .activeQuestions,

      uniqueQuestionsAnswered:
        snapshot
          .questionStats
          .uniqueQuestionsAnswered,

      topicProgressPercents:
        snapshot
          .topics
          .map(
            (
              topic,
            ) =>
              topic
                .progressPercent,
          ),

      completedExamCount,

      currentDay:
        snapshot
          .learningProgress
          ?.currentDay ??
        1,

      completedDays:
        snapshot
          .learningProgress
          ?.completedDays ??
        0,

      lastActivityAt:
        snapshot
          .learningProgress
          ?.lastActivityAt ??
        null,
    },
  );
}

export async function saveTheoryLessonProgress(
  context:
    TheoryContext,
  input: {
    lessonId:
      string;

    progressPercent:
      number;

    currentBlockIndex:
      number;

    completed:
      boolean;

    activeSecondsDelta?:
      number;
  },
) {
  return upsertTheoryLessonProgress(
    context,
    input,
  );
}

export async function startTheoryStudySession(
  context:
    TheoryContext,
  input: {
    lessonId?:
      string | null;

    sessionType?:
      | "lesson"
      | "practice"
      | "review"
      | "other";
  },
) {
  return createTheoryStudySession(
    context,
    input,
  );
}

export async function registerTheoryStudyActivity(
  context:
    TheoryContext,
  input: {
    sessionId:
      string;

    activeSecondsDelta:
      number;
  },
) {
  return touchTheoryStudySession(
    context,
    input.sessionId,
    input.activeSecondsDelta,
  );
}

export async function completeTheoryStudySession(
  context:
    TheoryContext,
  input: {
    sessionId:
      string;

    activeSecondsDelta?:
      number;

    abandoned?:
      boolean;
  },
) {
  return finishTheoryStudySession(
    context,
    input.sessionId,
    input.activeSecondsDelta ??
      0,
    input.abandoned ??
      false,
  );
}

function resolveAggregateActivityAt(
  snapshot:
    TheoryOverviewRepositorySnapshot,
  options:
    TheoryLearningAggregateSyncOptions,
): Date {
  const explicitActivityAt =
    validDateOrNull(
      options.activityAt,
    );

  if (
    explicitActivityAt
  ) {
    return explicitActivityAt;
  }

  if (
    options.touchActivity
  ) {
    return new Date();
  }

  /**
   * Merely reading /theorie must not change
   * the learner's real last-activity timestamp.
   */
  return (
    validDateOrNull(
      snapshot
        .learningProgress
        ?.lastActivityAt,
    ) ??
    new Date()
  );
}

export async function syncTheoryLearningAggregate(
  snapshot:
    TheoryOverviewRepositorySnapshot,

  readinessScore:
    number,

  options:
    TheoryLearningAggregateSyncOptions =
      {},
): Promise<void> {
  /**
   * Full persisted study duration.
   */
  const activeStudyMinutes =
    Math.floor(
      Math.max(
        0,
        snapshot
          .lessonStats
          .activeStudySeconds,
      ) /
        60,
    );

  /**
   * Never calculate lifetime practice time only
   * from recentTraining.
   *
   * recentTraining is intentionally limited for UI.
   */
  const practiceSeconds =
    snapshot
      .totalPracticeSeconds ??
    snapshot
      .recentTraining
      .reduce(
        (
          sum,
          session,
        ) =>
          sum +
          (
            session
              .completedAt
              ? Math.max(
                  0,
                  session
                    .durationSeconds,
                )
              : 0
          ),
        0,
      );

  const practiceMinutes =
    Math.floor(
      Math.max(
        0,
        practiceSeconds,
      ) /
        60,
    );

  const storedStudyMinutes =
    Math.max(
      0,
      snapshot
        .learningProgress
        ?.totalStudyMinutes ??
        0,
    );

  const calculatedStudyMinutes =
    Math.max(
      0,
      activeStudyMinutes +
        practiceMinutes,
    );

  await updateStoredLearningAggregate(
    snapshot.context,
    {
      completedLessons:
        nonNegativeInteger(
          snapshot
            .lessonStats
            .completedLessons,
        ),

      /**
       * answered_questions stores attempts in the current
       * aggregate contract.
       *
       * Unique coverage remains separately calculated from
       * uniqueQuestionsAnswered for the global percentage.
       */
      answeredQuestions:
        nonNegativeInteger(
          snapshot
            .questionStats
            .totalAttempts,
        ),

      correctAnswers:
        nonNegativeInteger(
          snapshot
            .questionStats
            .correctAttempts,
        ),

      readinessScore:
        pct(
          readinessScore,
        ),

      /**
       * Never decrease persisted lifetime study time.
       */
      totalStudyMinutes:
        Math.max(
          storedStudyMinutes,
          calculatedStudyMinutes,
        ),

      lastActivityAt:
        resolveAggregateActivityAt(
          snapshot,
          options,
        ),
    },
  );
}

export async function recalculateTheoryLearningAggregateForContext(
  context:
    TheoryContext,

  readinessScore:
    number,

  options:
    TheoryLearningAggregateSyncOptions =
      {},
): Promise<void> {
  const snapshot =
    await getTheoryOverviewRepositorySnapshot(
      context.userId,
      context.locale,
    );

  await syncTheoryLearningAggregate(
    snapshot,
    readinessScore,
    options,
  );
}