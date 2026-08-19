import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import type { ClientShellLocale } from "@/types/client-shell";

export type TheoryCountryCode = "DE" | "AT" | "CH" | "BE" | "ES";

export interface TheoryContext {
  userId: string;
  countryCode: TheoryCountryCode;
  locale: ClientShellLocale;
  userLicenseClassId: string | null;
  licenseClassCode: string | null;
  programId: string | null;
  programCode: string | null;
  programVersion: string | null;
  /**
   * Start of the user's current licence-class preparation.
   *
   * Optional on the public context type for backwards compatibility with
   * existing callers/tests that may build TheoryContext objects manually.
   */
  licenseClassStartedAt?: Date | null;
}

export interface TheoryRepositoryTopic {
  id: string;
  slug: string;
  sortOrder: number;
  title: string;
  description: string | null;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  progressPercent: number;
  masteryScore: number;
  lastTrainedAt: Date | null;
}

export interface TheoryRepositoryLearningProgress {
  currentDay: number;
  completedDays: number;
  completedLessons: number;
  answeredQuestions: number;
  correctAnswers: number;
  readinessScore: number;
  totalStudyMinutes: number;
  lastActivityAt: Date | null;
}

export interface TheoryRepositoryQuestionStats {
  totalAttempts: number;
  correctAttempts: number;
  incorrectAttempts: number;
  uniqueQuestionsAnswered: number;
  questionsToReview: number;
  masteredQuestions: number;
  activeQuestions: number;
}

export interface TheoryRepositoryLessonStats {
  totalLessons: number;
  startedLessons: number;
  completedLessons: number;
  activeStudySeconds: number;
}

export interface TheoryRepositoryTraining {
  id: string;
  topicId: string | null;
  topicTitle: string | null;
  sessionType: string;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  scorePercent: number | null;
  durationSeconds: number;
  startedAt: Date;
  completedAt: Date | null;
}

export interface TheoryRepositoryExamAttempt {
  id: string;
  status: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  penaltyPoints: number;
  scorePercent: number | null;
  passed: boolean | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface TheoryOverviewRepositorySnapshot {
  context: TheoryContext;
  learningProgress: TheoryRepositoryLearningProgress | null;
  lessonStats: TheoryRepositoryLessonStats;
  topics: readonly TheoryRepositoryTopic[];
  questionStats: TheoryRepositoryQuestionStats;
  recentTraining: readonly TheoryRepositoryTraining[];
  recentExams: readonly TheoryRepositoryExamAttempt[];
  /**
   * Full aggregates are kept separately from the limited "recent" lists so
   * totals never depend on the last 10 rows only.
   */
  totalPracticeSeconds?: number;
  completedExamCount?: number;
}

export interface TheoryQuestionForAnswer {
  id: string;
  topicId: string;
  questionType: string;
  penaltyPoints: number;
  prompt: string;
  explanation: string | null;
  answerOptions: unknown;
  correctAnswer: unknown;
}

export interface TheoryPublicQuestion {
  id: string;
  topicId: string;
  questionType: string;
  penaltyPoints: number;
  mediaStoragePath: string | null;
  prompt: string;
  answerOptions: unknown;
  favorite: boolean;
}

export interface TheoryErrorQuestion {
  id: string;
  topicId: string;
  topicTitle: string;
  prompt: string;
  questionType: string;
  penaltyPoints: number;
  attemptCount: number;
  correctCount: number;
  incorrectCount: number;
  lastAnswerCorrect: boolean | null;
  isMastered: boolean;
  lastAnsweredAt: Date | null;
}

export interface TheoryFavoriteQuestion {
  id: string;
  topicId: string;
  topicTitle: string;
  prompt: string;
  questionType: string;
  penaltyPoints: number;
  createdAt: Date;
}

export interface TheoryLessonListItem {
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
  lastActivityAt: Date | null;
}

export type TheoryLessonBlockType =
  | "TEXT" | "IMAGE" | "VIDEO" | "INFO"
  | "WARNING" | "TIP" | "EXAMPLE" | "QUESTION";

export interface TheoryLessonBlock {
  id: string;
  type: TheoryLessonBlockType;
  sortOrder: number;
  title: string | null;
  text: string | null;
  content: unknown;
  mediaStoragePath: string | null;
  questionId: string | null;
  config: unknown;
}

export interface TheoryLessonDetail {
  id: string;
  topicId: string;
  topicSlug: string;
  slug: string;
  title: string;
  description: string | null;
  estimatedDurationMinutes: number | null;
  progressPercent: number;
  currentBlockIndex: number;
  completed: boolean;
  blocks: readonly TheoryLessonBlock[];
}

export interface TheoryExamConfigurationRecord {
  id: string;
  programId: string;
  version: string;
  questionCount: number;
  durationSeconds: number;
  scoringMethod: string;
  passingRule: unknown;
}

export interface TheoryExamAttemptDetail {
  id: string;
  status: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  penaltyPoints: number;
  scorePercent: number | null;
  passed: boolean | null;
  startedAt: Date;
  completedAt: Date | null;
  examConfigurationId: string | null;
  configurationSnapshot: unknown;
  answers: readonly {
    id: string;
    questionId: string;
    answerPayload: unknown;
    isCorrect: boolean | null;
    penaltyPoints: number;
    assignedAt: Date;
  }[];
}

function country(value: string): TheoryCountryCode {
  const v = value.trim().toUpperCase();
  return v === "AT" || v === "CH" || v === "BE" || v === "ES" ? v : "DE";
}

function pct(value: number): number {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? Math.round(value) : 0));
}

function today(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
}

export const THEORY_PROGRAM_DAYS = 21;

function clampProgramDay(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(THEORY_PROGRAM_DAYS, Math.round(value)));
}

/**
 * The licence-class start timestamp is the source of truth for the calendar
 * position inside the 21-day programme.
 *
 * We compare UTC calendar days instead of raw elapsed milliseconds so DST
 * changes cannot turn one calendar day into day 1 again.
 */
function utcCalendarDay(value: Date): number {
  return Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  );
}

function deriveProgramDay(startedAt: Date, now = new Date()): number {
  const millisecondsPerDay = 86_400_000;
  const elapsedDays = Math.floor(
    (utcCalendarDay(now) - utcCalendarDay(startedAt)) / millisecondsPerDay,
  );

  return clampProgramDay(elapsedDays + 1);
}

function plannedProgramDate(startedAt: Date, dayNumber: number): Date {
  const base = new Date(utcCalendarDay(startedAt));
  base.setUTCDate(base.getUTCDate() + dayNumber - 1);
  return base;
}

function locales(locale: ClientShellLocale): ClientShellLocale[] {
  return locale === "de" ? ["de"] : [locale, "de"];
}

export function pickTheoryTranslation<T extends { locale: string }>(
  rows: readonly T[],
  locale: ClientShellLocale,
): T | null {
  return rows.find((x) => x.locale === locale)
    ?? rows.find((x) => x.locale === "de")
    ?? rows[0]
    ?? null;
}

function publishedQuestionWhere(): Prisma.theory_questionsWhereInput {
  const d = today();
  return {
    status: "published",
    is_active: true,
    AND: [
      { OR: [{ valid_from: null }, { valid_from: { lte: d } }] },
      { OR: [{ valid_until: null }, { valid_until: { gte: d } }] },
    ],
  };
}

