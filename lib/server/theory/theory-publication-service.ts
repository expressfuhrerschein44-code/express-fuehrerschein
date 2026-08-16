import "server-only";

import { prisma } from "@/lib/server/prisma";
import {
  normalizeGermanLicenseClassCode,
} from "@/lib/server/license-classes/user-license-class-service";

export interface TheoryProgramPublicationCheck {
  programId: string;
  countryCode: "DE";
  licenseClassCode: string;
  topicCount: number;
  lessonCount: number;
  questionCount: number;
  examConfigurationCount: number;
  canPublish: boolean;
  warnings: readonly string[];
  blockers: readonly string[];
}

export async function validateGermanTheoryProgramForPublication(
  programId: string,
): Promise<TheoryProgramPublicationCheck> {
  const program = await prisma.theory_programs.findUnique({
    where: { id: programId },
    select: {
      id: true,
      country_code: true,
      license_class_code: true,
      status: true,
    },
  });

  if (!program) {
    throw new Error(
      "[Express-Führerschein] Theorieprogramm wurde nicht gefunden.",
    );
  }

  if (program.country_code !== "DE") {
    throw new Error(
      "[Express-Führerschein] Dieser Veröffentlichungsservice ist aktuell auf Deutschland begrenzt.",
    );
  }

  normalizeGermanLicenseClassCode(
    program.license_class_code,
  );

  const topics = await prisma.theory_topics.findMany({
    where: {
      program_id: program.id,
      is_active: true,
    },
    select: { id: true },
  });

  const topicIds = topics.map((topic) => topic.id);

  const [lessonCount, questionCount, examConfigurationCount] =
    await Promise.all([
      topicIds.length
        ? prisma.theory_lessons.count({
            where: {
              topic_id: { in: topicIds },
              status: "published",
            },
          })
        : Promise.resolve(0),
      topicIds.length
        ? prisma.theory_questions.count({
            where: {
              topic_id: { in: topicIds },
              status: "published",
              is_active: true,
            },
          })
        : Promise.resolve(0),
      prisma.exam_configurations.count({
        where: {
          program_id: program.id,
          status: "published",
        },
      }),
    ]);

  const blockers: string[] = [];
  const warnings: string[] = [];

  if (topics.length === 0) {
    blockers.push(
      "Das Programm enthält keine aktiven Themen.",
    );
  }

  if (lessonCount === 0) {
    blockers.push(
      "Das Programm enthält keine veröffentlichten Lektionen.",
    );
  }

  if (questionCount === 0) {
    blockers.push(
      "Das Programm enthält keine veröffentlichten Fragen.",
    );
  }

  if (examConfigurationCount === 0) {
    warnings.push(
      "Für das Programm ist noch keine veröffentlichte Prüfungskonfiguration hinterlegt.",
    );
  }

  return {
    programId: program.id,
    countryCode: "DE",
    licenseClassCode: program.license_class_code,
    topicCount: topics.length,
    lessonCount,
    questionCount,
    examConfigurationCount,
    canPublish: blockers.length === 0,
    warnings,
    blockers,
  };
}

export async function publishGermanTheoryProgram(
  input: {
    programId: string;
    makeCurrent?: boolean;
  },
) {
  const check =
    await validateGermanTheoryProgramForPublication(
      input.programId,
    );

  if (!check.canPublish) {
    throw new Error(
      `[Express-Führerschein] Theorieprogramm kann nicht veröffentlicht werden: ${check.blockers.join(" ")}`,
    );
  }

  const makeCurrent = input.makeCurrent ?? true;

  return prisma.$transaction(async (tx) => {
    const program = await tx.theory_programs.findUnique({
      where: { id: input.programId },
      select: {
        id: true,
        country_code: true,
        license_class_code: true,
      },
    });

    if (!program || program.country_code !== "DE") {
      throw new Error(
        "[Express-Führerschein] Deutsches Theorieprogramm wurde nicht gefunden.",
      );
    }

    if (makeCurrent) {
      await tx.theory_programs.updateMany({
        where: {
          country_code: program.country_code,
          license_class_code: program.license_class_code,
          id: { not: program.id },
          is_current: true,
        },
        data: { is_current: false },
      });
    }

    return tx.theory_programs.update({
      where: { id: program.id },
      data: {
        status: "published",
        is_current: makeCurrent,
        published_at: new Date(),
      },
      select: {
        id: true,
        code: true,
        country_code: true,
        license_class_code: true,
        version: true,
        status: true,
        is_current: true,
        published_at: true,
      },
    });
  });
}

export async function archiveGermanTheoryProgram(
  programId: string,
) {
  const program = await prisma.theory_programs.findUnique({
    where: { id: programId },
    select: {
      id: true,
      country_code: true,
    },
  });

  if (!program || program.country_code !== "DE") {
    throw new Error(
      "[Express-Führerschein] Deutsches Theorieprogramm wurde nicht gefunden.",
    );
  }

  return prisma.theory_programs.update({
    where: { id: program.id },
    data: {
      status: "archived",
      is_current: false,
    },
    select: {
      id: true,
      status: true,
      is_current: true,
      updated_at: true,
    },
  });
}
