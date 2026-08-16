import "server-only";

import {
  Prisma,
} from "@prisma/client";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  AdminTheoryCandidateView,
  AdminTheoryExamInput,
  AdminTheoryExamView,
  AdminTheoryLessonInput,
  AdminTheoryLessonView,
  AdminTheoryPageData,
  AdminTheoryProgramInput,
  AdminTheoryProgramView,
  AdminTheoryQuestionInput,
  AdminTheoryQuestionView,
  AdminTheoryReportView,
  AdminTheoryTopicInput,
  AdminTheoryTopicView,
} from "@/types/admin-theory";

export type AdminTheoryStatusTable =
  | "theory_programs"
  | "theory_lessons"
  | "theory_questions"
  | "exam_configurations"
  | "theory_question_reports";

type ConstraintRow = {
  definition: string;
};

const ADMIN_THEORY_TRANSACTION_MAX_WAIT_MS =
  10_000;

const ADMIN_THEORY_TRANSACTION_TIMEOUT_MS =
  60_000;

/**
 * Shared options for Admin Theorie interactive transactions.
 *
 * Program, topic, lesson and question updates can write the main record plus
 * translations/content rows atomically. The remote PostgreSQL connection can
 * exceed Prisma's short default interactive-transaction timeout during local
 * development, so the timeout is explicitly controlled here.
 */
function runAdminTheoryTransaction<T>(
  operation: (
    tx:
      Prisma.TransactionClient,
  ) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    operation,
    {
      maxWait:
        ADMIN_THEORY_TRANSACTION_MAX_WAIT_MS,

      timeout:
        ADMIN_THEORY_TRANSACTION_TIMEOUT_MS,
    },
  );
}

function dateOnly(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

function iso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

function fullName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()]
    .filter(Boolean)
    .join(" ");
}

function jsonValue(value: Prisma.JsonValue | null): unknown | null {
  if (value === null) return null;
  return JSON.parse(JSON.stringify(value)) as unknown;
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function nullableJson(value: unknown | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.DbNull;
  return toJson(value);
}

function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function titleFromTranslations(
  rows: readonly { locale: string; title: string; description?: string | null }[],
  fallback: string,
) {
  const translation =
    rows.find((row) => row.locale === "de") ??
    rows.find((row) => row.locale.startsWith("de-")) ??
    rows[0];

  return {
    title: translation?.title ?? fallback,
    description: translation?.description ?? null,
  };
}

function promptFromTranslations(
  rows: readonly { locale: string; prompt: string; explanation?: string | null }[],
  fallback: string,
) {
  const translation =
    rows.find((row) => row.locale === "de") ??
    rows.find((row) => row.locale.startsWith("de-")) ??
    rows[0];

  return {
    prompt: translation?.prompt ?? fallback,
    explanation: translation?.explanation ?? null,
  };
}

export async function listAllowedStatusValues(
  table: AdminTheoryStatusTable,
): Promise<string[]> {
  const rows = await prisma.$queryRaw<ConstraintRow[]>(
    Prisma.sql`
      SELECT pg_get_constraintdef(oid) AS definition
      FROM pg_constraint
      WHERE conrelid = ${`public.${table}`}::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) ILIKE '%status%'
    `,
  );

  const values = new Set<string>();

  for (const row of rows) {
    const regex =
      /'([^']+)'(?:::(?:character varying|text))?/g;

    for (const match of row.definition.matchAll(regex)) {
      if (match[1]) values.add(match[1]);
    }
  }

  return Array.from(values).sort();
}

export async function findAdminSessionByTokenHashes(
  hashes: string[],
) {
  if (hashes.length === 0) return null;

  return prisma.admin_sessions.findFirst({
    where: {
      token_hash: {
        in: hashes,
      },
      revoked_at: null,
      expires_at: {
        gt: new Date(),
      },
      admin: {
        is: {
          is_active: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      admin: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
        },
      },
    },
  });
}

export async function touchAdminTheoryPresence(
  sessionId: string,
  adminId: string,
): Promise<void> {
  const now = new Date();

  await Promise.allSettled([
    prisma.admin_sessions.update({
      where: { id: sessionId },
      data: { last_seen_at: now },
    }),
    prisma.admin_users.update({
      where: { id: adminId },
      data: { last_seen_at: now },
    }),
  ]);
}

export async function createAdminTheoryAudit(input: {
  adminId: string;
  targetUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: unknown;
}): Promise<void> {
  await prisma.admin_audit_logs.create({
    data: {
      admin_id: input.adminId,
      target_user_id: input.targetUserId ?? null,
      action: input.action.slice(0, 80),
      entity_type: input.entityType.slice(0, 64),
      entity_id: input.entityId?.slice(0, 128) ?? null,
      metadata:
        input.metadata === undefined
          ? undefined
          : toJson(input.metadata),
    },
  });
}

async function mapProgram(
  row: {
    id: string;
    country_code: string;
    license_class_code: string;
    code: string;
    version: string;
    status: string;
    is_current: boolean;
    valid_from: Date | null;
    valid_until: Date | null;
    published_at: Date | null;
    created_at: Date;
    updated_at: Date;
    _count: {
      topics: number;
      exam_configurations: number;
    };
  },
): Promise<AdminTheoryProgramView> {
  const [lessons, questions] =
    await Promise.all([
      prisma.theory_lessons.count({
        where: {
          theory_topics: {
            program_id: row.id,
          },
        },
      }),
      prisma.theory_questions.count({
        where: {
          theory_topics: {
            program_id: row.id,
          },
        },
      }),
    ]);

  return {
    id: row.id,
    countryCode: row.country_code,
    licenseClassCode: row.license_class_code,
    code: row.code,
    version: row.version,
    status: row.status,
    isCurrent: row.is_current,
    validFrom: dateOnly(row.valid_from),
    validUntil: dateOnly(row.valid_until),
    publishedAt: iso(row.published_at),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    counts: {
      topics: row._count.topics,
      lessons,
      questions,
      exams: row._count.exam_configurations,
    },
  };
}