async function currentProgram(countryCode: TheoryCountryCode, classCode: string) {
  const d = today();
  const validity: Prisma.theory_programsWhereInput[] = [
    { OR: [{ valid_from: null }, { valid_from: { lte: d } }] },
    { OR: [{ valid_until: null }, { valid_until: { gte: d } }] },
  ];

  return (
    await prisma.theory_programs.findFirst({
      where: {
        country_code: countryCode,
        license_class_code: classCode,
        status: "published",
        is_current: true,
        AND: validity,
      },
      orderBy: [{ valid_from: "desc" }, { created_at: "desc" }],
      select: { id: true, code: true, version: true },
    })
  ) ?? prisma.theory_programs.findFirst({
    where: {
      country_code: countryCode,
      license_class_code: classCode,
      status: "published",
      AND: validity,
    },
    orderBy: [{ valid_from: "desc" }, { created_at: "desc" }],
    select: { id: true, code: true, version: true },
  });
}

export async function getTheoryContextForUser(
  userId: string,
  locale: ClientShellLocale,
): Promise<TheoryContext> {
  const id = userId.trim();
  if (!id) throw new Error("[Express-Führerschein] Theory userId fehlt.");

  const [user, licenseClass] = await Promise.all([
    prisma.users.findUnique({
      where: { id },
      select: { country_code: true },
    }),
    prisma.user_license_classes.findFirst({
      where: { user_id: id, status: { not: "archived" } },
      orderBy: [{ is_primary: "desc" }, { created_at: "asc" }],
      select: { id: true, license_class_code: true, started_at: true },
    }),
  ]);

  if (!user) throw new Error("[Express-Führerschein] Benutzer wurde nicht gefunden.");

  const countryCode = country(user.country_code);
  if (!licenseClass) {
    return {
      userId: id,
      countryCode,
      locale,
      userLicenseClassId: null,
      licenseClassCode: null,
      programId: null,
      programCode: null,
      programVersion: null,
      licenseClassStartedAt: null,
    };
  }

  const program = await currentProgram(countryCode, licenseClass.license_class_code);

  return {
    userId: id,
    countryCode,
    locale,
    userLicenseClassId: licenseClass.id,
    licenseClassCode: licenseClass.license_class_code,
    programId: program?.id ?? null,
    programCode: program?.code ?? null,
    programVersion: program?.version ?? null,
    licenseClassStartedAt: licenseClass.started_at,
  };
}

/**
 * Keeps the persisted 21-day calendar in sync with the licence-class start
 * date without altering completed/in-progress/skipped day states.
 *
 * - current_day advances automatically with calendar days;
 * - already reached locked days become available;
 * - future days remain locked when they are created;
 * - completed day states are never downgraded;
 * - completed_days stays monotonic and is reconciled with persisted day rows.
 */
export async function syncTheoryProgramTimeline(
  context: TheoryContext,
  now = new Date(),
): Promise<{
  currentDay: number;
  completedDays: number;
}> {
  const classId = context.userLicenseClassId;

  if (!classId) {
    return {
      currentDay: 1,
      completedDays: 0,
    };
  }

  let startedAt = context.licenseClassStartedAt ?? null;

  if (!startedAt) {
    const licenseClass = await prisma.user_license_classes.findUnique({
      where: { id: classId },
      select: { started_at: true },
    });

    startedAt = licenseClass?.started_at ?? null;
  }

  if (!startedAt) {
    const existing = await prisma.learning_progress.findUnique({
      where: { user_license_class_id: classId },
      select: { current_day: true, completed_days: true },
    });

    return {
      currentDay: clampProgramDay(existing?.current_day ?? 1),
      completedDays: Math.max(
        0,
        Math.min(THEORY_PROGRAM_DAYS, existing?.completed_days ?? 0),
      ),
    };
  }

  const existingLearning = await prisma.learning_progress.findUnique({
    where: { user_license_class_id: classId },
    select: { current_day: true, completed_days: true },
  });

  const derivedDay = deriveProgramDay(startedAt, now);
  const storedCurrentDay = clampProgramDay(existingLearning?.current_day ?? 1);
  const storedCompletedDays = Math.max(
    0,
    Math.min(THEORY_PROGRAM_DAYS, existingLearning?.completed_days ?? 0),
  );

  const currentDay = clampProgramDay(
    Math.max(derivedDay, storedCurrentDay, storedCompletedDays),
  );

  await prisma.learning_days.createMany({
    data: Array.from(
      { length: THEORY_PROGRAM_DAYS },
      (_, index) => {
        const dayNumber = index + 1;

        return {
          user_license_class_id: classId,
          day_number: dayNumber,
          status: dayNumber <= currentDay ? "available" : "locked",
          planned_date: plannedProgramDate(startedAt!, dayNumber),
        };
      },
    ),
    skipDuplicates: true,
  });

  /**
   * Only unlock rows that are still explicitly locked.
   * Existing completed/in_progress/skipped rows are deliberately preserved.
   */
  await prisma.learning_days.updateMany({
    where: {
      user_license_class_id: classId,
      day_number: { lte: currentDay },
      status: "locked",
    },
    data: {
      status: "available",
    },
  });

  const completedRows = await prisma.learning_days.count({
    where: {
      user_license_class_id: classId,
      OR: [
        { status: "completed" },
        { completed_at: { not: null } },
      ],
    },
  });

  const completedDays = Math.min(
    currentDay,
    Math.max(storedCompletedDays, completedRows),
  );

  await prisma.learning_progress.upsert({
    where: { user_license_class_id: classId },
    create: {
      user_license_class_id: classId,
      current_day: currentDay,
      completed_days: completedDays,
    },
    update: {
      current_day: currentDay,
      completed_days: completedDays,
    },
  });

  return {
    currentDay,
    completedDays,
  };
}

