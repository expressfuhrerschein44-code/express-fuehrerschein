import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

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
  sort_order: number;
  translations: Array<{
    locale: string;
    title: string;
    description: string | null;
  }>;
  user_progress: Array<{
    answered_questions: number;
    correct_answers: number;
    incorrect_answers: number;
    progress_percent: number;
    mastery_score: number;
    last_trained_at: Date | null;
  }>;
  _count: {
    questions: number;
  };
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

function todayUtc(): Date {
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

function validityWhere(
  today: Date,
) {
  return {
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

async function findPublishedProgram(
  countryCode: string,
  licenseClassCode: string,
): Promise<{
  id: string;
} | null> {
  const today =
    todayUtc();

  const baseWhere = {
    country_code:
      countryCode,
    license_class_code:
      licenseClassCode,
    status:
      "published",
    ...validityWhere(
      today,
    ),
  };

  const current =
    await prisma.theory_programs.findFirst({
      where: {
        ...baseWhere,
        is_current:
          true,
      },
      select: {
        id:
          true,
      },
      orderBy: {
        published_at:
          "desc",
      },
    });

  if (current) {
    return current;
  }

  return prisma.theory_programs.findFirst({
    where:
      baseWhere,
    select: {
      id:
        true,
    },
    orderBy: [
      {
        published_at:
          "desc",
      },
      {
        created_at:
          "desc",
      },
    ],
  });
}

export async function getProgressRepositorySnapshot(
  input: {
    userId: string;
    locale: string;
  },
): Promise<ProgressRepositorySnapshot> {
  const user =
    await prisma.users.findUnique({
      where: {
        id:
          input.userId,
      },
      select: {
        id:
          true,
        country_code:
          true,
        user_license_classes: {
          where: {
            status:
              "active",
          },
          orderBy: [
            {
              is_primary:
                "desc",
            },
            {
              started_at:
                "asc",
            },
          ],
          take:
            1,
          select: {
            id:
              true,
            license_class_code:
              true,
          },
        },
      },
    });

  if (!user) {
    throw new Error(
      "[Express-Führerschein] Benutzer wurde nicht gefunden.",
    );
  }

  const activeClass =
    user.user_license_classes[0] ??
    null;

  if (!activeClass) {
    return {
      context: {
        userId:
          user.id,
        countryCode:
          user.country_code,
        userLicenseClassId:
          null,
        licenseClassCode:
          null,
        programId:
          null,
      },
      learningProgress:
        null,
      learningDays:
        [],
      theory: {
        totalLessons:
          0,
        completedLessons:
          0,
        totalQuestions:
          0,
        answeredQuestions:
          0,
        correctAttempts:
          0,
        incorrectAttempts:
          0,
        needsReviewCount:
          0,
      },
      training: {
        completedSessions:
          0,
        totalQuestionsAnswered:
          0,
        totalDurationSeconds:
          0,
        scoredSessions:
          0,
        scoreSum:
          0,
        lastTrainingAt:
          null,
        lastScorePercent:
          null,
      },
      exam: {
        completedAttempts:
          0,
        passedAttempts:
          0,
        failedAttempts:
          0,
        scoredAttempts:
          0,
        scoreSum:
          0,
        lastAttemptAt:
          null,
        lastScorePercent:
          null,
        lastAttemptPassed:
          null,
      },
      topics:
        [],
    };
  }

  const program =
    await findPublishedProgram(
      user.country_code,
      activeClass.license_class_code,
    );

  const [
    learningProgress,
    learningDays,
    completedTrainingSessions,
    trainingAggregate,
    lastTraining,
    completedExams,
    examAggregate,
    lastExam,
  ] =
    await Promise.all([
      prisma.learning_progress.findUnique({
        where: {
          user_license_class_id:
            activeClass.id,
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

      prisma.learning_days.findMany({
        where: {
          user_license_class_id:
            activeClass.id,
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
        where: {
          user_license_class_id:
            activeClass.id,
          completed_at: {
            not:
              null,
          },
        },
      }),

      prisma.training_sessions.aggregate({
        where: {
          user_license_class_id:
            activeClass.id,
          completed_at: {
            not:
              null,
          },
        },
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
        where: {
          user_license_class_id:
            activeClass.id,
          completed_at: {
            not:
              null,
          },
        },
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
        where: {
          user_license_class_id:
            activeClass.id,
          status:
            "completed",
        },
      }),

      prisma.exam_attempts.aggregate({
        where: {
          user_license_class_id:
            activeClass.id,
          status:
            "completed",
        },
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
        where: {
          user_license_class_id:
            activeClass.id,
          status:
            "completed",
        },
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

  const [
    passedAttempts,
    failedAttempts,
  ] =
    await Promise.all([
      prisma.exam_attempts.count({
        where: {
          user_license_class_id:
            activeClass.id,
          status:
            "completed",
          passed:
            true,
        },
      }),

      prisma.exam_attempts.count({
        where: {
          user_license_class_id:
            activeClass.id,
          status:
            "completed",
          passed:
            false,
        },
      }),
    ]);

  if (!program) {
    return {
      context: {
        userId:
          user.id,
        countryCode:
          user.country_code,
        userLicenseClassId:
          activeClass.id,
        licenseClassCode:
          activeClass.license_class_code,
        programId:
          null,
      },
      learningProgress,
      learningDays,
      theory: {
        totalLessons:
          0,
        completedLessons:
          0,
        totalQuestions:
          0,
        answeredQuestions:
          0,
        correctAttempts:
          0,
        incorrectAttempts:
          0,
        needsReviewCount:
          0,
      },
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
      topics:
        [],
    };
  }

  const today =
    todayUtc();

  const lessonValidity =
    validityWhere(
      today,
    );

  const questionValidity =
    validityWhere(
      today,
    );

  const [
    totalLessons,
    completedLessons,
    totalQuestions,
    answeredQuestions,
    questionAttemptAggregate,
    needsReviewCount,
    topics,
  ] =
    await Promise.all([
      prisma.theory_lessons.count({
        where: {
          status:
            "published",
          ...lessonValidity,
          theory_topics: {
            program_id:
              program.id,
            is_active:
              true,
          },
        },
      }),

      prisma.user_lesson_progress.count({
        where: {
          user_license_class_id:
            activeClass.id,
          completed:
            true,
          theory_lessons: {
            status:
              "published",
            ...lessonValidity,
            theory_topics: {
              program_id:
                program.id,
              is_active:
                true,
            },
          },
        },
      }),

      prisma.theory_questions.count({
        where: {
          is_active:
            true,
          status:
            "published",
          ...questionValidity,
          theory_topics: {
            program_id:
              program.id,
            is_active:
              true,
          },
        },
      }),

      prisma.user_question_progress.count({
        where: {
          user_license_class_id:
            activeClass.id,
          attempt_count: {
            gt:
              0,
          },
          theory_questions: {
            is_active:
              true,
            status:
              "published",
            ...questionValidity,
            theory_topics: {
              program_id:
                program.id,
              is_active:
                true,
            },
          },
        },
      }),

      prisma.user_question_progress.aggregate({
        where: {
          user_license_class_id:
            activeClass.id,
          theory_questions: {
            is_active:
              true,
            status:
              "published",
            ...questionValidity,
            theory_topics: {
              program_id:
                program.id,
              is_active:
                true,
            },
          },
        },
        _sum: {
          correct_count:
            true,
          incorrect_count:
            true,
        },
      }),

      prisma.user_question_progress.count({
        where: {
          user_license_class_id:
            activeClass.id,
          needs_review:
            true,
          theory_questions: {
            is_active:
              true,
            status:
              "published",
            ...questionValidity,
            theory_topics: {
              program_id:
                program.id,
              is_active:
                true,
            },
          },
        },
      }),

      prisma.theory_topics.findMany({
        where: {
          program_id:
            program.id,
          is_active:
            true,
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
                in: Array.from(
                  new Set([
                    input.locale,
                    "de",
                  ]),
                ),
              },
            },
            select: {
              locale:
                true,
              title:
                true,
              description:
                true,
            },
          },
          user_progress: {
            where: {
              user_license_class_id:
                activeClass.id,
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
          _count: {
            select: {
              questions: {
                where: {
                  is_active:
                    true,
                  status:
                    "published",
                  ...questionValidity,
                },
              },
            },
          },
        },
        orderBy: [
          {
            sort_order:
              "asc",
          },
          {
            created_at:
              "asc",
          },
        ],
      }),
    ]);

  return {
    context: {
      userId:
        user.id,
      countryCode:
        user.country_code,
      userLicenseClassId:
        activeClass.id,
      licenseClassCode:
        activeClass.license_class_code,
      programId:
        program.id,
    },
    learningProgress,
    learningDays,
    theory: {
      totalLessons,
      completedLessons,
      totalQuestions,
      answeredQuestions,
      correctAttempts:
        questionAttemptAggregate._sum.correct_count ??
        0,
      incorrectAttempts:
        questionAttemptAggregate._sum.incorrect_count ??
        0,
      needsReviewCount,
    },
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