import { PrismaClient } from "@prisma/client";
import {
  loadAndValidateClassContent,
  parseCliArgs,
  resolveClassDirectories,
  safeImportStatus,
  toDate,
} from "./validate-content";

const prisma = new PrismaClient();

async function importProgram(directory: string): Promise<void> {
  const content = await loadAndValidateClassContent(directory);
  const program = content.program;

  const existing = await prisma.theory_programs.findFirst({
    where: {
      code: program.code,
    },
    select: { id: true },
  });

  const data = {
    country_code: "DE",
    license_class_code: program.licenseClassCode,
    code: program.code,
    version: program.version,
    status: safeImportStatus(program.status),
    is_current: false,
    valid_from: toDate(program.validFrom),
    valid_until: toDate(program.validUntil),
    published_at: null,
  };

  if (existing) {
    await prisma.theory_programs.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.theory_programs.create({
      data,
    });
  }

  console.log(`✓ Programm DE/${program.licenseClassCode} importiert: ${program.code}`);
}

async function main(): Promise<void> {
  const options = parseCliArgs();
  const directories = await resolveClassDirectories(options);

  for (const directory of directories) {
    await importProgram(directory);
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
