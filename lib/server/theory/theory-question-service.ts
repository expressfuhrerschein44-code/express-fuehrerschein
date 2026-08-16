import "server-only";

import {
  createTheoryQuestionReport,
  findPublicTheoryQuestion,
  findTheoryQuestionForAnswer,
  deleteTheoryNotePersistence,
  getTheoryContextForUser,
  listTheoryNotes,
  recordTheoryQuestionOutcome,
  saveTheoryNote,
  updateTheoryNotePersistence,
} from "@/lib/server/theory/theory-repository";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

export type TheoryQuestionLearningMode =
  | "learning"
  | "practice"
  | "error_review";

export type TheoryQuestionReportReason =
  | "incorrect_question"
  | "incorrect_media"
  | "translation"
  | "technical"
  | "other";

function primitiveToken(value: unknown): string | null {
  switch (typeof value) {
    case "string":
      return value.trim();
    case "number":
    case "boolean":
      return String(value);
    default:
      return null;
  }
}

function collectTokens(value: unknown): string[] {
  const direct = primitiveToken(value);
  if (direct !== null) return [direct];

  if (Array.isArray(value)) {
    return value.flatMap(collectTokens).filter(Boolean);
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of [
      "answerIds",
      "selectedAnswers",
      "answers",
      "answer",
      "value",
      "id",
      "key",
    ]) {
      if (key in record) return collectTokens(record[key]);
    }
    return Object.values(record).flatMap(collectTokens);
  }

  return [];
}

function canonicalTokens(value: unknown): readonly string[] {
  return [...new Set(
    collectTokens(value)
      .map((token) => token.trim())
      .filter((token) => token.length > 0),
  )].sort((left, right) => left.localeCompare(right));
}

export function evaluateTheoryAnswer(
  answerPayload: unknown,
  correctAnswer: unknown,
): boolean {
  const actual = canonicalTokens(answerPayload);
  const expected = canonicalTokens(correctAnswer);

  if (!expected.length) {
    throw new Error(
      "[Express-Führerschein] Für diese Theoriefrage ist keine gültige Lösung hinterlegt.",
    );
  }

  return actual.length === expected.length
    && expected.every((value, index) => actual[index] === value);
}

export async function submitTheoryAnswer(
  input: {
    userId: string;
    locale: ClientShellLocale;
    questionId: string;
    answerPayload: unknown;
    mode: TheoryQuestionLearningMode;
    trainingSessionId?: string | null;
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
      "[Express-Führerschein] Für Land und Führerscheinklasse ist noch kein veröffentlichtes Theorieprogramm verfügbar.",
    );
  }

  const question = await findTheoryQuestionForAnswer(
    context,
    input.questionId,
  );

  if (!question) {
    throw new Error("[Express-Führerschein] Theoriefrage wurde nicht gefunden.");
  }

  const correct = evaluateTheoryAnswer(
    input.answerPayload,
    question.correctAnswer,
  );

  await recordTheoryQuestionOutcome(context, {
    questionId: question.id,
    topicId: question.topicId,
    correct,
    trainingSessionId: input.trainingSessionId ?? null,
  });

  return {
    questionId: question.id,
    correct,
    explanation: question.explanation,
    correctAnswer: question.correctAnswer,
    needsReview: !correct,
  };
}

export async function reportTheoryQuestion(
  input: {
    userId: string;
    locale: ClientShellLocale;
    questionId: string;
    reason: TheoryQuestionReportReason;
    message?: string | null;
  },
) {
  const context = await getTheoryContextForUser(input.userId, input.locale);
  const question = await findPublicTheoryQuestion(context, input.questionId);

  if (!question) {
    throw new Error("[Express-Führerschein] Theoriefrage wurde nicht gefunden.");
  }

  return createTheoryQuestionReport(context, {
    questionId: question.id,
    reason: input.reason,
    message: input.message ?? null,
  });
}

export async function createTheoryNote(
  input: {
    userId: string;
    locale: ClientShellLocale;
    questionId?: string | null;
    lessonId?: string | null;
    body: string;
  },
) {
  const context = await getTheoryContextForUser(input.userId, input.locale);

  return saveTheoryNote(context, {
    questionId: input.questionId ?? null,
    lessonId: input.lessonId ?? null,
    body: input.body,
  });
}


export async function getTheoryNotes(
  input: {
    userId: string;
    locale: ClientShellLocale;
    take?: number;
  },
) {
  const context = await getTheoryContextForUser(input.userId, input.locale);
  return listTheoryNotes(context, input.take);
}

export async function updateTheoryNote(
  input: {
    userId: string;
    locale: ClientShellLocale;
    noteId: string;
    body: string;
  },
) {
  const context = await getTheoryContextForUser(input.userId, input.locale);
  return updateTheoryNotePersistence(context, input.noteId, input.body);
}

export async function deleteTheoryNote(
  input: {
    userId: string;
    locale: ClientShellLocale;
    noteId: string;
  },
): Promise<void> {
  const context = await getTheoryContextForUser(input.userId, input.locale);
  await deleteTheoryNotePersistence(context, input.noteId);
}
