/**
 * Express-Führerschein
 * Shared contracts for Theorie content/import files.
 *
 * IMPORTANT
 * - This file contains TYPES ONLY.
 * - No Prisma access.
 * - No API calls.
 * - No React types.
 * - No database writes.
 *
 * It describes the JSON structure used by:
 *
 * data/theory/de/klasse-<code>/
 * ├── program.json
 * ├── topics.json
 * ├── lessons/*.json
 * ├── questions/*.json
 * └── exam-config.json
 *
 * Database persistence remains handled by the existing Theorie import scripts
 * and Prisma models.
 */

/* ==========================================================================
   JSON
   ========================================================================== */

export type TheoryJsonPrimitive =
  | string
  | number
  | boolean
  | null;

export type TheoryJsonValue =
  | TheoryJsonPrimitive
  | TheoryJsonObject
  | readonly TheoryJsonValue[];

export interface TheoryJsonObject {
  readonly [key: string]: TheoryJsonValue;
}

/* ==========================================================================
   GERMANY
   ========================================================================== */

/**
 * Führerscheinklassen currently supported by the Germany Theorie content
 * architecture.
 *
 * B96 / B196 are intentionally not represented as independent license classes.
 */
export type GermanTheoryLicenseClassCode =
  | "AM"
  | "A1"
  | "A2"
  | "A"
  | "B"
  | "BE"
  | "C1"
  | "C1E"
  | "C"
  | "CE"
  | "D1"
  | "D1E"
  | "D"
  | "DE"
  | "L"
  | "T";

export type TheoryCountryCode = "DE";

/* ==========================================================================
   CONTENT LIFECYCLE
   ========================================================================== */

export type TheoryContentStatus =
  | "draft"
  | "review"
  | "published"
  | "archived";

/**
 * Date values inside JSON files.
 *
 * Examples:
 * - "2026-08-15"
 * - "2026-08-15T00:00:00.000Z"
 */
export type TheoryIsoDateString = string;

/* ==========================================================================
   TRANSLATIONS
   ========================================================================== */

/**
 * BCP-47-like locale stored by the Theorie translation tables.
 *
 * Examples:
 * - "de"
 * - "fr"
 * - "en"
 * - "es"
 */
export type TheoryContentLocale = string;

export interface TheoryTopicTranslationInput {
  readonly locale: TheoryContentLocale;
  readonly title: string;
  readonly description?: string | null;
}

export interface TheoryLessonTranslationInput {
  readonly locale: TheoryContentLocale;
  readonly title: string;
  readonly description?: string | null;
}

export interface TheoryLessonBlockTranslationInput {
  readonly locale: TheoryContentLocale;
  readonly title?: string | null;
  readonly bodyText?: string | null;
  readonly content?: TheoryJsonValue;
}

export interface TheoryQuestionTranslationInput {
  readonly locale: TheoryContentLocale;
  readonly prompt: string;
  readonly explanation?: string | null;

  /**
   * Serializable answer options.
   *
   * The exact shape depends on questionType.
   */
  readonly answerOptions: TheoryJsonValue;

  /**
   * Protected answer definition used by server-side correction/import only.
   * It must never be treated as public frontend data during an exam.
   */
  readonly correctAnswer: TheoryJsonValue;
}

/* ==========================================================================
   PROGRAM
   ========================================================================== */

/**
 * Shape of:
 * data/theory/de/klasse-<code>/program.json
 */
export interface TheoryProgramContentInput {
  readonly countryCode: TheoryCountryCode;
  readonly licenseClassCode: GermanTheoryLicenseClassCode;

  /**
   * Stable unique program code.
   *
   * Example:
   * "DE-B-2026-01"
   */
  readonly code: string;

  /**
   * Human/content version.
   *
   * Example:
   * "2026-1"
   */
  readonly version: string;

  readonly status?: TheoryContentStatus;
  readonly validFrom?: TheoryIsoDateString | null;
  readonly validUntil?: TheoryIsoDateString | null;
}

/* ==========================================================================
   TOPICS
   ========================================================================== */

