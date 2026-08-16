import "server-only";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

import {
  createExamAttemptWithQuestions,
  findPublicTheoryQuestion,
  findTheoryQuestionForAnswer,
  finishExamAttempt,
  getCurrentExamConfiguration,
  getExamAttemptForUser,
  getTheoryContextForUser,
  getTheoryOverviewRepositorySnapshot,
  listExamHistory,
  sampleTheoryQuestionIds,
  saveExamAnswerOutcome,
} from "@/lib/server/theory/theory-repository";

import {
  evaluateTheoryAnswer,
} from "@/lib/server/theory/theory-question-service";

import type {
  TheoryContext,
  TheoryExamAttemptDetail,
  TheoryExamConfigurationRecord,
  TheoryPublicQuestion,
  TheoryQuestionForAnswer,
} from "@/lib/server/theory/theory-repository";

import type {
  ExamAttemptPageData,
  ExamConfigurationView,
  ExamHistoryItemView,
  ExamPassingRuleView,
  ExamQuestionOptionView,
  ExamQuestionType,
  ExamQuestionView,
  ExamResultQuestionView,
  ExamResultView,
  ExamsPageData,
} from "@/types/exams";

export type TheoryExamServiceErrorCode =
  | "NO_ACTIVE_LICENSE_CLASS"
  | "NO_PUBLISHED_PROGRAM"
  | "NO_EXAM_CONFIGURATION"
  | "NO_EXAM_QUESTIONS"
  | "EXAM_NOT_FOUND"
  | "EXAM_ALREADY_COMPLETED"
  | "EXAM_TIME_EXPIRED"
  | "QUESTION_NOT_ASSIGNED"
  | "QUESTION_ALREADY_ANSWERED"
  | "INVALID_ANSWER"
  | "EXAM_INCOMPLETE";

export class TheoryExamServiceError
  extends Error {
  readonly code:
    TheoryExamServiceErrorCode;

  readonly status:
    number;

  constructor(
    code:
      TheoryExamServiceErrorCode,
    message:
      string,
    status =
      400,
  ) {
    super(
      message,
    );

    this.name =
      "TheoryExamServiceError";

    this.code =
      code;

    this.status =
      status;
  }
}

interface PassingRuleRecord {
  requireAllAnswered?:
    unknown;
  require_all_answered?:
    unknown;

  minimumScorePercent?:
    unknown;
  minimum_score_percent?:
    unknown;

  maximumPenaltyPoints?:
    unknown;
  maximum_penalty_points?:
    unknown;

  failOnTwoFivePointErrors?:
    unknown;

  trainingOnly?:
    unknown;

  officialTheoryExamRequired?:
    unknown;
}

interface ConfigurationSnapshotRecord {
  id?:
    unknown;
  programId?:
    unknown;
  version?:
    unknown;
  questionCount?:
    unknown;
  durationSeconds?:
    unknown;
  scoringMethod?:
    unknown;
  passingRule?:
    unknown;
}

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

function asRecord(
  value:
    unknown,
): Record<
  string,
  unknown
> | null {
  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value,
    )
  ) {
    return null;
  }

  return value as Record<
    string,
    unknown
  >;
}

function numberOrNull(
  value:
    unknown,
): number | null {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return null;
  }

  return value;
}

function booleanOrNull(
  value:
    unknown,
): boolean | null {
  return typeof value ===
    "boolean"
    ? value
    : null;
}

