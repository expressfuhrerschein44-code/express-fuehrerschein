import "server-only";

import {
  getTheoryContextForUser,
  listTheoryErrorQuestions,
  sampleTheoryQuestionIds,
} from "@/lib/server/theory/theory-repository";

import type {
  TheoryErrorQuestion,
} from "@/lib/server/theory/theory-repository";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

export async function getTheoryErrors(
  input: {
    userId: string;
    locale: ClientShellLocale;
    take?: number;
  },
): Promise<readonly TheoryErrorQuestion[]> {
  const context = await getTheoryContextForUser(input.userId, input.locale);
  return listTheoryErrorQuestions(context, input.take);
}

export async function getErrorReviewQuestionIds(
  input: {
    userId: string;
    locale: ClientShellLocale;
    questionCount?: number;
  },
): Promise<readonly string[]> {
  const context = await getTheoryContextForUser(input.userId, input.locale);
  return sampleTheoryQuestionIds(context, {
    onlyReview: true,
    questionCount: input.questionCount ?? 20,
  });
}
