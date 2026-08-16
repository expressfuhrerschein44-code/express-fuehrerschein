import "server-only";

import {
  getProgressRepositorySnapshot,
} from "@/lib/server/progress/progress-repository";

import type {
  ProgressDayStatus,
  ProgressDayView,
  ProgressPageData,
  ProgressTopicView,
} from "@/types/progress";

const TOTAL_PROGRAM_DAYS =
  21;

function pct(
  value: number,
): number {
  if (
    !Number.isFinite(
      value,
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        value,
      ),
    ),
  );
}

function normalizeDayStatus(
  value: string,
  dayNumber: number,
  currentDay: number,
  completedDays: number,
): ProgressDayStatus {
  const normalized =
    value
      .trim()
      .toLowerCase();

  if (
    normalized ===
      "completed" ||
    dayNumber <=
      completedDays
  ) {
    return "completed";
  }

  if (
    normalized ===
      "in_progress" ||
    normalized ===
      "active" ||
    dayNumber ===
      currentDay
  ) {
    return "in_progress";
  }

  if (
    normalized ===
      "available" ||
    normalized ===
      "unlocked"
  ) {
    return "available";
  }

  return "locked";
}

function buildDays(
  input: {
    currentDay: number;
    completedDays: number;
    storedDays: Array<{
      day_number: number;
      status: string;
      planned_date: Date | null;
      study_minutes: number;
      score: number | null;
    }>;
  },
): ProgressDayView[] {
  const storedByDay =
    new Map(
      input.storedDays.map(
        (
          day,
        ) => [
          day.day_number,
          day,
        ] as const,
      ),
    );

  return Array.from(
    {
      length:
        TOTAL_PROGRAM_DAYS,
    },
    (
      _,
      index,
    ) => {
      const dayNumber =
        index +
        1;

      const stored =
        storedByDay.get(
          dayNumber,
        ) ??
        null;

      const status =
        normalizeDayStatus(
          stored?.status ??
            "locked",
          dayNumber,
          input.currentDay,
          input.completedDays,
        );

      return {
        dayNumber,
        status,
        plannedDate:
          stored?.planned_date
            ? stored.planned_date.toISOString()
            : null,
        studyMinutes:
          Math.max(
            0,
            stored?.study_minutes ??
              0,
          ),
        score:
          stored?.score ??
          null,
      };
    },
  );
}

function localizedTopic(
  input: {
    translations: Array<{
      locale: string;
      title: string;
      description: string | null;
    }>;
    preferredLocale: string;
  },
): {
  title: string;
  description: string | null;
} {
  const preferred =
    input.translations.find(
      (
        translation,
      ) =>
        translation.locale ===
        input.preferredLocale,
    );

  const german =
    input.translations.find(
      (
        translation,
      ) =>
        translation.locale ===
        "de",
    );

  const fallback =
    preferred ??
    german ??
    input.translations[0] ??
    null;

  return {
    title:
      fallback?.title ??
      "Thema",
    description:
      fallback?.description ??
      null,
  };
}