export async function getTheoryOverviewRepositorySnapshot(
  userId: string,
  locale: ClientShellLocale,
): Promise<TheoryOverviewRepositorySnapshot> {
  const context = await getTheoryContextForUser(userId, locale);
  const classId = context.userLicenseClassId;
  const programId = context.programId;

  if (!classId) {
    return {
      context,
      learningProgress: null,
      lessonStats: { totalLessons: 0, startedLessons: 0, completedLessons: 0, activeStudySeconds: 0 },
      topics: [],
      questionStats: {
        totalAttempts: 0, correctAttempts: 0, incorrectAttempts: 0,
        uniqueQuestionsAnswered: 0, questionsToReview: 0,
        masteredQuestions: 0, activeQuestions: 0,
      },
      recentTraining: [],
      recentExams: [],
      totalPracticeSeconds: 0,
      completedExamCount: 0,
    };
  }

  /**
   * Synchronize the calendar before reading the snapshot so both Theorie and
   * every consumer of learning_progress immediately see the real programme day.
   */
  await syncTheoryProgramTimeline(context);

  if (!programId) {
    const learning = await prisma.learning_progress.findUnique({
      where: { user_license_class_id: classId },
      select: {
        current_day: true, completed_days: true, completed_lessons: true,
        answered_questions: true, correct_answers: true, readiness_score: true,
        total_study_minutes: true, last_activity_at: true,
      },
    });

    return {
      context,
      learningProgress: learning ? {
        currentDay: learning.current_day,
        completedDays: learning.completed_days,
        completedLessons: learning.completed_lessons,
        answeredQuestions: learning.answered_questions,
        correctAnswers: learning.correct_answers,
        readinessScore: learning.readiness_score,
        totalStudyMinutes: learning.total_study_minutes,
        lastActivityAt: learning.last_activity_at,
      } : null,
      lessonStats: { totalLessons: 0, startedLessons: 0, completedLessons: 0, activeStudySeconds: 0 },
      topics: [],
      questionStats: {
        totalAttempts: 0, correctAttempts: 0, incorrectAttempts: 0,
        uniqueQuestionsAnswered: 0, questionsToReview: 0,
        masteredQuestions: 0, activeQuestions: 0,
      },
      recentTraining: [],
      recentExams: [],
      totalPracticeSeconds: 0,
      completedExamCount: 0,
    };
  }

  const ls = locales(locale);
  const q = publishedQuestionWhere();

  const [
    learning,
    topics,
    qAgg,
    uniqueAnswered,
    review,
    mastered,
    activeQuestions,
    totalLessons,
    startedLessons,
    completedLessons,
    studyAgg,
    practiceAgg,
    completedExamCount,
    recentTraining,
    recentExams,
  ] = await Promise.all([
    prisma.learning_progress.findUnique({
      where: { user_license_class_id: classId },
      select: {
        current_day: true, completed_days: true, completed_lessons: true,
        answered_questions: true, correct_answers: true, readiness_score: true,
        total_study_minutes: true, last_activity_at: true,
      },
    }),
    prisma.theory_topics.findMany({
      where: { program_id: programId, is_active: true },
      orderBy: { sort_order: "asc" },
      select: {
        id: true, slug: true, sort_order: true,
        translations: {
          where: { locale: { in: ls } },
          select: { locale: true, title: true, description: true },
        },
        _count: { select: { questions: { where: q } } },
        user_progress: {
          where: { user_license_class_id: classId },
          take: 1,
          select: {
            answered_questions: true, correct_answers: true, incorrect_answers: true,
            progress_percent: true, mastery_score: true, last_trained_at: true,
          },
        },
      },
    }),
    prisma.user_question_progress.aggregate({
      where: {
        user_license_class_id: classId,
        theory_questions: {
          ...q,
          theory_topics: { program_id: programId, is_active: true },
        },
      },
      _sum: { attempt_count: true, correct_count: true, incorrect_count: true },
    }),
    prisma.user_question_progress.count({
      where: {
        user_license_class_id: classId,
        attempt_count: { gt: 0 },
        theory_questions: { ...q, theory_topics: { program_id: programId, is_active: true } },
      },
    }),
    prisma.user_question_progress.count({
      where: {
        user_license_class_id: classId,
        needs_review: true,
        theory_questions: { ...q, theory_topics: { program_id: programId, is_active: true } },
      },
    }),
    prisma.user_question_progress.count({
      where: {
        user_license_class_id: classId,
        is_mastered: true,
        theory_questions: { ...q, theory_topics: { program_id: programId, is_active: true } },
      },
    }),
    prisma.theory_questions.count({
      where: { ...q, theory_topics: { program_id: programId, is_active: true } },
    }),
    prisma.theory_lessons.count({
      where: { status: "published", theory_topics: { program_id: programId, is_active: true } },
    }),
    prisma.user_lesson_progress.count({
      where: {
        user_license_class_id: classId,
        started_at: { not: null },
        theory_lessons: { status: "published", theory_topics: { program_id: programId, is_active: true } },
      },
    }),
    prisma.user_lesson_progress.count({
      where: {
        user_license_class_id: classId,
        completed: true,
        theory_lessons: { status: "published", theory_topics: { program_id: programId, is_active: true } },
      },
    }),
    prisma.theory_study_sessions.aggregate({
      where: { user_license_class_id: classId },
      _sum: { active_seconds: true },
    }),
    prisma.training_sessions.aggregate({
      where: {
        user_license_class_id: classId,
        completed_at: { not: null },
      },
      _sum: { duration_seconds: true },
    }),
    prisma.exam_attempts.count({
      where: {
        user_license_class_id: classId,
        status: "completed",
        OR: [
          { exam_configuration_id: null },
          { exam_configurations: { program_id: programId } },
        ],
      },
    }),
    prisma.training_sessions.findMany({
      where: {
        user_license_class_id: classId,
        OR: [{ topic_id: null }, { theory_topics: { program_id: programId } }],
      },
      orderBy: { started_at: "desc" },
      take: 10,
      select: {
        id: true, topic_id: true, session_type: true, questions_answered: true,
        correct_answers: true, incorrect_answers: true, score_percent: true,
        duration_seconds: true, started_at: true, completed_at: true,
        theory_topics: {
          select: {
            translations: {
              where: { locale: { in: ls } },
              select: { locale: true, title: true },
            },
          },
        },
      },
    }),
    prisma.exam_attempts.findMany({
      where: {
        user_license_class_id: classId,
        OR: [
          { exam_configuration_id: null },
          { exam_configurations: { program_id: programId } },
        ],
      },
      orderBy: { started_at: "desc" },
      take: 10,
      select: {
        id: true, status: true, total_questions: true, answered_questions: true,
        correct_answers: true, incorrect_answers: true, penalty_points: true,
        score_percent: true, passed: true, started_at: true, completed_at: true,
      },
    }),
  ]);

  return {
    context,
    learningProgress: learning ? {
      currentDay: learning.current_day,
      completedDays: learning.completed_days,
      completedLessons: learning.completed_lessons,
      answeredQuestions: learning.answered_questions,
      correctAnswers: learning.correct_answers,
      readinessScore: learning.readiness_score,
      totalStudyMinutes: learning.total_study_minutes,
      lastActivityAt: learning.last_activity_at,
    } : null,
    lessonStats: {
      totalLessons,
      startedLessons,
      completedLessons,
      activeStudySeconds: studyAgg._sum.active_seconds ?? 0,
    },
    topics: topics.map((topic) => {
      const t = pickTheoryTranslation(topic.translations, locale);
      const p = topic.user_progress[0] ?? null;
      return {
        id: topic.id,
        slug: topic.slug,
        sortOrder: topic.sort_order,
        title: t?.title ?? topic.slug,
        description: t?.description ?? null,
        totalQuestions: topic._count.questions,
        answeredQuestions: p?.answered_questions ?? 0,
        correctAnswers: p?.correct_answers ?? 0,
        incorrectAnswers: p?.incorrect_answers ?? 0,
        progressPercent: pct(p?.progress_percent ?? 0),
        masteryScore: pct(p?.mastery_score ?? 0),
        lastTrainedAt: p?.last_trained_at ?? null,
      };
    }),
    questionStats: {
      totalAttempts: qAgg._sum.attempt_count ?? 0,
      correctAttempts: qAgg._sum.correct_count ?? 0,
      incorrectAttempts: qAgg._sum.incorrect_count ?? 0,
      uniqueQuestionsAnswered: uniqueAnswered,
      questionsToReview: review,
      masteredQuestions: mastered,
      activeQuestions,
    },
    recentTraining: recentTraining.map((s) => ({
      id: s.id,
      topicId: s.topic_id,
      topicTitle: pickTheoryTranslation(s.theory_topics?.translations ?? [], locale)?.title ?? null,
      sessionType: s.session_type,
      questionsAnswered: s.questions_answered,
      correctAnswers: s.correct_answers,
      incorrectAnswers: s.incorrect_answers,
      scorePercent: s.score_percent,
      durationSeconds: s.duration_seconds,
      startedAt: s.started_at,
      completedAt: s.completed_at,
    })),
    recentExams: recentExams.map((e) => ({
      id: e.id,
      status: e.status,
      totalQuestions: e.total_questions,
      answeredQuestions: e.answered_questions,
      correctAnswers: e.correct_answers,
      incorrectAnswers: e.incorrect_answers,
      penaltyPoints: e.penalty_points,
      scorePercent: e.score_percent,
      passed: e.passed,
      startedAt: e.started_at,
      completedAt: e.completed_at,
    })),
    totalPracticeSeconds: practiceAgg._sum.duration_seconds ?? 0,
    completedExamCount,
  };
}

