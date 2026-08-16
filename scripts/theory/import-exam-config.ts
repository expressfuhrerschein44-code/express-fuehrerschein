import { Prisma, PrismaClient } from "@prisma/client";
import {
  loadAndValidateClassContent,
  parseCliArgs,
  resolveClassDirectories,
  safeImportStatus,
  toDate,
} from "./validate-content";

const prisma = new PrismaClient();

async function importExamConfiguration(
  directory: string,
): Promise<void> {
  const content = await loadAndValidateClassContent(directory);

  if (!content.examConfig) {
    throw new Error(
      `exam-config.json fehlt für DE/${content.program.licenseClassCode}.`,
    );
  }

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

  const config = content.examConfig;

  const existing = await prisma.exam_configurations.findFirst({
    where: {
      program_id: program.id,
      version: config.version,
    },
    select: { id: true },
  });

  const data = {
    question_count: config.questionCount,
    duration_seconds: config.durationSeconds,
    scoring_method: config.scoringMethod,
    passing_rule: config.passingRule as Prisma.InputJsonValue,
    status: safeImportStatus(config.status),
    active_from: toDate(config.activeFrom),
    active_until: toDate(config.activeUntil),
    published_at: null,
  };

  if (existing) {
    await prisma.exam_configurations.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.exam_configurations.create({
      data: {
        program_id: program.id,
        version: config.version,
        ...data,
      },
    });
  }

  console.log(
    `✓ ExamConfig ${config.version} für DE/${content.program.licenseClassCode} importiert.`,
  );
}

async function main(): Promise<void> {
  const options = parseCliArgs();
  const directories = await resolveClassDirectories(options);

  for (const directory of directories) {
    await importExamConfiguration(directory);
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
