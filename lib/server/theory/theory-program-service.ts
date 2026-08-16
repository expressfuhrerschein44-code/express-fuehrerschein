import "server-only";

import { prisma } from "@/lib/server/prisma";
import {
  getGermanLicenseClassesForUser,
  normalizeGermanLicenseClassCode,
} from "@/lib/server/license-classes/user-license-class-service";
import {
  getTheoryContextForUser,
} from "@/lib/server/theory/theory-repository";
import type {
  ClientShellLocale,
} from "@/types/client-shell";

export interface GermanTheoryProgramSummary {
  id: string;
  code: string;
  countryCode: "DE";
  licenseClassCode: string;
  version: string;
  status: string;
  isCurrent: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  publishedAt: Date | null;
  topicCount: number;
  lessonCount: number;
  questionCount: number;
  examConfigurationAvailable: boolean;
}

function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );
}

async function buildProgramSummary(
  programId: string,
): Promise<GermanTheoryProgramSummary | null> {
  const program = await prisma.theory_programs.findUnique({
    where: { id: programId },
    select: {
      id: true,
      code: true,
      country_code: true,
      license_class_code: true,
      version: true,
      status: true,
      is_current: true,
      valid_from: true,
      valid_until: true,
      published_at: true,
    },
  });

  if (!program || program.country_code !== "DE") {
    return null;
  }

  const topics = await prisma.theory_topics.findMany({
    where: {
      program_id: program.id,
      is_active: true,
    },
    select: { id: true },
  });

  const topicIds = topics.map((topic) => topic.id);

  const [lessonCount, questionCount, examConfiguration] =
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
      prisma.exam_configurations.findFirst({
        where: {
          program_id: program.id,
          status: "published",
        },
        select: { id: true },
      }),
    ]);

  return {
    id: program.id,
    code: program.code,
    countryCode: "DE",
    licenseClassCode: program.license_class_code,
    version: program.version,
    status: program.status,
    isCurrent: program.is_current,
    validFrom: program.valid_from,
    validUntil: program.valid_until,
    publishedAt: program.published_at,
    topicCount: topicIds.length,
    lessonCount,
    questionCount,
    examConfigurationAvailable: Boolean(examConfiguration),
  };
}

export async function getCurrentGermanTheoryProgramForUser(
  userId: string,
  locale: ClientShellLocale,
): Promise<GermanTheoryProgramSummary | null> {
  const context = await getTheoryContextForUser(userId, locale);

  if (
    context.countryCode !== "DE" ||
    !context.userLicenseClassId ||
    !context.programId
  ) {
    return null;
  }

  return buildProgramSummary(context.programId);
}

export async function listAvailableGermanTheoryProgramsForUser(
  userId: string,
): Promise<readonly GermanTheoryProgramSummary[]> {
  const classes = await getGermanLicenseClassesForUser(userId);
  const date = todayUtc();

  const results: GermanTheoryProgramSummary[] = [];

  for (const userClass of classes) {
    const code = normalizeGermanLicenseClassCode(
      userClass.licenseClassCode,
    );

    const program = await prisma.theory_programs.findFirst({
      where: {
        country_code: "DE",
        license_class_code: code,
        status: "published",
        AND: [
          {
            OR: [
              { valid_from: null },
              { valid_from: { lte: date } },
            ],
          },
          {
            OR: [
              { valid_until: null },
              { valid_until: { gte: date } },
            ],
          },
        ],
      },
      orderBy: [
        { is_current: "desc" },
        { published_at: "desc" },
        { created_at: "desc" },
      ],
      select: { id: true },
    });

    if (!program) {
      continue;
    }

    const summary = await buildProgramSummary(program.id);

    if (summary) {
      results.push(summary);
    }
  }

  return results;
}
