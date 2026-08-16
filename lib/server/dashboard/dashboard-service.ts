/**
 * Express-Führerschein
 * Dashboard application service.
 *
 * Flow:
 * authenticated session
 *   -> dashboard repository
 *   -> business metrics
 *   -> serializable DashboardData
 */

import "server-only";

import {
  DASHBOARD_PROGRAM_DAYS,
  DASHBOARD_QUICK_ACCESS,
  DASHBOARD_TODAY_COPY,
} from "@/data/dashboard";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getDashboardRepositorySnapshot,
} from "@/lib/server/dashboard/dashboard-repository";

import {
  buildReadiness,
  calculateAccuracyPercent,
  calculateDerivedReadinessPercent,
  calculateExamPassRatePercent,
  calculateOverallProgressPercent,
  calculateRemainingProgramDays,
  clampNumber,
  roundPercent,
} from "@/lib/server/dashboard/dashboard-metrics";

import {
  DashboardServiceError,
} from "@/types/dashboard";

import type {
  DashboardData,
  DashboardProgramDay,
  DashboardProgramDayStatus,
  DashboardTodayTask,
  DashboardTopicProgress,
} from "@/types/dashboard";

import type {
  ClientShellLocale,
} from "@/types/client-shell";


/* ==========================================================================
   HELPERS
   ========================================================================== */

function iso(
  value:
    Date | null | undefined,
): string | null {
  return value
    ? value.toISOString()
    : null;
}

function normalizeProgramDayStatus(
  value:
    string,
): DashboardProgramDayStatus {
  switch (
    value
  ) {
    case "locked":
    case "available":
    case "in_progress":
    case "completed":
    case "skipped":
      return value;

    default:
      return "locked";
  }
}

function pickTranslation(
  translations:
    readonly {
      locale:
        string;

      title:
        string;
    }[],

  locale:
    ClientShellLocale,

  fallback:
    string,
): string {
  const preferred =
    translations.find(
      (
        translation,
      ) =>
        translation.locale ===
        locale,
    );

  if (
    preferred
  ) {
    return preferred.title;
  }

  const german =
    translations.find(
      (
        translation,
      ) =>
        translation.locale ===
        "de",
    );

  return (
    german?.title ??
    translations[0]
      ?.title ??
    fallback
  );
}

function buildProgramDays(
  currentDay:
    number,

  storedDays:
    readonly {
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
    }[],
): readonly DashboardProgramDay[] {
  const safeCurrentDay =
    Math.round(
      clampNumber(
        currentDay,
        1,
        DASHBOARD_PROGRAM_DAYS,
      ),
    );

  const byNumber =
    new Map(
      storedDays.map(
        (
          day,
        ) => [
          day.dayNumber,
          day,
        ] as const,
      ),
    );

  return Array.from(
    {
      length:
        DASHBOARD_PROGRAM_DAYS,
    },

    (
      _,
      index,
    ) => {
      const dayNumber =
        index +
        1;

      const stored =
        byNumber.get(
          dayNumber,
        );

      /**
       * Missing rows are not interpreted as completed progress.
       * They are structural placeholders for the fixed 21-day program.
       */
      const fallbackStatus:
        DashboardProgramDayStatus =
        dayNumber <
        safeCurrentDay
          ? "locked"
          : dayNumber ===
              safeCurrentDay
            ? "available"
            : "locked";

      return {
        dayNumber,

        status:
          stored
            ? normalizeProgramDayStatus(
                stored.status,
              )
            : fallbackStatus,

        isCurrent:
          dayNumber ===
          safeCurrentDay,

        plannedDate:
          iso(
            stored
              ?.plannedDate,
          ),

        startedAt:
          iso(
            stored
              ?.startedAt,
          ),

        completedAt:
          iso(
            stored
              ?.completedAt,
          ),

        studyMinutes:
          Math.max(
            0,
            stored
              ?.studyMinutes ??
              0,
          ),

        score:
          stored
            ?.score ??
          null,
      };
    },
  );
}