function passingRuleView(
  scoringMethod:
    string,
  value:
    unknown,
): ExamPassingRuleView {
  const record =
    asRecord(
      value,
    ) as
      | PassingRuleRecord
      | null;

  const requireAllAnswered =
    booleanOrNull(
      record
        ?.requireAllAnswered,
    ) ??
    booleanOrNull(
      record
        ?.require_all_answered,
    ) ??
    false;

  const minimumScorePercent =
    numberOrNull(
      record
        ?.minimumScorePercent,
    ) ??
    numberOrNull(
      record
        ?.minimum_score_percent,
    );

  const maximumPenaltyPoints =
    numberOrNull(
      record
        ?.maximumPenaltyPoints,
    ) ??
    numberOrNull(
      record
        ?.maximum_penalty_points,
    );

  const failOnTwoFivePointErrors =
    booleanOrNull(
      record
        ?.failOnTwoFivePointErrors,
    ) ??
    false;

  const trainingOnly =
    scoringMethod ===
      "training_only" ||
    (
      booleanOrNull(
        record
          ?.trainingOnly,
      ) ??
      false
    );

  const officialTheoryExamRequired =
    booleanOrNull(
      record
        ?.officialTheoryExamRequired,
    );

  return {
    requireAllAnswered,
    minimumScorePercent:
      minimumScorePercent ===
      null
        ? null
        : pct(
            minimumScorePercent,
          ),
    maximumPenaltyPoints:
      maximumPenaltyPoints ===
      null
        ? null
        : Math.max(
            0,
            Math.round(
              maximumPenaltyPoints,
            ),
          ),
    failOnTwoFivePointErrors,
    trainingOnly,
    officialTheoryExamRequired,
  };
}

function configurationView(
  configuration:
    TheoryExamConfigurationRecord,
): ExamConfigurationView {
  const rule =
    passingRuleView(
      configuration
        .scoringMethod,
      configuration
        .passingRule,
    );

  return {
    id:
      configuration.id,
    version:
      configuration.version,
    questionCount:
      Math.max(
        1,
        Math.round(
          configuration
            .questionCount,
        ),
      ),
    durationSeconds:
      Math.max(
        60,
        Math.round(
          configuration
            .durationSeconds,
        ),
      ),
    durationMinutes:
      Math.max(
        1,
        Math.ceil(
          configuration
            .durationSeconds /
            60,
        ),
      ),
    scoringMethod:
      configuration
        .scoringMethod,
    passingRule:
      rule,
    trainingOnly:
      rule.trainingOnly,
  };
}

function configurationFromSnapshot(
  attempt:
    TheoryExamAttemptDetail,
  fallback:
    TheoryExamConfigurationRecord | null,
): TheoryExamConfigurationRecord | null {
  const snapshot =
    asRecord(
      attempt
        .configurationSnapshot,
    ) as
      | ConfigurationSnapshotRecord
      | null;

  if (
    snapshot &&
    typeof snapshot.id ===
      "string" &&
    typeof snapshot.programId ===
      "string" &&
    typeof snapshot.version ===
      "string" &&
    typeof snapshot.questionCount ===
      "number" &&
    typeof snapshot.durationSeconds ===
      "number" &&
    typeof snapshot.scoringMethod ===
      "string"
  ) {
    return {
      id:
        snapshot.id,
      programId:
        snapshot.programId,
      version:
        snapshot.version,
      questionCount:
        snapshot.questionCount,
      durationSeconds:
        snapshot.durationSeconds,
      scoringMethod:
        snapshot.scoringMethod,
      passingRule:
        snapshot.passingRule ??
        {},
    };
  }

  return fallback;
}

function normalizeQuestionType(
  value:
    string,
): ExamQuestionType {
  switch (
    value
      .trim()
      .toLowerCase()
  ) {
    case "multiple_choice":
    case "multiple-choice":
      return "MULTIPLE_CHOICE";

    case "image_choice":
    case "image-choice":
      return "IMAGE_CHOICE";

    case "video":
      return "VIDEO";

    case "numeric":
    case "number":
      return "NUMERIC";

    case "single_choice":
    case "single-choice":
    default:
      return "SINGLE_CHOICE";
  }
}

function primitiveToken(
  value:
    unknown,
): string | null {
  switch (
    typeof value
  ) {
    case "string":
      return value.trim();

    case "number":
    case "boolean":
      return String(
        value,
      );

    default:
      return null;
  }
}