export async function listAdminTheoryPrograms(): Promise<AdminTheoryProgramView[]> {
  const rows =
    await prisma.theory_programs.findMany({
      orderBy: [
        { country_code: "asc" },
        { license_class_code: "asc" },
        { created_at: "desc" },
      ],
      select: {
        id: true,
        country_code: true,
        license_class_code: true,
        code: true,
        version: true,
        status: true,
        is_current: true,
        valid_from: true,
        valid_until: true,
        published_at: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            topics: true,
            exam_configurations: true,
          },
        },
      },
    });

  return Promise.all(rows.map(mapProgram));
}

export async function getAdminTheoryProgram(
  id: string,
): Promise<AdminTheoryProgramView | null> {
  const row =
    await prisma.theory_programs.findUnique({
      where: { id },
      select: {
        id: true,
        country_code: true,
        license_class_code: true,
        code: true,
        version: true,
        status: true,
        is_current: true,
        valid_from: true,
        valid_until: true,
        published_at: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            topics: true,
            exam_configurations: true,
          },
        },
      },
    });

  return row ? mapProgram(row) : null;
}

export async function listAdminTheoryTopics(): Promise<AdminTheoryTopicView[]> {
  const rows =
    await prisma.theory_topics.findMany({
      orderBy: [
        { country_code: "asc" },
        { license_class_code: "asc" },
        { sort_order: "asc" },
      ],
      select: {
        id: true,
        program_id: true,
        country_code: true,
        license_class_code: true,
        slug: true,
        sort_order: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        translations: {
          orderBy: { locale: "asc" },
          select: {
            locale: true,
            title: true,
            description: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            questions: true,
          },
        },
      },
    });

  return rows.map((row) => {
    const primary =
      titleFromTranslations(row.translations, row.slug);

    return {
      id: row.id,
      programId: row.program_id,
      countryCode: row.country_code,
      licenseClassCode: row.license_class_code,
      slug: row.slug,
      sortOrder: row.sort_order,
      isActive: row.is_active,
      title: primary.title,
      description: primary.description,
      translations: row.translations,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      counts: {
        lessons: row._count.lessons,
        questions: row._count.questions,
      },
    };
  });
}

export async function getAdminTheoryTopic(
  id: string,
): Promise<AdminTheoryTopicView | null> {
  const row =
    await prisma.theory_topics.findUnique({
      where: { id },
      select: {
        id: true,
        program_id: true,
        country_code: true,
        license_class_code: true,
        slug: true,
        sort_order: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        translations: {
          orderBy: { locale: "asc" },
          select: {
            locale: true,
            title: true,
            description: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            questions: true,
          },
        },
      },
    });

  if (!row) return null;
  const primary = titleFromTranslations(row.translations, row.slug);

  return {
    id: row.id,
    programId: row.program_id,
    countryCode: row.country_code,
    licenseClassCode: row.license_class_code,
    slug: row.slug,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    title: primary.title,
    description: primary.description,
    translations: row.translations,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    counts: {
      lessons: row._count.lessons,
      questions: row._count.questions,
    },
  };
}

const lessonListSelect = {
  id: true,
  topic_id: true,
  slug: true,
  sort_order: true,
  estimated_duration_minutes: true,
  status: true,
  version: true,
  valid_from: true,
  valid_until: true,
  published_at: true,
  created_at: true,
  updated_at: true,
  translations: {
    orderBy: { locale: "asc" as const },
    select: {
      locale: true,
      title: true,
      description: true,
    },
  },
  theory_topics: {
    select: {
      program_id: true,
      slug: true,
      translations: {
        orderBy: { locale: "asc" as const },
        select: {
          locale: true,
          title: true,
          description: true,
        },
      },
      theory_programs: {
        select: {
          code: true,
        },
      },
    },
  },
  _count: {
    select: {
      content_blocks: true,
      user_progress: true,
    },
  },
} satisfies Prisma.theory_lessonsSelect;

type LessonListRow =
  Prisma.theory_lessonsGetPayload<{
    select: typeof lessonListSelect;
  }>;

function mapLessonListRow(
  row: LessonListRow,
): AdminTheoryLessonView {
  const primary =
    titleFromTranslations(row.translations, row.slug);
  const topic =
    titleFromTranslations(
      row.theory_topics.translations,
      row.theory_topics.slug,
    );

  return {
    id: row.id,
    topicId: row.topic_id,
    programId: row.theory_topics.program_id,
    programCode: row.theory_topics.theory_programs.code,
    topicTitle: topic.title,
    slug: row.slug,
    sortOrder: row.sort_order,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    status: row.status,
    version: row.version,
    validFrom: dateOnly(row.valid_from),
    validUntil: dateOnly(row.valid_until),
    publishedAt: iso(row.published_at),
    title: primary.title,
    description: primary.description,
    translations: row.translations,
    contentBlocks: [],
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    counts: {
      blocks: row._count.content_blocks,
      learners: row._count.user_progress,
    },
  };
}

export async function listAdminTheoryLessons(): Promise<AdminTheoryLessonView[]> {
  const rows =
    await prisma.theory_lessons.findMany({
      orderBy: [
        { theory_topics: { sort_order: "asc" } },
        { sort_order: "asc" },
      ],
      select: lessonListSelect,
    });

  return rows.map(mapLessonListRow);
}

