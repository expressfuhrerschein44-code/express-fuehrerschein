import "server-only";

import {
  findPublicTheoryQuestion,
  getTheoryContextForUser,
  listTheoryFavoriteQuestionIds,
  listTheoryFavoriteQuestions,
  setTheoryQuestionFavoritePersistence,
} from "@/lib/server/theory/theory-repository";

import type {
  TheoryFavoriteQuestion,
} from "@/lib/server/theory/theory-repository";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

export interface TheoryFavoriteCapability {
  supported: true;
  reason: string;
}

export async function getTheoryFavoriteCapability(
  input: {
    userId: string;
    locale: ClientShellLocale;
  },
): Promise<TheoryFavoriteCapability> {
  await getTheoryContextForUser(input.userId, input.locale);

  return {
    supported: true,
    reason:
      "Markierte Fragen werden persistent gespeichert und geräteübergreifend synchronisiert.",
  };
}

export async function listFavoriteTheoryQuestionIds(
  input: {
    userId: string;
    locale: ClientShellLocale;
  },
): Promise<readonly string[]> {
  const context = await getTheoryContextForUser(input.userId, input.locale);
  return listTheoryFavoriteQuestionIds(context);
}

export async function getFavoriteTheoryQuestions(
  input: {
    userId: string;
    locale: ClientShellLocale;
    take?: number;
  },
): Promise<readonly TheoryFavoriteQuestion[]> {
  const context = await getTheoryContextForUser(input.userId, input.locale);
  return listTheoryFavoriteQuestions(context, input.take);
}

export async function setTheoryQuestionFavorite(
  input: {
    userId: string;
    locale: ClientShellLocale;
    questionId: string;
    favorite: boolean;
  },
): Promise<{ favorite: boolean }> {
  const context = await getTheoryContextForUser(input.userId, input.locale);
  const question = await findPublicTheoryQuestion(context, input.questionId);

  if (!question) {
    throw new Error("[Express-Führerschein] Theoriefrage wurde nicht gefunden.");
  }

  const favorite = await setTheoryQuestionFavoritePersistence(
    context,
    input.questionId,
    input.favorite,
  );

  return { favorite };
}
