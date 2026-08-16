import { Prisma, PrismaClient } from "@prisma/client";

import {
  loadAndValidateClassContent,
  parseCliArgs,
  resolveClassDirectories,
  safeImportStatus,
  toDate,
} from "./validate-content";

const ALLOWED_BLOCK_TYPES = new Set([
  "TEXT",
  "IMAGE",
  "VIDEO",
  "INFO",
  "WARNING",
  "TIP",
  "EXAMPLE",
  "QUESTION",
]);

const MAX_CLASS_ATTEMPTS = 4;
const BASE_RETRY_DELAY_MS = 1_500;
const BETWEEN_CLASSES_DELAY_MS = 500;

function lessonKey(topicId: string, slug: string): string {
  return `${topicId}::${slug}`;
}

function assertBlockType(blockType: string): void {
  if (!ALLOWED_BLOCK_TYPES.has(blockType)) {
    throw new Error(
      `Nicht unterstützter Lesson-Block-Typ "${blockType}".`,
    );
  }
}

function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : String(error);
}

/**
 * Retry only transient database/network errors.
 *
 * Schema, validation or content errors are NOT retried because retrying them
 * would only hide the real problem.
 */
function isTransientDatabaseError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("server has closed the connection") ||
    message.includes("connection terminated") ||
    message.includes("connection closed") ||
    message.includes("connection reset") ||
    message.includes("socket hang up") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("p1001") ||
    message.includes("p1017")
  );
}

/**
 * Imports all lesson data for one German license-class directory.
 *
 * Important:
 * - no long Prisma interactive transaction;
 * - safe to restart;
 * - existing lessons/blocks/translations are updated instead of duplicated;
 * - existing Prisma field names are respected:
 *   lesson_id, block_id, question_id, config_json, content_json;
 * - QUESTION blocks resolve their existing theory_questions row by
 *   external_ref inside the active program.
 */