export async function findTheoryQuestionForAnswer(
  context: TheoryContext,
  questionId: string,
): Promise<TheoryQuestionForAnswer | null> {
  if (!context.programId) return null;
  const ls = locales(context.locale);

  const row = await prisma.theory_questions.findFirst({
    where: {
      id: questionId,
      ...publishedQuestionWhere(),
      theory_topics: { program_id: context.programId, is_active: true },
    },
    select: {
      id: true, topic_id: true, question_type: true, penalty_points: true,
      translations: {
        where: { locale: { in: ls } },
        select: {
          locale: true, prompt: true, explanation: true,
          answer_options: true, correct_answer: true,
        },
      },
    },
  });

  if (!row) return null;
  const t = pickTheoryTranslation(row.translations, context.locale);
  if (!t) return null;

  return {
    id: row.id,
    topicId: row.topic_id,
    questionType: row.question_type,
    penaltyPoints: row.penalty_points,
    prompt: t.prompt,
    explanation: t.explanation,
    answerOptions: t.answer_options,
    correctAnswer: t.correct_answer,
  };
}

export async function findPublicTheoryQuestion(
  context: TheoryContext,
  questionId: string,
): Promise<TheoryPublicQuestion | null> {
  if (!context.programId || !context.userLicenseClassId) return null;
  const ls = locales(context.locale);

  const [row, favorite] = await Promise.all([
    prisma.theory_questions.findFirst({
      where: {
        id: questionId,
        ...publishedQuestionWhere(),
        theory_topics: { program_id: context.programId, is_active: true },
      },
      select: {
        id: true, topic_id: true, question_type: true, penalty_points: true,
        media_storage_path: true,
        translations: {
          where: { locale: { in: ls } },
          select: { locale: true, prompt: true, answer_options: true },
        },
      },
    }),
    prisma.theory_question_favorites.findUnique({
      where: {
        user_license_class_id_question_id: {
          user_license_class_id: context.userLicenseClassId,
          question_id: questionId,
        },
      },
      select: { id: true },
    }),
  ]);

  if (!row) return null;
  const t = pickTheoryTranslation(row.translations, context.locale);
  if (!t) return null;

  return {
    id: row.id,
    topicId: row.topic_id,
    questionType: row.question_type,
    penaltyPoints: row.penalty_points,
    mediaStoragePath: row.media_storage_path,
    prompt: t.prompt,
    answerOptions: t.answer_options,
    favorite: Boolean(favorite),
  };
}

export async function sampleTheoryQuestionIds(
  context: TheoryContext,
  options: {
    topicId?: string | null;
    questionCount?: number;
    onlyReview?: boolean;
    onlyFavorites?: boolean;
  } = {},
): Promise<readonly string[]> {
  const classId = context.userLicenseClassId;
  const programId = context.programId;
  if (!classId || !programId) return [];

  const take = Math.max(1, Math.min(60, Math.round(options.questionCount ?? 10)));
  let ids: string[] = [];

  if (options.onlyReview) {
    const rows = await prisma.user_question_progress.findMany({
      where: {
        user_license_class_id: classId,
        needs_review: true,
        theory_questions: {
          ...publishedQuestionWhere(),
          topic_id: options.topicId ?? undefined,
          theory_topics: { program_id: programId, is_active: true },
        },
      },
      select: { question_id: true },
    });
    ids = rows.map((x) => x.question_id);
  } else if (options.onlyFavorites) {
    const rows = await prisma.theory_question_favorites.findMany({
      where: {
        user_license_class_id: classId,
        theory_questions: {
          ...publishedQuestionWhere(),
          topic_id: options.topicId ?? undefined,
          theory_topics: { program_id: programId, is_active: true },
        },
      },
      select: { question_id: true },
    });
    ids = rows.map((x) => x.question_id);
  } else {
    const rows = await prisma.theory_questions.findMany({
      where: {
        ...publishedQuestionWhere(),
        topic_id: options.topicId ?? undefined,
        theory_topics: { program_id: programId, is_active: true },
      },
      select: { id: true },
    });
    ids = rows.map((x) => x.id);
  }

  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  return ids.slice(0, take);
}

export async function recordTheoryQuestionOutcome(
  context: TheoryContext,
  input: {
    questionId: string;
    topicId: string;
    correct: boolean;
    trainingSessionId?: string | null;
  },
): Promise<void> {
  const classId = context.userLicenseClassId;
  if (!classId) throw new Error("[Express-Führerschein] Keine aktive Führerscheinklasse.");

  await prisma.$transaction(async (tx) => {
    const old = await tx.user_question_progress.findUnique({
      where: {
        user_license_class_id_question_id: {
          user_license_class_id: classId,
          question_id: input.questionId,
        },
      },
      select: { attempt_count: true, correct_count: true, incorrect_count: true },
    });

    const attempts = (old?.attempt_count ?? 0) + 1;
    const correct = (old?.correct_count ?? 0) + (input.correct ? 1 : 0);
    const incorrect = (old?.incorrect_count ?? 0) + (input.correct ? 0 : 1);
    const mastered = input.correct && correct >= 2 && correct - incorrect >= 2;

    await tx.user_question_progress.upsert({
      where: {
        user_license_class_id_question_id: {
          user_license_class_id: classId,
          question_id: input.questionId,
        },
      },
      create: {
        user_license_class_id: classId,
        question_id: input.questionId,
        attempt_count: 1,
        correct_count: input.correct ? 1 : 0,
        incorrect_count: input.correct ? 0 : 1,
        last_answer_correct: input.correct,
        is_mastered: mastered,
        needs_review: !input.correct,
        last_answered_at: new Date(),
      },
      update: {
        attempt_count: attempts,
        correct_count: correct,
        incorrect_count: incorrect,
        last_answer_correct: input.correct,
        is_mastered: mastered,
        needs_review: input.correct ? !mastered : true,
        last_answered_at: new Date(),
      },
    });

    const topicQuestionWhere: Prisma.theory_questionsWhereInput = {
      topic_id: input.topicId,
      ...publishedQuestionWhere(),
    };

    const [attemptAggregate, answered, correctAnswered, total] =
      await Promise.all([
        tx.user_question_progress.aggregate({
          where: {
            user_license_class_id: classId,
            theory_questions: topicQuestionWhere,
          },
          _sum: {
            correct_count: true,
            incorrect_count: true,
          },
        }),
        tx.user_question_progress.count({
          where: {
            user_license_class_id: classId,
            attempt_count: { gt: 0 },
            theory_questions: topicQuestionWhere,
          },
        }),
        tx.user_question_progress.count({
          where: {
            user_license_class_id: classId,
            attempt_count: { gt: 0 },
            last_answer_correct: true,
            theory_questions: topicQuestionWhere,
          },
        }),
        tx.theory_questions.count({
          where: topicQuestionWhere,
        }),
      ]);

    /**
     * Topic-level counters describe the current state of unique questions,
     * not the cumulative number of attempts.
     *
     * This keeps the database invariant coherent:
     *
     * answered_questions = correct_answers + incorrect_answers
     *
     * Retrying the same question therefore does not artificially increase
     * the number of answered questions or break chk_user_topic_progress_counts.
     */
    const incorrectAnswered = Math.max(
      0,
      answered - correctAnswered,
    );

    /**
     * Mastery still uses the full attempt history. This preserves the
     * existing scoring behaviour without mixing attempt counters into
     * the unique-question topic counters above.
     */
    const attemptCorrect =
      attemptAggregate._sum.correct_count ?? 0;
    const attemptIncorrect =
      attemptAggregate._sum.incorrect_count ?? 0;
    const totalAttempts =
      attemptCorrect + attemptIncorrect;

    const topicProgressData = {
      answered_questions: answered,
      correct_answers: correctAnswered,
      incorrect_answers: incorrectAnswered,
      progress_percent:
        total > 0
          ? pct((answered / total) * 100)
          : 0,
      mastery_score:
        totalAttempts > 0
          ? pct((attemptCorrect / totalAttempts) * 100)
          : 0,
      last_trained_at: new Date(),
    } satisfies Prisma.user_topic_progressUncheckedUpdateInput;

    await tx.user_topic_progress.upsert({
      where: {
        user_license_class_id_topic_id: {
          user_license_class_id: classId,
          topic_id: input.topicId,
        },
      },
      create: {
        user_license_class_id: classId,
        topic_id: input.topicId,
        ...topicProgressData,
      },
      update: topicProgressData,
    });

    if (input.trainingSessionId) {
      const s = await tx.training_sessions.findFirst({
        where: {
          id: input.trainingSessionId,
          user_license_class_id: classId,
          completed_at: null,
        },
        select: {
          id: true, questions_answered: true,
          correct_answers: true, incorrect_answers: true,
        },
      });

      if (s) {
        const qa = s.questions_answered + 1;
        const ca = s.correct_answers + (input.correct ? 1 : 0);
        const ia = s.incorrect_answers + (input.correct ? 0 : 1);
        await tx.training_sessions.update({
          where: { id: s.id },
          data: {
            questions_answered: qa,
            correct_answers: ca,
            incorrect_answers: ia,
            score_percent: pct((ca / qa) * 100),
          },
        });
      }
    }
  });
}

