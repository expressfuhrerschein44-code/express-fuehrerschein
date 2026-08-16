import "server-only";

import { prisma } from "@/lib/server/prisma";
import {
  getExamAttemptForUser,
  getTheoryContextForUser,
  listExamHistory,
  pickTheoryTranslation,
} from "@/lib/server/theory/theory-repository";
import type {
  ClientShellLocale,
} from "@/types/client-shell";

function localeFallbacks(
  locale: ClientShellLocale,
): string[] {
  return locale === "de" ? ["de"] : [locale, "de"];
}

export async function listGermanTheoryExamResults(
  input: {
    userId: string;
    locale: ClientShellLocale;
    take?: number;
  },
) {
  const context = await getTheoryContextForUser(
    input.userId,
    input.locale,
  );

  if (
    context.countryCode !== "DE" ||
    !context.userLicenseClassId
  ) {
    return [];
  }

  const history = await listExamHistory(
    context,
    input.take ?? 50,
  );

  return history.map((attempt) => ({
    id: attempt.id,
    licenseClassCode: context.licenseClassCode,
    status: attempt.status,
    totalQuestions: attempt.totalQuestions,
    answeredQuestions: attempt.answeredQuestions,
    correctAnswers: attempt.correctAnswers,
    incorrectAnswers: attempt.incorrectAnswers,
    penaltyPoints: attempt.penaltyPoints,
    scorePercent: attempt.scorePercent,
    passed: attempt.passed,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
  }));
}

export async function getGermanTheoryExamResultDetail(
  input: {
    userId: string;
    locale: ClientShellLocale;
    attemptId: string;
  },
) {
  const context = await getTheoryContextForUser(
    input.userId,
    input.locale,
  );

  if (
    context.countryCode !== "DE" ||
    !context.userLicenseClassId
  ) {
    return null;
  }

  const attempt = await getExamAttemptForUser(
    context,
    input.attemptId,
  );

  if (!attempt || attempt.status !== "completed") {
    return null;
  }

  const questionIds = attempt.answers.map(
    (answer) => answer.questionId,
  );

  const questions = questionIds.length
    ? await prisma.theory_questions.findMany({
        where: {
          id: { in: questionIds },
        },
        select: {
          id: true,
          question_type: true,
          penalty_points: true,
          media_storage_path: true,
          translations: {
            where: {
              locale: {
                in: localeFallbacks(input.locale),
              },
            },
            select: {
              locale: true,
              prompt: true,
              explanation: true,
              answer_options: true,
              correct_answer: true,
            },
          },
        },
      })
    : [];

  const questionMap = new Map(
    questions.map((question) => [question.id, question]),
  );

  return {
    id: attempt.id,
    licenseClassCode: context.licenseClassCode,
    status: attempt.status,
    totalQuestions: attempt.totalQuestions,
    answeredQuestions: attempt.answeredQuestions,
    correctAnswers: attempt.correctAnswers,
    incorrectAnswers: attempt.incorrectAnswers,
    penaltyPoints: attempt.penaltyPoints,
    scorePercent: attempt.scorePercent,
    passed: attempt.passed,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    examConfigurationId: attempt.examConfigurationId,
    configurationSnapshot: attempt.configurationSnapshot,
    answers: attempt.answers.map((answer) => {
      const question = questionMap.get(answer.questionId) ?? null;
      const translation = question
        ? pickTheoryTranslation(
            question.translations,
            input.locale,
          )
        : null;

      return {
        id: answer.id,
        questionId: answer.questionId,
        questionType: question?.question_type ?? null,
        prompt: translation?.prompt ?? null,
        explanation: translation?.explanation ?? null,
        answerOptions: translation?.answer_options ?? null,
        correctAnswer: translation?.correct_answer ?? null,
        answerPayload: answer.answerPayload,
        isCorrect: answer.isCorrect,
        penaltyPoints: answer.penaltyPoints,
        configuredPenaltyPoints:
          question?.penalty_points ?? null,
        mediaStoragePath:
          question?.media_storage_path ?? null,
      };
    }),
  };
}