function collectTokens(
  value:
    unknown,
): string[] {
  const direct =
    primitiveToken(
      value,
    );

  if (
    direct !==
    null
  ) {
    return direct
      ? [
          direct,
        ]
      : [];
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return value
      .flatMap(
        collectTokens,
      )
      .filter(
        Boolean,
      );
  }

  const record =
    asRecord(
      value,
    );

  if (!record) {
    return [];
  }

  for (
    const key of [
      "answerIds",
      "selectedAnswers",
      "answers",
      "answer",
      "value",
      "id",
      "key",
    ]
  ) {
    if (
      key in record
    ) {
      return collectTokens(
        record[
          key
        ],
      );
    }
  }

  return Object
    .values(
      record,
    )
    .flatMap(
      collectTokens,
    )
    .filter(
      Boolean,
    );
}

function canonicalTokens(
  value:
    unknown,
): string[] {
  return Array.from(
    new Set(
      collectTokens(
        value,
      )
        .map(
          (
            token,
          ) =>
            token.trim(),
        )
        .filter(
          (
            token,
          ) =>
            token.length >
            0,
        ),
    ),
  );
}

function optionCandidateArray(
  answerOptions:
    unknown,
): unknown[] {
  if (
    Array.isArray(
      answerOptions,
    )
  ) {
    return answerOptions;
  }

  const record =
    asRecord(
      answerOptions,
    );

  if (!record) {
    return [];
  }

  for (
    const key of [
      "options",
      "answers",
      "choices",
      "items",
    ]
  ) {
    const value =
      record[
        key
      ];

    if (
      Array.isArray(
        value,
      )
    ) {
      return value;
    }
  }

  return [];
}

function optionString(
  record:
    Record<
      string,
      unknown
    >,
  keys:
    readonly string[],
): string | null {
  for (
    const key of keys
  ) {
    const value =
      primitiveToken(
        record[
          key
        ],
      );

    if (
      value
    ) {
      return value;
    }
  }

  return null;
}

function normalizeOptions(
  answerOptions:
    unknown,
): ExamQuestionOptionView[] {
  return optionCandidateArray(
    answerOptions,
  )
    .map(
      (
        item,
        index,
      ) => {
        const primitive =
          primitiveToken(
            item,
          );

        if (
          primitive !==
          null
        ) {
          return {
            id:
              primitive ||
              String(
                index +
                  1,
              ),
            label:
              primitive ||
              `Antwort ${index + 1}`,
            imageUrl:
              null,
          };
        }

        const record =
          asRecord(
            item,
          );

        if (!record) {
          return null;
        }

        const id =
          optionString(
            record,
            [
              "id",
              "key",
              "code",
              "value",
            ],
          ) ??
          String(
            index +
              1,
          );

        const label =
          optionString(
            record,
            [
              "label",
              "text",
              "title",
              "name",
              "value",
            ],
          ) ??
          `Antwort ${index + 1}`;

        const imageUrl =
          optionString(
            record,
            [
              "imageUrl",
              "image_url",
              "image",
              "src",
            ],
          );

        return {
          id,
          label,
          imageUrl:
            imageUrl &&
            (
              imageUrl.startsWith(
                "https://",
              ) ||
              imageUrl.startsWith(
                "http://",
              ) ||
              imageUrl.startsWith(
                "/",
              )
            )
              ? imageUrl
              : null,
        };
      },
    )
    .filter(
      (
        option,
      ): option is
        ExamQuestionOptionView =>
        Boolean(
          option,
        ),
    );
}

function publicMediaUrl(
  storagePath:
    string | null,
): string | null {
  const value =
    storagePath
      ?.trim();

  if (!value) {
    return null;
  }

  if (
    value.startsWith(
      "https://",
    ) ||
    value.startsWith(
      "http://",
    ) ||
    value.startsWith(
      "/",
    )
  ) {
    return value;
  }

  return null;
}

function historyItem(
  attempt: {
    id: string;
    totalQuestions: number;
    answeredQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    penaltyPoints: number;
    scorePercent: number | null;
    passed: boolean | null;
    startedAt: Date;
    completedAt: Date | null;
  },
): ExamHistoryItemView {
  return {
    id:
      attempt.id,
    totalQuestions:
      attempt.totalQuestions,
    answeredQuestions:
      attempt.answeredQuestions,
    correctAnswers:
      attempt.correctAnswers,
    incorrectAnswers:
      attempt.incorrectAnswers,
    penaltyPoints:
      attempt.penaltyPoints,
    scorePercent:
      attempt.scorePercent,
    passed:
      attempt.passed,
    startedAt:
      attempt.startedAt
        .toISOString(),
    completedAt:
      attempt.completedAt
        ?.toISOString() ??
      null,
  };
}

