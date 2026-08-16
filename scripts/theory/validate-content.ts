import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type ImportStatus = "draft" | "review" | "published" | "archived";
export type LessonBlockType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "INFO"
  | "WARNING"
  | "TIP"
  | "EXAMPLE"
  | "QUESTION";

export interface TranslationInput {
  locale: string;
  title?: string | null;
  description?: string | null;
}

export interface ProgramInput {
  countryCode: "DE";
  licenseClassCode: string;
  code: string;
  version: string;
  status?: ImportStatus;
  validFrom?: string | null;
  validUntil?: string | null;
}

export interface TopicInput {
  slug: string;
  sortOrder: number;
  isActive?: boolean;
  translations: Array<{
    locale: string;
    title: string;
    description?: string | null;
  }>;
}

export interface LessonBlockTranslationInput {
  locale: string;
  title?: string | null;
  bodyText?: string | null;
  content?: unknown;
}

export interface LessonBlockInput {
  type: LessonBlockType;
  sortOrder: number;
  isActive?: boolean;
  mediaStoragePath?: string | null;
  questionExternalRef?: string | null;
  config?: unknown;
  translations?: LessonBlockTranslationInput[];
}

export interface LessonInput {
  slug: string;
  sortOrder: number;
  status?: ImportStatus;
  estimatedDurationMinutes?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  translations: Array<{
    locale: string;
    title: string;
    description?: string | null;
  }>;
  blocks: LessonBlockInput[];
}

export interface LessonsFileInput {
  topicSlug: string;
  lessons: LessonInput[];
}

export interface QuestionInput {
  externalRef: string;
  questionType: string;
  penaltyPoints: number;
  mediaStoragePath?: string | null;
  status?: ImportStatus;
  version?: number;
  difficulty?: string;
  validFrom?: string | null;
  validUntil?: string | null;
  translations: Array<{
    locale: string;
    prompt: string;
    explanation?: string | null;
    answerOptions: unknown;
    correctAnswer: unknown;
  }>;
}

export interface QuestionsFileInput {
  topicSlug: string;
  questions: QuestionInput[];
}

export interface ExamConfigInput {
  version: string;
  questionCount: number;
  durationSeconds: number;
  scoringMethod: string;
  passingRule: unknown;
  status?: ImportStatus;
  activeFrom?: string | null;
  activeUntil?: string | null;
}

export interface TheoryClassContent {
  directory: string;
  program: ProgramInput;
  topics: TopicInput[];
  lessonsFiles: LessonsFileInput[];
  questionsFiles: QuestionsFileInput[];
  examConfig: ExamConfigInput | null;
}

const THIS_FILE = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(THIS_FILE), "../..");
const DATA_ROOT = path.join(PROJECT_ROOT, "data", "theory", "de");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function text(value: unknown, label: string): string {
  assert(typeof value === "string" && value.trim().length > 0, `${label} fehlt oder ist leer.`);
  return value.trim();
}

function integer(value: unknown, label: string, min = 0): number {
  assert(Number.isInteger(value) && Number(value) >= min, `${label} muss eine ganze Zahl >= ${min} sein.`);
  return Number(value);
}

function optionalDate(value: unknown, label: string): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  assert(typeof value === "string", `${label} muss ein ISO-Datum oder null sein.`);
  const date = new Date(value);
  assert(!Number.isNaN(date.getTime()), `${label} ist kein gültiges Datum.`);
  return value;
}

function normalizeStatus(value: unknown, label: string): ImportStatus | undefined {
  if (value === undefined) return undefined;
  assert(
    value === "draft" || value === "review" || value === "published" || value === "archived",
    `${label} ist ungültig.`,
  );
  return value;
}

function normalizeLocale(value: unknown, label: string): string {
  const locale = text(value, label).toLowerCase();
  assert(/^[a-z]{2}(?:-[a-z]{2})?$/.test(locale), `${label} ist ungültig: ${locale}.`);
  return locale;
}

function ensureUnique(values: readonly string[], label: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    assert(!seen.has(value), `${label}: doppelter Wert "${value}".`);
    seen.add(value);
  }
}

