import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import {
  getTheoryContextForUser,
  listTheoryLessons,
  pickTheoryTranslation,
} from "@/lib/server/theory/theory-repository";
import type { ClientShellLocale } from "@/types/client-shell";

function localeFallbacks(locale: ClientShellLocale): ClientShellLocale[] {
  return locale === "de" ? ["de"] : [locale, "de"];
}

function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );
}

function publishedQuestionWhere(): Prisma.theory_questionsWhereInput {
  const date = todayUtc();

  return {
    status: "published",
    is_active: true,
    AND: [
      {
        OR: [
          { valid_from: null },
          { valid_from: { lte: date } },
        ],
      },
      {
        OR: [
          { valid_until: null },
          { valid_until: { gte: date } },
        ],
      },
    ],
  };
}

function percent(value: number | null | undefined): number {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

export interface GermanTheoryTopicListItem {
  id: string;
  slug: string;
  sortOrder: number;
  title: string;
  description: string | null;
  questionCount: number;
  lessonCount: number;
  reviewQuestions: number;
  masteredQuestions: number;
  progress: {
    answeredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    progressPercent: number;
    masteryScore: number;
    lastTrainedAt: string | null;
  };
}

export interface GermanTheoryTopicPageData extends GermanTheoryTopicListItem {
  countryCode: "DE";
  licenseClassCode: string;
  lessons: readonly {
    id: string;
    topicId: string;
    slug: string;
    sortOrder: number;
    title: string;
    description: string | null;
    estimatedDurationMinutes: number | null;
    progressPercent: number;
    currentBlockIndex: number;
    completed: boolean;
    lastActivityAt: string | null;
  }[];
}

async function topicCounters(input: {
  topicId: string;
  userLicenseClassId: string;
}) {
  const questionWhere = publishedQuestionWhere();

  return Promise.all([
    prisma.theory_questions.count({
      where: {
        topic_id: input.topicId,
        ...questionWhere,
      },
    }),
    prisma.theory_lessons.count({
      where: {
        topic_id: input.topicId,
        status: "published",
        AND: [
          {
            OR: [
              { valid_from: null },
              { valid_from: { lte: todayUtc() } },
            ],
          },
          {
            OR: [
              { valid_until: null },
              { valid_until: { gte: todayUtc() } },
            ],
          },
        ],
      },
    }),
    prisma.user_question_progress.count({
      where: {
        user_license_class_id: input.userLicenseClassId,
        needs_review: true,
        theory_questions: {
          topic_id: input.topicId,
          ...questionWhere,
        },
      },
    }),
    prisma.user_question_progress.count({
      where: {
        user_license_class_id: input.userLicenseClassId,
        is_mastered: true,
        theory_questions: {
          topic_id: input.topicId,
          ...questionWhere,
        },
      },
    }),
  ]);
}

export async function listGermanTheoryTopicsForUser(
  userId: string,
  locale: ClientShellLocale,
): Promise<readonly GermanTheoryTopicListItem[]> {
  const context = await getTheoryContextForUser(userId, locale);

  if (
    context.countryCode !== "DE" ||
    !context.userLicenseClassId ||
    !context.programId
  ) {
    return [];
  }

  const rows = await prisma.theory_topics.findMany({
    where: {
      program_id: context.programId,
      country_code: "DE",
      is_active: true,
    },
    orderBy: { sort_order: "asc" },
    select: {
      id: true,
      slug: true,
      sort_order: true,
      translations: {
        where: {
          locale: { in: localeFallbacks(locale) },
        },
        select: {
          locale: true,
          title: true,
          description: true,
        },
      },
      user_progress: {
        where: {
          user_license_class_id: context.userLicenseClassId,
        },
        take: 1,
        select: {
          answered_questions: true,
          correct_answers: true,
          incorrect_answers: true,
          progress_percent: true,
          mastery_score: true,
          last_trained_at: true,
        },
      },
    },
  });

  return Promise.all(
    rows.map(async (row) => {
      const translation = pickTheoryTranslation(
        row.translations,
        locale,
      );
      const progress = row.user_progress[0] ?? null;
      const [
        questionCount,
        lessonCount,
        reviewQuestions,
        masteredQuestions,
      ] = await topicCounters({
        topicId: row.id,
        userLicenseClassId: context.userLicenseClassId!,
      });

      return {
        id: row.id,
        slug: row.slug,
        sortOrder: row.sort_order,
        title: translation?.title ?? row.slug,
        description: translation?.description ?? null,
        questionCount,
        lessonCount,
        reviewQuestions,
        masteredQuestions,
        progress: {
          answeredQuestions: progress?.answered_questions ?? 0,
          correctAnswers: progress?.correct_answers ?? 0,
          incorrectAnswers: progress?.incorrect_answers ?? 0,
          progressPercent: percent(progress?.progress_percent),
          masteryScore: percent(progress?.mastery_score),
          lastTrainedAt:
            progress?.last_trained_at?.toISOString() ?? null,
        },
      };
    }),
  );
}

export async function getGermanTheoryTopicPageData(input: {
  userId: string;
  locale: ClientShellLocale;
  topicSlug: string;
}): Promise<GermanTheoryTopicPageData | null> {
  const context = await getTheoryContextForUser(
    input.userId,
    input.locale,
  );

  if (
    context.countryCode !== "DE" ||
    !context.userLicenseClassId ||
    !context.programId ||
    !context.licenseClassCode
  ) {
    return null;
  }

  const topic = await prisma.theory_topics.findFirst({
    where: {
      program_id: context.programId,
      country_code: "DE",
      slug: input.topicSlug,
      is_active: true,
    },
    select: {
      id: true,
      slug: true,
      sort_order: true,
      translations: {
        where: {
          locale: { in: localeFallbacks(input.locale) },
        },
        select: {
          locale: true,
          title: true,
          description: true,
        },
      },
      user_progress: {
        where: {
          user_license_class_id: context.userLicenseClassId,
        },
        take: 1,
        select: {
          answered_questions: true,
          correct_answers: true,
          incorrect_answers: true,
          progress_percent: true,
          mastery_score: true,
          last_trained_at: true,
        },
      },
    },
  });

  if (!topic) return null;

  const translation = pickTheoryTranslation(
    topic.translations,
    input.locale,
  );
  const progress = topic.user_progress[0] ?? null;

  const [
    counters,
    lessons,
  ] = await Promise.all([
    topicCounters({
      topicId: topic.id,
      userLicenseClassId: context.userLicenseClassId,
    }),
    listTheoryLessons(context, topic.slug),
  ]);

  const [
    questionCount,
    lessonCount,
    reviewQuestions,
    masteredQuestions,
  ] = counters;

  return {
    id: topic.id,
    slug: topic.slug,
    sortOrder: topic.sort_order,
    title: translation?.title ?? topic.slug,
    description: translation?.description ?? null,
    countryCode: "DE",
    licenseClassCode: context.licenseClassCode,
    questionCount,
    lessonCount,
    reviewQuestions,
    masteredQuestions,
    progress: {
      answeredQuestions: progress?.answered_questions ?? 0,
      correctAnswers: progress?.correct_answers ?? 0,
      incorrectAnswers: progress?.incorrect_answers ?? 0,
      progressPercent: percent(progress?.progress_percent),
      masteryScore: percent(progress?.mastery_score),
      lastTrainedAt:
        progress?.last_trained_at?.toISOString() ?? null,
    },
    lessons: lessons.map((lesson) => ({
      id: lesson.id,
      topicId: lesson.topicId,
      slug: lesson.slug,
      sortOrder: lesson.sortOrder,
      title: lesson.title,
      description: lesson.description,
      estimatedDurationMinutes: lesson.estimatedDurationMinutes,
      progressPercent: percent(lesson.progressPercent),
      currentBlockIndex: Math.max(0, lesson.currentBlockIndex),
      completed: lesson.completed,
      lastActivityAt: lesson.lastActivityAt?.toISOString() ?? null,
    })),
  };
}
