/**
 * Express-Führerschein
 * Dashboard repository.
 *
 * Persistence:
 * Prisma 6.19.x -> PostgreSQL -> Supabase.
 *
 * This file contains database reads only.
 * Business calculations belong in dashboard-metrics.ts / dashboard-service.ts.
 */

import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  DASHBOARD_LIMITS,
} from "@/data/dashboard";

import {
  prisma,
} from "@/lib/server/prisma";

import {
  findLatestApplicationByUserId,
} from "@/lib/server/driving-license-application/application-repository";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

import type {
  DrivingLicenseApplication,
} from "@/types/driving-license-application";

/* ==========================================================================
   RAW REPOSITORY TYPES
   ========================================================================== */

export interface DashboardRepositoryLicenseClass {
  id:
    string;

  code:
    string;

  status:
    string;

  isPrimary:
    boolean;

  startedAt:
    Date;

  targetExamDate:
    Date | null;
}

export interface DashboardRepositoryLearningProgress {
  currentDay:
    number;

  completedDays:
    number;

  completedLessons:
    number;

  answeredQuestions:
    number;

  correctAnswers:
    number;

  readinessScore:
    number;

  totalStudyMinutes:
    number;

  lastActivityAt:
    Date | null;
}

export interface DashboardRepositoryProgramDay {
  dayNumber:
    number;

  status:
    string;

  plannedDate:
    Date | null;

  startedAt:
    Date | null;

  completedAt:
    Date | null;

  studyMinutes:
    number;

  score:
    number | null;
}

export interface DashboardRepositoryTopic {
  id:
    string;

  slug:
    string;

  sortOrder:
    number;

  translations:
    readonly {
      locale:
        string;

      title:
        string;
    }[];

  progress:
    {
      answeredQuestions:
        number;

      correctAnswers:
        number;

      incorrectAnswers:
        number;

      progressPercent:
        number;

      masteryScore:
        number;

      lastTrainedAt:
        Date | null;
    } | null;
}

export interface DashboardRepositoryQuestionStats {
  totalAttempts:
    number;

  correctAttempts:
    number;

  incorrectAttempts:
    number;

  activeQuestions:
    number;

  uniqueQuestionsAnswered:
    number;

  needsReview:
    number;
}

export interface DashboardRepositoryExamStats {
  completed:
    number;

  passed:
    number;

  averageScorePercent:
    number;
}

export interface DashboardRepositoryRecentTraining {
  id:
    string;

  topicId:
    string | null;

  topicTranslations:
    readonly {
      locale:
        string;

      title:
        string;
    }[];

  sessionType:
    string;

  questionsAnswered:
    number;

  correctAnswers:
    number;

  incorrectAnswers:
    number;

  scorePercent:
    number | null;

  durationSeconds:
    number;

  startedAt:
    Date;

  completedAt:
    Date | null;
}

export interface DashboardRepositoryAppointment {
  id:
    string;

  type:
    string;

  title:
    string;

  location:
    string | null;

  startsAt:
    Date;

  endsAt:
    Date | null;

  status:
    string;
}

export interface DashboardRepositoryDocumentCounts {
  uploaded:
    number;

  processing:
    number;

  verified:
    number;

  rejected:
    number;
}

export interface DashboardRepositorySnapshot {
  drivingLicenseApplication:
    DrivingLicenseApplication | null;

  licenseClass:
    DashboardRepositoryLicenseClass | null;

  learningProgress:
    DashboardRepositoryLearningProgress | null;

  programDays:
    readonly DashboardRepositoryProgramDay[];

  topics:
    readonly DashboardRepositoryTopic[];

  questionStats:
    DashboardRepositoryQuestionStats;

  examStats:
    DashboardRepositoryExamStats;

  recentTraining:
    readonly DashboardRepositoryRecentTraining[];

  nextAppointment:
    DashboardRepositoryAppointment | null;

  unreadNotifications:
    number;

  unreadMessages:
    number;

  documents:
    DashboardRepositoryDocumentCounts;
}

type DashboardTheoryCountryCode =
  | "DE"
  | "AT"
  | "CH"
  | "BE"
  | "ES";

