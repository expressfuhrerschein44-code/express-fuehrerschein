import "server-only";

import {
  getTrainingRepositorySnapshot,
} from "@/lib/server/training/training-repository";

import type {
  TrainingPageData,
  TrainingTopicView,
} from "@/types/training";

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

export async function getTrainingPageData(
  input: {
    userId: string;
    locale: string;
  },
): Promise<TrainingPageData> {
  const snapshot =
    await getTrainingRepositorySnapshot(
      input,
    );

  if (
    !snapshot.context
      .licenseClassId ||
    !snapshot.context
      .licenseClassCode
  ) {
    return {
      status:
        "no_active_license_class",
      licenseClassCode:
        null,
      overview: {
        totalAttempts:
          0,
        correctAttempts:
          0,
        incorrectAttempts:
          0,
        needsReviewCount:
          0,
        accuracyPercent:
          0,
        completedSessions:
          0,
        lastTrainingAt:
          null,
      },
      topics:
        [],
    };
  }

  if (
    !snapshot.context
      .programId
  ) {
    return {
      status:
        "no_published_program",
      licenseClassCode:
        snapshot.context
          .licenseClassCode,
      overview: {
        totalAttempts:
          0,
        correctAttempts:
          0,
        incorrectAttempts:
          0,
        needsReviewCount:
          0,
        accuracyPercent:
          0,
        completedSessions:
          0,
        lastTrainingAt:
          null,
      },
      topics:
        [],
    };
  }

  const topics:
    TrainingTopicView[] =
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
            topic._count.questions,
          answeredQuestions:
            Math.max(
              0,
              progress?.answered_questions ??
                0,
            ),
          progressPercent:
            pct(
              progress?.progress_percent ??
                0,
            ),
        };
      },
    );

  const totalAttempts =
    Math.max(
      0,
      snapshot.totals
        .totalAttempts,
    );

  const correctAttempts =
    Math.max(
      0,
      snapshot.totals
        .correctAttempts,
    );

  const incorrectAttempts =
    Math.max(
      0,
      snapshot.totals
        .incorrectAttempts,
    );

  return {
    status:
      "ready",
    licenseClassCode:
      snapshot.context
        .licenseClassCode,
    overview: {
      totalAttempts,
      correctAttempts,
      incorrectAttempts,
      needsReviewCount:
        Math.max(
          0,
          snapshot.totals
            .needsReviewCount,
        ),
      accuracyPercent:
        totalAttempts > 0
          ? pct(
              (
                correctAttempts /
                totalAttempts
              ) *
                100,
            )
          : 0,
      completedSessions:
        Math.max(
          0,
          snapshot.completedSessions,
        ),
      lastTrainingAt:
        snapshot.lastTrainingAt?.toISOString() ??
        null,
    },
    topics,
  };
}