export async function getAdminTheoryLesson(
  id: string,
): Promise<AdminTheoryLessonView | null> {
  const row =
    await prisma.theory_lessons.findUnique({
      where: { id },
      select: {
        ...lessonListSelect,
        content_blocks: {
          orderBy: { sort_order: "asc" },
          select: {
            id: true,
            block_type: true,
            sort_order: true,
            media_storage_path: true,
            question_id: true,
            config_json: true,
            is_active: true,
            translations: {
              orderBy: { locale: "asc" },
              select: {
                locale: true,
                title: true,
                body_text: true,
                content_json: true,
              },
            },
          },
        },
      },
    });

  if (!row) return null;
  const base = mapLessonListRow(row);

  return {
    ...base,
    contentBlocks: row.content_blocks.map((block) => ({
      id: block.id,
      blockType: block.block_type,
      sortOrder: block.sort_order,
      mediaStoragePath: block.media_storage_path,
      questionId: block.question_id,
      configJson: jsonValue(block.config_json),
      isActive: block.is_active,
      translations: block.translations.map((translation) => ({
        locale: translation.locale,
        title: translation.title,
        bodyText: translation.body_text,
        contentJson: jsonValue(translation.content_json),
      })),
    })),
  };
}

const questionSelect = {
  id: true,
  topic_id: true,
  external_ref: true,
  question_type: true,
  penalty_points: true,
  media_storage_path: true,
  is_active: true,
  status: true,
  version: true,
  difficulty: true,
  valid_from: true,
  valid_until: true,
  published_at: true,
  created_at: true,
  updated_at: true,
  translations: {
    orderBy: { locale: "asc" as const },
    select: {
      locale: true,
      prompt: true,
      explanation: true,
      answer_options: true,
      correct_answer: true,
    },
  },
  theory_topics: {
    select: {
      program_id: true,
      slug: true,
      translations: {
        orderBy: { locale: "asc" as const },
        select: {
          locale: true,
          title: true,
          description: true,
        },
      },
      theory_programs: {
        select: {
          code: true,
        },
      },
    },
  },
  _count: {
    select: {
      user_progress: true,
      reports: true,
    },
  },
} satisfies Prisma.theory_questionsSelect;

type QuestionRow =
  Prisma.theory_questionsGetPayload<{
    select: typeof questionSelect;
  }>;

function mapQuestion(
  row: QuestionRow,
): AdminTheoryQuestionView {
  const primary =
    promptFromTranslations(row.translations, row.external_ref ?? row.id);
  const topic =
    titleFromTranslations(
      row.theory_topics.translations,
      row.theory_topics.slug,
    );

  return {
    id: row.id,
    topicId: row.topic_id,
    programId: row.theory_topics.program_id,
    programCode: row.theory_topics.theory_programs.code,
    topicTitle: topic.title,
    externalRef: row.external_ref,
    questionType: row.question_type,
    penaltyPoints: row.penalty_points,
    mediaStoragePath: row.media_storage_path,
    isActive: row.is_active,
    status: row.status,
    version: row.version,
    difficulty: row.difficulty,
    validFrom: dateOnly(row.valid_from),
    validUntil: dateOnly(row.valid_until),
    publishedAt: iso(row.published_at),
    prompt: primary.prompt,
    explanation: primary.explanation,
    translations: row.translations.map((translation) => ({
      locale: translation.locale,
      prompt: translation.prompt,
      explanation: translation.explanation,
      answerOptions: jsonValue(translation.answer_options),
      correctAnswer: jsonValue(translation.correct_answer),
    })),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    counts: {
      answers: row._count.user_progress,
      reports: row._count.reports,
    },
  };
}

export async function listAdminTheoryQuestions(): Promise<AdminTheoryQuestionView[]> {
  const rows =
    await prisma.theory_questions.findMany({
      orderBy: { updated_at: "desc" },
      take: 500,
      select: questionSelect,
    });

  return rows.map(mapQuestion);
}

export async function getAdminTheoryQuestion(
  id: string,
): Promise<AdminTheoryQuestionView | null> {
  const row =
    await prisma.theory_questions.findUnique({
      where: { id },
      select: questionSelect,
    });

  return row ? mapQuestion(row) : null;
}

export async function listAdminTheoryExams(): Promise<AdminTheoryExamView[]> {
  const rows =
    await prisma.exam_configurations.findMany({
      orderBy: { updated_at: "desc" },
      select: {
        id: true,
        program_id: true,
        version: true,
        question_count: true,
        duration_seconds: true,
        scoring_method: true,
        passing_rule: true,
        status: true,
        active_from: true,
        active_until: true,
        published_at: true,
        created_at: true,
        updated_at: true,
        theory_programs: {
          select: {
            code: true,
            country_code: true,
            license_class_code: true,
          },
        },
        _count: {
          select: {
            exam_attempts: true,
          },
        },
      },
    });

  return rows.map((row) => ({
    id: row.id,
    programId: row.program_id,
    programCode: row.theory_programs.code,
    countryCode: row.theory_programs.country_code,
    licenseClassCode: row.theory_programs.license_class_code,
    version: row.version,
    questionCount: row.question_count,
    durationSeconds: row.duration_seconds,
    scoringMethod: row.scoring_method,
    passingRule: jsonValue(row.passing_rule),
    status: row.status,
    activeFrom: dateOnly(row.active_from),
    activeUntil: dateOnly(row.active_until),
    publishedAt: iso(row.published_at),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    attempts: row._count.exam_attempts,
  }));
}

export async function getAdminTheoryExam(
  id: string,
): Promise<AdminTheoryExamView | null> {
  const rows = await listAdminTheoryExams();
  return rows.find((row) => row.id === id) ?? null;
}