async function requiredContext(
  userId:
    string,
  locale:
    ClientShellLocale,
): Promise<TheoryContext> {
  const context =
    await getTheoryContextForUser(
      userId,
      locale,
    );

  if (
    !context
      .userLicenseClassId ||
    !context
      .licenseClassCode
  ) {
    throw new TheoryExamServiceError(
      "NO_ACTIVE_LICENSE_CLASS",
      "Für die Prüfung ist noch keine aktive Führerscheinklasse verfügbar.",
      409,
    );
  }

  if (
    !context.programId
  ) {
    throw new TheoryExamServiceError(
      "NO_PUBLISHED_PROGRAM",
      "Für deine Führerscheinklasse ist aktuell kein veröffentlichtes Theorieprogramm verfügbar.",
      409,
    );
  }

  return context;
}

function remainingSeconds(
  attempt:
    TheoryExamAttemptDetail,
  configuration:
    ExamConfigurationView,
): number {
  const endsAt =
    attempt.startedAt
      .getTime() +
    configuration
      .durationSeconds *
      1000;

  return Math.max(
    0,
    Math.ceil(
      (
        endsAt -
        Date.now()
      ) /
        1000,
    ),
  );
}

function selectedLabels(
  payload:
    unknown,
  options:
    readonly ExamQuestionOptionView[],
): string[] {
  const tokens =
    canonicalTokens(
      payload,
    );

  const labels =
    tokens.map(
      (
        token,
      ) =>
        options.find(
          (
            option,
          ) =>
            option.id ===
            token,
        )
          ?.label ??
        token,
    );

  return labels;
}

function resultQuestion(
  input: {
    position:
      number;
    publicQuestion:
      TheoryPublicQuestion;
    protectedQuestion:
      TheoryQuestionForAnswer;
    answerPayload:
      unknown;
    isCorrect:
      boolean | null;
  },
): ExamResultQuestionView {
  const options =
    normalizeOptions(
      input
        .publicQuestion
        .answerOptions,
    );

  return {
    id:
      input.publicQuestion
        .id,
    position:
      input.position,
    prompt:
      input.publicQuestion
        .prompt,
    penaltyPoints:
      input.publicQuestion
        .penaltyPoints,
    isCorrect:
      input.isCorrect,
    selectedAnswerLabels:
      selectedLabels(
        input.answerPayload,
        options,
      ),
    correctAnswerLabels:
      selectedLabels(
        input
          .protectedQuestion
          .correctAnswer,
        options,
      ),
    explanation:
      input
        .protectedQuestion
        .explanation,
  };
}

async function buildResult(
  context:
    TheoryContext,
  attempt:
    TheoryExamAttemptDetail,
  configuration:
    ExamConfigurationView,
): Promise<ExamResultView> {
  const review =
    await Promise.all(
      attempt.answers.map(
        async (
          answer,
          index,
        ) => {
          const [
            publicQuestion,
            protectedQuestion,
          ] =
            await Promise.all([
              findPublicTheoryQuestion(
                context,
                answer.questionId,
              ),
              findTheoryQuestionForAnswer(
                context,
                answer.questionId,
              ),
            ]);

          if (
            !publicQuestion ||
            !protectedQuestion
          ) {
            return null;
          }

          return resultQuestion({
            position:
              index +
              1,
            publicQuestion,
            protectedQuestion,
            answerPayload:
              answer.answerPayload,
            isCorrect:
              answer.isCorrect,
          });
        },
      ),
    );

  return {
    attemptId:
      attempt.id,
    trainingOnly:
      configuration
        .trainingOnly,
    totalQuestions:
      attempt
        .totalQuestions,
    answeredQuestions:
      attempt
        .answeredQuestions,
    unansweredQuestions:
      Math.max(
        0,
        attempt
          .totalQuestions -
          attempt
            .answeredQuestions,
      ),
    correctAnswers:
      attempt
        .correctAnswers,
    incorrectAnswers:
      attempt
        .incorrectAnswers,
    penaltyPoints:
      attempt
        .penaltyPoints,
    scorePercent:
      pct(
        attempt
          .scorePercent ??
        (
          attempt
            .totalQuestions >
          0
            ? (
                attempt
                  .correctAnswers /
                attempt
                  .totalQuestions
              ) *
                100
            : 0
        ),
      ),
    passed:
      attempt.passed,
    startedAt:
      attempt.startedAt
        .toISOString(),
    completedAt:
      attempt.completedAt
        ?.toISOString() ??
      null,
    review:
      review.filter(
        (
          item,
        ): item is
          ExamResultQuestionView =>
          Boolean(
            item,
          ),
      ),
  };
}