async function importLessons(
  prisma: PrismaClient,
  directory: string,
): Promise<void> {
  const content =
    await loadAndValidateClassContent(directory);

  const program =
    await prisma.theory_programs.findFirst({
      where: {
        country_code: "DE",
        license_class_code:
          content.program.licenseClassCode,
        code: content.program.code,
      },
      select: {
        id: true,
      },
    });

  if (!program) {
    throw new Error(
      `Programm ${content.program.code} fehlt. Zuerst import-program.ts ausführen.`,
    );
  }

  /**
   * Load all topics of the current program once.
   */
  const topics =
    await prisma.theory_topics.findMany({
      where: {
        program_id: program.id,
      },
      select: {
        id: true,
        slug: true,
      },
    });

  const topicIdBySlug = new Map(
    topics.map((topic) => [
      topic.slug,
      topic.id,
    ]),
  );

  /**
   * Load all questions of the current program once.
   * QUESTION blocks can then resolve external_ref locally.
   */
  const questions =
    await prisma.theory_questions.findMany({
      where: {
        theory_topics: {
          program_id: program.id,
        },
      },
      select: {
        id: true,
        external_ref: true,
      },
    });

  const questionIdByExternalRef =
    new Map<string, string>();

  for (const question of questions) {
    if (question.external_ref) {
      questionIdByExternalRef.set(
        question.external_ref,
        question.id,
      );
    }
  }

  /**
   * Load existing lessons and their blocks once.
   *
   * If the script is restarted after a connection interruption, the next
   * attempt sees the rows already written and updates them.
   */
  const existingLessons =
    await prisma.theory_lessons.findMany({
      where: {
        theory_topics: {
          program_id: program.id,
        },
      },
      select: {
        id: true,
        topic_id: true,
        slug: true,
        content_blocks: {
          select: {
            id: true,
            sort_order: true,
          },
        },
      },
    });

  const existingLessonByKey =
    new Map(
      existingLessons.map((lesson) => [
        lessonKey(
          lesson.topic_id,
          lesson.slug,
        ),
        lesson,
      ]),
    );

  let importedLessons = 0;
  let importedLessonTranslations = 0;
  let importedBlocks = 0;
  let importedBlockTranslations = 0;

  for (const file of content.lessonsFiles) {
    const topicId =
      topicIdBySlug.get(file.topicSlug);

    if (!topicId) {
      throw new Error(
        `Thema "${file.topicSlug}" fehlt. Zuerst import-topics.ts ausführen.`,
      );
    }

    for (const lesson of file.lessons) {
      const key =
        lessonKey(topicId, lesson.slug);

      const existingLesson =
        existingLessonByKey.get(key);

      const lessonData = {
        sort_order: lesson.sortOrder,
        status:
          safeImportStatus(lesson.status),
        estimated_duration_minutes:
          lesson.estimatedDurationMinutes ??
          null,
        valid_from:
          toDate(lesson.validFrom),
        valid_until:
          toDate(lesson.validUntil),
        published_at: null,
      };

      const lessonRow = existingLesson
        ? await prisma.theory_lessons.update({
            where: {
              id: existingLesson.id,
            },
            data: lessonData,
            select: {
              id: true,
            },
          })
        : await prisma.theory_lessons.create({
            data: {
              topic_id: topicId,
              slug: lesson.slug,
              ...lessonData,
            },
            select: {
              id: true,
            },
          });

      /**
       * Keep the local cache synchronized when this execution creates a lesson.
       */
      if (!existingLesson) {
        existingLessonByKey.set(
          key,
          {
            id: lessonRow.id,
            topic_id: topicId,
            slug: lesson.slug,
            content_blocks: [],
          },
        );
      }

      /**
       * Unique key already present in Prisma:
       * (lesson_id, locale) => lesson_id_locale
       */
      for (
        const translation
        of lesson.translations
      ) {
        await prisma
          .theory_lesson_translations
          .upsert({
            where: {
              lesson_id_locale: {
                lesson_id:
                  lessonRow.id,
                locale:
                  translation.locale,
              },
            },
            create: {
              lesson_id:
                lessonRow.id,
              locale:
                translation.locale,
              title:
                translation.title,
              description:
                translation.description ??
                null,
            },
            update: {
              title:
                translation.title,
              description:
                translation.description ??
                null,
            },
          });

        importedLessonTranslations += 1;
      }

      /**
       * The current Prisma schema has no composite unique key for content
       * blocks, therefore sort_order is used as the stable importer position
       * inside one lesson.
       */
      const knownLesson =
        existingLessonByKey.get(key);

      const knownBlocks =
        knownLesson?.content_blocks ??
        [];

      const existingBlockBySortOrder =
        new Map(
          knownBlocks.map((block) => [
            block.sort_order,
            block.id,
          ]),
        );

      const importedBlockIds: string[] =
        [];

      for (const block of lesson.blocks) {
        assertBlockType(block.type);

        let questionId:
          | string
          | null = null;

        if (block.questionExternalRef) {
          questionId =
            questionIdByExternalRef.get(
              block.questionExternalRef,
            ) ?? null;

          if (!questionId) {
            throw new Error(
              `Frage "${block.questionExternalRef}" für ${file.topicSlug}/${lesson.slug} fehlt. Zuerst import-questions.ts ausführen.`,
            );
          }
        }

        if (
          block.type === "QUESTION" &&
          !questionId
        ) {
          throw new Error(
            `QUESTION-Block für ${file.topicSlug}/${lesson.slug} besitzt keine gültige Frage.`,
          );
        }

        const blockData = {
          block_type:
            block.type,
          sort_order:
            block.sortOrder,
          is_active:
            block.isActive ??
            true,
          media_storage_path:
            block.mediaStoragePath ??
            null,
          question_id:
            questionId,
          config_json:
            block.config === undefined ||
            block.config === null
              ? Prisma.JsonNull
              : (block.config as Prisma.InputJsonValue),
        };

        const existingBlockId =
          existingBlockBySortOrder.get(
            block.sortOrder,
          );

        const blockRow =
          existingBlockId
            ? await prisma
                .theory_lesson_content_blocks
                .update({
                  where: {
                    id:
                      existingBlockId,
                  },
                  data:
                    blockData,
                  select: {
                    id: true,
                  },
                })
            : await prisma
                .theory_lesson_content_blocks
                .create({
                  data: {
                    lesson_id:
                      lessonRow.id,
                    ...blockData,
                  },
                  select: {
                    id: true,
                  },
                });

        importedBlockIds.push(
          blockRow.id,
        );

        existingBlockBySortOrder.set(
          block.sortOrder,
          blockRow.id,
        );

        /**
         * Unique key already present in Prisma:
         * (block_id, locale) => block_id_locale
         *
         * IMPORTANT:
         * the correct field is block_id, not content_block_id.
         */
        for (
          const translation
          of block.translations ?? []
        ) {
          await prisma
            .theory_lesson_content_block_translations
            .upsert({
              where: {
                block_id_locale: {
                  block_id:
                    blockRow.id,
                  locale:
                    translation.locale,
                },
              },
              create: {
                block_id:
                  blockRow.id,
                locale:
                  translation.locale,
                title:
                  translation.title ??
                  null,
                body_text:
                  translation.bodyText ??
                  null,
                content_json:
                  translation.content ===
                    undefined ||
                  translation.content ===
                    null
                    ? Prisma.JsonNull
                    : (translation.content as Prisma.InputJsonValue),
              },
              update: {
                title:
                  translation.title ??
                  null,
                body_text:
                  translation.bodyText ??
                  null,
                content_json:
                  translation.content ===
                    undefined ||
                  translation.content ===
                    null
                    ? Prisma.JsonNull
                    : (translation.content as Prisma.InputJsonValue),
              },
            });

          importedBlockTranslations += 1;
        }

        importedBlocks += 1;
      }

      /**
       * Do not delete old content blocks because existing learning history may
       * still reference them. Blocks no longer present in JSON are deactivated.
       */
      if (importedBlockIds.length > 0) {
        await prisma
          .theory_lesson_content_blocks
          .updateMany({
            where: {
              lesson_id:
                lessonRow.id,
              id: {
                notIn:
                  importedBlockIds,
              },
            },
            data: {
              is_active: false,
            },
          });
      } else {
        await prisma
          .theory_lesson_content_blocks
          .updateMany({
            where: {
              lesson_id:
                lessonRow.id,
            },
            data: {
              is_active: false,
            },
          });
      }

      importedLessons += 1;
    }
  }

  console.log(
    `✓ ${importedLessons} Lektionen / ${importedLessonTranslations} Lektion-Übersetzungen / ${importedBlocks} Blöcke / ${importedBlockTranslations} Block-Übersetzungen für DE/${content.program.licenseClassCode} importiert.`,
  );
}