export async function listTheoryLessons(
  context: TheoryContext,
  topicSlug: string,
): Promise<readonly TheoryLessonListItem[]> {
  if (!context.programId || !context.userLicenseClassId) return [];
  const ls = locales(context.locale);
  const d = today();

  const topic = await prisma.theory_topics.findFirst({
    where: { program_id: context.programId, slug: topicSlug, is_active: true },
    select: { id: true },
  });
  if (!topic) return [];

  const rows = await prisma.theory_lessons.findMany({
    where: {
      topic_id: topic.id,
      status: "published",
      AND: [
        { OR: [{ valid_from: null }, { valid_from: { lte: d } }] },
        { OR: [{ valid_until: null }, { valid_until: { gte: d } }] },
      ],
    },
    orderBy: { sort_order: "asc" },
    select: {
      id: true, topic_id: true, slug: true, sort_order: true,
      estimated_duration_minutes: true,
      translations: {
        where: { locale: { in: ls } },
        select: { locale: true, title: true, description: true },
      },
      user_progress: {
        where: { user_license_class_id: context.userLicenseClassId },
        take: 1,
        select: {
          progress_percent: true, current_block_index: true,
          completed: true, last_activity_at: true,
        },
      },
    },
  });

  return rows.map((row) => {
    const t = pickTheoryTranslation(row.translations, context.locale);
    const up = row.user_progress[0] ?? null;
    return {
      id: row.id,
      topicId: row.topic_id,
      slug: row.slug,
      sortOrder: row.sort_order,
      title: t?.title ?? row.slug,
      description: t?.description ?? null,
      estimatedDurationMinutes: row.estimated_duration_minutes,
      progressPercent: pct(up?.progress_percent ?? 0),
      currentBlockIndex: Math.max(0, up?.current_block_index ?? 0),
      completed: up?.completed ?? false,
      lastActivityAt: up?.last_activity_at ?? null,
    };
  });
}

export async function getTheoryLessonDetail(
  context: TheoryContext,
  topicSlug: string,
  lessonSlug: string,
): Promise<TheoryLessonDetail | null> {
  if (!context.programId || !context.userLicenseClassId) return null;
  const ls = locales(context.locale);
  const d = today();

  const row = await prisma.theory_lessons.findFirst({
    where: {
      slug: lessonSlug,
      status: "published",
      AND: [
        { OR: [{ valid_from: null }, { valid_from: { lte: d } }] },
        { OR: [{ valid_until: null }, { valid_until: { gte: d } }] },
      ],
      theory_topics: {
        program_id: context.programId,
        slug: topicSlug,
        is_active: true,
      },
    },
    select: {
      id: true, topic_id: true, slug: true, estimated_duration_minutes: true,
      theory_topics: { select: { slug: true } },
      translations: {
        where: { locale: { in: ls } },
        select: { locale: true, title: true, description: true },
      },
      user_progress: {
        where: { user_license_class_id: context.userLicenseClassId },
        take: 1,
        select: { progress_percent: true, current_block_index: true, completed: true },
      },
      content_blocks: {
        where: { is_active: true },
        orderBy: { sort_order: "asc" },
        select: {
          id: true, block_type: true, sort_order: true, media_storage_path: true,
          question_id: true, config_json: true,
          translations: {
            where: { locale: { in: ls } },
            select: {
              locale: true, title: true, body_text: true, content_json: true,
            },
          },
        },
      },
    },
  });

  if (!row) return null;
  const t = pickTheoryTranslation(row.translations, context.locale);
  const up = row.user_progress[0] ?? null;

  return {
    id: row.id,
    topicId: row.topic_id,
    topicSlug: row.theory_topics.slug,
    slug: row.slug,
    title: t?.title ?? row.slug,
    description: t?.description ?? null,
    estimatedDurationMinutes: row.estimated_duration_minutes,
    progressPercent: pct(up?.progress_percent ?? 0),
    currentBlockIndex: Math.max(0, up?.current_block_index ?? 0),
    completed: up?.completed ?? false,
    blocks: row.content_blocks.map((b) => {
      const bt = pickTheoryTranslation(b.translations, context.locale);
      return {
        id: b.id,
        type: b.block_type as TheoryLessonBlockType,
        sortOrder: b.sort_order,
        title: bt?.title ?? null,
        text: bt?.body_text ?? null,
        content: bt?.content_json ?? null,
        mediaStoragePath: b.media_storage_path,
        questionId: b.question_id,
        config: b.config_json ?? null,
      };
    }),
  };
}

export async function upsertTheoryLessonProgress(
  context: TheoryContext,
  input: {
    lessonId: string;
    progressPercent: number;
    currentBlockIndex: number;
    completed: boolean;
    activeSecondsDelta?: number;
  },
) {
  if (
    !context.userLicenseClassId ||
    !context.programId
  ) {
    throw new Error(
      "[Express-Führerschein] Keine aktive Theorie-Zuordnung.",
    );
  }

  /**
   * Security:
   * the lesson must belong to the currently active
   * published theory program of the user.
   */
  const allowedLesson =
    await prisma.theory_lessons.findFirst({
      where: {
        id:
          input.lessonId,

        status:
          "published",

        theory_topics: {
          program_id:
            context.programId,

          is_active:
            true,
        },
      },

      select: {
        id:
          true,
      },
    });

  if (!allowedLesson) {
    throw new Error(
      "[Express-Führerschein] Lektion wurde nicht gefunden.",
    );
  }

  const key = {
    user_license_class_id:
      context.userLicenseClassId,

    lesson_id:
      input.lessonId,
  };

  /**
   * Read the previous state before updating.
   *
   * Progress and completion are intentionally monotonic:
   * once a lesson has been completed, reviewing it must
   * never make it incomplete again.
   */
  const old =
    await prisma.user_lesson_progress.findUnique({
      where: {
        user_license_class_id_lesson_id:
          key,
      },

      select: {
        progress_percent:
          true,

        current_block_index:
          true,

        completed:
          true,

        started_at:
          true,

        completed_at:
          true,

        total_active_seconds:
          true,
      },
    });

  const now =
    new Date();

  const requestedPercent =
    pct(
      input.progressPercent,
    );

  const requestedBlockIndex =
    Math.max(
      0,
      Math.round(
        input.currentBlockIndex,
      ),
    );

  const delta =
    Math.max(
      0,
      Math.min(
        900,
        Math.round(
          input.activeSecondsDelta ??
          0,
        ),
      ),
    );

  /**
   * Completion can only move:
   *
   * false → true
   *
   * Never:
   *
   * true → false
   */
  const completed =
    Boolean(
      old?.completed ||
      input.completed,
    );

  /**
   * Progress must never decrease.
   *
   * A completed lesson always stays at 100%.
   */
  const progressPercent =
    completed
      ? 100
      : Math.max(
          old?.progress_percent ??
            0,

          requestedPercent,
        );

  /**
   * When a completed lesson is opened again for review,
   * do not overwrite its stored completion position with
   * an earlier review block.
   */
  const currentBlockIndex =
    old?.completed
      ? old.current_block_index
      : requestedBlockIndex;

  return prisma.user_lesson_progress.upsert({
    where: {
      user_license_class_id_lesson_id:
        key,
    },

    create: {
      ...key,

      progress_percent:
        input.completed
          ? 100
          : requestedPercent,

      current_block_index:
        requestedBlockIndex,

      completed:
        input.completed,

      started_at:
        now,

      completed_at:
        input.completed
          ? now
          : null,

      last_activity_at:
        now,

      total_active_seconds:
        delta,
    },

    update: {
      progress_percent:
        progressPercent,

      current_block_index:
        currentBlockIndex,

      completed,

      started_at:
        old?.started_at ??
        now,

      completed_at:
        completed
          ? (
              old?.completed_at ??
              now
            )
          : null,

      last_activity_at:
        now,

      total_active_seconds:
        (
          old?.total_active_seconds ??
          0
        ) +
        delta,
    },
  });
}