export async function getExamsPageData(
  input: {
    userId:
      string;
    locale:
      ClientShellLocale;
  },
): Promise<ExamsPageData> {
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
      configuration:
        null,
      overview: {
        completedAttempts:
          0,
        passedAttempts:
          0,
        failedAttempts:
          0,
        passRatePercent:
          null,
        averageScorePercent:
          null,
        readinessScore:
          0,
      },
      history:
        [],
      activeAttemptId:
        null,
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
      configuration:
        null,
      overview: {
        completedAttempts:
          0,
        passedAttempts:
          0,
        failedAttempts:
          0,
        passRatePercent:
          null,
        averageScorePercent:
          null,
        readinessScore:
          0,
      },
      history:
        [],
      activeAttemptId:
        null,
    };
  }

  const [
    configuration,
    history,
    overviewSnapshot,
  ] =
    await Promise.all([
      getCurrentExamConfiguration(
        context,
      ),
      listExamHistory(
        context,
        20,
      ),
      getTheoryOverviewRepositorySnapshot(
        input.userId,
        input.locale,
      ),
    ]);

  const completedAttempts =
    history.length;

  const passedAttempts =
    history.filter(
      (
        attempt,
      ) =>
        attempt.passed ===
        true,
    ).length;

  const failedAttempts =
    history.filter(
      (
        attempt,
      ) =>
        attempt.passed ===
        false,
    ).length;

  const scored =
    history.filter(
      (
        attempt,
      ) =>
        attempt.scorePercent !==
        null,
    );

  const averageScorePercent =
    scored.length >
    0
      ? pct(
          scored.reduce(
            (
              sum,
              attempt,
            ) =>
              sum +
              (
                attempt
                  .scorePercent ??
                0
              ),
            0,
          ) /
            scored.length,
        )
      : null;

  const activeAttempt =
    overviewSnapshot
      .recentExams
      .find(
        (
          attempt,
        ) =>
          attempt.status ===
          "in_progress",
      ) ??
    null;

  const mappedConfiguration =
    configuration
      ? configurationView(
          configuration,
        )
      : null;

  return {
    status:
      mappedConfiguration
        ? "ready"
        : "no_exam_configuration",
    licenseClassCode:
      context
        .licenseClassCode,
    configuration:
      mappedConfiguration,
    overview: {
      completedAttempts,
      passedAttempts,
      failedAttempts,
      passRatePercent:
        completedAttempts >
        0
          ? pct(
              (
                passedAttempts /
                completedAttempts
              ) *
                100,
            )
          : null,
      averageScorePercent,
      readinessScore:
        pct(
          overviewSnapshot
            .learningProgress
            ?.readinessScore ??
            0,
        ),
    },
    history:
      history.map(
        historyItem,
      ),
    activeAttemptId:
      activeAttempt?.id ??
      null,
  };
}

