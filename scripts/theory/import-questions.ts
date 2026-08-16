import { Prisma, PrismaClient } from "@prisma/client";

import {
  loadAndValidateClassContent,
  parseCliArgs,
  resolveClassDirectories,
  safeImportStatus,
  toDate,
} from "./validate-content";

const prisma = new PrismaClient();

/**
 * Converts the JSON/content question type to the value expected by the
 * existing PostgreSQL CHECK constraint on theory_questions.question_type.
 *
 * The current Prisma schema already uses the lowercase database convention
 * (default: "single_choice"), so import files may stay expressive with
 * uppercase content values while persistence remains compatible with the DB.
 */
function toDatabaseQuestionType(questionType: string): string {
  const normalized = questionType.trim().toUpperCase();

  switch (normalized) {
    case "SINGLE_CHOICE":
      return "single_choice";

    case "MULTIPLE_CHOICE":
      return "multiple_choice";

    case "IMAGE_CHOICE":
      return "image_choice";

    case "VIDEO":
      return "video";

    case "NUMERIC":
      return "numeric";

    default:
      throw new Error(
        `Nicht unterstützter questionType "${questionType}".`,
      );
  }
}

/**
 * Imports questions idempotently.
 *
 * IMPORTANT:
 * We intentionally do NOT wrap the whole class import in a long interactive
 * Prisma transaction. Imports can contain hundreds of questions and run
 * against a remote Supabase/PostgreSQL connection. A long interactive
 * transaction can expire after Prisma's transaction timeout.
 *
 * Every question and translation is resolved first and then updated or
 * created, so the script can safely be restarted after an interruption.
 */
async function importQuestions(directory: string): Promise<void> {
  const content = await loadAndValidateClassContent(directory);

  const program = await prisma.theory_programs.findFirst({
    where: {
      country_code: "DE",
      license_class_code:
        content.program.licenseClassCode,
      code:
        content.program.code,
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

  let importedQuestions = 0;
  let importedTranslations = 0;

  for (const file of content.questionsFiles) {
    const topic = await prisma.theory_topics.findFirst({
      where: {
        program_id:
          program.id,
        slug:
          file.topicSlug,
      },
      select: {
        id: true,
      },
    });

    if (!topic) {
      throw new Error(
        `Thema "${file.topicSlug}" fehlt. Zuerst import-topics.ts ausführen.`,
      );
    }

    for (const question of file.questions) {
      const existing =
        await prisma.theory_questions.findFirst({
          where: {
            topic_id:
              topic.id,
            external_ref:
              question.externalRef,
          },
          select: {
            id: true,
          },
        });

      const questionData = {
        question_type:
          toDatabaseQuestionType(
            question.questionType,
          ),

        penalty_points:
          question.penaltyPoints,

        media_storage_path:
          question.mediaStoragePath ??
          null,

        is_active:
          true,

        status:
          safeImportStatus(
            question.status,
          ),

        version:
          question.version ??
          1,

        difficulty:
          question.difficulty ??
          "standard",

        valid_from:
          toDate(
            question.validFrom,
          ),

        valid_until:
          toDate(
            question.validUntil,
          ),

        published_at:
          null,
      };

      const row = existing
        ? await prisma.theory_questions.update({
            where: {
              id:
                existing.id,
            },

            data:
              questionData,

            select: {
              id: true,
            },
          })
        : await prisma.theory_questions.create({
            data: {
              topic_id:
                topic.id,

              external_ref:
                question.externalRef,

              ...questionData,
            },

            select: {
              id: true,
            },
          });

      for (
        const translation
        of question.translations
      ) {
        const existingTranslation =
          await prisma
            .theory_question_translations
            .findFirst({
              where: {
                question_id:
                  row.id,

                locale:
                  translation.locale,
              },

              select: {
                id: true,
              },
            });

        const translationData = {
          locale:
            translation.locale,

          prompt:
            translation.prompt,

          explanation:
            translation.explanation ??
            null,

          answer_options: translation.answerOptions as Prisma.InputJsonValue,

          correct_answer: translation.correctAnswer as Prisma.InputJsonValue,
        };

        if (existingTranslation) {
          await prisma
            .theory_question_translations
            .update({
              where: {
                id:
                  existingTranslation.id,
              },

              data:
                translationData,
            });
        } else {
          await prisma
            .theory_question_translations
            .create({
              data: {
                question_id:
                  row.id,

                ...translationData,
              },
            });
        }

        importedTranslations += 1;
      }

      importedQuestions += 1;
    }
  }

  console.log(
    `✓ ${importedQuestions} Fragen / ${importedTranslations} Übersetzungen für DE/${content.program.licenseClassCode} importiert.`,
  );
}

async function main(): Promise<void> {
  const options =
    parseCliArgs();

  const directories =
    await resolveClassDirectories(
      options,
    );

  for (const directory of directories) {
    await importQuestions(
      directory,
    );
  }
}

main()
  .catch((error) => {
    console.error(
      error instanceof Error
        ? error.message
        : error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