function buildTodayTasks(
  topics:
    readonly DashboardTopicProgress[],

  questionsToReview:
    number,

  hasLicenseClass:
    boolean,
): readonly DashboardTodayTask[] {
  if (
    !hasLicenseClass
  ) {
    return [];
  }

  const tasks:
    DashboardTodayTask[] = [];

  const nextTopic =
    topics.find(
      (
        topic,
      ) =>
        topic.progressPercent <
        100,
    );

  if (
    nextTopic
  ) {
    tasks.push({
      id:
        `continue-topic-${nextTopic.id}`,

      kind:
        "continue_theory",

      title:
        `Kapitel: ${nextTopic.title}`,

      description:
        "Setze deinen aktuellen Theorie-Lernfortschritt fort.",

      meta:
        `${nextTopic.progressPercent}% abgeschlossen`,

      href:
        `/theorie/${encodeURIComponent(nextTopic.slug)}`,

      actionLabel:
        DASHBOARD_TODAY_COPY
          .continueTheoryAction,

      icon:
        "book",
    });
  } else {
    tasks.push({
      id:
        "training",

      kind:
        "training",

      title:
        DASHBOARD_TODAY_COPY
          .trainingTitle,

      description:
        DASHBOARD_TODAY_COPY
          .trainingDescription,

      meta:
        null,

      href:
        "/trainieren",

      actionLabel:
        DASHBOARD_TODAY_COPY
          .trainingAction,

      icon:
        "sparkles",
    });
  }

  if (
    questionsToReview >
    0
  ) {
    tasks.push({
      id:
        "review-errors",

      kind:
        "review_errors",

      title:
        `${questionsToReview} ${
          questionsToReview ===
          1
            ? "Frage"
            : "Fragen"
        } wiederholen`,

      description:
        DASHBOARD_TODAY_COPY
          .reviewErrorsDescription,

      meta:
        `${questionsToReview} offen`,

      href:
        "/fehler",

      actionLabel:
        DASHBOARD_TODAY_COPY
          .reviewErrorsAction,

      icon:
        "alert-circle",
    });
  }

  tasks.push({
    id:
      "exam-simulation",

    kind:
      "exam_simulation",

    title:
      DASHBOARD_TODAY_COPY
        .examTitle,

    description:
      DASHBOARD_TODAY_COPY
        .examDescription,

    meta:
      null,

    href:
      "/pruefungen",

    actionLabel:
      DASHBOARD_TODAY_COPY
        .examAction,

    icon:
      "clipboard-check",
  });

  return tasks.slice(
    0,
    3,
  );
}

/* ==========================================================================
   SERVICE
   ========================================================================== */