export interface TheoryTopicContentInput {
  readonly slug: string;
  readonly sortOrder: number;
  readonly isActive?: boolean;
  readonly translations: readonly TheoryTopicTranslationInput[];
}

/**
 * Shape of:
 * data/theory/de/klasse-<code>/topics.json
 */
export type TheoryTopicsContentFile =
  readonly TheoryTopicContentInput[];

/* ==========================================================================
   LESSON CONTENT BLOCKS
   ========================================================================== */

export type TheoryLessonBlockType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "INFO"
  | "WARNING"
  | "TIP"
  | "EXAMPLE"
  | "QUESTION";

export interface TheoryLessonBlockContentInput {
  readonly type: TheoryLessonBlockType;
  readonly sortOrder: number;
  readonly isActive?: boolean;

  /**
   * Storage path only.
   * Public/signed URL generation belongs to the existing media backend.
   */
  readonly mediaStoragePath?: string | null;

  /**
   * Used only for QUESTION blocks.
   *
   * The import layer resolves this stable external reference to
   * theory_questions.id and persists it in the lesson block relation.
   */
  readonly questionExternalRef?: string | null;

  /**
   * Serializable block configuration.
   *
   * Examples:
   * - image alt metadata
   * - video presentation flags
   * - UI/content behavior
   */
  readonly config?: TheoryJsonValue;

  readonly translations?:
    readonly TheoryLessonBlockTranslationInput[];
}

/* ==========================================================================
   LESSONS
   ========================================================================== */

export interface TheoryLessonContentInput {
  readonly slug: string;
  readonly sortOrder: number;
  readonly status?: TheoryContentStatus;

  readonly estimatedDurationMinutes?: number | null;

  readonly validFrom?: TheoryIsoDateString | null;
  readonly validUntil?: TheoryIsoDateString | null;

  readonly translations:
    readonly TheoryLessonTranslationInput[];

  readonly blocks:
    readonly TheoryLessonBlockContentInput[];
}

/**
 * Shape of each JSON file inside:
 * data/theory/de/klasse-<code>/lessons/
 */
export interface TheoryLessonsContentFile {
  readonly topicSlug: string;
  readonly lessons: readonly TheoryLessonContentInput[];
}

/* ==========================================================================
   QUESTIONS
   ========================================================================== */

export type TheoryQuestionType =
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "IMAGE_CHOICE"
  | "VIDEO"
  | "NUMERIC";

export type TheoryQuestionDifficulty =
  | "easy"
  | "standard"
  | "hard";

export interface TheoryQuestionContentInput {
  /**
   * Stable reference inside the imported content.
   *
   * It is used for idempotent imports and QUESTION lesson-block links.
   */
  readonly externalRef: string;

  readonly questionType: TheoryQuestionType;
  readonly penaltyPoints: number;
  readonly mediaStoragePath?: string | null;
  readonly status?: TheoryContentStatus;
  readonly version?: number;
  readonly difficulty?: TheoryQuestionDifficulty;
  readonly validFrom?: TheoryIsoDateString | null;
  readonly validUntil?: TheoryIsoDateString | null;

  readonly translations:
    readonly TheoryQuestionTranslationInput[];
}

/**
 * Shape of each JSON file inside:
 * data/theory/de/klasse-<code>/questions/
 */
export interface TheoryQuestionsContentFile {
  readonly topicSlug: string;
  readonly questions: readonly TheoryQuestionContentInput[];
}

/* ==========================================================================
   EXAM CONFIGURATION
   ========================================================================== */

export type TheoryExamScoringMethod =
  | "score"
  | "penalty_points"
  | "score_and_penalty_points"
  | "training_only"
  | (string & {});

/**
 * Common rule fields understood by the server-side exam architecture.
 *
 * The intersection with TheoryJsonObject keeps the object JSON-safe while
 * allowing the known optional rule properties below.
 */