export async function createTheoryStudySession(
  context: TheoryContext,
  input: {
    lessonId?: string | null;
    sessionType?: "lesson" | "practice" | "review" | "other";
  },
) {
  if (!context.userLicenseClassId || !context.programId) {
    throw new Error("[Express-Führerschein] Keine aktive Theorie-Zuordnung.");
  }

  if (input.lessonId) {
    const allowedLesson = await prisma.theory_lessons.findFirst({
      where: {
        id: input.lessonId,
        status: "published",
        theory_topics: {
          program_id: context.programId,
          is_active: true,
        },
      },
      select: { id: true },
    });

    if (!allowedLesson) {
      throw new Error("[Express-Führerschein] Lektion wurde nicht gefunden.");
    }
  }

  return prisma.theory_study_sessions.create({
    data: {
      user_license_class_id: context.userLicenseClassId,
      lesson_id: input.lessonId ?? null,
      session_type: input.sessionType ?? "lesson",
      status: "active",
    },
  });
}

export async function touchTheoryStudySession(
  context: TheoryContext,
  sessionId: string,
  activeSecondsDelta: number,
) {
  if (!context.userLicenseClassId) return null;
  const row = await prisma.theory_study_sessions.findFirst({
    where: {
      id: sessionId,
      user_license_class_id: context.userLicenseClassId,
      ended_at: null,
    },
  });
  if (!row) return null;

  return prisma.theory_study_sessions.update({
    where: { id: row.id },
    data: {
      status: "active",
      last_activity_at: new Date(),
      active_seconds: row.active_seconds + Math.max(0, Math.min(120, Math.round(activeSecondsDelta))),
    },
  });
}

export async function finishTheoryStudySession(
  context: TheoryContext,
  sessionId: string,
  activeSecondsDelta = 0,
  abandoned = false,
) {
  if (!context.userLicenseClassId) return null;
  const row = await prisma.theory_study_sessions.findFirst({
    where: {
      id: sessionId,
      user_license_class_id: context.userLicenseClassId,
      ended_at: null,
    },
  });
  if (!row) return null;

  const now = new Date();
  return prisma.theory_study_sessions.update({
    where: { id: row.id },
    data: {
      status: abandoned ? "abandoned" : "completed",
      ended_at: now,
      last_activity_at: now,
      active_seconds: row.active_seconds + Math.max(0, Math.min(120, Math.round(activeSecondsDelta))),
    },
  });
}

export async function listTheoryFavoriteQuestionIds(
  context: TheoryContext,
): Promise<readonly string[]> {
  if (!context.userLicenseClassId || !context.programId) return [];
  const rows = await prisma.theory_question_favorites.findMany({
    where: {
      user_license_class_id: context.userLicenseClassId,
      theory_questions: {
        ...publishedQuestionWhere(),
        theory_topics: { program_id: context.programId, is_active: true },
      },
    },
    orderBy: { created_at: "desc" },
    select: { question_id: true },
  });
  return rows.map((x) => x.question_id);
}

export async function listTheoryFavoriteQuestions(
  context: TheoryContext,
  take = 100,
): Promise<readonly TheoryFavoriteQuestion[]> {
  if (!context.userLicenseClassId || !context.programId) return [];
  const ls = locales(context.locale);

  const rows = await prisma.theory_question_favorites.findMany({
    where: {
      user_license_class_id: context.userLicenseClassId,
      theory_questions: {
        ...publishedQuestionWhere(),
        theory_topics: { program_id: context.programId, is_active: true },
      },
    },
    orderBy: { created_at: "desc" },
    take: Math.max(1, Math.min(200, Math.round(take))),
    select: {
      created_at: true,
      theory_questions: {
        select: {
          id: true, topic_id: true, question_type: true, penalty_points: true,
          translations: {
            where: { locale: { in: ls } },
            select: { locale: true, prompt: true },
          },
          theory_topics: {
            select: {
              slug: true,
              translations: {
                where: { locale: { in: ls } },
                select: { locale: true, title: true },
              },
            },
          },
        },
      },
    },
  });

  return rows.map((row) => {
    const q = row.theory_questions;
    return {
      id: q.id,
      topicId: q.topic_id,
      topicTitle: pickTheoryTranslation(q.theory_topics.translations, context.locale)?.title
        ?? q.theory_topics.slug,
      prompt: pickTheoryTranslation(q.translations, context.locale)?.prompt ?? "",
      questionType: q.question_type,
      penaltyPoints: q.penalty_points,
      createdAt: row.created_at,
    };
  });
}

export async function setTheoryQuestionFavoritePersistence(
  context: TheoryContext,
  questionId: string,
  favorite: boolean,
): Promise<boolean> {
  if (!context.userLicenseClassId) throw new Error("[Express-Führerschein] Keine aktive Führerscheinklasse.");

  if (favorite) {
    await prisma.theory_question_favorites.upsert({
      where: {
        user_license_class_id_question_id: {
          user_license_class_id: context.userLicenseClassId,
          question_id: questionId,
        },
      },
      create: {
        user_license_class_id: context.userLicenseClassId,
        question_id: questionId,
      },
      update: {},
    });
    return true;
  }

  await prisma.theory_question_favorites.deleteMany({
    where: {
      user_license_class_id: context.userLicenseClassId,
      question_id: questionId,
    },
  });
  return false;
}

export async function saveTheoryNote(
  context: TheoryContext,
  input: { questionId?: string | null; lessonId?: string | null; body: string },
) {
  if (!context.userLicenseClassId || !context.programId) {
    throw new Error("[Express-Führerschein] Keine aktive Theorie-Zuordnung.");
  }

  const body = input.body.trim();
  if (!body || (!input.questionId && !input.lessonId)) {
    throw new Error("[Express-Führerschein] Ungültige Theorie-Notiz.");
  }

  if (input.questionId) {
    const allowedQuestion = await prisma.theory_questions.findFirst({
      where: {
        id: input.questionId,
        ...publishedQuestionWhere(),
        theory_topics: {
          program_id: context.programId,
          is_active: true,
        },
      },
      select: { id: true },
    });

    if (!allowedQuestion) {
      throw new Error("[Express-Führerschein] Theoriefrage wurde nicht gefunden.");
    }
  }

  if (input.lessonId) {
    const allowedLesson = await prisma.theory_lessons.findFirst({
      where: {
        id: input.lessonId,
        status: "published",
        theory_topics: {
          program_id: context.programId,
          is_active: true,
        },
      },
      select: { id: true },
    });

    if (!allowedLesson) {
      throw new Error("[Express-Führerschein] Lektion wurde nicht gefunden.");
    }
  }

  return prisma.theory_question_notes.create({
    data: {
      user_license_class_id: context.userLicenseClassId,
      question_id: input.questionId ?? null,
      lesson_id: input.lessonId ?? null,
      body: body.slice(0, 5000),
    },
  });
}