function validateProgram(raw: unknown): ProgramInput {
  assert(raw && typeof raw === "object" && !Array.isArray(raw), "program.json muss ein Objekt sein.");
  const row = raw as Record<string, unknown>;

  const countryCode = text(row.countryCode, "program.countryCode").toUpperCase();
  assert(countryCode === "DE", "Aktuell darf nur countryCode=DE importiert werden.");

  const licenseClassCode = text(row.licenseClassCode, "program.licenseClassCode").toUpperCase();
  assert(/^[A-Z0-9]{1,8}$/.test(licenseClassCode), "program.licenseClassCode ist ungültig.");

  return {
    countryCode: "DE",
    licenseClassCode,
    code: text(row.code, "program.code"),
    version: text(row.version, "program.version"),
    status: normalizeStatus(row.status, "program.status"),
    validFrom: optionalDate(row.validFrom, "program.validFrom"),
    validUntil: optionalDate(row.validUntil, "program.validUntil"),
  };
}

function validateTopics(raw: unknown): TopicInput[] {
  assert(Array.isArray(raw), "topics.json muss ein Array sein.");

  const topics = raw.map((entry, index): TopicInput => {
    assert(entry && typeof entry === "object" && !Array.isArray(entry), `topics[${index}] muss ein Objekt sein.`);
    const row = entry as Record<string, unknown>;
    assert(Array.isArray(row.translations) && row.translations.length > 0, `topics[${index}].translations fehlt.`);

    const translations = row.translations.map((entry2, trIndex) => {
      assert(entry2 && typeof entry2 === "object" && !Array.isArray(entry2), `topics[${index}].translations[${trIndex}] ist ungültig.`);
      const tr = entry2 as Record<string, unknown>;
      return {
        locale: normalizeLocale(tr.locale, `topics[${index}].translations[${trIndex}].locale`),
        title: text(tr.title, `topics[${index}].translations[${trIndex}].title`),
        description:
          tr.description === null || tr.description === undefined
            ? null
            : text(tr.description, `topics[${index}].translations[${trIndex}].description`),
      };
    });

    ensureUnique(translations.map((x) => x.locale), `topics[${index}].translations`);

    return {
      slug: text(row.slug, `topics[${index}].slug`).toLowerCase(),
      sortOrder: integer(row.sortOrder, `topics[${index}].sortOrder`),
      isActive: row.isActive === undefined ? true : Boolean(row.isActive),
      translations,
    };
  });

  ensureUnique(topics.map((x) => x.slug), "topics.slug");
  ensureUnique(topics.map((x) => String(x.sortOrder)), "topics.sortOrder");

  return topics;
}

