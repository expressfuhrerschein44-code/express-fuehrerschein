/**
 * Express-Führerschein
 * Prisma repository for the back-office driving-license application module.
 *
 * This file is the persistence boundary of the module.
 */

import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";
import type {
  AdminApplicationReviewAction,
  AdminApplicationViewStatus,
  AdminApplicationsQuery,
} from "@/types/admin-applications";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function statusWhere(
  status: AdminApplicationViewStatus | "all",
): Prisma.driving_license_applicationsWhereInput | null {
  switch (status) {
    case "draft":
      return { status: "draft" };

    case "submitted":
      return {
        reviewed_at: null,
        approved_at: null,
        rejected_at: null,
        OR: [
          { submitted_at: { not: null } },
          { status: { not: "draft" } },
        ],
      };

    case "under_review":
      return {
        reviewed_at: { not: null },
        approved_at: null,
        rejected_at: null,
      };

    case "approved":
      return { approved_at: { not: null } };

    case "rejected":
      return { rejected_at: { not: null } };

    case "other":
      return {
        submitted_at: null,
        reviewed_at: null,
        approved_at: null,
        rejected_at: null,
        status: { not: "draft" },
      };

    case "all":
    default:
      return null;
  }
}

function buildApplicationsWhere(
  query: Pick<AdminApplicationsQuery, "search" | "status" | "licenseClass">,
): Prisma.driving_license_applicationsWhereInput {
  const and: Prisma.driving_license_applicationsWhereInput[] = [];

  const state = statusWhere(query.status);
  if (state) and.push(state);

  if (query.licenseClass) {
    and.push({ selected_classes: { has: query.licenseClass } });
  }

  if (query.search) {
    const searchOr: Prisma.driving_license_applicationsWhereInput[] = [
      {
        application_reference: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        users: {
          is: {
            first_name: { contains: query.search, mode: "insensitive" },
          },
        },
      },
      {
        users: {
          is: {
            last_name: { contains: query.search, mode: "insensitive" },
          },
        },
      },
      {
        users: {
          is: {
            email: { contains: query.search, mode: "insensitive" },
          },
        },
      },
    ];

    if (UUID_PATTERN.test(query.search)) {
      searchOr.push({ id: query.search });
    }

    and.push({ OR: searchOr });
  }

  return and.length > 0 ? { AND: and } : {};
}

export async function findAdminSessionByTokenHash(tokenHash: string) {
  return prisma.admin_sessions.findUnique({
    where: { token_hash: tokenHash },
    select: {
      id: true,
      admin_id: true,
      expires_at: true,
      revoked_at: true,
      last_seen_at: true,
      admin: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          role: true,
          is_active: true,
        },
      },
    },
  });
}

export async function touchAdminSession(
  sessionId: string,
  adminId: string,
  now: Date,
): Promise<void> {
  await prisma.$transaction([
    prisma.admin_sessions.updateMany({
      where: {
        id: sessionId,
        revoked_at: null,
        expires_at: { gt: now },
      },
      data: { last_seen_at: now },
    }),
    prisma.admin_users.updateMany({
      where: { id: adminId, is_active: true },
      data: { last_seen_at: now },
    }),
  ]);
}

export async function listAdminApplications(query: AdminApplicationsQuery) {
  const where = buildApplicationsWhere(query);
  const skip = (query.page - 1) * query.pageSize;

  const [rows, total] = await prisma.$transaction([
    prisma.driving_license_applications.findMany({
      where,
      orderBy: [
        { submitted_at: "desc" },
        { created_at: "desc" },
      ],
      skip,
      take: query.pageSize,
      select: {
        id: true,
        user_id: true,
        application_reference: true,
        selected_classes: true,
        total_cents: true,
        currency: true,
        status: true,
        submitted_at: true,
        reviewed_at: true,
        approved_at: true,
        rejected_at: true,
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            country_code: true,
          },
        },
        _count: {
          select: { documents: true },
        },
      },
    }),
    prisma.driving_license_applications.count({ where }),
  ]);

  return { rows, total };
}