function normalizeDashboardTheoryCountryCode(
  value:
    string,
): DashboardTheoryCountryCode {
  const normalized =
    value
      .trim()
      .toUpperCase();

  switch (
    normalized
  ) {
    case "AT":
    case "CH":
    case "BE":
    case "ES":
      return normalized;

    default:
      return "DE";
  }
}

function getDashboardTheoryToday():
  Date {
  const now =
    new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );
}

function getPublishedDashboardTheoryQuestionWhere():
  Prisma.theory_questionsWhereInput {
  const today =
    getDashboardTheoryToday();

  return {
    status:
      "published",

    is_active:
      true,

    AND: [
      {
        OR: [
          {
            valid_from:
              null,
          },

          {
            valid_from: {
              lte:
                today,
            },
          },
        ],
      },

      {
        OR: [
          {
            valid_until:
              null,
          },

          {
            valid_until: {
              gte:
                today,
            },
          },
        ],
      },
    ],
  };
}

async function findDashboardCurrentTheoryProgram(
  countryCode:
    DashboardTheoryCountryCode,

  licenseClassCode:
    string,
) {
  const today =
    getDashboardTheoryToday();

  const validity:
    Prisma.theory_programsWhereInput[] = [
    {
      OR: [
        {
          valid_from:
            null,
        },

        {
          valid_from: {
            lte:
              today,
          },
        },
      ],
    },

    {
      OR: [
        {
          valid_until:
            null,
        },

        {
          valid_until: {
            gte:
              today,
          },
        },
      ],
    },
  ];

  const current =
    await prisma
      .theory_programs
      .findFirst({
        where: {
          country_code:
            countryCode,

          license_class_code:
            licenseClassCode,

          status:
            "published",

          is_current:
            true,

          AND:
            validity,
        },

        orderBy: [
          {
            valid_from:
              "desc",
          },

          {
            created_at:
              "desc",
          },
        ],

        select: {
          id:
            true,
        },
      });

  if (
    current
  ) {
    return current;
  }

  return prisma
    .theory_programs
    .findFirst({
      where: {
        country_code:
          countryCode,

        license_class_code:
          licenseClassCode,

        status:
          "published",

        AND:
          validity,
      },

      orderBy: [
        {
          valid_from:
            "desc",
        },

        {
          created_at:
            "desc",
        },
      ],

      select: {
        id:
          true,
      },
    });
}