function validateLessonsFile(raw: unknown, fileName: string): LessonsFileInput {
  assert(raw && typeof raw === "object" && !Array.isArray(raw), `${fileName} muss ein Objekt sein.`);
  const row = raw as Record<string, unknown>;
  assert(Array.isArray(row.lessons), `${fileName}.lessons muss ein Array sein.`);

  const lessons = row.lessons.map((entry, index): LessonInput => {
    assert(entry && typeof entry === "object" && !Array.isArray(entry), `${fileName}.lessons[${index}] ist ungültig.`);
    const lesson = entry as Record<string, unknown>;
    assert(Array.isArray(lesson.translations) && lesson.translations.length > 0, `${fileName}.lessons[${index}].translations fehlt.`);
    assert(Array.isArray(lesson.blocks), `${fileName}.lessons[${index}].blocks muss ein Array sein.`);

    const translations = lesson.translations.map((entry2, trIndex) => {
      assert(entry2 && typeof entry2 === "object" && !Array.isArray(entry2), `${fileName}.lessons[${index}].translations[${trIndex}] ist ungültig.`);
      const tr = entry2 as Record<string, unknown>;
      return {
        locale: normalizeLocale(tr.locale, `${fileName}.lessons[${index}].translations[${trIndex}].locale`),
        title: text(tr.title, `${fileName}.lessons[${index}].translations[${trIndex}].title`),
        description:
          tr.description === null || tr.description === undefined
            ? null
            : text(tr.description, `${fileName}.lessons[${index}].translations[${trIndex}].description`),
      };
    });
    ensureUnique(translations.map((x) => x.locale), `${fileName}.lessons[${index}].translations`);

    const blocks = lesson.blocks.map((entry2, blockIndex): LessonBlockInput => {
      assert(entry2 && typeof entry2 === "object" && !Array.isArray(entry2), `${fileName}.lessons[${index}].blocks[${blockIndex}] ist ungültig.`);
      const block = entry2 as Record<string, unknown>;
      const type = text(block.type, `${fileName}.lessons[${index}].blocks[${blockIndex}].type`) as LessonBlockType;
      assert(
        ["TEXT", "IMAGE", "VIDEO", "INFO", "WARNING", "TIP", "EXAMPLE", "QUESTION"].includes(type),
        `${fileName}.lessons[${index}].blocks[${blockIndex}].type ist ungültig.`,
      );

      const blockTranslations = block.translations === undefined
        ? []
        : (() => {
            assert(Array.isArray(block.translations), `${fileName}.lessons[${index}].blocks[${blockIndex}].translations muss ein Array sein.`);
            return block.translations.map((entry3, blockTrIndex) => {
              assert(entry3 && typeof entry3 === "object" && !Array.isArray(entry3), `${fileName}.lessons[${index}].blocks[${blockIndex}].translations[${blockTrIndex}] ist ungültig.`);
              const tr = entry3 as Record<string, unknown>;
              return {
                locale: normalizeLocale(tr.locale, `${fileName}.lessons[${index}].blocks[${blockIndex}].translations[${blockTrIndex}].locale`),
                title: tr.title === null || tr.title === undefined ? null : text(tr.title, "block translation title"),
                bodyText: tr.bodyText === null || tr.bodyText === undefined ? null : text(tr.bodyText, "block translation bodyText"),
                content: tr.content,
              };
            });
          })();

      ensureUnique(blockTranslations.map((x) => x.locale), `${fileName}.lessons[${index}].blocks[${blockIndex}].translations`);

      return {
        type,
        sortOrder: integer(block.sortOrder, `${fileName}.lessons[${index}].blocks[${blockIndex}].sortOrder`),
        isActive: block.isActive === undefined ? true : Boolean(block.isActive),
        mediaStoragePath:
          block.mediaStoragePath === null || block.mediaStoragePath === undefined
            ? null
            : text(block.mediaStoragePath, "block.mediaStoragePath"),
        questionExternalRef:
          block.questionExternalRef === null || block.questionExternalRef === undefined
            ? null
            : text(block.questionExternalRef, "block.questionExternalRef"),
        config: block.config,
        translations: blockTranslations,
      };
    });

    ensureUnique(blocks.map((x) => String(x.sortOrder)), `${fileName}.lessons[${index}].blocks.sortOrder`);

    return {
      slug: text(lesson.slug, `${fileName}.lessons[${index}].slug`).toLowerCase(),
      sortOrder: integer(lesson.sortOrder, `${fileName}.lessons[${index}].sortOrder`),
      status: normalizeStatus(lesson.status, `${fileName}.lessons[${index}].status`),
      estimatedDurationMinutes:
        lesson.estimatedDurationMinutes === null || lesson.estimatedDurationMinutes === undefined
          ? null
          : integer(lesson.estimatedDurationMinutes, `${fileName}.lessons[${index}].estimatedDurationMinutes`, 1),
      validFrom: optionalDate(lesson.validFrom, `${fileName}.lessons[${index}].validFrom`),
      validUntil: optionalDate(lesson.validUntil, `${fileName}.lessons[${index}].validUntil`),
      translations,
      blocks,
    };
  });

  ensureUnique(lessons.map((x) => x.slug), `${fileName}.lessons.slug`);
  ensureUnique(lessons.map((x) => String(x.sortOrder)), `${fileName}.lessons.sortOrder`);

  return {
    topicSlug: text(row.topicSlug, `${fileName}.topicSlug`).toLowerCase(),
    lessons,
  };
}

