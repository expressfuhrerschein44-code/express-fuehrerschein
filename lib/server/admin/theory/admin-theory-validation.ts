import "server-only";

import type {
  AdminTheoryExamInput,
  AdminTheoryLessonBlockInput,
  AdminTheoryLessonBlockTranslationInput,
  AdminTheoryLessonInput,
  AdminTheoryProgramInput,
  AdminTheoryQuestionInput,
  AdminTheoryQuestionTranslationInput,
  AdminTheoryTopicInput,
  AdminTheoryTranslationInput,
} from "@/types/admin-theory";

export interface AdminTheoryValidationResult<T> {
  ok: boolean;
  data?: T;
  fields?: Record<string, string>;
}

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const COUNTRY =
  /^[A-Z]{2}$/;

const LICENSE_CLASS =
  /^[A-Z0-9]{1,8}$/i;

const LOCALE =
  /^[a-z]{2}(?:-[A-Z]{2})?$/;

const SLUG =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function objectOf(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(value: unknown): string | null {
  const valueText = text(value);
  return valueText || null;
}

function integer(value: unknown, fallback = 0): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.round(number) : fallback;
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function nullableDate(value: unknown): string | null {
  const raw = text(value);
  if (!raw) return null;
  const parsed = new Date(`${raw}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : raw;
}

function validateDateRange(
  from: string | null,
  until: string | null,
  fields: Record<string, string>,
  fromKey: string,
  untilKey: string,
) {
  if (!from || !until) return;
  if (new Date(`${from}T00:00:00Z`).getTime() >
      new Date(`${until}T00:00:00Z`).getTime()) {
    fields[untilKey] =
      "Das Enddatum muss am oder nach dem Startdatum liegen.";
  }
}

type ParsedTheoryTranslation =
  | AdminTheoryTranslationInput
  | AdminTheoryQuestionTranslationInput
  | AdminTheoryLessonBlockTranslationInput;

function parseTranslations(
  value: unknown,
  kind: "generic",
  fields: Record<string, string>,
): AdminTheoryTranslationInput[];

function parseTranslations(
  value: unknown,
  kind: "question",
  fields: Record<string, string>,
): AdminTheoryQuestionTranslationInput[];

function parseTranslations(
  value: unknown,
  kind: "block",
  fields: Record<string, string>,
): AdminTheoryLessonBlockTranslationInput[];

function parseTranslations(
  value: unknown,
  kind: "generic" | "question" | "block",
  fields: Record<string, string>,
): ParsedTheoryTranslation[] {
  if (!Array.isArray(value) || value.length === 0) {
    fields.translations =
      "Mindestens eine Übersetzung ist erforderlich.";
    return [];
  }

  const seen = new Set<string>();
  const result: ParsedTheoryTranslation[] = [];

  value.forEach((item, index) => {
    const row = objectOf(item);
    const locale = text(row.locale);

    if (!LOCALE.test(locale)) {
      fields[`translations.${index}.locale`] =
        "Ungültige Sprache.";
      return;
    }

    if (seen.has(locale)) {
      fields[`translations.${index}.locale`] =
        "Diese Sprache ist doppelt vorhanden.";
      return;
    }

    seen.add(locale);

    if (kind === "question") {
      const prompt = text(row.prompt);

      if (!prompt) {
        fields[`translations.${index}.prompt`] =
          "Die Frage darf nicht leer sein.";
      }

      result.push({
        locale,
        prompt,
        explanation: nullableText(row.explanation),
        answerOptions:
          row.answerOptions === undefined ? null : row.answerOptions,
        correctAnswer:
          row.correctAnswer === undefined ? null : row.correctAnswer,
      } satisfies AdminTheoryQuestionTranslationInput);
      return;
    }

    if (kind === "block") {
      result.push({
        locale,
        title: nullableText(row.title),
        bodyText: nullableText(row.bodyText),
        contentJson:
          row.contentJson === undefined ? null : row.contentJson,
      } satisfies AdminTheoryLessonBlockTranslationInput);
      return;
    }

    const title = text(row.title);

    if (!title) {
      fields[`translations.${index}.title`] =
        "Der Titel darf nicht leer sein.";
    }

    result.push({
      locale,
      title,
      description: nullableText(row.description),
    } satisfies AdminTheoryTranslationInput);
  });

  return result;
}

function finish<T>(
  data: T,
  fields: Record<string, string>,
): AdminTheoryValidationResult<T> {
  return Object.keys(fields).length
    ? { ok: false, fields }
    : { ok: true, data };
}

export function validateProgramInput(
  value: unknown,
): AdminTheoryValidationResult<AdminTheoryProgramInput> {
  const row = objectOf(value);
  const fields: Record<string, string> = {};

  const countryCode = text(row.countryCode).toUpperCase();
  const licenseClassCode = text(row.licenseClassCode).toUpperCase();
  const code = text(row.code);
  const version = text(row.version);
  const status = nullableText(row.status) ?? undefined;
  const validFrom = nullableDate(row.validFrom);
  const validUntil = nullableDate(row.validUntil);

  if (!COUNTRY.test(countryCode)) fields.countryCode = "Ungültiger Ländercode.";
  if (!LICENSE_CLASS.test(licenseClassCode)) fields.licenseClassCode = "Ungültige Führerscheinklasse.";
  if (!code || code.length > 96) fields.code = "Der Programmcode ist erforderlich (max. 96 Zeichen).";
  if (!version || version.length > 32) fields.version = "Die Version ist erforderlich (max. 32 Zeichen).";
  if (status && status.length > 24) fields.status = "Der Status ist zu lang.";
  validateDateRange(validFrom, validUntil, fields, "validFrom", "validUntil");

  return finish({
    countryCode,
    licenseClassCode,
    code,
    version,
    status,
    isCurrent: bool(row.isCurrent),
    validFrom,
    validUntil,
  }, fields);
}

export function validateTopicInput(
  value: unknown,
): AdminTheoryValidationResult<AdminTheoryTopicInput> {
  const row = objectOf(value);
  const fields: Record<string, string> = {};
  const programId = text(row.programId);
  const slug = text(row.slug).toLowerCase();
  const sortOrder = integer(row.sortOrder);

  if (!UUID.test(programId)) fields.programId = "Ungültiges Theorieprogramm.";
  if (!SLUG.test(slug) || slug.length > 96) fields.slug = "Ungültiger Slug.";
  if (sortOrder < 0) fields.sortOrder = "Die Reihenfolge darf nicht negativ sein.";

  const translations =
    parseTranslations(row.translations, "generic", fields) as AdminTheoryTranslationInput[];

  return finish({
    programId,
    slug,
    sortOrder,
    isActive: bool(row.isActive, true),
    translations,
  }, fields);
}

function parseBlocks(
  value: unknown,
  fields: Record<string, string>,
): AdminTheoryLessonBlockInput[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const row = objectOf(item);
    const id = nullableText(row.id);
    const blockType = text(row.blockType);
    const questionId = nullableText(row.questionId);
    const sortOrder = integer(row.sortOrder, index);

    if (id && !UUID.test(id)) fields[`contentBlocks.${index}.id`] = "Ungültige Block-ID.";
    if (!blockType || blockType.length > 32) fields[`contentBlocks.${index}.blockType`] = "Blocktyp erforderlich.";
    if (questionId && !UUID.test(questionId)) fields[`contentBlocks.${index}.questionId`] = "Ungültige Frage-ID.";

    return {
      id,
      blockType,
      sortOrder,
      mediaStoragePath: nullableText(row.mediaStoragePath),
      questionId,
      configJson: row.configJson === undefined ? null : row.configJson,
      isActive: bool(row.isActive, true),
      translations:
        parseTranslations(row.translations, "block", fields),
    };
  });
}

export function validateLessonInput(
  value: unknown,
): AdminTheoryValidationResult<AdminTheoryLessonInput> {
  const row = objectOf(value);
  const fields: Record<string, string> = {};
  const topicId = text(row.topicId);
  const slug = text(row.slug).toLowerCase();
  const sortOrder = integer(row.sortOrder);
  const duration =
    row.estimatedDurationMinutes === null ||
    row.estimatedDurationMinutes === "" ||
    row.estimatedDurationMinutes === undefined
      ? null
      : integer(row.estimatedDurationMinutes);
  const status = nullableText(row.status) ?? undefined;
  const validFrom = nullableDate(row.validFrom);
  const validUntil = nullableDate(row.validUntil);

  if (!UUID.test(topicId)) fields.topicId = "Ungültiges Thema.";
  if (!SLUG.test(slug) || slug.length > 96) fields.slug = "Ungültiger Slug.";
  if (sortOrder < 0) fields.sortOrder = "Die Reihenfolge darf nicht negativ sein.";
  if (duration !== null && (duration < 1 || duration > 1440)) {
    fields.estimatedDurationMinutes = "Die Dauer muss zwischen 1 und 1440 Minuten liegen.";
  }
  if (status && status.length > 24) fields.status = "Der Status ist zu lang.";
  validateDateRange(validFrom, validUntil, fields, "validFrom", "validUntil");

  return finish({
    topicId,
    slug,
    sortOrder,
    estimatedDurationMinutes: duration,
    status,
    validFrom,
    validUntil,
    translations:
      parseTranslations(row.translations, "generic", fields) as AdminTheoryTranslationInput[],
    contentBlocks: parseBlocks(row.contentBlocks, fields),
  }, fields);
}

export function validateQuestionInput(
  value: unknown,
): AdminTheoryValidationResult<AdminTheoryQuestionInput> {
  const row = objectOf(value);
  const fields: Record<string, string> = {};
  const topicId = text(row.topicId);
  const questionType = text(row.questionType);
  const difficulty = text(row.difficulty);
  const penaltyPoints = integer(row.penaltyPoints);
  const status = nullableText(row.status) ?? undefined;
  const validFrom = nullableDate(row.validFrom);
  const validUntil = nullableDate(row.validUntil);

  if (!UUID.test(topicId)) fields.topicId = "Ungültiges Thema.";
  if (!questionType || questionType.length > 32) fields.questionType = "Fragetyp erforderlich.";
  if (penaltyPoints < 0 || penaltyPoints > 99) fields.penaltyPoints = "Ungültige Fehlerpunkte.";
  if (!difficulty || difficulty.length > 24) fields.difficulty = "Schwierigkeit erforderlich.";
  if (status && status.length > 24) fields.status = "Der Status ist zu lang.";
  validateDateRange(validFrom, validUntil, fields, "validFrom", "validUntil");

  return finish({
    topicId,
    externalRef: nullableText(row.externalRef),
    questionType,
    penaltyPoints,
    difficulty,
    status,
    isActive: bool(row.isActive, false),
    validFrom,
    validUntil,
    translations:
      parseTranslations(row.translations, "question", fields),
  }, fields);
}

export function validateExamInput(
  value: unknown,
): AdminTheoryValidationResult<AdminTheoryExamInput> {
  const row = objectOf(value);
  const fields: Record<string, string> = {};
  const programId = text(row.programId);
  const version = text(row.version);
  const questionCount = integer(row.questionCount);
  const durationSeconds = integer(row.durationSeconds);
  const scoringMethod = text(row.scoringMethod);
  const status = nullableText(row.status) ?? undefined;
  const activeFrom = nullableDate(row.activeFrom);
  const activeUntil = nullableDate(row.activeUntil);

  if (!UUID.test(programId)) fields.programId = "Ungültiges Theorieprogramm.";
  if (!version || version.length > 32) fields.version = "Version erforderlich.";
  if (questionCount < 1 || questionCount > 500) fields.questionCount = "Ungültige Fragenanzahl.";
  if (durationSeconds < 60 || durationSeconds > 86400) fields.durationSeconds = "Ungültige Prüfungsdauer.";
  if (!scoringMethod || scoringMethod.length > 32) fields.scoringMethod = "Bewertungsmethode erforderlich.";
  if (status && status.length > 24) fields.status = "Der Status ist zu lang.";
  if (row.passingRule === undefined || row.passingRule === null) fields.passingRule = "Bestehensregel erforderlich.";
  validateDateRange(activeFrom, activeUntil, fields, "activeFrom", "activeUntil");

  return finish({
    programId,
    version,
    questionCount,
    durationSeconds,
    scoringMethod,
    passingRule: row.passingRule,
    status,
    activeFrom,
    activeUntil,
  }, fields);
}

export function validateUuid(value: string): boolean {
  return UUID.test(value.trim());
}