export async function listTheoryNotes(
  context: TheoryContext,
  take = 100,
) {
  if (!context.userLicenseClassId || !context.programId) return [];

  return prisma.theory_question_notes.findMany({
    where: {
      user_license_class_id: context.userLicenseClassId,
      OR: [
        {
          theory_questions: {
            theory_topics: {
              program_id: context.programId,
            },
          },
        },
        {
          theory_lessons: {
            theory_topics: {
              program_id: context.programId,
            },
          },
        },
      ],
    },
    orderBy: { updated_at: "desc" },
    take: Math.max(1, Math.min(200, Math.round(take))),
    select: {
      id: true,
      question_id: true,
      lesson_id: true,
      body: true,
      created_at: true,
      updated_at: true,
    },
  });
}

export async function updateTheoryNotePersistence(
  context: TheoryContext,
  noteId: string,
  body: string,
) {
  if (!context.userLicenseClassId) {
    throw new Error("[Express-Führerschein] Keine aktive Führerscheinklasse.");
  }

  const normalized = body.trim();
  if (!normalized) {
    throw new Error("[Express-Führerschein] Notiz darf nicht leer sein.");
  }

  const existing = await prisma.theory_question_notes.findFirst({
    where: {
      id: noteId,
      user_license_class_id: context.userLicenseClassId,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new Error("[Express-Führerschein] Notiz wurde nicht gefunden.");
  }

  return prisma.theory_question_notes.update({
    where: { id: existing.id },
    data: { body: normalized.slice(0, 5000) },
    select: {
      id: true,
      question_id: true,
      lesson_id: true,
      body: true,
      created_at: true,
      updated_at: true,
    },
  });
}

export async function deleteTheoryNotePersistence(
  context: TheoryContext,
  noteId: string,
): Promise<void> {
  if (!context.userLicenseClassId) {
    throw new Error("[Express-Führerschein] Keine aktive Führerscheinklasse.");
  }

  await prisma.theory_question_notes.deleteMany({
    where: {
      id: noteId,
      user_license_class_id: context.userLicenseClassId,
    },
  });
}

export async function createTheoryQuestionReport(
  context: TheoryContext,
  input: {
    questionId: string;
    reason: "incorrect_question" | "incorrect_media" | "translation" | "technical" | "other";
    message?: string | null;
  },
) {
  if (!context.userLicenseClassId) throw new Error("[Express-Führerschein] Keine aktive Führerscheinklasse.");

  return prisma.theory_question_reports.create({
    data: {
      user_license_class_id: context.userLicenseClassId,
      question_id: input.questionId,
      reason: input.reason,
      message: input.message?.trim().slice(0, 3000) || null,
      status: "open",
    },
  });
}

export async function listTheoryErrorQuestions(
  context: TheoryContext,
  take = 50,
): Promise<readonly TheoryErrorQuestion[]> {
  if (!context.userLicenseClassId || !context.programId) return [];
  const ls = locales(context.locale);

  const rows = await prisma.user_question_progress.findMany({
    where: {
      user_license_class_id: context.userLicenseClassId,
      needs_review: true,
      theory_questions: {
        ...publishedQuestionWhere(),
        theory_topics: { program_id: context.programId, is_active: true },
      },
    },
    orderBy: [{ incorrect_count: "desc" }, { last_answered_at: "desc" }],
    take: Math.max(1, Math.min(100, Math.round(take))),
    select: {
      attempt_count: true, correct_count: true, incorrect_count: true,
      last_answer_correct: true, is_mastered: true, last_answered_at: true,
      theory_questions: {
        select: {
          id: true, topic_id: true, question_type: true, penalty_points: true,
          translations: {
            where: { locale: { in: ls } },
            select: { locale: true, prompt: true },
          },
          theory_topics: {
            select: {
              slug: true,
              translations: {
                where: { locale: { in: ls } },
                select: { locale: true, title: true },
              },
            },
          },
        },
      },
    },
  });

  return rows.map((row) => {
    const q = row.theory_questions;
    return {
      id: q.id,
      topicId: q.topic_id,
      topicTitle: pickTheoryTranslation(q.theory_topics.translations, context.locale)?.title
        ?? q.theory_topics.slug,
      prompt: pickTheoryTranslation(q.translations, context.locale)?.prompt ?? "",
      questionType: q.question_type,
      penaltyPoints: q.penalty_points,
      attemptCount: row.attempt_count,
      correctCount: row.correct_count,
      incorrectCount: row.incorrect_count,
      lastAnswerCorrect: row.last_answer_correct,
      isMastered: row.is_mastered,
      lastAnsweredAt: row.last_answered_at,
    };
  });
}

export async function createTheoryTrainingSession(
  context: TheoryContext,
  topicId: string | null,
  sessionType: string,
) {
  if (!context.userLicenseClassId) throw new Error("[Express-Führerschein] Keine aktive Führerscheinklasse.");
  return prisma.training_sessions.create({
    data: {
      user_license_class_id: context.userLicenseClassId,
      topic_id: topicId,
      session_type: sessionType,
    },
    select: { id: true, started_at: true },
  });
}

export async function finishTheoryTrainingSession(
  context: TheoryContext,
  sessionId: string,
  durationSeconds: number,
): Promise<TheoryRepositoryTraining> {
  if (!context.userLicenseClassId) throw new Error("[Express-Führerschein] Keine aktive Führerscheinklasse.");

  const old = await prisma.training_sessions.findFirst({
    where: { id: sessionId, user_license_class_id: context.userLicenseClassId },
  });
  if (!old) throw new Error("[Express-Führerschein] Training wurde nicht gefunden.");

  const row = await prisma.training_sessions.update({
    where: { id: old.id },
    data: {
      duration_seconds: Math.max(
        old.duration_seconds,
        Math.max(0, Math.min(21600, Math.round(durationSeconds))),
      ),
      completed_at: old.completed_at ?? new Date(),
    },
  });

  return {
    id: row.id,
    topicId: row.topic_id,
    topicTitle: null,
    sessionType: row.session_type,
    questionsAnswered: row.questions_answered,
    correctAnswers: row.correct_answers,
    incorrectAnswers: row.incorrect_answers,
    scorePercent: row.score_percent,
    durationSeconds: row.duration_seconds,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

export async function getCurrentExamConfiguration(
  context: TheoryContext,
): Promise<TheoryExamConfigurationRecord | null> {
  if (!context.programId) return null;
  const d = today();

  const row = await prisma.exam_configurations.findFirst({
    where: {
      program_id: context.programId,
      status: "published",
      AND: [
        { OR: [{ active_from: null }, { active_from: { lte: d } }] },
        { OR: [{ active_until: null }, { active_until: { gte: d } }] },
      ],
    },
    orderBy: [{ active_from: "desc" }, { published_at: "desc" }, { created_at: "desc" }],
  });
  if (!row) return null;

  return {
    id: row.id,
    programId: row.program_id,
    version: row.version,
    questionCount: row.question_count,
    durationSeconds: row.duration_seconds,
    scoringMethod: row.scoring_method,
    passingRule: row.passing_rule,
  };
}

export async function createExamAttemptWithQuestions(
  context: TheoryContext,
  configuration: TheoryExamConfigurationRecord,
  questionIds: readonly string[],
) {
  if (!context.userLicenseClassId) throw new Error("[Express-Führerschein] Keine aktive Führerscheinklasse.");
  if (questionIds.length === 0) throw new Error("[Express-Führerschein] Keine Prüfungsfragen verfügbar.");

  const snapshot = {
    id: configuration.id,
    programId: configuration.programId,
    version: configuration.version,
    questionCount: configuration.questionCount,
    durationSeconds: configuration.durationSeconds,
    scoringMethod: configuration.scoringMethod,
    passingRule: configuration.passingRule,
  } as Prisma.InputJsonValue;

  return prisma.$transaction(async (tx) => {
    const attempt = await tx.exam_attempts.create({
      data: {
        user_license_class_id: context.userLicenseClassId!,
        attempt_type: "theory_simulation",
        status: "in_progress",
        total_questions: questionIds.length,
        exam_configuration_id: configuration.id,
        configuration_snapshot: snapshot,
      },
      select: { id: true, started_at: true },
    });

    await tx.exam_attempt_answers.createMany({
      data: questionIds.map((questionId, index) => {
        const assigned = new Date(attempt.started_at.getTime() + index);
        return {
          exam_attempt_id: attempt.id,
          question_id: questionId,
          is_correct: null,
          penalty_points: 0,
          answered_at: assigned,
          created_at: assigned,
          updated_at: assigned,
        };
      }),
    });

    return { id: attempt.id, startedAt: attempt.started_at };
  });
}

export async function getExamAttemptForUser(
  context: TheoryContext,
  attemptId: string,
): Promise<TheoryExamAttemptDetail | null> {
  if (!context.userLicenseClassId) return null;

  const row = await prisma.exam_attempts.findFirst({
    where: { id: attemptId, user_license_class_id: context.userLicenseClassId },
    select: {
      id: true, status: true, total_questions: true, answered_questions: true,
      correct_answers: true, incorrect_answers: true, penalty_points: true,
      score_percent: true, passed: true, started_at: true, completed_at: true,
      exam_configuration_id: true, configuration_snapshot: true,
      answers: {
        orderBy: [{ created_at: "asc" }, { id: "asc" }],
        select: {
          id: true, question_id: true, answer_payload: true,
          is_correct: true, penalty_points: true, created_at: true,
        },
      },
    },
  });

  if (!row) return null;
  return {
    id: row.id,
    status: row.status,
    totalQuestions: row.total_questions,
    answeredQuestions: row.answered_questions,
    correctAnswers: row.correct_answers,
    incorrectAnswers: row.incorrect_answers,
    penaltyPoints: row.penalty_points,
    scorePercent: row.score_percent,
    passed: row.passed,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    examConfigurationId: row.exam_configuration_id,
    configurationSnapshot: row.configuration_snapshot,
    answers: row.answers.map((a) => ({
      id: a.id,
      questionId: a.question_id,
      answerPayload: a.answer_payload,
      isCorrect: a.is_correct,
      penaltyPoints: a.penalty_points,
      assignedAt: a.created_at,
    })),
  };
}

export async function saveExamAnswerOutcome(
  context: TheoryContext,
  input: {
    attemptId: string;
    questionId: string;
    answerPayload: unknown;
    correct: boolean;
    penaltyPoints: number;
  },
): Promise<boolean> {
  if (!context.userLicenseClassId) return false;

  return prisma.$transaction(async (tx) => {
    const attempt = await tx.exam_attempts.findFirst({
      where: {
        id: input.attemptId,
        user_license_class_id: context.userLicenseClassId!,
        status: "in_progress",
      },
      select: {
        id: true, answered_questions: true, correct_answers: true,
        incorrect_answers: true, penalty_points: true,
      },
    });
    if (!attempt) return false;

    const assigned = await tx.exam_attempt_answers.findUnique({
      where: {
        exam_attempt_id_question_id: {
          exam_attempt_id: input.attemptId,
          question_id: input.questionId,
        },
      },
      select: { id: true, is_correct: true },
    });
    if (!assigned || assigned.is_correct !== null) return false;

    await tx.exam_attempt_answers.update({
      where: { id: assigned.id },
      data: {
        answer_payload: input.answerPayload as Prisma.InputJsonValue,
        is_correct: input.correct,
        penalty_points: input.correct ? 0 : Math.max(0, input.penaltyPoints),
        answered_at: new Date(),
      },
    });

    await tx.exam_attempts.update({
      where: { id: attempt.id },
      data: {
        answered_questions: attempt.answered_questions + 1,
        correct_answers: attempt.correct_answers + (input.correct ? 1 : 0),
        incorrect_answers: attempt.incorrect_answers + (input.correct ? 0 : 1),
        penalty_points: attempt.penalty_points + (input.correct ? 0 : Math.max(0, input.penaltyPoints)),
      },
    });

    return true;
  });
}

export async function finishExamAttempt(
  context: TheoryContext,
  attemptId: string,
  scorePercent: number,
  passed: boolean,
): Promise<void> {
  if (!context.userLicenseClassId) throw new Error("[Express-Führerschein] Keine aktive Führerscheinklasse.");

  const result = await prisma.exam_attempts.updateMany({
    where: {
      id: attemptId,
      user_license_class_id: context.userLicenseClassId,
      status: "in_progress",
    },
    data: {
      status: "completed",
      score_percent: pct(scorePercent),
      passed,
      completed_at: new Date(),
    },
  });
  if (result.count !== 1) throw new Error("[Express-Führerschein] Prüfung kann nicht abgeschlossen werden.");
}

export async function listExamHistory(
  context: TheoryContext,
  take = 50,
): Promise<readonly TheoryRepositoryExamAttempt[]> {
  if (!context.userLicenseClassId) return [];

  const rows = await prisma.exam_attempts.findMany({
    where: {
      user_license_class_id: context.userLicenseClassId,
      status: "completed",
      ...(context.programId ? {
        OR: [
          { exam_configuration_id: null },
          { exam_configurations: { program_id: context.programId } },
        ],
      } : {}),
    },
    orderBy: { started_at: "desc" },
    take: Math.max(1, Math.min(100, Math.round(take))),
  });

  return rows.map((e) => ({
    id: e.id,
    status: e.status,
    totalQuestions: e.total_questions,
    answeredQuestions: e.answered_questions,
    correctAnswers: e.correct_answers,
    incorrectAnswers: e.incorrect_answers,
    penaltyPoints: e.penalty_points,
    scorePercent: e.score_percent,
    passed: e.passed,
    startedAt: e.started_at,
    completedAt: e.completed_at,
  }));
}

export async function updateStoredLearningAggregate(
  context: TheoryContext,
  input: {
    completedLessons: number;
    answeredQuestions: number;
    correctAnswers: number;
    readinessScore: number;
    totalStudyMinutes: number;
    lastActivityAt?: Date | null;
  },
): Promise<void> {
  if (!context.userLicenseClassId) return;

  await prisma.learning_progress.upsert({
    where: { user_license_class_id: context.userLicenseClassId },
    create: {
      user_license_class_id: context.userLicenseClassId,
      completed_lessons: Math.max(0, input.completedLessons),
      answered_questions: Math.max(0, input.answeredQuestions),
      correct_answers: Math.max(0, input.correctAnswers),
      readiness_score: pct(input.readinessScore),
      total_study_minutes: Math.max(0, input.totalStudyMinutes),
      last_activity_at: input.lastActivityAt ?? new Date(),
    },
    update: {
      completed_lessons: Math.max(0, input.completedLessons),
      answered_questions: Math.max(0, input.answeredQuestions),
      correct_answers: Math.max(0, input.correctAnswers),
      readiness_score: pct(input.readinessScore),
      total_study_minutes: Math.max(0, input.totalStudyMinutes),
      last_activity_at: input.lastActivityAt ?? new Date(),
    },
  });
}