export async function getAdminApplicationsStats() {
  const submittedBase: Prisma.driving_license_applicationsWhereInput = {
    OR: [
      { submitted_at: { not: null } },
      { status: { not: "draft" } },
    ],
  };

  const [total, newCount, underReview, approved, rejected] =
    await prisma.$transaction([
      prisma.driving_license_applications.count(),
      prisma.driving_license_applications.count({
        where: {
          ...submittedBase,
          reviewed_at: null,
          approved_at: null,
          rejected_at: null,
        },
      }),
      prisma.driving_license_applications.count({
        where: {
          reviewed_at: { not: null },
          approved_at: null,
          rejected_at: null,
        },
      }),
      prisma.driving_license_applications.count({
        where: { approved_at: { not: null } },
      }),
      prisma.driving_license_applications.count({
        where: { rejected_at: { not: null } },
      }),
    ]);

  return { total, newCount, underReview, approved, rejected };
}

export async function findAdminApplicationById(applicationId: string) {
  return prisma.driving_license_applications.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      user_id: true,
      application_reference: true,
      selected_classes: true,
      theory_passed: true,
      practical_passed: true,
      classes_total_cents: true,
      processing_fee_cents: true,
      total_cents: true,
      currency: true,
      signature_type: true,
      signature_path: true,
      status: true,
      submitted_at: true,
      reviewed_by_admin_id: true,
      reviewed_at: true,
      approved_at: true,
      rejected_at: true,
      rejection_reason: true,
      created_at: true,
      updated_at: true,
      users: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_e164: true,
          country_code: true,
        },
      },
      reviewed_by_admin: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
      documents: {
        orderBy: [{ document_type: "asc" }, { created_at: "asc" }],
        select: {
          id: true,
          document_type: true,
          original_filename: true,
          mime_type: true,
          file_size_bytes: true,
          created_at: true,
        },
      },
    },
  });
}

export async function applyAdminApplicationReview(input: {
  applicationId: string;
  adminId: string;
  action: AdminApplicationReviewAction;
  reason: string | null;
  userAgent: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.driving_license_applications.findUnique({
      where: { id: input.applicationId },
      select: {
        id: true,
        user_id: true,
        status: true,
        reviewed_at: true,
        approved_at: true,
        rejected_at: true,
        rejection_reason: true,
      },
    });

    if (!existing) return null;

    const now = new Date();
    const common = {
      reviewed_by_admin_id: input.adminId,
      reviewed_at: now,
    };

    const data =
      input.action === "approve"
        ? {
            ...common,
            approved_at: now,
            rejected_at: null,
            rejection_reason: null,
          }
        : input.action === "reject"
          ? {
              ...common,
              approved_at: null,
              rejected_at: now,
              rejection_reason: input.reason,
            }
          : {
              ...common,
            };

    /*
     * Important: the module deliberately does not write to the application
     * `status` column. PostgreSQL may enforce a CHECK constraint that is not
     * represented by Prisma. Review state is derived from the dedicated
     * reviewed/approved/rejected timestamps already present in the schema.
     */
    const updated = await tx.driving_license_applications.update({
      where: { id: input.applicationId },
      data,
      select: {
        id: true,
        status: true,
        reviewed_at: true,
        approved_at: true,
        rejected_at: true,
        rejection_reason: true,
      },
    });

    const auditAction =
      input.action === "approve"
        ? "application.approved"
        : input.action === "reject"
          ? "application.rejected"
          : "application.review_started";

    await tx.admin_audit_logs.create({
      data: {
        admin_id: input.adminId,
        target_user_id: existing.user_id,
        action: auditAction,
        entity_type: "driving_license_application",
        entity_id: existing.id,
        user_agent: input.userAgent?.slice(0, 512) ?? null,
        metadata: {
          action: input.action,
          reason: input.reason,
          previousRawStatus: existing.status,
          previousReviewedAt: existing.reviewed_at?.toISOString() ?? null,
          previousApprovedAt: existing.approved_at?.toISOString() ?? null,
          previousRejectedAt: existing.rejected_at?.toISOString() ?? null,
        },
      },
    });

    return updated;
  });
}

export async function findAdminApplicationDocument(
  applicationId: string,
  documentId: string,
) {
  return prisma.application_documents.findFirst({
    where: {
      id: documentId,
      application_id: applicationId,
    },
    select: {
      id: true,
      application_id: true,
      storage_bucket: true,
      storage_path: true,
      original_filename: true,
      mime_type: true,
    },
  });
}

export async function findAdminApplicationSignature(applicationId: string) {
  return prisma.driving_license_applications.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      signature_type: true,
      signature_path: true,
    },
  });
}
