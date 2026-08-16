import "server-only";

import {
  createTheoryTrainingSession,
  findPublicTheoryQuestion,
  finishTheoryTrainingSession,
  getTheoryContextForUser,
  sampleTheoryQuestionIds,
} from "@/lib/server/theory/theory-repository";

import type {
  TheoryPublicQuestion,
  TheoryRepositoryTraining,
} from "@/lib/server/theory/theory-repository";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

export type TheoryPracticeKind =
  | "random"
  | "topic"
  | "errors"
  | "favorites"
  | "quick";

export async function startTheoryPractice(
  input: {
    userId: string;
    locale: ClientShellLocale;
    kind: TheoryPracticeKind;
    topicId?: string | null;
    questionCount?: number;
  },
) {
  const context = await getTheoryContextForUser(input.userId, input.locale);

  if (!context.userLicenseClassId) {
    throw new Error(
      "[Express-Führerschein] Wähle zuerst eine Führerscheinklasse aus.",
    );
  }

  if (!context.programId) {
    throw new Error(
      "[Express-Führerschein] Kein veröffentlichtes Theorieprogramm verfügbar.",
    );
  }

  if (input.kind === "topic" && !input.topicId) {
    throw new Error(
      "[Express-Führerschein] Für Themen-Training fehlt das Thema.",
    );
  }

  const questionIds = await sampleTheoryQuestionIds(context, {
    topicId: input.topicId ?? null,
    questionCount: Math.max(
      1,
      Math.min(
        50,
        Math.round(
          input.questionCount ?? (input.kind === "quick" ? 10 : 20),
        ),
      ),
    ),
    onlyReview: input.kind === "errors",
    onlyFavorites: input.kind === "favorites",
  });

  if (!questionIds.length) {
    throw new Error(
      "[Express-Führerschein] Für dieses Training sind derzeit keine Fragen verfügbar.",
    );
  }

  const session = await createTheoryTrainingSession(
    context,
    input.topicId ?? null,
    input.kind,
  );

  return {
    sessionId: session.id,
    kind: input.kind,
    startedAt: session.started_at.toISOString(),
    questionIds,
  };
}

export async function getPracticeQuestion(
  input: {
    userId: string;
    locale: ClientShellLocale;
    questionId: string;
  },
): Promise<TheoryPublicQuestion | null> {
  const context = await getTheoryContextForUser(input.userId, input.locale);
  return findPublicTheoryQuestion(context, input.questionId);
}

export async function completeTheoryPractice(
  input: {
    userId: string;
    locale: ClientShellLocale;
    sessionId: string;
    activeDurationSeconds: number;
  },
): Promise<TheoryRepositoryTraining> {
  const context = await getTheoryContextForUser(input.userId, input.locale);

  return finishTheoryTrainingSession(
    context,
    input.sessionId,
    input.activeDurationSeconds,
  );
}