export type TheoryExamPassingRuleInput =
  TheoryJsonObject & {
    readonly requireAllAnswered?: boolean;
    readonly minimumScorePercent?: number;
    readonly maximumPenaltyPoints?: number;

    /**
     * Snake-case aliases are accepted by the existing server architecture too.
     */
    readonly require_all_answered?: boolean;
    readonly minimum_score_percent?: number;
    readonly maximum_penalty_points?: number;

    /**
     * Additional rules already used by the Germany data pack.
     */
    readonly failOnTwoFivePointErrors?: boolean;
    readonly questionPointTotal?: number;
    readonly officialVariant?: string;
    readonly officialTheoryExamRequired?: boolean;
    readonly trainingOnly?: boolean;
    readonly durationIsPlatformTrainingWindow?: boolean;

    readonly extensionVariant?: TheoryJsonObject;
  };

/**
 * Shape of:
 * data/theory/de/klasse-<code>/exam-config.json
 */
export interface TheoryExamConfigurationContentInput {
  readonly version: string;
  readonly questionCount: number;
  readonly durationSeconds: number;
  readonly scoringMethod: TheoryExamScoringMethod;

  /**
   * Official/configured rules belong to backend configuration.
   * Do not hard-code them in React components.
   */
  readonly passingRule: TheoryExamPassingRuleInput;

  readonly status?: TheoryContentStatus;
  readonly activeFrom?: TheoryIsoDateString | null;
  readonly activeUntil?: TheoryIsoDateString | null;
}

/* ==========================================================================
   COMPLETE CLASS CONTENT
   ========================================================================== */

/**
 * Normalized in-memory representation of one German license class.
 *
 * This is useful for validation/import tooling.
 */
export interface TheoryClassContentBundle {
  readonly directory: string;

  readonly program: TheoryProgramContentInput;

  readonly topics:
    readonly TheoryTopicContentInput[];

  readonly lessonsFiles:
    readonly TheoryLessonsContentFile[];

  readonly questionsFiles:
    readonly TheoryQuestionsContentFile[];

  readonly examConfig:
    TheoryExamConfigurationContentInput | null;
}

/* ==========================================================================
   VALIDATION
   ========================================================================== */

export type TheoryContentValidationSeverity =
  | "error"
  | "warning";

export interface TheoryContentValidationIssue {
  readonly severity: TheoryContentValidationSeverity;

  /**
   * Machine-readable validation identifier.
   *
   * Example:
   * "DUPLICATE_TOPIC_SLUG"
   */
  readonly code: string;

  /**
   * Human-readable explanation.
   */
  readonly message: string;

  /**
   * Relative content location when available.
   *
   * Example:
   * "lessons/topic-01.json"
   */
  readonly file?: string;

  /**
   * Logical JSON path when available.
   *
   * Example:
   * "lessons[0].blocks[2].questionExternalRef"
   */
  readonly path?: string;
}

export interface TheoryContentValidationReport {
  readonly valid: boolean;
  readonly errors: readonly TheoryContentValidationIssue[];
  readonly warnings: readonly TheoryContentValidationIssue[];
}

/* ==========================================================================
   IMPORT / PUBLISH TOOLING
   ========================================================================== */

export interface TheoryContentCliSelection {
  /**
   * Import all available German class directories.
   */
  readonly all: boolean;

  /**
   * Used when all=false.
   */
  readonly classCode: GermanTheoryLicenseClassCode | null;
}

export interface TheoryContentImportSummary {
  readonly countryCode: TheoryCountryCode;
  readonly licenseClassCode: GermanTheoryLicenseClassCode;

  readonly programCode: string;
  readonly programVersion: string;

  readonly topics: number;
  readonly lessons: number;
  readonly contentBlocks: number;
  readonly questions: number;

  readonly examConfigurationImported: boolean;
}

export interface TheoryContentPublishSummary
  extends TheoryContentImportSummary {
  readonly publishedAt: string;
  readonly isCurrent: boolean;
}

/* ==========================================================================
   TYPE HELPERS
   ========================================================================== */

export type TheoryProgramFile =
  TheoryProgramContentInput;

export type TheoryTopicsFile =
  TheoryTopicsContentFile;

export type TheoryLessonsFile =
  TheoryLessonsContentFile;

export type TheoryQuestionsFile =
  TheoryQuestionsContentFile;

export type TheoryExamConfigFile =
  TheoryExamConfigurationContentInput;