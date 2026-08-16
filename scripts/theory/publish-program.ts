import { PrismaClient } from "@prisma/client";
import {
  loadAndValidateClassContent,
  parseCliArgs,
  resolveClassDirectories,
} from "./validate-content";

const prisma = new PrismaClient();

async function publishProgram(directory: string): Promise<void> {
  const content = await loadAndValidateClassContent(directory);

  const program = await prisma.theory_programs.findFirst({
    where: {
      country_code: "DE",
      license_class_code: content.program.licenseClassCode,
      code: content.program.code,
    },
    select: {
      id: true,
      code: true,
      status: true,
    },
  });

  if (!program) {
    throw new Error(
      `Programm ${content.program.code} fehlt. Import zuerst vollständig ausführen.`,
    );
  }

  const [
    topicCount,
    lessonCount,
    questionCount,
    examConfig,
    unresolvedQuestionBlocks,
  ] = await Promise.all([
    prisma.theory_topics.count({
      where: {
        program_id: program.id,
        is_active: true,
      },
    }),
    prisma.theory_lessons.count({
      where: {
        theory_topics: {
          program_id: program.id,
          is_active: true,
        },
        status: { in: ["draft", "review", "published"] },
      },
    }),
    prisma.theory_questions.count({
      where: {
        theory_topics: {
          program_id: program.id,
          is_active: true,
        },
        is_active: true,
        status: { in: ["draft", "review", "published"] },
      },
    }),
    prisma.exam_configurations.findFirst({
      where: {
        program_id: program.id,
        version: content.examConfig?.version,
      },
      select: { id: true },
    }),
    prisma.theory_lesson_content_blocks.count({
      where: {
        block_type: "QUESTION",
        is_active: true,
        question_id: null,
        theory_lessons: {
          theory_topics: {
            program_id: program.id,
          },
        },
      },
    }),
  ]);

  if (topicCount === 0) {
    throw new Error("Publikation abgebrochen: keine aktiven Themen.");
  }
  if (lessonCount === 0) {
    throw new Error("Publikation abgebrochen: keine Lektionen.");
  }
  if (questionCount === 0) {
    throw new Error("Publikation abgebrochen: keine Fragen.");
  }
  if (!content.examConfig || !examConfig) {
    throw new Error("Publikation abgebrochen: ExamConfig fehlt oder wurde nicht importiert.");
  }
  if (unresolvedQuestionBlocks > 0) {
    throw new Error(
      `Publikation abgebrochen: ${unresolvedQuestionBlocks} QUESTION-Blöcke besitzen keine verknüpfte Frage.`,
    );
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.theory_programs.updateMany({
      where: {
        country_code: "DE",
        license_class_code: content.program.licenseClassCode,
        is_current: true,
        id: { not: program.id },
      },
      data: {
        is_current: false,
      },
    });

    await tx.theory_lessons.updateMany({
      where: {
        theory_topics: {
          program_id: program.id,
          is_active: true,
        },
        status: { in: ["draft", "review"] },
      },
      data: {
        status: "published",
        published_at: now,
      },
    });

    await tx.theory_questions.updateMany({
      where: {
        theory_topics: {
          program_id: program.id,
          is_active: true,
        },
        is_active: true,
        status: { in: ["draft", "review"] },
      },
      data: {
        status: "published",
        published_at: now,
      },
    });

    await tx.exam_configurations.update({
      where: { id: examConfig.id },
      data: {
        status: "published",
        published_at: now,
      },
    });

    await tx.theory_programs.update({
      where: { id: program.id },
      data: {
        status: "published",
        is_current: true,
        published_at: now,
      },
    });
  });

  console.log(
    `✓ DE/${content.program.licenseClassCode} veröffentlicht: ${topicCount} Themen, ${lessonCount} Lektionen, ${questionCount} Fragen.`,
  );
}

async function main(): Promise<void> {
  const options = parseCliArgs();
  const directories = await resolveClassDirectories(options);

  for (const directory of directories) {
    await publishProgram(directory);
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
