import "server-only";

import {
  getErrorsRepositorySnapshot,
} from "@/lib/server/errors/errors-repository";

import {
  getTheoryContextForUser,
} from "@/lib/server/theory/theory-repository";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

import type {
  ErrorQuestionView,
  ErrorsPageData,
} from "@/types/errors";

function pct(
  value:
    number,
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

function translatedValue(
  input: {
    translations:
      readonly {
        locale: string;
        value: string;
      }[];
    locale:
      string;
    fallback:
      string;
  },
): string {
  const preferred =
    input.translations.find(
      (
        item,
      ) =>
        item.locale ===
        input.locale,
    );

  const german =
    input.translations.find(
      (
        item,
      ) =>
        item.locale ===
        "de",
    );

  return (
    preferred?.value ??
    german?.value ??
    input.translations[0]
      ?.value ??
    input.fallback
  );
}

export async function getErrorsPageData(
  input: {
    userId:
      string;
    locale:
      ClientShellLocale;
  },
): Promise<ErrorsPageData> {
  const context =
    await getTheoryContextForUser(
      input.userId,
      input.locale,
    );

  if (
    !context
      .userLicenseClassId ||
    !context
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
        masteredQuestions:
          0,
        accuracyPercent:
          0,
      },
      questions:
        [],
    };
  }

  if (
    !context.programId
  ) {
    return {
      status:
        "no_published_program",
      licenseClassCode:
        context
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
        masteredQuestions:
          0,
        accuracyPercent:
          0,
      },
      questions:
        [],
    };
  }

  const snapshot =
    await getErrorsRepositorySnapshot({
      context,
      locale:
        input.locale,
      take:
        100,
    });

  const questions:
    ErrorQuestionView[] =
    snapshot.questions.map(
      (
        item,
      ) => ({
        id:
          item.questionId,
        topicId:
          item.topicId,
        topicSlug:
          item.topicSlug,
        topicTitle:
          translatedValue({
            translations:
              item.topicTranslations.map(
                (
                  translation,
                ) => ({
                  locale:
                    translation.locale,
                  value:
                    translation.title,
                }),
              ),
            locale:
              input.locale,
            fallback:
              "Thema",
          }),
        prompt:
          translatedValue({
            translations:
              item.questionTranslations.map(
                (
                  translation,
                ) => ({
                  locale:
                    translation.locale,
                  value:
                    translation.prompt,
                }),
              ),
            locale:
              input.locale,
            fallback:
              "Theoriefrage",
          }),
        penaltyPoints:
          Math.max(
            0,
            item.penaltyPoints,
          ),
        attemptCount:
          Math.max(
            0,
            item.attemptCount,
          ),
        correctCount:
          Math.max(
            0,
            item.correctCount,
          ),
        incorrectCount:
          Math.max(
            0,
            item.incorrectCount,
          ),
        lastAnswerCorrect:
          item.lastAnswerCorrect,
        isMastered:
          item.isMastered,
        needsReview:
          item.needsReview,
        lastAnsweredAt:
          item.lastAnsweredAt
            ?.toISOString() ??
          null,
      }),
    );

  const totalAttempts =
    Math.max(
      0,
      snapshot.totalAttempts,
    );

  const correctAttempts =
    Math.max(
      0,
      snapshot.correctAttempts,
    );

  return {
    status:
      "ready",
    licenseClassCode:
      context
        .licenseClassCode,
    overview: {
      totalAttempts,
      correctAttempts,
      incorrectAttempts:
        Math.max(
          0,
          snapshot
            .incorrectAttempts,
        ),
      needsReviewCount:
        Math.max(
          0,
          snapshot
            .needsReviewCount,
        ),
      masteredQuestions:
        Math.max(
          0,
          snapshot
            .masteredQuestions,
        ),
      accuracyPercent:
        totalAttempts >
        0
          ? pct(
              (
                correctAttempts /
                totalAttempts
              ) *
                100,
            )
          : 0,
    },
    questions,
  };
}