async function getDashboardTheoryScopedData(
  classId:
    string,

  programId:
    string | null,

  translationLocales:
    ClientShellLocale[],
) {
  if (
    !programId
  ) {
    return {
      topics:
        [],

      questionAggregate: {
        _sum: {
          attempt_count:
            null,

          correct_count:
            null,

          incorrect_count:
            null,
        },
      },

      uniqueQuestionsAnswered:
        0,

      needsReview:
        0,

      activeQuestions:
        0,

      completedExams:
        0,

      passedExams:
        0,

      examScoreAggregate: {
        _avg: {
          score_percent:
            null,
        },
      },

      recentTraining:
        [],
    };
  }

  const questionWhere =
    getPublishedDashboardTheoryQuestionWhere();

  const topicWhere:
    Prisma.theory_topicsWhereInput = {
    program_id:
      programId,

    is_active:
      true,
  };

  const scopedQuestionWhere:
    Prisma.theory_questionsWhereInput = {
    ...questionWhere,

    theory_topics:
      topicWhere,
  };

  const scopedExamWhere:
    Prisma.exam_attemptsWhereInput = {
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
  };

  const [
    topics,
    questionAggregate,
    uniqueQuestionsAnswered,
    needsReview,
    activeQuestions,
    completedExams,
    passedExams,
    examScoreAggregate,
    recentTraining,
  ] =
    await Promise.all([
      prisma
        .theory_topics
        .findMany({
          where:
            topicWhere,

          orderBy: {
            sort_order:
              "asc",
          },

          select: {
            id:
              true,

            slug:
              true,

            sort_order:
              true,

            translations: {
              where: {
                locale: {
                  in:
                    translationLocales,
                },
              },

              select: {
                locale:
                  true,

                title:
                  true,
              },
            },

            user_progress: {
              where: {
                user_license_class_id:
                  classId,
              },

              take:
                1,

              select: {
                answered_questions:
                  true,

                correct_answers:
                  true,

                incorrect_answers:
                  true,

                progress_percent:
                  true,

                mastery_score:
                  true,

                last_trained_at:
                  true,
              },
            },
          },
        }),

      prisma
        .user_question_progress
        .aggregate({
          where: {
            user_license_class_id:
              classId,

            theory_questions:
              scopedQuestionWhere,
          },

          _sum: {
            attempt_count:
              true,

            correct_count:
              true,

            incorrect_count:
              true,
          },
        }),

      prisma
        .user_question_progress
        .count({
          where: {
            user_license_class_id:
              classId,

            attempt_count: {
              gt:
                0,
            },

            theory_questions:
              scopedQuestionWhere,
          },
        }),

      prisma
        .user_question_progress
        .count({
          where: {
            user_license_class_id:
              classId,

            needs_review:
              true,

            theory_questions:
              scopedQuestionWhere,
          },
        }),

      prisma
        .theory_questions
        .count({
          where:
            scopedQuestionWhere,
        }),

      prisma
        .exam_attempts
        .count({
          where:
            scopedExamWhere,
        }),

      prisma
        .exam_attempts
        .count({
          where: {
            ...scopedExamWhere,

            passed:
              true,
          },
        }),

      prisma
        .exam_attempts
        .aggregate({
          where: {
            ...scopedExamWhere,

            score_percent: {
              not:
                null,
            },
          },

          _avg: {
            score_percent:
              true,
          },
        }),

      prisma
        .training_sessions
        .findMany({
          where: {
            user_license_class_id:
              classId,

            completed_at: {
              not:
                null,
            },

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
          },

          orderBy: {
            started_at:
              "desc",
          },

          take:
            DASHBOARD_LIMITS
              .recentTraining,

          select: {
            id:
              true,

            topic_id:
              true,

            session_type:
              true,

            questions_answered:
              true,

            correct_answers:
              true,

            incorrect_answers:
              true,

            score_percent:
              true,

            duration_seconds:
              true,

            started_at:
              true,

            completed_at:
              true,

            theory_topics: {
              select: {
                translations: {
                  where: {
                    locale: {
                      in:
                        translationLocales,
                    },
                  },

                  select: {
                    locale:
                      true,

                    title:
                      true,
                  },
                },
              },
            },
          },
        }),
    ]);

  return {
    topics,
    questionAggregate,
    uniqueQuestionsAnswered,
    needsReview,
    activeQuestions,
    completedExams,
    passedExams,
    examScoreAggregate,
    recentTraining,
  };
}

/* ==========================================================================
   SMALL SHARED QUERIES
   ========================================================================== */

async function countUnreadNotifications(
  userId:
    string,
): Promise<number> {
  return prisma
    .user_notifications
    .count({
      where: {
        user_id:
          userId,

        read_at:
          null,
      },
    });
}

async function countUnreadMessages(
  userId:
    string,
): Promise<number> {
  return prisma
    .conversation_messages
    .count({
      where: {
        read_at:
          null,

        sender_type: {
          in: [
            "support",
            "system",
          ],
        },

        conversations: {
          user_id:
            userId,
        },
      },
    });
}

async function getDocumentCounts(
  userId:
    string,
): Promise<DashboardRepositoryDocumentCounts> {
  const rows =
    await prisma
      .user_documents
      .groupBy({
        by: [
          "status",
        ],

        where: {
          user_id:
            userId,

          deleted_at:
            null,
        },

        _count: {
          _all:
            true,
        },
      });

  const counts:
    DashboardRepositoryDocumentCounts = {
    uploaded:
      0,

    processing:
      0,

    verified:
      0,

    rejected:
      0,
  };

  for (
    const row of
    rows
  ) {
    const value =
      row._count._all;

    switch (
      row.status
    ) {
      case "uploaded":
        counts.uploaded +=
          value;
        break;

      case "processing":
        counts.processing +=
          value;
        break;

      case "verified":
        counts.verified +=
          value;
        break;

      case "rejected":
        counts.rejected +=
          value;
        break;

      default:
        break;
    }
  }

  return counts;
}

