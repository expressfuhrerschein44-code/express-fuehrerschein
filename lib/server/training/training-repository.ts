import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

export interface TrainingContextRecord {
  userId: string;
  countryCode: string;
  licenseClassId: string | null;
  licenseClassCode: string | null;
  programId: string | null;
}

export interface TrainingTopicRecord {
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
    progress_percent: number;
  }>;
  _count: {
    questions: number;
  };
}

export interface TrainingRepositorySnapshot {
  context: TrainingContextRecord;
  totals: {
    totalAttempts: number;
    correctAttempts: number;
    incorrectAttempts: number;
    needsReviewCount: number;
  };
  completedSessions: number;
  lastTrainingAt: Date | null;
  topics: TrainingTopicRecord[];
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

async function findPublishedProgram(
  countryCode: string,
  licenseClassCode: string,
): Promise<{
  id: string;
} | null> {
  const today =
    todayUtc();

  const validityWhere = {
    status:
      "published",
    country_code:
      countryCode,
    license_class_code:
      licenseClassCode,
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

  const current =
    await prisma.theory_programs.findFirst({
      where: {
        ...validityWhere,
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
      validityWhere,
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

export async function getTrainingRepositorySnapshot(
  input: {
    userId: string;
    locale: string;
  },
): Promise<TrainingRepositorySnapshot> {
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
        licenseClassId:
          null,
        licenseClassCode:
          null,
        programId:
          null,
      },
      totals: {
        totalAttempts:
          0,
        correctAttempts:
          0,
        incorrectAttempts:
          0,
        needsReviewCount:
          0,
      },
      completedSessions:
        0,
      lastTrainingAt:
        null,
      topics:
        [],
    };
  }

  const program =
    await findPublishedProgram(
      user.country_code,
      activeClass.license_class_code,
    );

  if (!program) {
    return {
      context: {
        userId:
          user.id,
        countryCode:
          user.country_code,
        licenseClassId:
          activeClass.id,
        licenseClassCode:
          activeClass.license_class_code,
        programId:
          null,
      },
      totals: {
        totalAttempts:
          0,
        correctAttempts:
          0,
        incorrectAttempts:
          0,
        needsReviewCount:
          0,
      },
      completedSessions:
        0,
      lastTrainingAt:
        null,
      topics:
        [],
    };
  }

  const today =
    todayUtc();

  const [
    questionTotals,
    needsReviewCount,
    completedSessions,
    lastTraining,
    topics,
  ] =
    await Promise.all([
      prisma.user_question_progress.aggregate({
        where: {
          user_license_class_id:
            activeClass.id,
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

      prisma.user_question_progress.count({
        where: {
          user_license_class_id:
            activeClass.id,
          needs_review:
            true,
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

      prisma.training_sessions.findFirst({
        where: {
          user_license_class_id:
            activeClass.id,
        },
        select: {
          started_at:
            true,
        },
        orderBy: {
          started_at:
            "desc",
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
              progress_percent:
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
      licenseClassId:
        activeClass.id,
      licenseClassCode:
        activeClass.license_class_code,
      programId:
        program.id,
    },
    totals: {
      totalAttempts:
        questionTotals._sum.attempt_count ??
        0,
      correctAttempts:
        questionTotals._sum.correct_count ??
        0,
      incorrectAttempts:
        questionTotals._sum.incorrect_count ??
        0,
      needsReviewCount,
    },
    completedSessions,
    lastTrainingAt:
      lastTraining?.started_at ??
      null,
    topics,
  };
}