/**
 * Runs one license class with a fresh PrismaClient.
 *
 * If Supabase/PostgreSQL closes the connection during a long import, only the
 * current class is retried. Successful previous classes are not repeated.
 *
 * The importer above is idempotent, so retrying a partially imported class
 * updates existing rows instead of creating duplicates.
 */
async function importDirectoryWithRetry(
  directory: string,
): Promise<void> {
  let lastError: unknown = null;

  for (
    let attempt = 1;
    attempt <= MAX_CLASS_ATTEMPTS;
    attempt += 1
  ) {
    const prisma =
      new PrismaClient();

    try {
      await prisma.$connect();

      await importLessons(
        prisma,
        directory,
      );

      return;
    } catch (error) {
      lastError = error;

      if (
        !isTransientDatabaseError(
          error,
        ) ||
        attempt === MAX_CLASS_ATTEMPTS
      ) {
        throw error;
      }

      const delay =
        BASE_RETRY_DELAY_MS *
        attempt;

      console.warn(
        `⚠ Datenbankverbindung unterbrochen. Aktuelle Klasse wird erneut versucht (${attempt}/${MAX_CLASS_ATTEMPTS}). Neuer Versuch in ${delay} ms.`,
      );

      console.warn(
        `  ${getErrorMessage(error)}`,
      );

      await sleep(delay);
    } finally {
      try {
        await prisma.$disconnect();
      } catch {
        /**
         * The remote server may already have closed the connection.
         */
      }
    }
  }

  throw lastError;
}

async function main(): Promise<void> {
  const options =
    parseCliArgs();

  const directories =
    await resolveClassDirectories(
      options,
    );

  for (
    let index = 0;
    index < directories.length;
    index += 1
  ) {
    await importDirectoryWithRetry(
      directories[index],
    );

    if (
      index <
      directories.length - 1
    ) {
      await sleep(
        BETWEEN_CLASSES_DELAY_MS,
      );
    }
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : error,
  );

  process.exitCode = 1;
});
