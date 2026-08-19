import "server-only";

import {
  createTheoryTrainingSession,
  findPublicTheoryQuestion,
  findTheoryQuestionForAnswer,
  finishTheoryTrainingSession,
  getTheoryContextForUser,
  recordTheoryQuestionOutcome,
  sampleTheoryQuestionIds,
} from "@/lib/server/theory/theory-repository";

import type {
  TheoryPublicQuestion,
  TheoryRepositoryTraining,
} from "@/lib/server/theory/theory-repository";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

import type {
  TheoryQuestionOptionView,
  TheoryQuestionResultView,
  TheoryQuestionView,
} from "@/types/theory";

export type TheoryPracticeKind =
  | "random"
  | "topic"
  | "errors"
  | "favorites"
  | "quick";

type JsonRecord = Record<string, unknown>;

function isRecord(
  value: unknown,
): value is JsonRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function scalarText(
  value: unknown,
): string | null {
  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const text = String(value).trim();
    return text || null;
  }

  return null;
}

function firstText(
  row: JsonRecord,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const value = scalarText(row[key]);
    if (value) return value;
  }

  return null;
}

function normalizeOption(
  value: unknown,
  index: number,
  fallbackId?: string,
): TheoryQuestionOptionView | null {
  const primitive = scalarText(value);

  if (primitive) {
    return {
      id: fallbackId ?? primitive,
      label: primitive,
    };
  }

  if (!isRecord(value)) {
    return null;
  }

  const id =
    firstText(
      value,
      [
        "id",
        "optionId",
        "option_id",
        "value",
        "key",
        "code",
      ],
    ) ??
    fallbackId ??
    String(index + 1);

  const label =
    firstText(
      value,
      [
        "label",
        "text",
        "title",
        "name",
        "caption",
        "value",
      ],
    ) ?? id;

  const imageUrl = firstText(
    value,
    [
      "imageUrl",
      "image_url",
      "mediaUrl",
      "media_url",
      "image",
    ],
  );

  return {
    id,
    label,
    ...(imageUrl
      ? { imageUrl }
      : {}),
  };
}

function normalizeQuestionOptions(
  value: unknown,
): readonly TheoryQuestionOptionView[] {
  if (Array.isArray(value)) {
    return value
      .map((option, index) =>
        normalizeOption(option, index),
      )
      .filter(
        (
          option,
        ): option is TheoryQuestionOptionView =>
          option !== null,
      );
  }

  if (!isRecord(value)) {
    return [];
  }

  for (const key of [
    "options",
    "answers",
    "choices",
    "items",
  ] as const) {
    const nested = value[key];

    if (Array.isArray(nested)) {
      return nested
        .map((option, index) =>
          normalizeOption(option, index),
        )
        .filter(
          (
            option,
          ): option is TheoryQuestionOptionView =>
            option !== null,
        );
    }
  }

  return Object.entries(value)
    .map(([key, option], index) =>
      normalizeOption(
        option,
        index,
        key,
      ),
    )
    .filter(
      (
        option,
      ): option is TheoryQuestionOptionView =>
        option !== null,
    );
}

function normalizePublicQuestion(
  question: TheoryPublicQuestion,
): TheoryQuestionView {
  const mediaUrl =
    question.mediaStoragePath &&
    (
      question.mediaStoragePath.startsWith("/") ||
      /^https?:\/\//i.test(
        question.mediaStoragePath,
      )
    )
      ? question.mediaStoragePath
      : null;

  return {
    id: question.id,
    topicId: question.topicId,
    questionType: question.questionType.trim().toUpperCase(),
    penaltyPoints: question.penaltyPoints,
    prompt: question.prompt,
    options: normalizeQuestionOptions(
      question.answerOptions,
    ),
    favorite: question.favorite,
    ...(mediaUrl
      ? { mediaUrl }
      : {}),
  };
}

function uniqueAnswerValues(
  values: readonly string[],
): readonly string[] {
  return [
    ...new Set(
      values
        .map((value) =>
          value.trim(),
        )
        .filter(Boolean),
    ),
  ];
}

function extractCorrectAnswerValues(
  value: unknown,
): readonly string[] {
  const primitive = scalarText(value);

  if (primitive) {
    return [primitive];
  }

  if (typeof value === "boolean") {
    return [String(value)];
  }

  if (Array.isArray(value)) {
    return uniqueAnswerValues(
      value.flatMap((item) =>
        extractCorrectAnswerValues(item),
      ),
    );
  }

  if (!isRecord(value)) {
    return [];
  }

  const pluralKeys = [
    "correctOptionIds",
    "correct_option_ids",
    "optionIds",
    "option_ids",
    "correctAnswers",
    "correct_answers",
    "answers",
    "values",
  ] as const;

  for (const key of pluralKeys) {
    if (key in value) {
      const parsed =
        extractCorrectAnswerValues(
          value[key],
        );

      if (parsed.length > 0) {
        return parsed;
      }
    }
  }

  const singularKeys = [
    "correctOptionId",
    "correct_option_id",
    "optionId",
    "option_id",
    "correctAnswer",
    "correct_answer",
    "answer",
    "value",
    "id",
  ] as const;

  for (const key of singularKeys) {
    if (key in value) {
      const parsed =
        extractCorrectAnswerValues(
          value[key],
        );

      if (parsed.length > 0) {
        return parsed;
      }
    }
  }

  const enabledKeys =
    Object.entries(value)
      .filter(([, enabled]) =>
        enabled === true,
      )
      .map(([key]) => key);

  return uniqueAnswerValues(enabledKeys);
}

