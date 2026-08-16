import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  TheoryContext,
} from "@/lib/server/theory/theory-repository";

export interface ErrorQuestionProgressRecord {
  questionId: string;
  topicId: string;
  topicSlug: string;
  penaltyPoints: number;
  attemptCount: number;
  correctCount: number;
  incorrectCount: number;
  lastAnswerCorrect: boolean | null;
  isMastered: boolean;
  needsReview: boolean;
  lastAnsweredAt: Date | null;
  questionTranslations: Array<{
    locale: string;
    prompt: string;
  }>;
  topicTranslations: Array<{
    locale: string;
    title: string;
  }>;
}

export interface ErrorsRepositorySnapshot {
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  needsReviewCount: number;
  masteredQuestions: number;
  questions: ErrorQuestionProgressRecord[];
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

function currentQuestionWhere(
  context: TheoryContext,
) {
  const today =
    todayUtc();

  return {
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
    theory_topics: {
      program_id:
        context.programId!,
      is_active:
        true,
    },
  };
}

export async function getErrorsRepositorySnapshot(
  input: {
    context: TheoryContext;
    locale: string;
    take?: number;
  },
): Promise<ErrorsRepositorySnapshot> {
  if (
    !input.context
      .userLicenseClassId ||
    !input.context
      .programId
  ) {
    return {
      totalAttempts:
        0,
      correctAttempts:
        0,
      incorrectAttempts:
        0,
      needsReviewCount:
        0,
      masteredQuestions:
        0,
      questions:
        [],
    };
  }

  const questionWhere =
    currentQuestionWhere(
      input.context,
    );

  const localeCandidates =
    Array.from(
      new Set([
        input.locale,
        "de",
      ]),
    );

  const take =
    Math.max(
      1,
      Math.min(
        200,
        Math.round(
          input.take ??
            100,
        ),
      ),
    );

  const [
    aggregate,
    needsReviewCount,
    masteredQuestions,
    progressRows,
  ] =
    await Promise.all([
      prisma.user_question_progress.aggregate({
        where: {
          user_license_class_id:
            input.context
              .userLicenseClassId,
          theory_questions:
            questionWhere,
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
            input.context
              .userLicenseClassId,
          needs_review:
            true,
          theory_questions:
            questionWhere,
        },
      }),

      prisma.user_question_progress.count({
        where: {
          user_license_class_id:
            input.context
              .userLicenseClassId,
          is_mastered:
            true,
          theory_questions:
            questionWhere,
        },
      }),

      prisma.user_question_progress.findMany({
        where: {
          user_license_class_id:
            input.context
              .userLicenseClassId,
          needs_review:
            true,
          theory_questions:
            questionWhere,
        },
        select: {
          question_id:
            true,
          attempt_count:
            true,
          correct_count:
            true,
          incorrect_count:
            true,
          last_answer_correct:
            true,
          is_mastered:
            true,
          needs_review:
            true,
          last_answered_at:
            true,
          theory_questions: {
            select: {
              id:
                true,
              penalty_points:
                true,
              translations: {
                where: {
                  locale: {
                    in:
                      localeCandidates,
                  },
                },
                select: {
                  locale:
                    true,
                  prompt:
                    true,
                },
              },
              theory_topics: {
                select: {
                  id:
                    true,
                  slug:
                    true,
                  translations: {
                    where: {
                      locale: {
                        in:
                          localeCandidates,
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
          },
        },
        orderBy: [
          {
            last_answered_at:
              "desc",
          },
          {
            updated_at:
              "desc",
          },
        ],
        take,
      }),
    ]);

  return {
    totalAttempts:
      aggregate._sum
        ?.attempt_count ??
      0,
    correctAttempts:
      aggregate._sum
        ?.correct_count ??
      0,
    incorrectAttempts:
      aggregate._sum
        ?.incorrect_count ??
      0,
    needsReviewCount,
    masteredQuestions,
    questions:
      progressRows.map(
        (
          row,
        ) => ({
          questionId:
            row.question_id,
          topicId:
            row
              .theory_questions
              .theory_topics
              .id,
          topicSlug:
            row
              .theory_questions
              .theory_topics
              .slug,
          penaltyPoints:
            row
              .theory_questions
              .penalty_points,
          attemptCount:
            row.attempt_count,
          correctCount:
            row.correct_count,
          incorrectCount:
            row.incorrect_count,
          lastAnswerCorrect:
            row
              .last_answer_correct,
          isMastered:
            row.is_mastered,
          needsReview:
            row.needs_review,
          lastAnsweredAt:
            row.last_answered_at,
          questionTranslations:
            row
              .theory_questions
              .translations,
          topicTranslations:
            row
              .theory_questions
              .theory_topics
              .translations,
        }),
      ),
  };
}