export async function startTheoryExam(
  input: {
    userId:
      string;
    locale:
      ClientShellLocale;
  },
): Promise<{
  attemptId:
    string;
}> {
  const context =
    await requiredContext(
      input.userId,
      input.locale,
    );

  const snapshot =
    await getTheoryOverviewRepositorySnapshot(
      input.userId,
      input.locale,
    );

  const existing =
    snapshot
      .recentExams
      .find(
        (
          attempt,
        ) =>
          attempt.status ===
          "in_progress",
      );

  if (existing) {
    return {
      attemptId:
        existing.id,
    };
  }

  const configuration =
    await getCurrentExamConfiguration(
      context,
    );

  if (!configuration) {
    throw new TheoryExamServiceError(
      "NO_EXAM_CONFIGURATION",
      "Für deine Führerscheinklasse ist aktuell keine veröffentlichte Prüfungskonfiguration verfügbar.",
      409,
    );
  }

  const questionIds =
    await sampleTheoryQuestionIds(
      context,
      {
        questionCount:
          configuration
            .questionCount,
      },
    );

  if (
    questionIds.length ===
    0
  ) {
    throw new TheoryExamServiceError(
      "NO_EXAM_QUESTIONS",
      "Für diese Prüfung sind aktuell keine veröffentlichten Fragen verfügbar.",
      409,
    );
  }

  const attempt =
    await createExamAttemptWithQuestions(
      context,
      configuration,
      questionIds,
    );

  return {
    attemptId:
      attempt.id,
  };
}

export async function getTheoryExamAttemptPageData(
  input: {
    userId:
      string;
    locale:
      ClientShellLocale;
    attemptId:
      string;
  },
): Promise<ExamAttemptPageData | null> {
  const context =
    await requiredContext(
      input.userId,
      input.locale,
    );

  const attempt =
    await getExamAttemptForUser(
      context,
      input.attemptId,
    );

  if (!attempt) {
    return null;
  }

  const currentConfiguration =
    await getCurrentExamConfiguration(
      context,
    );

  const configuration =
    configurationFromSnapshot(
      attempt,
      currentConfiguration,
    );

  if (!configuration) {
    throw new TheoryExamServiceError(
      "NO_EXAM_CONFIGURATION",
      "Die Prüfungskonfiguration dieser Simulation ist nicht mehr verfügbar.",
      409,
    );
  }

  const viewConfiguration =
    configurationView(
      configuration,
    );

  if (
    attempt.status ===
    "completed"
  ) {
    return {
      licenseClassCode:
        context
          .licenseClassCode!,
      configuration:
        viewConfiguration,
      attempt: {
        id:
          attempt.id,
        status:
          attempt.status,
        totalQuestions:
          attempt
            .totalQuestions,
        answeredQuestions:
          attempt
            .answeredQuestions,
        correctAnswers:
          attempt
            .correctAnswers,
        incorrectAnswers:
          attempt
            .incorrectAnswers,
        penaltyPoints:
          attempt
            .penaltyPoints,
        startedAt:
          attempt.startedAt
            .toISOString(),
        completedAt:
          attempt.completedAt
            ?.toISOString() ??
          null,
      },
      remainingSeconds:
        0,
      questions:
        [],
      result:
        await buildResult(
          context,
          attempt,
          viewConfiguration,
        ),
    };
  }

  const publicQuestions =
    await Promise.all(
      attempt.answers.map(
        (
          answer,
        ) =>
          findPublicTheoryQuestion(
            context,
            answer.questionId,
          ),
      ),
    );

  const questions:
    ExamQuestionView[] =
    [];

  for (
    let index =
      0;
    index <
    attempt.answers.length;
    index +=
      1
  ) {
    const answer =
      attempt.answers[
        index
      ];

    const question =
      publicQuestions[
        index
      ];

    if (!question) {
      continue;
    }

    questions.push({
      id:
        question.id,
      position:
        index +
        1,
      totalQuestions:
        attempt
          .totalQuestions,
      questionType:
        normalizeQuestionType(
          question
            .questionType,
        ),
      penaltyPoints:
        question
          .penaltyPoints,
      prompt:
        question.prompt,
      mediaUrl:
        publicMediaUrl(
          question
            .mediaStoragePath,
        ),
      options:
        normalizeOptions(
          question
            .answerOptions,
        ),
      answerPayload:
        answer.answerPayload,
      answered:
        answer.isCorrect !==
        null,
    });
  }

  return {
    licenseClassCode:
      context
        .licenseClassCode!,
    configuration:
      viewConfiguration,
    attempt: {
      id:
        attempt.id,
      status:
        attempt.status,
      totalQuestions:
        attempt
          .totalQuestions,
      answeredQuestions:
        attempt
          .answeredQuestions,
      correctAnswers:
        attempt
          .correctAnswers,
      incorrectAnswers:
        attempt
          .incorrectAnswers,
      penaltyPoints:
        attempt
          .penaltyPoints,
      startedAt:
        attempt.startedAt
          .toISOString(),
      completedAt:
        attempt.completedAt
          ?.toISOString() ??
        null,
    },
    remainingSeconds:
      remainingSeconds(
        attempt,
        viewConfiguration,
      ),
    questions,
    result:
      null,
  };
}