function validateQuestionsFile(raw: unknown, fileName: string): QuestionsFileInput {
  assert(raw && typeof raw === "object" && !Array.isArray(raw), `${fileName} muss ein Objekt sein.`);
  const row = raw as Record<string, unknown>;
  assert(Array.isArray(row.questions), `${fileName}.questions muss ein Array sein.`);

  const questions = row.questions.map((entry, index): QuestionInput => {
    assert(entry && typeof entry === "object" && !Array.isArray(entry), `${fileName}.questions[${index}] ist ungültig.`);
    const question = entry as Record<string, unknown>;
    assert(Array.isArray(question.translations) && question.translations.length > 0, `${fileName}.questions[${index}].translations fehlt.`);

    const translations = question.translations.map((entry2, trIndex) => {
      assert(entry2 && typeof entry2 === "object" && !Array.isArray(entry2), `${fileName}.questions[${index}].translations[${trIndex}] ist ungültig.`);
      const tr = entry2 as Record<string, unknown>;
      assert(tr.answerOptions !== undefined, `${fileName}.questions[${index}].translations[${trIndex}].answerOptions fehlt.`);
      assert(tr.correctAnswer !== undefined, `${fileName}.questions[${index}].translations[${trIndex}].correctAnswer fehlt.`);
      return {
        locale: normalizeLocale(tr.locale, `${fileName}.questions[${index}].translations[${trIndex}].locale`),
        prompt: text(tr.prompt, `${fileName}.questions[${index}].translations[${trIndex}].prompt`),
        explanation:
          tr.explanation === null || tr.explanation === undefined
            ? null
            : text(tr.explanation, `${fileName}.questions[${index}].translations[${trIndex}].explanation`),
        answerOptions: tr.answerOptions,
        correctAnswer: tr.correctAnswer,
      };
    });

    ensureUnique(translations.map((x) => x.locale), `${fileName}.questions[${index}].translations`);

    return {
      externalRef: text(question.externalRef, `${fileName}.questions[${index}].externalRef`),
      questionType: text(question.questionType, `${fileName}.questions[${index}].questionType`).toUpperCase(),
      penaltyPoints: integer(question.penaltyPoints, `${fileName}.questions[${index}].penaltyPoints`),
      mediaStoragePath:
        question.mediaStoragePath === null || question.mediaStoragePath === undefined
          ? null
          : text(question.mediaStoragePath, `${fileName}.questions[${index}].mediaStoragePath`),
      status: normalizeStatus(question.status, `${fileName}.questions[${index}].status`),
      version: question.version === undefined ? 1 : integer(question.version, `${fileName}.questions[${index}].version`, 1),
      difficulty: question.difficulty === undefined ? "standard" : text(question.difficulty, `${fileName}.questions[${index}].difficulty`),
      validFrom: optionalDate(question.validFrom, `${fileName}.questions[${index}].validFrom`),
      validUntil: optionalDate(question.validUntil, `${fileName}.questions[${index}].validUntil`),
      translations,
    };
  });

  ensureUnique(questions.map((x) => x.externalRef), `${fileName}.questions.externalRef`);

  return {
    topicSlug: text(row.topicSlug, `${fileName}.topicSlug`).toLowerCase(),
    questions,
  };
}

function validateExamConfig(raw: unknown): ExamConfigInput {
  assert(raw && typeof raw === "object" && !Array.isArray(raw), "exam-config.json muss ein Objekt sein.");
  const row = raw as Record<string, unknown>;
  assert(row.passingRule !== undefined && row.passingRule !== null, "exam-config.passingRule fehlt.");

  return {
    version: text(row.version, "exam-config.version"),
    questionCount: integer(row.questionCount, "exam-config.questionCount", 1),
    durationSeconds: integer(row.durationSeconds, "exam-config.durationSeconds", 60),
    scoringMethod: text(row.scoringMethod, "exam-config.scoringMethod"),
    passingRule: row.passingRule,
    status: normalizeStatus(row.status, "exam-config.status"),
    activeFrom: optionalDate(row.activeFrom, "exam-config.activeFrom"),
    activeUntil: optionalDate(row.activeUntil, "exam-config.activeUntil"),
  };
}