export async function getProgressPageData(
  input: {
    userId: string;
    locale: string;
  },
): Promise<ProgressPageData> {
  const snapshot =
    await getProgressRepositorySnapshot(
      input,
    );

  const currentDay =
    Math.max(
      1,
      Math.min(
        TOTAL_PROGRAM_DAYS,
        snapshot.learningProgress
          ?.current_day ??
          1,
      ),
    );

  const completedDays =
    Math.max(
      0,
      Math.min(
        TOTAL_PROGRAM_DAYS,
        snapshot.learningProgress
          ?.completed_days ??
          0,
      ),
    );

  const days =
    buildDays({
      currentDay,
      completedDays,
      storedDays:
        snapshot.learningDays,
    });

  const totalAttempts =
    Math.max(
      0,
      snapshot.theory
        .correctAttempts +
        snapshot.theory
          .incorrectAttempts,
    );

  const theory = {
    totalLessons:
      Math.max(
        0,
        snapshot.theory
          .totalLessons,
      ),
    completedLessons:
      Math.max(
        0,
        snapshot.theory
          .completedLessons,
      ),
    lessonCompletionPercent:
      snapshot.theory
        .totalLessons > 0
        ? pct(
            (
              snapshot.theory
                .completedLessons /
              snapshot.theory
                .totalLessons
            ) *
              100,
          )
        : 0,
    totalQuestions:
      Math.max(
        0,
        snapshot.theory
          .totalQuestions,
      ),
    answeredQuestions:
      Math.max(
        0,
        snapshot.theory
          .answeredQuestions,
      ),
    questionCoveragePercent:
      snapshot.theory
        .totalQuestions > 0
        ? pct(
            (
              snapshot.theory
                .answeredQuestions /
              snapshot.theory
                .totalQuestions
            ) *
              100,
          )
        : 0,
    correctAttempts:
      Math.max(
        0,
        snapshot.theory
          .correctAttempts,
      ),
    incorrectAttempts:
      Math.max(
        0,
        snapshot.theory
          .incorrectAttempts,
      ),
    accuracyPercent:
      totalAttempts > 0
        ? pct(
            (
              snapshot.theory
                .correctAttempts /
              totalAttempts
            ) *
              100,
          )
        : 0,
    needsReviewCount:
      Math.max(
        0,
        snapshot.theory
          .needsReviewCount,
      ),
  };

  const training = {
    completedSessions:
      Math.max(
        0,
        snapshot.training
          .completedSessions,
      ),
    totalQuestionsAnswered:
      Math.max(
        0,
        snapshot.training
          .totalQuestionsAnswered,
      ),
    totalDurationMinutes:
      Math.floor(
        Math.max(
          0,
          snapshot.training
            .totalDurationSeconds,
        ) /
          60,
      ),
    averageScorePercent:
      snapshot.training
        .scoredSessions > 0
        ? pct(
            snapshot.training
              .scoreSum /
              snapshot.training
                .scoredSessions,
          )
        : null,
    lastTrainingAt:
      snapshot.training
        .lastTrainingAt
        ?.toISOString() ??
      null,
    lastScorePercent:
      snapshot.training
        .lastScorePercent ??
      null,
  };

  const exam = {
    completedAttempts:
      Math.max(
        0,
        snapshot.exam
          .completedAttempts,
      ),
    passedAttempts:
      Math.max(
        0,
        snapshot.exam
          .passedAttempts,
      ),
    failedAttempts:
      Math.max(
        0,
        snapshot.exam
          .failedAttempts,
      ),
    passRatePercent:
      snapshot.exam
        .completedAttempts > 0
        ? pct(
            (
              snapshot.exam
                .passedAttempts /
              snapshot.exam
                .completedAttempts
            ) *
              100,
          )
        : null,
    averageScorePercent:
      snapshot.exam
        .scoredAttempts > 0
        ? pct(
            snapshot.exam
              .scoreSum /
              snapshot.exam
                .scoredAttempts,
          )
        : null,
    lastAttemptAt:
      snapshot.exam
        .lastAttemptAt
        ?.toISOString() ??
      null,
    lastScorePercent:
      snapshot.exam
        .lastScorePercent ??
      null,
    lastAttemptPassed:
      snapshot.exam
        .lastAttemptPassed,
  };

  const topics:
    ProgressTopicView[] =
    snapshot.topics.map(
      (
        topic,
      ) => {
        const translation =
          localizedTopic({
            translations:
              topic.translations,
            preferredLocale:
              input.locale,
          });

        const progress =
          topic.user_progress[0] ??
          null;

        return {
          id:
            topic.id,
          slug:
            topic.slug,
          title:
            translation.title,
          description:
            translation.description,
          questionCount:
            Math.max(
              0,
              topic._count
                .questions,
            ),
          answeredQuestions:
            Math.max(
              0,
              progress
                ?.answered_questions ??
                0,
            ),
          correctAnswers:
            Math.max(
              0,
              progress
                ?.correct_answers ??
                0,
            ),
          incorrectAnswers:
            Math.max(
              0,
              progress
                ?.incorrect_answers ??
                0,
            ),
          progressPercent:
            pct(
              progress
                ?.progress_percent ??
                0,
            ),
          masteryScore:
            pct(
              progress
                ?.mastery_score ??
                0,
            ),
          lastTrainedAt:
            progress
              ?.last_trained_at
              ?.toISOString() ??
            null,
        };
      },
    );

  const base = {
    licenseClassCode:
      snapshot.context
        .licenseClassCode,
    overview: {
      currentDay,
      totalDays:
        TOTAL_PROGRAM_DAYS,
      completedDays,
      totalStudyMinutes:
        Math.max(
          0,
          snapshot.learningProgress
            ?.total_study_minutes ??
            0,
        ),
      answeredQuestions:
        theory.answeredQuestions,
      readinessScore:
        pct(
          snapshot.learningProgress
            ?.readiness_score ??
            0,
        ),
      lastActivityAt:
        snapshot.learningProgress
          ?.last_activity_at
          ?.toISOString() ??
        null,
    },
    days,
    theory,
    training,
    exam,
    topics,
  };

  if (
    !snapshot.context
      .userLicenseClassId ||
    !snapshot.context
      .licenseClassCode
  ) {
    return {
      status:
        "no_active_license_class",
      ...base,
      licenseClassCode:
        null,
    };
  }

  if (
    !snapshot.context
      .programId
  ) {
    return {
      status:
        "no_published_program",
      ...base,
    };
  }

  return {
    status:
      "ready",
    ...base,
  };
}
