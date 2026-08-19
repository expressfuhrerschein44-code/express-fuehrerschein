/**
 * Express-Führerschein
 * Progress repository.
 *
 * Core Theorie metrics deliberately reuse the canonical Theorie repository
 * snapshot so /theorie, /dashboard and /fortschritt work from the same
 * licence class, programme, lesson/question scope and 21-day timeline.
 */

import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  prisma,
} from "@/lib/server/prisma";

import {
  getTheoryOverviewRepositorySnapshot,
} from "@/lib/server/theory/theory-repository";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

export interface ProgressContextRecord {
  userId: string;
  countryCode: string;
  userLicenseClassId: string | null;
  licenseClassCode: string | null;
  programId: string | null;
}

export interface ProgressTopicRecord {
  id: string;
  slug: string;
  sortOrder: number;
  title: string;
  description: string | null;
  questionCount: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  progressPercent: number;
  masteryScore: number;
  lastTrainedAt: Date | null;
}

export interface ProgressRepositorySnapshot {
  context: ProgressContextRecord;

  learningProgress: {
    current_day: number;
    completed_days: number;
    completed_lessons: number;
    answered_questions: number;
    correct_answers: number;
    readiness_score: number;
    total_study_minutes: number;
    last_activity_at: Date | null;
  } | null;

  learningDays: Array<{
    day_number: number;
    status: string;
    planned_date: Date | null;
    study_minutes: number;
    score: number | null;
  }>;

  theory: {
    totalLessons: number;
    completedLessons: number;
    totalQuestions: number;
    answeredQuestions: number;
    correctAttempts: number;
    incorrectAttempts: number;
    needsReviewCount: number;
  };

  training: {
    completedSessions: number;
    totalQuestionsAnswered: number;
    totalDurationSeconds: number;
    scoredSessions: number;
    scoreSum: number;
    lastTrainingAt: Date | null;
    lastScorePercent: number | null;
  };

  exam: {
    completedAttempts: number;
    passedAttempts: number;
    failedAttempts: number;
    scoredAttempts: number;
    scoreSum: number;
    lastAttemptAt: Date | null;
    lastScorePercent: number | null;
    lastAttemptPassed: boolean | null;
  };

  topics: ProgressTopicRecord[];
}

function emptyTraining() {
  return {
    completedSessions: 0,
    totalQuestionsAnswered: 0,
    totalDurationSeconds: 0,
    scoredSessions: 0,
    scoreSum: 0,
    lastTrainingAt: null,
    lastScorePercent: null,
  };
}

function emptyExam() {
  return {
    completedAttempts: 0,
    passedAttempts: 0,
    failedAttempts: 0,
    scoredAttempts: 0,
    scoreSum: 0,
    lastAttemptAt: null,
    lastScorePercent: null,
    lastAttemptPassed: null,
  };
}