/* ==========================================================================
   MAIN SNAPSHOT
   ========================================================================== */

export async function getDashboardRepositorySnapshot(
  userId:
    string,

  locale:
    ClientShellLocale,
): Promise<DashboardRepositorySnapshot> {
  const normalizedUserId =
    userId.trim();

  if (
    !normalizedUserId
  ) {
    throw new Error(
      "[Express-Führerschein] Dashboard userId fehlt.",
    );
  }

  /**
   * Shared user-level data can be loaded regardless of whether
   * a driving-license class has already been selected.
   */
  const [
    drivingLicenseApplication,
    licenseClass,
    unreadNotifications,
    unreadMessages,
    documents,
  ] =
    await Promise.all([
      findLatestApplicationByUserId(
        normalizedUserId,
      ),

      prisma
        .user_license_classes
        .findFirst({
          where: {
            user_id:
              normalizedUserId,

            status: {
              not:
                "archived",
            },
          },

          orderBy: [
            {
              is_primary:
                "desc",
            },

            {
              created_at:
                "asc",
            },
          ],

          select: {
            id:
              true,

            license_class_code:
              true,

            status:
              true,

            is_primary:
              true,

            started_at:
              true,

            target_exam_date:
              true,

            users: {
              select: {
                country_code:
                  true,
              },
            },
          },
        }),

      countUnreadNotifications(
        normalizedUserId,
      ),

      countUnreadMessages(
        normalizedUserId,
      ),

      getDocumentCounts(
        normalizedUserId,
      ),
    ]);

  if (
    !licenseClass
  ) {
    return {
      drivingLicenseApplication,

      licenseClass:
        null,

      learningProgress:
        null,

      programDays:
        [],

      topics:
        [],

      questionStats: {
        totalAttempts:
          0,

        correctAttempts:
          0,

        incorrectAttempts:
          0,

        activeQuestions:
          0,

        uniqueQuestionsAnswered:
          0,

        needsReview:
          0,
      },

      examStats: {
        completed:
          0,

        passed:
          0,

        averageScorePercent:
          0,
      },

      recentTraining:
        [],

      nextAppointment:
        null,

      unreadNotifications,

      unreadMessages,

      documents,
    };
  }

  const classId =
    licenseClass.id;

  const classCode =
    licenseClass
      .license_class_code;

  const theoryCountryCode =
    normalizeDashboardTheoryCountryCode(
      licenseClass
        .users
        .country_code,
    );

  const currentTheoryProgram =
    await findDashboardCurrentTheoryProgram(
      theoryCountryCode,
      classCode,
    );

  const currentTheoryProgramId =
    currentTheoryProgram
      ?.id ??
    null;

  const translationLocales:
    ClientShellLocale[] =
    locale ===
    "de"
      ? [
          "de",
        ]
      : [
          locale,
          "de",
        ];

  const [
    learningProgress,
    programDays,
    nextAppointment,
    theoryScopedData,
  ] =
    await Promise.all([
      prisma
        .learning_progress
        .findUnique({
          where: {
            user_license_class_id:
              classId,
          },

          select: {
            current_day:
              true,

            completed_days:
              true,

            completed_lessons:
              true,

            answered_questions:
              true,

            correct_answers:
              true,

            readiness_score:
              true,

            total_study_minutes:
              true,

            last_activity_at:
              true,
          },
        }),

      prisma
        .learning_days
        .findMany({
          where: {
            user_license_class_id:
              classId,
          },

          orderBy: {
            day_number:
              "asc",
          },

          select: {
            day_number:
              true,

            status:
              true,

            planned_date:
              true,

            started_at:
              true,

            completed_at:
              true,

            study_minutes:
              true,

            score:
              true,
          },
        }),

      prisma
        .user_appointments
        .findFirst({
          where: {
            user_id:
              normalizedUserId,

            user_license_class_id:
              classId,

            status: {
              in: [
                "scheduled",
                "confirmed",
              ],
            },

            starts_at: {
              gte:
                new Date(),
            },
          },

          orderBy: {
            starts_at:
              "asc",
          },

          select: {
            id:
              true,

            appointment_type:
              true,

            title:
              true,

            location:
              true,

            starts_at:
              true,

            ends_at:
              true,

            status:
              true,
          },
        }),

      getDashboardTheoryScopedData(
        classId,
        currentTheoryProgramId,
        translationLocales,
      ),
    ]);

  const {
    topics,
    questionAggregate,
    uniqueQuestionsAnswered,
    needsReview,
    activeQuestions,
    completedExams,
    passedExams,
    examScoreAggregate,
    recentTraining,
  } =
    theoryScopedData;

  return {
    drivingLicenseApplication,

    licenseClass: {
      id:
        licenseClass.id,

      code:
        classCode,

      status:
        licenseClass.status,

      isPrimary:
        licenseClass
          .is_primary,

      startedAt:
        licenseClass
          .started_at,

      targetExamDate:
        licenseClass
          .target_exam_date,
    },

    learningProgress:
      learningProgress
        ? {
            currentDay:
              learningProgress
                .current_day,

            completedDays:
              learningProgress
                .completed_days,

            completedLessons:
              learningProgress
                .completed_lessons,

            answeredQuestions:
              learningProgress
                .answered_questions,

            correctAnswers:
              learningProgress
                .correct_answers,

            readinessScore:
              learningProgress
                .readiness_score,

            totalStudyMinutes:
              learningProgress
                .total_study_minutes,

            lastActivityAt:
              learningProgress
                .last_activity_at,
          }
        : null,

    programDays:
      programDays.map(
        (
          day,
        ) => ({
          dayNumber:
            day.day_number,

          status:
            day.status,

          plannedDate:
            day.planned_date,

          startedAt:
            day.started_at,

          completedAt:
            day.completed_at,

          studyMinutes:
            day.study_minutes,

          score:
            day.score,
        }),
      ),

    topics:
      topics.map(
        (
          topic,
        ) => {
          const progress =
            topic
              .user_progress[0] ??
            null;

          return {
            id:
              topic.id,

            slug:
              topic.slug,

            sortOrder:
              topic.sort_order,

            translations:
              topic.translations,

            progress:
              progress
                ? {
                    answeredQuestions:
                      progress
                        .answered_questions,

                    correctAnswers:
                      progress
                        .correct_answers,

                    incorrectAnswers:
                      progress
                        .incorrect_answers,

                    progressPercent:
                      progress
                        .progress_percent,

                    masteryScore:
                      progress
                        .mastery_score,

                    lastTrainedAt:
                      progress
                        .last_trained_at,
                  }
                : null,
          };
        },
      ),

    questionStats: {
      totalAttempts:
        questionAggregate
          ._sum
          .attempt_count ??
        0,

      correctAttempts:
        questionAggregate
          ._sum
          .correct_count ??
        0,

      incorrectAttempts:
        questionAggregate
          ._sum
          .incorrect_count ??
        0,

      activeQuestions,

      uniqueQuestionsAnswered,

      needsReview,
    },

    examStats: {
      completed:
        completedExams,

      passed:
        passedExams,

      averageScorePercent:
        Math.round(
          examScoreAggregate
            ._avg
            .score_percent ??
          0,
        ),
    },

    recentTraining:
      recentTraining.map(
        (
          training,
        ) => ({
          id:
            training.id,

          topicId:
            training.topic_id,

          topicTranslations:
            training
              .theory_topics
              ?.translations ??
            [],

          sessionType:
            training.session_type,

          questionsAnswered:
            training
              .questions_answered,

          correctAnswers:
            training
              .correct_answers,

          incorrectAnswers:
            training
              .incorrect_answers,

          scorePercent:
            training
              .score_percent,

          durationSeconds:
            training
              .duration_seconds,

          startedAt:
            training
              .started_at,

          completedAt:
            training
              .completed_at,
        }),
      ),

    nextAppointment:
      nextAppointment
        ? {
            id:
              nextAppointment.id,

            type:
              nextAppointment
                .appointment_type,

            title:
              nextAppointment.title,

            location:
              nextAppointment
                .location,

            startsAt:
              nextAppointment
                .starts_at,

            endsAt:
              nextAppointment
                .ends_at,

            status:
              nextAppointment.status,
          }
        : null,

    unreadNotifications,

    unreadMessages,

    documents,
  };
}