export async function getDashboardData():
  Promise<DashboardData> {
  let session;

  try {
    session =
      await requireClientSession();
  } catch {
    throw new DashboardServiceError(
      "UNAUTHENTICATED",

      "Bitte melde dich an, um dein Dashboard zu öffnen.",
    );
  }

  try {
    const locale =
      session
        .user
        .preferredLocale;

    const snapshot =
      await getDashboardRepositorySnapshot(
        session.user.id,
        locale,
      );

    const topics:
      readonly DashboardTopicProgress[] =
      snapshot.topics.map(
        (
          topic,
        ) => {
          const progress =
            topic.progress;

          return {
            id:
              topic.id,

            slug:
              topic.slug,

            title:
              pickTranslation(
                topic.translations,
                locale,
                topic.slug,
              ),

            sortOrder:
              topic.sortOrder,

            answeredQuestions:
              progress
                ?.answeredQuestions ??
              0,

            correctAnswers:
              progress
                ?.correctAnswers ??
              0,

            incorrectAnswers:
              progress
                ?.incorrectAnswers ??
              0,

            progressPercent:
              roundPercent(
                progress
                  ?.progressPercent ??
                0,
              ),

            masteryScore:
              roundPercent(
                progress
                  ?.masteryScore ??
                0,
              ),

            lastTrainedAt:
              iso(
                progress
                  ?.lastTrainedAt,
              ),
          };
        },
      );

    const learning =
      snapshot
        .learningProgress;

    const currentDay =
      Math.round(
        clampNumber(
          learning
            ?.currentDay ??
            1,
          1,
          DASHBOARD_PROGRAM_DAYS,
        ),
      );

    const completedDays =
      Math.round(
        clampNumber(
          learning
            ?.completedDays ??
            0,
          0,
          DASHBOARD_PROGRAM_DAYS,
        ),
      );

    const overallProgressPercent =
      calculateOverallProgressPercent(
        completedDays,
        topics.map(
          (
            topic,
          ) =>
            topic
              .progressPercent,
        ),
      );

    const answerStats =
      snapshot
        .questionStats;

    const accuracyPercent =
      calculateAccuracyPercent(
        answerStats
          .correctAttempts,
        answerStats
          .totalAttempts,
      );

    const openQuestions =
      Math.max(
        0,
        answerStats
          .activeQuestions -
          answerStats
            .uniqueQuestionsAnswered,
      );

    const completedExams =
      snapshot
        .examStats
        .completed;

    const passedExams =
      snapshot
        .examStats
        .passed;

    const examPassRatePercent =
      calculateExamPassRatePercent(
        passedExams,
        completedExams,
      );

    const readinessPercent =
      learning
        ? roundPercent(
            learning
              .readinessScore,
          )
        : calculateDerivedReadinessPercent(
            accuracyPercent,

            topics.map(
              (
                topic,
              ) =>
                topic
                  .masteryScore,
            ),

            examPassRatePercent,
          );

    const recentTraining =
      snapshot
        .recentTraining
        .map(
          (
            training,
          ) => ({
            id:
              training.id,

            topicId:
              training.topicId,

            topicTitle:
              pickTranslation(
                training
                  .topicTranslations,
                locale,
                "Gemischtes Training",
              ),

            sessionType:
              training
                .sessionType,

            questionsAnswered:
              training
                .questionsAnswered,

            correctAnswers:
              training
                .correctAnswers,

            incorrectAnswers:
              training
                .incorrectAnswers,

            scorePercent:
              training
                .scorePercent ===
              null
                ? null
                : roundPercent(
                    training
                      .scorePercent,
                  ),

            durationSeconds:
              Math.max(
                0,
                training
                  .durationSeconds,
              ),

            startedAt:
              training
                .startedAt
                .toISOString(),

            completedAt:
              iso(
                training
                  .completedAt,
              ),
          }),
        );

    const documentCounts =
      snapshot
        .documents;

    const hasLicenseClass =
      snapshot
        .licenseClass !==
      null;

    return {
      generatedAt:
        new Date()
          .toISOString(),

      drivingLicenseApplication:
        snapshot
          .drivingLicenseApplication,

      user: {
        id:
          session.user.id,

        firstName:
          session
            .user
            .firstName,

        lastName:
          session
            .user
            .lastName,

        displayName:
          [
            session
              .user
              .firstName,

            session
              .user
              .lastName,
          ]
            .filter(
              Boolean,
            )
            .join(
              " ",
            ),

        locale,

        timezone:
          session
            .user
            .timezone,
      },

      primaryLicenseClass:
        snapshot
          .licenseClass
          ? {
              id:
                snapshot
                  .licenseClass
                  .id,

              code:
                snapshot
                  .licenseClass
                  .code,

              status:
                snapshot
                  .licenseClass
                  .status,

              isPrimary:
                snapshot
                  .licenseClass
                  .isPrimary,

              startedAt:
                snapshot
                  .licenseClass
                  .startedAt
                  .toISOString(),

              targetExamDate:
                snapshot
                  .licenseClass
                  .targetExamDate
                  ?.toISOString()
                  .slice(
                    0,
                    10,
                  ) ??
                null,
            }
          : null,

      overview: {
        progress: {
          overallProgressPercent,

          currentDay,

          completedDays,

          totalDays:
            DASHBOARD_PROGRAM_DAYS,

          remainingDays:
            calculateRemainingProgramDays(
              currentDay,
            ),

          totalStudyMinutes:
            Math.max(
              0,
              learning
                ?.totalStudyMinutes ??
                0,
            ),

          lastActivityAt:
            iso(
              learning
                ?.lastActivityAt,
            ),
        },

        readiness:
          buildReadiness(
            readinessPercent,
          ),

        answers: {
          totalAnswered:
            Math.max(
              0,
              answerStats
                .totalAttempts,
            ),

          correct:
            Math.max(
              0,
              answerStats
                .correctAttempts,
            ),

          incorrect:
            Math.max(
              0,
              answerStats
                .incorrectAttempts,
            ),

          open:
            openQuestions,

          uniqueQuestionsAnswered:
            Math.max(
              0,
              answerStats
                .uniqueQuestionsAnswered,
            ),

          questionsToReview:
            Math.max(
              0,
              answerStats
                .needsReview,
            ),

          accuracyPercent,
        },

        exams: {
          completed:
            completedExams,

          passed:
            passedExams,

          failed:
            Math.max(
              0,
              completedExams -
                passedExams,
            ),

          passRatePercent:
            examPassRatePercent,

          averageScorePercent:
            roundPercent(
              snapshot
                .examStats
                .averageScorePercent,
            ),
        },
      },

      program: {
        currentDay,

        totalDays:
          DASHBOARD_PROGRAM_DAYS,

        days:
          buildProgramDays(
            currentDay,
            snapshot
              .programDays,
          ),
      },

      today:
        buildTodayTasks(
          topics,
          answerStats
            .needsReview,
          hasLicenseClass,
        ),

      topics,

      recentTraining,

      nextAppointment:
        snapshot
          .nextAppointment
          ? {
              id:
                snapshot
                  .nextAppointment
                  .id,

              type:
                snapshot
                  .nextAppointment
                  .type,

              title:
                snapshot
                  .nextAppointment
                  .title,

              location:
                snapshot
                  .nextAppointment
                  .location,

              startsAt:
                snapshot
                  .nextAppointment
                  .startsAt
                  .toISOString(),

              endsAt:
                iso(
                  snapshot
                    .nextAppointment
                    .endsAt,
                ),

              status:
                snapshot
                  .nextAppointment
                  .status,
            }
          : null,

      quickAccess:
        DASHBOARD_QUICK_ACCESS,

      notifications: {
        unreadNotifications:
          snapshot
            .unreadNotifications,

        unreadMessages:
          snapshot
            .unreadMessages,
      },

      documents: {
        total:
          documentCounts
            .uploaded +
          documentCounts
            .processing +
          documentCounts
            .verified +
          documentCounts
            .rejected,

        uploaded:
          documentCounts
            .uploaded,

        processing:
          documentCounts
            .processing,

        verified:
          documentCounts
            .verified,

        rejected:
          documentCounts
            .rejected,
      },

      requiresLicenseClassSetup:
        !hasLicenseClass,
    };
  } catch (
    error:
      unknown
  ) {
    if (
      error instanceof
      DashboardServiceError
    ) {
      throw error;
    }

    console.error(
      "[DASHBOARD_SERVICE_ERROR]",
      error instanceof Error
        ? error.message
        : error,
    );

    throw new DashboardServiceError(
      "DATABASE_ERROR",

      "Dein Dashboard konnte gerade nicht geladen werden.",
    );
  }
}