export async function getProgressRepositorySnapshot(
  input: {
    userId: string;
    locale: ClientShellLocale;
  },
): Promise<ProgressRepositorySnapshot> {
  /**
   * This is the canonical Theorie snapshot.
   *
   * It already:
   * - resolves the same licence class as /theorie;
   * - resolves the same current published programme;
   * - applies the same question/program scope;
   * - synchronizes the 21-day timeline before returning.
   */
  const theorySnapshot =
    await getTheoryOverviewRepositorySnapshot(
      input.userId,
      input.locale,
    );

  const context:
    ProgressContextRecord = {
      userId:
        theorySnapshot.context.userId,
      countryCode:
        theorySnapshot.context.countryCode,
      userLicenseClassId:
        theorySnapshot.context.userLicenseClassId,
      licenseClassCode:
        theorySnapshot.context.licenseClassCode,
      programId:
        theorySnapshot.context.programId,
    };

  const classId =
    theorySnapshot.context.userLicenseClassId;

  const programId =
    theorySnapshot.context.programId;

  const learningProgress =
    theorySnapshot.learningProgress
      ? {
          current_day:
            theorySnapshot.learningProgress.currentDay,
          completed_days:
            theorySnapshot.learningProgress.completedDays,
          completed_lessons:
            theorySnapshot.learningProgress.completedLessons,
          answered_questions:
            theorySnapshot.learningProgress.answeredQuestions,
          correct_answers:
            theorySnapshot.learningProgress.correctAnswers,
          readiness_score:
            theorySnapshot.learningProgress.readinessScore,
          total_study_minutes:
            theorySnapshot.learningProgress.totalStudyMinutes,
          last_activity_at:
            theorySnapshot.learningProgress.lastActivityAt,
        }
      : null;

  const theory = {
    totalLessons:
      theorySnapshot.lessonStats.totalLessons,
    completedLessons:
      theorySnapshot.lessonStats.completedLessons,
    totalQuestions:
      theorySnapshot.questionStats.activeQuestions,
    answeredQuestions:
      theorySnapshot.questionStats.uniqueQuestionsAnswered,
    correctAttempts:
      theorySnapshot.questionStats.correctAttempts,
    incorrectAttempts:
      theorySnapshot.questionStats.incorrectAttempts,
    needsReviewCount:
      theorySnapshot.questionStats.questionsToReview,
  };

  const topics:
    ProgressTopicRecord[] =
    theorySnapshot.topics.map(
      (
        topic,
      ) => ({
        id:
          topic.id,
        slug:
          topic.slug,
        sortOrder:
          topic.sortOrder,
        title:
          topic.title,
        description:
          topic.description,
        questionCount:
          topic.totalQuestions,
        answeredQuestions:
          topic.answeredQuestions,
        correctAnswers:
          topic.correctAnswers,
        incorrectAnswers:
          topic.incorrectAnswers,
        progressPercent:
          topic.progressPercent,
        masteryScore:
          topic.masteryScore,
        lastTrainedAt:
          topic.lastTrainedAt,
      }),
    );

  if (!classId) {
    return {
      context,
      learningProgress,
      learningDays: [],
      theory,
      training:
        emptyTraining(),
      exam:
        emptyExam(),
      topics,
    };
  }

  /**
   * Extra Fortschritt-only aggregates.
   *
   * When a published programme exists, training/exam rows are scoped in the
   * same way as the Theorie repository:
   * - topic-less training stays valid for mixed/random sessions;
   * - topic-bound training must belong to the current programme;
   * - legacy exam attempts without a configuration remain valid;
   * - configured exams must belong to the current programme.
   */
  const trainingScope:
    Prisma.training_sessionsWhereInput =
    programId
      ? {
          user_license_class_id:
            classId,
          OR: [
            {
              topic_id:
                null,
            },
            {
              theory_topics: {
                program_id:
                  programId,
              },
            },
          ],
        }
      : {
          user_license_class_id:
            classId,
        };

  const completedTrainingWhere:
    Prisma.training_sessionsWhereInput = {
      ...trainingScope,
      completed_at: {
        not:
          null,
      },
    };

  const completedExamWhere:
    Prisma.exam_attemptsWhereInput =
    programId
      ? {
          user_license_class_id:
            classId,
          status:
            "completed",
          OR: [
            {
              exam_configuration_id:
                null,
            },
            {
              exam_configurations: {
                program_id:
                  programId,
              },
            },
          ],
        }
      : {
          user_license_class_id:
            classId,
          status:
            "completed",
        };

  const [
    learningDays,
    completedTrainingSessions,
    trainingAggregate,
    lastTraining,
    completedExams,
    passedAttempts,
    failedAttempts,
    examAggregate,
    lastExam,
  ] =
    await Promise.all([
      prisma.learning_days.findMany({
        where: {
          user_license_class_id:
            classId,
        },
        select: {
          day_number:
            true,
          status:
            true,
          planned_date:
            true,
          study_minutes:
            true,
          score:
            true,
        },
        orderBy: {
          day_number:
            "asc",
        },
      }),

      prisma.training_sessions.count({
        where:
          completedTrainingWhere,
      }),

      prisma.training_sessions.aggregate({
        where:
          completedTrainingWhere,
        _sum: {
          questions_answered:
            true,
          duration_seconds:
            true,
          score_percent:
            true,
        },
        _count: {
          score_percent:
            true,
        },
      }),

      prisma.training_sessions.findFirst({
        where:
          completedTrainingWhere,
        select: {
          completed_at:
            true,
          started_at:
            true,
          score_percent:
            true,
        },
        orderBy: [
          {
            completed_at:
              "desc",
          },
          {
            started_at:
              "desc",
          },
        ],
      }),

      prisma.exam_attempts.count({
        where:
          completedExamWhere,
      }),

      prisma.exam_attempts.count({
        where: {
          ...completedExamWhere,
          passed:
            true,
        },
      }),

      prisma.exam_attempts.count({
        where: {
          ...completedExamWhere,
          passed:
            false,
        },
      }),

      prisma.exam_attempts.aggregate({
        where:
          completedExamWhere,
        _sum: {
          score_percent:
            true,
        },
        _count: {
          score_percent:
            true,
        },
      }),

      prisma.exam_attempts.findFirst({
        where:
          completedExamWhere,
        select: {
          completed_at:
            true,
          started_at:
            true,
          score_percent:
            true,
          passed:
            true,
        },
        orderBy: [
          {
            completed_at:
              "desc",
          },
          {
            started_at:
              "desc",
          },
        ],
      }),
    ]);

  return {
    context,
    learningProgress,
    learningDays,
    theory,
    training: {
      completedSessions:
        completedTrainingSessions,
      totalQuestionsAnswered:
        trainingAggregate._sum.questions_answered ??
        0,
      totalDurationSeconds:
        trainingAggregate._sum.duration_seconds ??
        0,
      scoredSessions:
        trainingAggregate._count.score_percent,
      scoreSum:
        trainingAggregate._sum.score_percent ??
        0,
      lastTrainingAt:
        lastTraining?.completed_at ??
        lastTraining?.started_at ??
        null,
      lastScorePercent:
        lastTraining?.score_percent ??
        null,
    },
    exam: {
      completedAttempts:
        completedExams,
      passedAttempts,
      failedAttempts,
      scoredAttempts:
        examAggregate._count.score_percent,
      scoreSum:
        examAggregate._sum.score_percent ??
        0,
      lastAttemptAt:
        lastExam?.completed_at ??
        lastExam?.started_at ??
        null,
      lastScorePercent:
        lastExam?.score_percent ??
        null,
      lastAttemptPassed:
        lastExam?.passed ??
        null,
    },
    topics,
  };
}