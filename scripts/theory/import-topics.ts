import { PrismaClient } from "@prisma/client";
import {
  loadAndValidateClassContent,
  parseCliArgs,
  resolveClassDirectories,
} from "./validate-content";

const prisma = new PrismaClient();

/**
 * Imports topics idempotently.
 *
 * IMPORTANT:
 * We deliberately do NOT wrap the full class import inside one interactive
 * Prisma transaction. With many topics/translations and a remote Supabase
 * PostgreSQL connection, a long interactive transaction can expire before all
 * queries are finished ("Transaction not found / old closed transaction").
 *
 * The import remains safe to restart because every write first resolves the
 * existing row and then updates or creates it.
 */
async function importTopics(directory: string): Promise<void> {
  const content = await loadAndValidateClassContent(directory);

  const program = await prisma.theory_programs.findFirst({
    where: {
      country_code: "DE",
      license_class_code: content.program.licenseClassCode,
      code: content.program.code,
    },
    select: { id: true },
  });

  if (!program) {
    throw new Error(
      `Programm ${content.program.code} fehlt. Zuerst import-program.ts ausführen.`,
    );
  }

  let importedTopics = 0;
  let importedTranslations = 0;

  for (const topic of content.topics) {
    const existing = await prisma.theory_topics.findFirst({
      where: {
        program_id: program.id,
        slug: topic.slug,
      },
      select: { id: true },
    });

    const topicRow = existing
      ? await prisma.theory_topics.update({
          where: { id: existing.id },
          data: {
            country_code: "DE",
            license_class_code: content.program.licenseClassCode,
            sort_order: topic.sortOrder,
            is_active: topic.isActive ?? true,
          },
          select: { id: true },
        })
      : await prisma.theory_topics.create({
          data: {
            country_code: "DE",
            program_id: program.id,
            license_class_code: content.program.licenseClassCode,
            slug: topic.slug,
            sort_order: topic.sortOrder,
            is_active: topic.isActive ?? true,
          },
          select: { id: true },
        });

    for (const translation of topic.translations) {
      const existingTranslation =
        await prisma.theory_topic_translations.findFirst({
          where: {
            topic_id: topicRow.id,
            locale: translation.locale,
          },
          select: { id: true },
        });

      const translationData = {
        locale: translation.locale,
        title: translation.title,
        description: translation.description ?? null,
      };

      if (existingTranslation) {
        await prisma.theory_topic_translations.update({
          where: { id: existingTranslation.id },
          data: translationData,
        });
      } else {
        await prisma.theory_topic_translations.create({
          data: {
            topic_id: topicRow.id,
            ...translationData,
          },
        });
      }

      importedTranslations += 1;
    }

    importedTopics += 1;
  }

  console.log(
    `✓ ${importedTopics} Themen / ${importedTranslations} Übersetzungen für DE/${content.program.licenseClassCode} importiert.`,
  );
}

async function main(): Promise<void> {
  const options = parseCliArgs();
  const directories = await resolveClassDirectories(options);

  for (const directory of directories) {
    await importTopics(directory);
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