function normalizeSelectedAnswers(
  values: readonly string[],
): readonly string[] {
  return uniqueAnswerValues(
    values.slice(0, 50),
  );
}

function numericValue(
  value: string,
): number | null {
  const normalized = value
    .trim()
    .replace(",", ".");

  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function sameChoiceSet(
  selected: readonly string[],
  expected: readonly string[],
): boolean {
  if (
    selected.length !==
    expected.length
  ) {
    return false;
  }

  const selectedSet =
    new Set(selected);

  return expected.every(
    (value) =>
      selectedSet.has(value),
  );
}

function answerIsCorrect(
  questionType: string,
  selected: readonly string[],
  expected: readonly string[],
): boolean {
  if (
    questionType.toUpperCase() ===
    "NUMERIC"
  ) {
    if (
      selected.length !== 1 ||
      expected.length < 1
    ) {
      return false;
    }

    const selectedNumber =
      numericValue(selected[0]);

    const expectedNumber =
      numericValue(expected[0]);

    if (
      selectedNumber === null ||
      expectedNumber === null
    ) {
      return selected[0] === expected[0];
    }

    return (
      Math.abs(
        selectedNumber -
        expectedNumber,
      ) < 1e-9
    );
  }

  return sameChoiceSet(
    selected,
    expected,
  );
}

export async function startTheoryPractice(
  input: {
    userId: string;
    locale: ClientShellLocale;
    kind: TheoryPracticeKind;
    topicId?: string | null;
    questionCount?: number;
  },
) {
  const context =
    await getTheoryContextForUser(
      input.userId,
      input.locale,
    );

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

  if (
    input.kind === "topic" &&
    !input.topicId
  ) {
    throw new Error(
      "[Express-Führerschein] Für Themen-Training fehlt das Thema.",
    );
  }

  const questionIds =
    await sampleTheoryQuestionIds(
      context,
      {
        topicId:
          input.topicId ?? null,
        questionCount:
          Math.max(
            1,
            Math.min(
              50,
              Math.round(
                input.questionCount ??
                  (
                    input.kind ===
                    "quick"
                      ? 10
                      : 20
                  ),
              ),
            ),
          ),
        onlyReview:
          input.kind ===
          "errors",
        onlyFavorites:
          input.kind ===
          "favorites",
      },
    );

  if (!questionIds.length) {
    throw new Error(
      "[Express-Führerschein] Für dieses Training sind derzeit keine Fragen verfügbar.",
    );
  }

  const session =
    await createTheoryTrainingSession(
      context,
      input.topicId ?? null,
      input.kind,
    );

  return {
    sessionId:
      session.id,
    kind:
      input.kind,
    startedAt:
      session.started_at.toISOString(),
    questionIds,
  };
}

export async function getPracticeQuestion(
  input: {
    userId: string;
    locale: ClientShellLocale;
    questionId: string;
  },
): Promise<TheoryQuestionView | null> {
  const context =
    await getTheoryContextForUser(
      input.userId,
      input.locale,
    );

  const question =
    await findPublicTheoryQuestion(
      context,
      input.questionId,
    );

  return question
    ? normalizePublicQuestion(
        question,
      )
    : null;
}

export async function answerTheoryPracticeQuestion(
  input: {
    userId: string;
    locale: ClientShellLocale;
    questionId: string;
    selectedOptionIds: readonly string[];
    trainingSessionId?: string | null;
  },
): Promise<TheoryQuestionResultView> {
  const context =
    await getTheoryContextForUser(
      input.userId,
      input.locale,
    );

  if (!context.userLicenseClassId) {
    throw new Error(
      "[Express-Führerschein] Keine aktive Führerscheinklasse.",
    );
  }

  if (!context.programId) {
    throw new Error(
      "[Express-Führerschein] Kein veröffentlichtes Theorieprogramm verfügbar.",
    );
  }

  const question =
    await findTheoryQuestionForAnswer(
      context,
      input.questionId,
    );

  if (!question) {
    throw new Error(
      "[Express-Führerschein] Theoriefrage wurde nicht gefunden.",
    );
  }

  const selected =
    normalizeSelectedAnswers(
      input.selectedOptionIds,
    );

  if (!selected.length) {
    throw new Error(
      "[Express-Führerschein] Wähle zuerst eine Antwort aus.",
    );
  }

  const correctOptionIds =
    extractCorrectAnswerValues(
      question.correctAnswer,
    );

  if (!correctOptionIds.length) {
    throw new Error(
      "[Express-Führerschein] Für diese Frage ist keine auswertbare Lösung hinterlegt.",
    );
  }

  const correct =
    answerIsCorrect(
      question.questionType,
      selected,
      correctOptionIds,
    );

  await recordTheoryQuestionOutcome(
    context,
    {
      questionId:
        question.id,
      topicId:
        question.topicId,
      correct,
      trainingSessionId:
        input.trainingSessionId ??
        null,
    },
  );

  return {
    correct,
    explanation:
      question.explanation,
    correctOptionIds,
  };
}

export async function completeTheoryPractice(
  input: {
    userId: string;
    locale: ClientShellLocale;
    sessionId: string;
    activeDurationSeconds: number;
  },
): Promise<TheoryRepositoryTraining> {
  const context =
    await getTheoryContextForUser(
      input.userId,
      input.locale,
    );

  return finishTheoryTrainingSession(
    context,
    input.sessionId,
    input.activeDurationSeconds,
  );
}