async function readJson(file: string): Promise<unknown> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as unknown;
  } catch (error) {
    throw new Error(
      `${path.relative(PROJECT_ROOT, file)} konnte nicht gelesen werden: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

async function listJsonFiles(directory: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json"))
      .map((entry) => path.join(directory, entry.name))
      .sort((a, b) => a.localeCompare(b));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }
}

export function parseCliArgs(argv = process.argv.slice(2)): {
  all: boolean;
  classCode: string | null;
} {
  const all = argv.includes("--all");
  const classIndex = argv.findIndex((item) => item === "--class" || item === "-c");
  const classCode =
    classIndex >= 0 && argv[classIndex + 1]
      ? argv[classIndex + 1].trim().toUpperCase()
      : null;

  if (!all && !classCode) {
    throw new Error('Benutzung: --class B   oder   --all');
  }

  return { all, classCode };
}

export async function resolveClassDirectories(
  options: { all: boolean; classCode: string | null },
): Promise<string[]> {
  if (!options.all) {
    const classCode = options.classCode!;
    const directory = path.join(DATA_ROOT, `klasse-${classCode.toLowerCase()}`);
    await fs.access(directory);
    return [directory];
  }

  const entries = await fs.readdir(DATA_ROOT, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("klasse-"))
    .map((entry) => path.join(DATA_ROOT, entry.name))
    .sort((a, b) => a.localeCompare(b));

  assert(directories.length > 0, "Keine data/theory/de/klasse-* Verzeichnisse gefunden.");
  return directories;
}

export async function loadAndValidateClassContent(
  directory: string,
): Promise<TheoryClassContent> {
  const programPath = path.join(directory, "program.json");
  const topicsPath = path.join(directory, "topics.json");
  const examConfigPath = path.join(directory, "exam-config.json");

  const program = validateProgram(await readJson(programPath));
  const topics = validateTopics(await readJson(topicsPath));

  const lessonsFiles = await Promise.all(
    (await listJsonFiles(path.join(directory, "lessons"))).map(async (file) =>
      validateLessonsFile(await readJson(file), path.basename(file)),
    ),
  );

  const questionsFiles = await Promise.all(
    (await listJsonFiles(path.join(directory, "questions"))).map(async (file) =>
      validateQuestionsFile(await readJson(file), path.basename(file)),
    ),
  );

  let examConfig: ExamConfigInput | null = null;
  try {
    await fs.access(examConfigPath);
    examConfig = validateExamConfig(await readJson(examConfigPath));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      examConfig = null;
    } else {
      throw error;
    }
  }

  const topicSlugs = new Set(topics.map((topic) => topic.slug));

  for (const file of lessonsFiles) {
    assert(topicSlugs.has(file.topicSlug), `Lessons referenzieren unbekanntes Thema "${file.topicSlug}".`);
  }

  for (const file of questionsFiles) {
    assert(topicSlugs.has(file.topicSlug), `Questions referenzieren unbekanntes Thema "${file.topicSlug}".`);
  }

  ensureUnique(lessonsFiles.map((x) => x.topicSlug), "lessons.topicSlug Dateien");
  ensureUnique(questionsFiles.map((x) => x.topicSlug), "questions.topicSlug Dateien");

  const allQuestionRefs = new Set(
    questionsFiles.flatMap((file) => file.questions.map((question) => question.externalRef)),
  );

  for (const lessonFile of lessonsFiles) {
    for (const lesson of lessonFile.lessons) {
      for (const block of lesson.blocks) {
        if (block.type === "QUESTION") {
          assert(
            block.questionExternalRef,
            `QUESTION-Block in ${lessonFile.topicSlug}/${lesson.slug} benötigt questionExternalRef.`,
          );
          assert(
            allQuestionRefs.has(block.questionExternalRef),
            `QUESTION-Block ${lessonFile.topicSlug}/${lesson.slug} referenziert unbekannte Frage "${block.questionExternalRef}".`,
          );
        }
      }
    }
  }

  const expectedDirectory = `klasse-${program.licenseClassCode.toLowerCase()}`;
  assert(
    path.basename(directory) === expectedDirectory,
    `Verzeichnis "${path.basename(directory)}" passt nicht zu licenseClassCode "${program.licenseClassCode}".`,
  );

  return {
    directory,
    program,
    topics,
    lessonsFiles,
    questionsFiles,
    examConfig,
  };
}

export function toDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

export function safeImportStatus(
  status: ImportStatus | undefined,
): "draft" | "review" {
  return status === "review" ? "review" : "draft";
}

export async function runValidation(): Promise<void> {
  const options = parseCliArgs();
  const directories = await resolveClassDirectories(options);

  for (const directory of directories) {
    const content = await loadAndValidateClassContent(directory);
    const lessonCount = content.lessonsFiles.reduce((sum, file) => sum + file.lessons.length, 0);
    const questionCount = content.questionsFiles.reduce((sum, file) => sum + file.questions.length, 0);

    console.log(
      `✓ DE/${content.program.licenseClassCode}: ${content.topics.length} Themen, ${lessonCount} Lektionen, ${questionCount} Fragen, ExamConfig=${content.examConfig ? "ja" : "nein"}`,
    );
  }
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  runValidation().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