async function finalizeAttempt(
  context:
    TheoryContext,
  attempt:
    TheoryExamAttemptDetail,
  configuration:
    ExamConfigurationView,
  force:
    boolean,
): Promise<void> {
  const rule =
    configuration
      .passingRule;

  if (
    !force &&
    rule.requireAllAnswered &&
    attempt.answeredQuestions <
      attempt.totalQuestions
  ) {
    throw new TheoryExamServiceError(
      "EXAM_INCOMPLETE",
      "Bitte beantworte alle Fragen, bevor du die Prüfung abgibst.",
      409,
    );
  }

  const scorePercent =
    attempt.totalQuestions >
    0
      ? pct(
          (
            attempt
              .correctAnswers /
            attempt
              .totalQuestions
          ) *
            100,
        )
      : 0;

  const allAnswered =
    attempt
      .answeredQuestions >=
    attempt
      .totalQuestions;

  const scorePass =
    rule.minimumScorePercent ===
    null
      ? true
      : scorePercent >=
        rule
          .minimumScorePercent;

  const penaltyPass =
    rule.maximumPenaltyPoints ===
    null
      ? true
      : attempt
          .penaltyPoints <=
        rule
          .maximumPenaltyPoints;

  const fivePointErrors =
    attempt.answers.filter(
      (
        answer,
      ) =>
        answer.isCorrect ===
          false &&
        answer.penaltyPoints >=
          5,
    ).length;

  const fivePointPass =
    !rule
      .failOnTwoFivePointErrors ||
    fivePointErrors <
      2;

  const completenessPass =
    !rule.requireAllAnswered ||
    allAnswered;

  const passed =
    scorePass &&
    penaltyPass &&
    fivePointPass &&
    completenessPass;

  await finishExamAttempt(
    context,
    attempt.id,
    scorePercent,
    passed,
  );
}

