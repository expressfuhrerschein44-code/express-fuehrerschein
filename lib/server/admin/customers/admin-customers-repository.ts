/**
 * Express-Führerschein
 * Admin customers repository.
 *
 * This file contains database reads only. It is the only file in the
 * Admin Customers feature that talks directly to Prisma.
 */

import "server-only";

import type {
  Prisma,
} from "@prisma/client";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  AdminCustomersQuery,
} from "@/types/admin-customers";

const customerListSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  phone_e164: true,
  country_code: true,
  status: true,
  email_verified_at: true,
  created_at: true,
  user_profile: {
    select: {
      last_seen_at: true,
    },
  },
  user_license_classes: {
    orderBy: [
      {
        is_primary: "desc",
      },
      {
        created_at: "asc",
      },
    ],
    select: {
      license_class_code: true,
      status: true,
      is_primary: true,
      learning_progress: {
        select: {
          readiness_score: true,
          last_activity_at: true,
        },
      },
    },
  },
  driving_license_applications: {
    orderBy: {
      updated_at: "desc",
    },
    take: 1,
    select: {
      id: true,
      application_reference: true,
      status: true,
      submitted_at: true,
      updated_at: true,
    },
  },
} satisfies Prisma.usersSelect;

const customerDetailSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
  phone_e164: true,
  country_code: true,
  accepted_terms_at: true,
  email_verified_at: true,
  status: true,
  created_at: true,
  updated_at: true,
  user_profile: {
    select: {
      preferred_locale: true,
      timezone: true,
      onboarding_completed_at: true,
      last_seen_at: true,
    },
  },
  user_license_classes: {
    orderBy: [
      {
        is_primary: "desc",
      },
      {
        created_at: "asc",
      },
    ],
    select: {
      id: true,
      license_class_code: true,
      status: true,
      is_primary: true,
      started_at: true,
      target_exam_date: true,
      completed_at: true,
      learning_progress: {
        select: {
          current_day: true,
          completed_days: true,
          completed_lessons: true,
          answered_questions: true,
          correct_answers: true,
          readiness_score: true,
          total_study_minutes: true,
          last_activity_at: true,
        },
      },
      exam_attempts: {
        where: {
          status: "completed",
        },
        orderBy: {
          started_at: "desc",
        },
        take: 50,
        select: {
          id: true,
          score_percent: true,
          passed: true,
          completed_at: true,
          started_at: true,
        },
      },
      training_sessions: {
        where: {
          completed_at: {
            not: null,
          },
        },
        orderBy: {
          started_at: "desc",
        },
        take: 50,
        select: {
          id: true,
          questions_answered: true,
          correct_answers: true,
          incorrect_answers: true,
          score_percent: true,
          duration_seconds: true,
          started_at: true,
          completed_at: true,
        },
      },
    },
  },
  driving_license_applications: {
    orderBy: {
      updated_at: "desc",
    },
    take: 20,
    select: {
      id: true,
      application_reference: true,
      selected_classes: true,
      theory_passed: true,
      practical_passed: true,
      classes_total_cents: true,
      processing_fee_cents: true,
      total_cents: true,
      currency: true,
      signature_type: true,
      status: true,
      submitted_at: true,
      reviewed_at: true,
      approved_at: true,
      rejected_at: true,
      rejection_reason: true,
      created_at: true,
      updated_at: true,
    },
  },
  user_appointments: {
    orderBy: {
      starts_at: "desc",
    },
    take: 30,
    select: {
      id: true,
      appointment_type: true,
      title: true,
      location: true,
      starts_at: true,
      ends_at: true,
      status: true,
      confirmed_at: true,
      cancelled_at: true,
      user_license_classes: {
        select: {
          license_class_code: true,
        },
      },
      managed_by_admin: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
    },
  },
  payments: {
    orderBy: [
      {
        created_at: "desc",
      },
      {
        stage_order: "desc",
      },
    ],
    take: 40,
    select: {
      id: true,
      application_id: true,
      payment_stage: true,
      stage_order: true,
      payment_reference: true,
      amount_cents: true,
      currency: true,
      status: true,
      description: true,
      activated_at: true,
      due_at: true,
      proof_submitted_at: true,
      reviewed_at: true,
      rejection_reason: true,
      paid_at: true,
      refunded_at: true,
      created_at: true,
    },
  },
  user_documents: {
    where: {
      deleted_at: null,
    },
    orderBy: {
      created_at: "desc",
    },
    take: 40,
    select: {
      id: true,
      document_type: true,
      title: true,
      original_filename: true,
      mime_type: true,
      file_size_bytes: true,
      status: true,
      rejection_reason: true,
      expires_on: true,
      uploaded_at: true,
      verified_at: true,
      rejected_at: true,
      created_at: true,
    },
  },
  application_documents: {
    orderBy: {
      created_at: "desc",
    },
    take: 40,
    select: {
      id: true,
      application_id: true,
      document_type: true,
      original_filename: true,
      mime_type: true,
      file_size_bytes: true,
      created_at: true,
    },
  },
} satisfies Prisma.usersSelect;