export async function listAdminTheoryReports(): Promise<AdminTheoryReportView[]> {
  const rows =
    await prisma.theory_question_reports.findMany({
      orderBy: { created_at: "desc" },
      take: 300,
      select: {
        id: true,
        reason: true,
        message: true,
        status: true,
        resolved_at: true,
        created_at: true,
        updated_at: true,
        resolved_by_admin: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        user_license_classes: {
          select: {
            id: true,
            user_id: true,
            license_class_code: true,
            users: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
        theory_questions: {
          select: {
            id: true,
            external_ref: true,
            translations: {
              orderBy: { locale: "asc" },
              select: {
                locale: true,
                prompt: true,
                explanation: true,
              },
            },
            theory_topics: {
              select: {
                slug: true,
                translations: {
                  orderBy: { locale: "asc" },
                  select: {
                    locale: true,
                    title: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });

  return rows.map((row) => {
    const question =
      promptFromTranslations(
        row.theory_questions.translations,
        row.theory_questions.external_ref ?? row.theory_questions.id,
      );
    const topic =
      titleFromTranslations(
        row.theory_questions.theory_topics.translations,
        row.theory_questions.theory_topics.slug,
      );

    return {
      id: row.id,
      reason: row.reason,
      message: row.message,
      status: row.status,
      resolvedAt: iso(row.resolved_at),
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      question: {
        id: row.theory_questions.id,
        prompt: question.prompt,
        topicTitle: topic.title,
      },
      candidate: {
        userLicenseClassId: row.user_license_classes.id,
        userId: row.user_license_classes.user_id,
        fullName: fullName(
          row.user_license_classes.users.first_name,
          row.user_license_classes.users.last_name,
        ),
        email: row.user_license_classes.users.email,
        licenseClassCode: row.user_license_classes.license_class_code,
      },
      resolvedBy: row.resolved_by_admin
        ? {
            id: row.resolved_by_admin.id,
            fullName: fullName(
              row.resolved_by_admin.first_name,
              row.resolved_by_admin.last_name,
            ),
            email: row.resolved_by_admin.email,
          }
        : null,
    };
  });
}

export async function getAdminTheoryReport(
  id: string,
): Promise<AdminTheoryReportView | null> {
  const reports = await listAdminTheoryReports();
  return reports.find((report) => report.id === id) ?? null;
}

async function mapCandidate(
  row: {
    id: string;
    user_id: string;
    license_class_code: string;
    status: string;
    is_primary: boolean;
    started_at: Date;
    target_exam_date: Date | null;
    users: {
      first_name: string;
      last_name: string;
      email: string;
      country_code: string;
    };
    learning_progress: {
      current_day: number;
      completed_days: number;
      completed_lessons: number;
      answered_questions: number;
      correct_answers: number;
      readiness_score: number;
      total_study_minutes: number;
      last_activity_at: Date | null;
    } | null;
  },
): Promise<AdminTheoryCandidateView> {
  const [
    topicsStarted,
    lessonsStarted,
    lessonsCompleted,
    questionRows,
    needsReview,
    mastered,
    simulations,
    simulationsPassed,
    study,
  ] = await Promise.all([
    prisma.user_topic_progress.count({
      where: {
        user_license_class_id: row.id,
        answered_questions: { gt: 0 },
      },
    }),
    prisma.user_lesson_progress.count({
      where: {
        user_license_class_id: row.id,
        started_at: { not: null },
      },
    }),
    prisma.user_lesson_progress.count({
      where: {
        user_license_class_id: row.id,
        completed: true,
      },
    }),
    prisma.user_question_progress.count({
      where: { user_license_class_id: row.id },
    }),
    prisma.user_question_progress.count({
      where: {
        user_license_class_id: row.id,
        needs_review: true,
      },
    }),
    prisma.user_question_progress.count({
      where: {
        user_license_class_id: row.id,
        is_mastered: true,
      },
    }),
    prisma.exam_attempts.count({
      where: {
        user_license_class_id: row.id,
        attempt_type: "theory_simulation",
      },
    }),
    prisma.exam_attempts.count({
      where: {
        user_license_class_id: row.id,
        attempt_type: "theory_simulation",
        passed: true,
      },
    }),
    prisma.theory_study_sessions.aggregate({
      where: { user_license_class_id: row.id },
      _sum: { active_seconds: true },
    }),
  ]);

  return {
    userLicenseClassId: row.id,
    userId: row.user_id,
    fullName: fullName(row.users.first_name, row.users.last_name),
    email: row.users.email,
    countryCode: row.users.country_code,
    licenseClassCode: row.license_class_code,
    classStatus: row.status,
    isPrimary: row.is_primary,
    startedAt: row.started_at.toISOString(),
    targetExamDate: dateOnly(row.target_exam_date),
    progress: {
      currentDay: row.learning_progress?.current_day ?? null,
      completedDays: row.learning_progress?.completed_days ?? 0,
      completedLessons: row.learning_progress?.completed_lessons ?? 0,
      answeredQuestions: row.learning_progress?.answered_questions ?? 0,
      correctAnswers: row.learning_progress?.correct_answers ?? 0,
      readinessScore: row.learning_progress?.readiness_score ?? 0,
      totalStudyMinutes: row.learning_progress?.total_study_minutes ?? 0,
      lastActivityAt: iso(row.learning_progress?.last_activity_at ?? null),
    },
    metrics: {
      topicsStarted,
      lessonsStarted,
      lessonsCompleted,
      questionRows,
      questionsNeedsReview: needsReview,
      masteredQuestions: mastered,
      simulations,
      simulationsPassed,
      activeStudySeconds: study._sum.active_seconds ?? 0,
    },
  };
}

export async function listAdminTheoryCandidates(): Promise<AdminTheoryCandidateView[]> {
  const rows =
    await prisma.user_license_classes.findMany({
      where: {
        status: {
          not: "cancelled",
        },
      },
      orderBy: { started_at: "desc" },
      take: 100,
      select: {
        id: true,
        user_id: true,
        license_class_code: true,
        status: true,
        is_primary: true,
        started_at: true,
        target_exam_date: true,
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            country_code: true,
          },
        },
        learning_progress: {
          select: {
            current_day: true,
            completed_days: true,
            completed_lessons: true,
            answered_questions: true,
            correct_answers: true,
            readiness_score: true,
            total_study_minutes: true,
            last_activity_at: true,
          },
        },
      },
    });

  const ids =
    rows.map((row) => row.id);

  if (ids.length === 0) {
    return [];
  }

  const [
    topicGroups,
    lessonStartedGroups,
    lessonCompletedGroups,
    questionGroups,
    reviewGroups,
    masteredGroups,
    simulationGroups,
    simulationPassedGroups,
    studyGroups,
  ] = await Promise.all([
    prisma.user_topic_progress.groupBy({
      by: ["user_license_class_id"],
      where: {
        user_license_class_id: { in: ids },
        answered_questions: { gt: 0 },
      },
      _count: { id: true },
    }),
    prisma.user_lesson_progress.groupBy({
      by: ["user_license_class_id"],
      where: {
        user_license_class_id: { in: ids },
        started_at: { not: null },
      },
      _count: { id: true },
    }),
    prisma.user_lesson_progress.groupBy({
      by: ["user_license_class_id"],
      where: {
        user_license_class_id: { in: ids },
        completed: true,
      },
      _count: { id: true },
    }),
    prisma.user_question_progress.groupBy({
      by: ["user_license_class_id"],
      where: {
        user_license_class_id: { in: ids },
      },
      _count: { id: true },
    }),
    prisma.user_question_progress.groupBy({
      by: ["user_license_class_id"],
      where: {
        user_license_class_id: { in: ids },
        needs_review: true,
      },
      _count: { id: true },
    }),
    prisma.user_question_progress.groupBy({
      by: ["user_license_class_id"],
      where: {
        user_license_class_id: { in: ids },
        is_mastered: true,
      },
      _count: { id: true },
    }),
    prisma.exam_attempts.groupBy({
      by: ["user_license_class_id"],
      where: {
        user_license_class_id: { in: ids },
        attempt_type: "theory_simulation",
      },
      _count: { id: true },
    }),
    prisma.exam_attempts.groupBy({
      by: ["user_license_class_id"],
      where: {
        user_license_class_id: { in: ids },
        attempt_type: "theory_simulation",
        passed: true,
      },
      _count: { id: true },
    }),
    prisma.theory_study_sessions.groupBy({
      by: ["user_license_class_id"],
      where: {
        user_license_class_id: { in: ids },
      },
      _sum: { active_seconds: true },
    }),
  ]);

  const countMap =
    (
      groups: Array<{
        user_license_class_id: string;
        _count: { id: number };
      }>,
    ) =>
      new Map(
        groups.map((group) => [
          group.user_license_class_id,
          group._count.id,
        ]),
      );

  const topicMap = countMap(topicGroups);
  const lessonStartedMap = countMap(lessonStartedGroups);
  const lessonCompletedMap = countMap(lessonCompletedGroups);
  const questionMap = countMap(questionGroups);
  const reviewMap = countMap(reviewGroups);
  const masteredMap = countMap(masteredGroups);
  const simulationMap = countMap(simulationGroups);
  const simulationPassedMap = countMap(simulationPassedGroups);
  const studyMap =
    new Map(
      studyGroups.map((group) => [
        group.user_license_class_id,
        group._sum.active_seconds ?? 0,
      ]),
    );

  return rows.map((row) => ({
    userLicenseClassId: row.id,
    userId: row.user_id,
    fullName: fullName(
      row.users.first_name,
      row.users.last_name,
    ),
    email: row.users.email,
    countryCode: row.users.country_code,
    licenseClassCode: row.license_class_code,
    classStatus: row.status,
    isPrimary: row.is_primary,
    startedAt: row.started_at.toISOString(),
    targetExamDate: dateOnly(row.target_exam_date),
    progress: {
      currentDay: row.learning_progress?.current_day ?? null,
      completedDays: row.learning_progress?.completed_days ?? 0,
      completedLessons: row.learning_progress?.completed_lessons ?? 0,
      answeredQuestions: row.learning_progress?.answered_questions ?? 0,
      correctAnswers: row.learning_progress?.correct_answers ?? 0,
      readinessScore: row.learning_progress?.readiness_score ?? 0,
      totalStudyMinutes: row.learning_progress?.total_study_minutes ?? 0,
      lastActivityAt: iso(row.learning_progress?.last_activity_at ?? null),
    },
    metrics: {
      topicsStarted: topicMap.get(row.id) ?? 0,
      lessonsStarted: lessonStartedMap.get(row.id) ?? 0,
      lessonsCompleted: lessonCompletedMap.get(row.id) ?? 0,
      questionRows: questionMap.get(row.id) ?? 0,
      questionsNeedsReview: reviewMap.get(row.id) ?? 0,
      masteredQuestions: masteredMap.get(row.id) ?? 0,
      simulations: simulationMap.get(row.id) ?? 0,
      simulationsPassed: simulationPassedMap.get(row.id) ?? 0,
      activeStudySeconds: studyMap.get(row.id) ?? 0,
    },
  }));
}

export async function getAdminTheoryCandidate(
  id: string,
): Promise<AdminTheoryCandidateView | null> {
  const row =
    await prisma.user_license_classes.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        license_class_code: true,
        status: true,
        is_primary: true,
        started_at: true,
        target_exam_date: true,
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            country_code: true,
          },
        },
        learning_progress: {
          select: {
            current_day: true,
            completed_days: true,
            completed_lessons: true,
            answered_questions: true,
            correct_answers: true,
            readiness_score: true,
            total_study_minutes: true,
            last_activity_at: true,
          },
        },
      },
    });

  return row ? mapCandidate(row) : null;
}

export async function createAdminTheoryProgramRepository(
  input: AdminTheoryProgramInput & { status: string },
): Promise<AdminTheoryProgramView> {
  const row =
    await runAdminTheoryTransaction(async (tx) => {
      if (input.isCurrent) {
        await tx.theory_programs.updateMany({
          where: {
            country_code: input.countryCode,
            license_class_code: input.licenseClassCode,
          },
          data: {
            is_current: false,
          },
        });
      }

      return tx.theory_programs.create({
        data: {
          country_code: input.countryCode,
          license_class_code: input.licenseClassCode,
          code: input.code,
          version: input.version,
          status: input.status,
          is_current: input.isCurrent,
          valid_from: toDate(input.validFrom),
          valid_until: toDate(input.validUntil),
          published_at:
            input.status === "published" ? new Date() : null,
        },
        select: {
          id: true,
        },
      });
    });

  const created = await getAdminTheoryProgram(row.id);
  if (!created) throw new Error("Created theory program could not be reloaded.");
  return created;
}

export async function updateAdminTheoryProgramRepository(
  id: string,
  input: AdminTheoryProgramInput & { status: string },
): Promise<AdminTheoryProgramView> {
  await runAdminTheoryTransaction(async (tx) => {
    if (input.isCurrent) {
      await tx.theory_programs.updateMany({
        where: {
          country_code: input.countryCode,
          license_class_code: input.licenseClassCode,
          id: { not: id },
        },
        data: {
          is_current: false,
        },
      });
    }

    await tx.theory_programs.update({
      where: { id },
      data: {
        country_code: input.countryCode,
        license_class_code: input.licenseClassCode,
        code: input.code,
        version: input.version,
        status: input.status,
        is_current: input.isCurrent,
        valid_from: toDate(input.validFrom),
        valid_until: toDate(input.validUntil),
        published_at:
          input.status === "published" ? new Date() : null,
      },
    });
  });

  const updated = await getAdminTheoryProgram(id);
  if (!updated) throw new Error("Theory program could not be reloaded.");
  return updated;
}

async function syncGenericTranslations(
  tx: Prisma.TransactionClient,
  entity: "topic" | "lesson",
  entityId: string,
  translations: AdminTheoryTopicInput["translations"],
) {
  const locales = translations.map((row) => row.locale);

  if (entity === "topic") {
    await tx.theory_topic_translations.deleteMany({
      where: {
        topic_id: entityId,
        locale: { notIn: locales },
      },
    });

    for (const translation of translations) {
      await tx.theory_topic_translations.upsert({
        where: {
          topic_id_locale: {
            topic_id: entityId,
            locale: translation.locale,
          },
        },
        create: {
          topic_id: entityId,
          locale: translation.locale,
          title: translation.title,
          description: translation.description,
        },
        update: {
          title: translation.title,
          description: translation.description,
        },
      });
    }
    return;
  }

  await tx.theory_lesson_translations.deleteMany({
    where: {
      lesson_id: entityId,
      locale: { notIn: locales },
    },
  });

  for (const translation of translations) {
    await tx.theory_lesson_translations.upsert({
      where: {
        lesson_id_locale: {
          lesson_id: entityId,
          locale: translation.locale,
        },
      },
      create: {
        lesson_id: entityId,
        locale: translation.locale,
        title: translation.title,
        description: translation.description,
      },
      update: {
        title: translation.title,
        description: translation.description,
      },
    });
  }
}

export async function createAdminTheoryTopicRepository(
  input: AdminTheoryTopicInput,
): Promise<AdminTheoryTopicView> {
  const program =
    await prisma.theory_programs.findUnique({
      where: { id: input.programId },
      select: {
        country_code: true,
        license_class_code: true,
      },
    });

  if (!program) throw new Error("Theory program not found.");

  const created =
    await runAdminTheoryTransaction(async (tx) => {
      const topic =
        await tx.theory_topics.create({
          data: {
            program_id: input.programId,
            country_code: program.country_code,
            license_class_code: program.license_class_code,
            slug: input.slug,
            sort_order: input.sortOrder,
            is_active: input.isActive,
          },
          select: { id: true },
        });

      await syncGenericTranslations(
        tx,
        "topic",
        topic.id,
        input.translations,
      );

      return topic;
    });

  const row = await getAdminTheoryTopic(created.id);
  if (!row) throw new Error("Created theory topic could not be reloaded.");
  return row;
}

export async function updateAdminTheoryTopicRepository(
  id: string,
  input: AdminTheoryTopicInput,
): Promise<AdminTheoryTopicView> {
  const program =
    await prisma.theory_programs.findUnique({
      where: { id: input.programId },
      select: {
        country_code: true,
        license_class_code: true,
      },
    });

  if (!program) throw new Error("Theory program not found.");

  await runAdminTheoryTransaction(async (tx) => {
    await tx.theory_topics.update({
      where: { id },
      data: {
        program_id: input.programId,
        country_code: program.country_code,
        license_class_code: program.license_class_code,
        slug: input.slug,
        sort_order: input.sortOrder,
        is_active: input.isActive,
      },
    });

    await syncGenericTranslations(
      tx,
      "topic",
      id,
      input.translations,
    );
  });

  const row = await getAdminTheoryTopic(id);
  if (!row) throw new Error("Theory topic could not be reloaded.");
  return row;
}

async function createLessonBlocks(
  tx: Prisma.TransactionClient,
  lessonId: string,
  blocks: AdminTheoryLessonInput["contentBlocks"],
) {
  for (const block of blocks) {
    const created =
      await tx.theory_lesson_content_blocks.create({
        data: {
          lesson_id: lessonId,
          block_type: block.blockType,
          sort_order: block.sortOrder,
          media_storage_path: block.mediaStoragePath,
          question_id: block.questionId,
          config_json: nullableJson(block.configJson),
          is_active: block.isActive,
        },
        select: { id: true },
      });

    for (const translation of block.translations) {
      await tx.theory_lesson_content_block_translations.create({
        data: {
          block_id: created.id,
          locale: translation.locale,
          title: translation.title,
          body_text: translation.bodyText,
          content_json: nullableJson(translation.contentJson),
        },
      });
    }
  }
}

export async function createAdminTheoryLessonRepository(
  input: AdminTheoryLessonInput & { status: string },
): Promise<AdminTheoryLessonView> {
  const created =
    await runAdminTheoryTransaction(async (tx) => {
      const lesson =
        await tx.theory_lessons.create({
          data: {
            topic_id: input.topicId,
            slug: input.slug,
            sort_order: input.sortOrder,
            estimated_duration_minutes: input.estimatedDurationMinutes,
            status: input.status,
            valid_from: toDate(input.validFrom),
            valid_until: toDate(input.validUntil),
            published_at:
              input.status === "published" ? new Date() : null,
          },
          select: { id: true },
        });

      await syncGenericTranslations(
        tx,
        "lesson",
        lesson.id,
        input.translations,
      );

      await createLessonBlocks(
        tx,
        lesson.id,
        input.contentBlocks,
      );

      return lesson;
    });

  const row = await getAdminTheoryLesson(created.id);
  if (!row) throw new Error("Created theory lesson could not be reloaded.");
  return row;
}

export async function updateAdminTheoryLessonRepository(
  id: string,
  input: AdminTheoryLessonInput & { status: string },
): Promise<AdminTheoryLessonView> {
  await runAdminTheoryTransaction(async (tx) => {
    const current =
      await tx.theory_lessons.findUnique({
        where: { id },
        select: { version: true },
      });

    if (!current) throw new Error("Theory lesson not found.");

    await tx.theory_lessons.update({
      where: { id },
      data: {
        topic_id: input.topicId,
        slug: input.slug,
        sort_order: input.sortOrder,
        estimated_duration_minutes: input.estimatedDurationMinutes,
        status: input.status,
        version: current.version + 1,
        valid_from: toDate(input.validFrom),
        valid_until: toDate(input.validUntil),
        published_at:
          input.status === "published" ? new Date() : null,
      },
    });

    await syncGenericTranslations(
      tx,
      "lesson",
      id,
      input.translations,
    );

    await tx.theory_lesson_content_blocks.deleteMany({
      where: { lesson_id: id },
    });

    await createLessonBlocks(
      tx,
      id,
      input.contentBlocks,
    );
  });

  const row = await getAdminTheoryLesson(id);
  if (!row) throw new Error("Theory lesson could not be reloaded.");
  return row;
}

async function syncQuestionTranslations(
  tx: Prisma.TransactionClient,
  questionId: string,
  translations: AdminTheoryQuestionInput["translations"],
) {
  const locales = translations.map((row) => row.locale);

  await tx.theory_question_translations.deleteMany({
    where: {
      question_id: questionId,
      locale: { notIn: locales },
    },
  });

  for (const translation of translations) {
    await tx.theory_question_translations.upsert({
      where: {
        question_id_locale: {
          question_id: questionId,
          locale: translation.locale,
        },
      },
      create: {
        question_id: questionId,
        locale: translation.locale,
        prompt: translation.prompt,
        explanation: translation.explanation,
        answer_options: nullableJson(translation.answerOptions),
        correct_answer: nullableJson(translation.correctAnswer),
      },
      update: {
        prompt: translation.prompt,
        explanation: translation.explanation,
        answer_options: nullableJson(translation.answerOptions),
        correct_answer: nullableJson(translation.correctAnswer),
      },
    });
  }
}

export async function createAdminTheoryQuestionRepository(
  input: AdminTheoryQuestionInput & {
    status: string;
    forceInactive?: boolean;
  },
): Promise<AdminTheoryQuestionView> {
  const created =
    await runAdminTheoryTransaction(async (tx) => {
      const question =
        await tx.theory_questions.create({
          data: {
            topic_id: input.topicId,
            external_ref: input.externalRef,
            question_type: input.questionType,
            penalty_points: input.penaltyPoints,
            difficulty: input.difficulty,
            status: input.status,
            is_active:
              input.forceInactive ? false : input.isActive,
            valid_from: toDate(input.validFrom),
            valid_until: toDate(input.validUntil),
            published_at:
              input.status === "published" && !input.forceInactive
                ? new Date()
                : null,
          },
          select: { id: true },
        });

      await syncQuestionTranslations(
        tx,
        question.id,
        input.translations,
      );

      return question;
    });

  const row = await getAdminTheoryQuestion(created.id);
  if (!row) throw new Error("Created theory question could not be reloaded.");
  return row;
}

export async function updateAdminTheoryQuestionRepository(
  id: string,
  input: AdminTheoryQuestionInput & { status: string },
): Promise<AdminTheoryQuestionView> {
  await runAdminTheoryTransaction(async (tx) => {
    const current =
      await tx.theory_questions.findUnique({
        where: { id },
        select: {
          id: true,
          topic_id: true,
          external_ref: true,
          question_type: true,
          penalty_points: true,
          media_storage_path: true,
          is_active: true,
          status: true,
          version: true,
          difficulty: true,
          valid_from: true,
          valid_until: true,
          published_at: true,
          translations: {
            select: {
              locale: true,
              prompt: true,
              explanation: true,
              answer_options: true,
              correct_answer: true,
            },
          },
        },
      });

    if (!current) throw new Error("Theory question not found.");

    await tx.theory_question_versions.upsert({
      where: {
        question_id_version: {
          question_id: id,
          version: current.version,
        },
      },
      create: {
        question_id: id,
        version: current.version,
        snapshot: toJson({
          ...current,
          valid_from: dateOnly(current.valid_from),
          valid_until: dateOnly(current.valid_until),
          published_at: iso(current.published_at),
          translations: current.translations.map((translation) => ({
            ...translation,
            answer_options: jsonValue(translation.answer_options),
            correct_answer: jsonValue(translation.correct_answer),
          })),
        }),
      },
      update: {},
    });

    await tx.theory_questions.update({
      where: { id },
      data: {
        topic_id: input.topicId,
        external_ref: input.externalRef,
        question_type: input.questionType,
        penalty_points: input.penaltyPoints,
        difficulty: input.difficulty,
        status: input.status,
        is_active: input.isActive,
        version: current.version + 1,
        valid_from: toDate(input.validFrom),
        valid_until: toDate(input.validUntil),
        published_at:
          input.status === "published" && input.isActive
            ? new Date()
            : null,
      },
    });

    await syncQuestionTranslations(
      tx,
      id,
      input.translations,
    );
  });

  const row = await getAdminTheoryQuestion(id);
  if (!row) throw new Error("Theory question could not be reloaded.");
  return row;
}

export async function updateAdminTheoryQuestionMediaPath(
  id: string,
  mediaStoragePath: string | null,
): Promise<AdminTheoryQuestionView> {
  await prisma.theory_questions.update({
    where: { id },
    data: {
      media_storage_path: mediaStoragePath,
    },
  });

  const row = await getAdminTheoryQuestion(id);
  if (!row) throw new Error("Theory question could not be reloaded.");
  return row;
}

export async function createAdminTheoryExamRepository(
  input: AdminTheoryExamInput & { status: string },
): Promise<AdminTheoryExamView> {
  const created =
    await prisma.exam_configurations.create({
      data: {
        program_id: input.programId,
        version: input.version,
        question_count: input.questionCount,
        duration_seconds: input.durationSeconds,
        scoring_method: input.scoringMethod,
        passing_rule: toJson(input.passingRule),
        status: input.status,
        active_from: toDate(input.activeFrom),
        active_until: toDate(input.activeUntil),
        published_at:
          input.status === "published" ? new Date() : null,
      },
      select: { id: true },
    });

  const row = await getAdminTheoryExam(created.id);
  if (!row) throw new Error("Created exam configuration could not be reloaded.");
  return row;
}

export async function updateAdminTheoryExamRepository(
  id: string,
  input: AdminTheoryExamInput & { status: string },
): Promise<AdminTheoryExamView> {
  await prisma.exam_configurations.update({
    where: { id },
    data: {
      program_id: input.programId,
      version: input.version,
      question_count: input.questionCount,
      duration_seconds: input.durationSeconds,
      scoring_method: input.scoringMethod,
      passing_rule: toJson(input.passingRule),
      status: input.status,
      active_from: toDate(input.activeFrom),
      active_until: toDate(input.activeUntil),
      published_at:
        input.status === "published" ? new Date() : null,
    },
  });

  const row = await getAdminTheoryExam(id);
  if (!row) throw new Error("Exam configuration could not be reloaded.");
  return row;
}

export async function resolveAdminTheoryReportRepository(
  id: string,
  adminId: string,
  status: string,
): Promise<AdminTheoryReportView> {
  await prisma.theory_question_reports.update({
    where: { id },
    data: {
      status,
      resolved_by_admin_id: adminId,
      resolved_at: new Date(),
    },
  });

  const row = await getAdminTheoryReport(id);
  if (!row) throw new Error("Theory report could not be reloaded.");
  return row;
}

export async function getAdminTheoryPageDataRepository():
  Promise<AdminTheoryPageData> {
  const [
    programs,
    topics,
    lessons,
    questions,
    exams,
    reports,
    candidates,
  ] = await Promise.all([
    listAdminTheoryPrograms(),
    listAdminTheoryTopics(),
    listAdminTheoryLessons(),
    listAdminTheoryQuestions(),
    listAdminTheoryExams(),
    listAdminTheoryReports(),
    listAdminTheoryCandidates(),
  ]);

  return {
    programs,
    topics,
    lessons,
    questions,
    exams,
    reports,
    candidates,
    stats: {
      programs: programs.length,
      currentPrograms:
        programs.filter((row) => row.isCurrent).length,
      activeTopics:
        topics.filter((row) => row.isActive).length,
      lessons: lessons.length,
      publishedLessons:
        lessons.filter((row) => row.status === "published").length,
      questions: questions.length,
      publishedQuestions:
        questions.filter(
          (row) =>
            row.status === "published" &&
            row.isActive,
        ).length,
      openReports:
        reports.filter(
          (row) =>
            row.status !== "resolved" &&
            row.status !== "closed",
        ).length,
      candidates: candidates.length,
    },
    generatedAt: new Date().toISOString(),
  };
}