export async function submitTheoryExamAnswer(
  input: {
    userId:
      string;
    locale:
      ClientShellLocale;
    attemptId:
      string;
    questionId:
      string;
    answerPayload:
      unknown;
  },
): Promise<{
  attemptId:
    string;
  questionId:
    string;
  answeredQuestions:
    number;
  totalQuestions:
    number;
}> {
  const context =
    await requiredContext(
      input.userId,
      input.locale,
    );

  const attempt =
    await getExamAttemptForUser(
      context,
      input.attemptId,
    );

  if (!attempt) {
    throw new TheoryExamServiceError(
      "EXAM_NOT_FOUND",
      "Die Prüfung wurde nicht gefunden.",
      404,
    );
  }

  if (
    attempt.status !==
    "in_progress"
  ) {
    throw new TheoryExamServiceError(
      "EXAM_ALREADY_COMPLETED",
      "Diese Prüfung ist bereits abgeschlossen.",
      409,
    );
  }

  const currentConfiguration =
    await getCurrentExamConfiguration(
      context,
    );

  const configurationRecord =
    configurationFromSnapshot(
      attempt,
      currentConfiguration,
    );

  if (!configurationRecord) {
    throw new TheoryExamServiceError(
      "NO_EXAM_CONFIGURATION",
      "Die Prüfungskonfiguration ist nicht verfügbar.",
      409,
    );
  }

  const configuration =
    configurationView(
      configurationRecord,
    );

  if (
    remainingSeconds(
      attempt,
      configuration,
    ) <=
    0
  ) {
    await finalizeAttempt(
      context,
      attempt,
      configuration,
      true,
    );

    throw new TheoryExamServiceError(
      "EXAM_TIME_EXPIRED",
      "Die Prüfungszeit ist abgelaufen. Die Simulation wurde beendet.",
      409,
    );
  }

  const assigned =
    attempt.answers.find(
      (
        answer,
      ) =>
        answer.questionId ===
        input.questionId,
    );

  if (!assigned) {
    throw new TheoryExamServiceError(
      "QUESTION_NOT_ASSIGNED",
      "Diese Frage gehört nicht zu deiner aktuellen Prüfung.",
      404,
    );
  }

  if (
    assigned.isCorrect !==
    null
  ) {
    throw new TheoryExamServiceError(
      "QUESTION_ALREADY_ANSWERED",
      "Diese Prüfungsfrage wurde bereits gespeichert.",
      409,
    );
  }

  const selected =
    canonicalTokens(
      input.answerPayload,
    );

  if (
    selected.length ===
    0
  ) {
    throw new TheoryExamServiceError(
      "INVALID_ANSWER",
      "Bitte wähle eine Antwort aus.",
      400,
    );
  }

  const question =
    await findTheoryQuestionForAnswer(
      context,
      input.questionId,
    );

  if (!question) {
    throw new TheoryExamServiceError(
      "QUESTION_NOT_ASSIGNED",
      "Die Theoriefrage wurde nicht gefunden.",
      404,
    );
  }

  const correct =
    evaluateTheoryAnswer(
      input.answerPayload,
      question
        .correctAnswer,
    );

  const saved =
    await saveExamAnswerOutcome(
      context,
      {
        attemptId:
          attempt.id,
        questionId:
          question.id,
        answerPayload:
          input.answerPayload,
        correct,
        penaltyPoints:
          question
            .penaltyPoints,
      },
    );

  if (!saved) {
    throw new TheoryExamServiceError(
      "QUESTION_ALREADY_ANSWERED",
      "Die Antwort konnte nicht erneut gespeichert werden.",
      409,
    );
  }

  return {
    attemptId:
      attempt.id,
    questionId:
      question.id,
    answeredQuestions:
      Math.min(
        attempt
          .totalQuestions,
        attempt
          .answeredQuestions +
          1,
      ),
    totalQuestions:
      attempt
        .totalQuestions,
  };
}

export async function completeTheoryExam(
  input: {
    userId:
      string;
    locale:
      ClientShellLocale;
    attemptId:
      string;
    reason?:
      "manual" |
      "timeout";
  },
): Promise<{
  attemptId:
    string;
}> {
  const context =
    await requiredContext(
      input.userId,
      input.locale,
    );

  const attempt =
    await getExamAttemptForUser(
      context,
      input.attemptId,
    );

  if (!attempt) {
    throw new TheoryExamServiceError(
      "EXAM_NOT_FOUND",
      "Die Prüfung wurde nicht gefunden.",
      404,
    );
  }

  if (
    attempt.status ===
    "completed"
  ) {
    return {
      attemptId:
        attempt.id,
    };
  }

  const currentConfiguration =
    await getCurrentExamConfiguration(
      context,
    );

  const configurationRecord =
    configurationFromSnapshot(
      attempt,
      currentConfiguration,
    );

  if (!configurationRecord) {
    throw new TheoryExamServiceError(
      "NO_EXAM_CONFIGURATION",
      "Die Prüfungskonfiguration ist nicht verfügbar.",
      409,
    );
  }

  const configuration =
    configurationView(
      configurationRecord,
    );

  const timedOut =
    remainingSeconds(
      attempt,
      configuration,
    ) <=
    0;

  await finalizeAttempt(
    context,
    attempt,
    configuration,
    timedOut ||
      input.reason ===
        "timeout",
  );

  return {
    attemptId:
      attempt.id,
  };
}