export type AdminCustomerListRow =
  Prisma.usersGetPayload<{
    select: typeof customerListSelect;
  }>;

export type AdminCustomerDetailRow =
  Prisma.usersGetPayload<{
    select: typeof customerDetailSelect;
  }>;

function buildCustomerWhere(
  query: AdminCustomersQuery,
): Prisma.usersWhereInput {
  const where: Prisma.usersWhereInput = {};

  if (query.search) {
    where.OR = [
      {
        first_name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        last_name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        phone_e164: {
          contains: query.search,
        },
      },
    ];
  }

  if (query.country) {
    where.country_code = query.country;
  }

  if (query.accountStatus) {
    where.status = query.accountStatus;
  }

  if (query.licenseClass) {
    where.user_license_classes = {
      some: {
        license_class_code: query.licenseClass,
      },
    };
  }

  if (query.applicationStatus) {
    where.driving_license_applications = {
      some: {
        status: query.applicationStatus,
      },
    };
  }

  return where;
}

export async function listAdminCustomersRepository(
  query: AdminCustomersQuery,
): Promise<{
  rows: AdminCustomerListRow[];
  total: number;
}> {
  const where = buildCustomerWhere(query);
  const skip = (query.page - 1) * query.pageSize;

  const [rows, total] = await prisma.$transaction([
    prisma.users.findMany({
      where,
      orderBy: [
        {
          created_at: "desc",
        },
        {
          last_name: "asc",
        },
      ],
      skip,
      take: query.pageSize,
      select: customerListSelect,
    }),
    prisma.users.count({
      where,
    }),
  ]);

  return {
    rows,
    total,
  };
}

export async function getAdminCustomersStatsRepository(): Promise<{
  total: number;
  active: number;
  pendingVerification: number;
  withApplications: number;
}> {
  const [
    total,
    active,
    pendingVerification,
    withApplications,
  ] = await prisma.$transaction([
    prisma.users.count(),
    prisma.users.count({
      where: {
        status: "active",
      },
    }),
    prisma.users.count({
      where: {
        status: "pending_verification",
      },
    }),
    prisma.users.count({
      where: {
        driving_license_applications: {
          some: {},
        },
      },
    }),
  ]);

  return {
    total,
    active,
    pendingVerification,
    withApplications,
  };
}

export async function getAdminCustomersFilterRowsRepository(): Promise<{
  countries: string[];
  accountStatuses: string[];
  licenseClasses: string[];
  applicationStatuses: string[];
}> {
  const [
    countriesRows,
    accountStatusRows,
    licenseClassRows,
    applicationStatusRows,
  ] = await prisma.$transaction([
    prisma.users.findMany({
      select: {
        country_code: true,
      },
      orderBy: {
        country_code: "asc",
      },
    }),
    prisma.users.findMany({
      select: {
        status: true,
      },
      orderBy: {
        status: "asc",
      },
    }),
    prisma.user_license_classes.findMany({
      select: {
        license_class_code: true,
      },
      orderBy: {
        license_class_code: "asc",
      },
    }),
    prisma.driving_license_applications.findMany({
      select: {
        status: true,
      },
      orderBy: {
        status: "asc",
      },
    }),
  ]);

  return {
    countries: countriesRows.map((row) => row.country_code),
    accountStatuses: accountStatusRows.map((row) => row.status),
    licenseClasses: licenseClassRows.map(
      (row) => row.license_class_code,
    ),
    applicationStatuses: applicationStatusRows.map(
      (row) => row.status,
    ),
  };
}

export async function findAdminCustomerDetailRepository(
  userId: string,
): Promise<AdminCustomerDetailRow | null> {
  return prisma.users.findUnique({
    where: {
      id: userId,
    },
    select: customerDetailSelect,
  });
}
