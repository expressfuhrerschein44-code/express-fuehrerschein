import "server-only";

import { prisma } from "@/lib/server/prisma";

export interface UserLicenseClassRecord {
  id: string;
  userId: string;
  licenseClassCode: string;
  status: string;
  isPrimary: boolean;
  startedAt: Date;
  targetExamDate: Date | null;
  completedAt: Date | null;
}

function mapRow(row: {
  id: string;
  user_id: string;
  license_class_code: string;
  status: string;
  is_primary: boolean;
  started_at: Date;
  target_exam_date: Date | null;
  completed_at: Date | null;
}): UserLicenseClassRecord {
  return {
    id: row.id,
    userId: row.user_id,
    licenseClassCode: row.license_class_code,
    status: row.status,
    isPrimary: row.is_primary,
    startedAt: row.started_at,
    targetExamDate: row.target_exam_date,
    completedAt: row.completed_at,
  };
}

export async function getUserCountryCode(
  userId: string,
): Promise<string | null> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { country_code: true },
  });

  return user?.country_code ?? null;
}

export async function listUserLicenseClasses(
  userId: string,
): Promise<readonly UserLicenseClassRecord[]> {
  const rows = await prisma.user_license_classes.findMany({
    where: { user_id: userId },
    orderBy: [
      { is_primary: "desc" },
      { created_at: "asc" },
    ],
    select: {
      id: true,
      user_id: true,
      license_class_code: true,
      status: true,
      is_primary: true,
      started_at: true,
      target_exam_date: true,
      completed_at: true,
    },
  });

  return rows.map(mapRow);
}

export async function listActiveUserLicenseClasses(
  userId: string,
): Promise<readonly UserLicenseClassRecord[]> {
  const rows = await prisma.user_license_classes.findMany({
    where: {
      user_id: userId,
      status: "active",
    },
    orderBy: [
      { is_primary: "desc" },
      { created_at: "asc" },
    ],
    select: {
      id: true,
      user_id: true,
      license_class_code: true,
      status: true,
      is_primary: true,
      started_at: true,
      target_exam_date: true,
      completed_at: true,
    },
  });

  return rows.map(mapRow);
}

export async function findPrimaryActiveUserLicenseClass(
  userId: string,
): Promise<UserLicenseClassRecord | null> {
  const row = await prisma.user_license_classes.findFirst({
    where: {
      user_id: userId,
      status: "active",
      is_primary: true,
    },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      user_id: true,
      license_class_code: true,
      status: true,
      is_primary: true,
      started_at: true,
      target_exam_date: true,
      completed_at: true,
    },
  });

  return row ? mapRow(row) : null;
}

export async function activateUserLicenseClasses(
  input: {
    userId: string;
    licenseClassCodes: readonly string[];
    primaryLicenseClassCode?: string | null;
  },
): Promise<readonly UserLicenseClassRecord[]> {
  const uniqueCodes = [...new Set(
    input.licenseClassCodes
      .map((code) => code.trim().toUpperCase())
      .filter(Boolean),
  )];

  if (uniqueCodes.length === 0) {
    return listActiveUserLicenseClasses(input.userId);
  }

  return prisma.$transaction(async (tx) => {
    const existingPrimary = await tx.user_license_classes.findFirst({
      where: {
        user_id: input.userId,
        status: "active",
        is_primary: true,
      },
      select: { license_class_code: true },
    });

    const requestedPrimary =
      input.primaryLicenseClassCode?.trim().toUpperCase() ?? null;

    const primaryCode =
      requestedPrimary && uniqueCodes.includes(requestedPrimary)
        ? requestedPrimary
        : existingPrimary?.license_class_code ?? uniqueCodes[0];

    // Keep exactly one primary class for the user, even if an older class
    // is completed/inactive but was previously marked primary.
    await tx.user_license_classes.updateMany({
      where: {
        user_id: input.userId,
        is_primary: true,
        license_class_code: { not: primaryCode },
      },
      data: { is_primary: false },
    });

    for (const code of uniqueCodes) {
      await tx.user_license_classes.upsert({
        where: {
          user_id_license_class_code: {
            user_id: input.userId,
            license_class_code: code,
          },
        },
        create: {
          user_id: input.userId,
          license_class_code: code,
          status: "active",
          is_primary: code === primaryCode,
          started_at: new Date(),
          completed_at: null,
        },
        update: {
          status: "active",
          is_primary: code === primaryCode,
          completed_at: null,
        },
      });
    }

    const rows = await tx.user_license_classes.findMany({
      where: {
        user_id: input.userId,
        status: "active",
      },
      orderBy: [
        { is_primary: "desc" },
        { created_at: "asc" },
      ],
      select: {
        id: true,
        user_id: true,
        license_class_code: true,
        status: true,
        is_primary: true,
        started_at: true,
        target_exam_date: true,
        completed_at: true,
      },
    });

    return rows.map(mapRow);
  });
}

export async function setPrimaryUserLicenseClass(
  input: {
    userId: string;
    licenseClassCode: string;
  },
): Promise<UserLicenseClassRecord> {
  const code = input.licenseClassCode.trim().toUpperCase();

  return prisma.$transaction(async (tx) => {
    const target = await tx.user_license_classes.findUnique({
      where: {
        user_id_license_class_code: {
          user_id: input.userId,
          license_class_code: code,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!target || target.status !== "active") {
      throw new Error(
        "[Express-Führerschein] Die Führerscheinklasse ist nicht aktiv.",
      );
    }

    await tx.user_license_classes.updateMany({
      where: {
        user_id: input.userId,
        is_primary: true,
      },
      data: { is_primary: false },
    });

    const row = await tx.user_license_classes.update({
      where: { id: target.id },
      data: { is_primary: true },
      select: {
        id: true,
        user_id: true,
        license_class_code: true,
        status: true,
        is_primary: true,
        started_at: true,
        target_exam_date: true,
        completed_at: true,
      },
    });

    return mapRow(row);
  });
}
