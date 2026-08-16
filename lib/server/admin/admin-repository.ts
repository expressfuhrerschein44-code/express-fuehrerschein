import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  AdminDashboardData,
} from "@/types/admin";

export async function findAdminLoginRecordByEmail(
  email: string,
) {
  return prisma.admin_users.findFirst({
    where: {
      email: {
        equals:
          email,
        mode:
          "insensitive",
      },
    },
    select: {
      id:
        true,
      email:
        true,
      password_hash:
        true,
      first_name:
        true,
      last_name:
        true,
      role:
        true,
      is_active:
        true,
    },
  });
}

export async function createAdminSessionRecord(
  input: {
    adminId: string;
    tokenHash: string;
    expiresAt: Date;
    ipHash?: string | null;
    userAgent?: string | null;
  },
) {
  return prisma.admin_sessions.create({
    data: {
      admin_id:
        input.adminId,
      token_hash:
        input.tokenHash,
      expires_at:
        input.expiresAt,
      ip_hash:
        input.ipHash ??
        null,
      user_agent:
        input.userAgent
          ?.slice(
            0,
            512,
          ) ??
        null,
      last_seen_at:
        new Date(),
    },
    select: {
      id:
        true,
      expires_at:
        true,
    },
  });
}

export async function findAdminSessionRecordByTokenHash(
  tokenHash: string,
) {
  return prisma.admin_sessions.findUnique({
    where: {
      token_hash:
        tokenHash,
    },
    select: {
      id:
        true,
      expires_at:
        true,
      revoked_at:
        true,
      last_seen_at:
        true,
      admin: {
        select: {
          id:
            true,
          email:
            true,
          first_name:
            true,
          last_name:
            true,
          role:
            true,
          is_active:
            true,
        },
      },
    },
  });
}

export async function touchAdminSession(
  input: {
    sessionId: string;
    adminId: string;
  },
): Promise<void> {
  const now =
    new Date();

  await prisma.$transaction([
    prisma.admin_sessions.updateMany({
      where: {
        id:
          input.sessionId,
        revoked_at:
          null,
      },
      data: {
        last_seen_at:
          now,
      },
    }),

    prisma.admin_users.updateMany({
      where: {
        id:
          input.adminId,
        is_active:
          true,
      },
      data: {
        last_seen_at:
          now,
      },
    }),
  ]);
}

export async function markAdminLoginSuccess(
  adminId: string,
): Promise<void> {
  const now =
    new Date();

  await prisma.admin_users.update({
    where: {
      id:
        adminId,
    },
    data: {
      last_login_at:
        now,
      last_seen_at:
        now,
    },
  });
}

export async function revokeAdminSessionByTokenHash(
  tokenHash: string,
) {
  const current =
    await prisma.admin_sessions.findUnique({
      where: {
        token_hash:
          tokenHash,
      },
      select: {
        id:
          true,
        admin_id:
          true,
        revoked_at:
          true,
      },
    });

  if (!current) {
    return null;
  }

  if (!current.revoked_at) {
    await prisma.admin_sessions.update({
      where: {
        id:
          current.id,
      },
      data: {
        revoked_at:
          new Date(),
      },
    });
  }

  return {
    sessionId:
      current.id,
    adminId:
      current.admin_id,
  };
}

export async function getAdminDashboardData(
  adminId: string,
): Promise<AdminDashboardData> {
  const now =
    new Date();

  const [
    users,
    submittedApplications,
    paymentsToReview,
    documentsToReview,
    openConversations,
    upcomingAppointments,
    openTheoryReports,
    unreadAdminNotifications,
    recentAudit,
  ] =
    await Promise.all([
      prisma.users.count(),

      prisma.driving_license_applications.count({
        where: {
          submitted_at: {
            not:
              null,
          },
          status: {
            not:
              "draft",
          },
        },
      }),

      prisma.payments.count({
        where: {
          status: {
            in: [
              "proof_submitted",
              "under_review",
            ],
          },
        },
      }),

      prisma.user_documents.count({
        where: {
          deleted_at:
            null,
          status: {
            in: [
              "uploaded",
              "pending",
              "under_review",
            ],
          },
        },
      }),

      prisma.conversations.count({
        where: {
          status:
            "open",
        },
      }),

      prisma.user_appointments.count({
        where: {
          starts_at: {
            gte:
              now,
          },
          status: {
            not:
              "cancelled",
          },
        },
      }),

      prisma.theory_question_reports.count({
        where: {
          status:
            "open",
        },
      }),

      prisma.admin_notifications.count({
        where: {
          read_at:
            null,
          OR: [
            {
              admin_id:
                adminId,
            },
            {
              admin_id:
                null,
            },
          ],
        },
      }),

      prisma.admin_audit_logs.findMany({
        where: {
          admin_id:
            adminId,
        },
        take:
          6,
        orderBy: {
          created_at:
            "desc",
        },
        select: {
          id:
            true,
          action:
            true,
          entity_type:
            true,
          entity_id:
            true,
          created_at:
            true,
        },
      }),
    ]);

  return {
    stats: {
      users,
      submittedApplications,
      paymentsToReview,
      documentsToReview,
      openConversations,
      upcomingAppointments,
      openTheoryReports,
      unreadAdminNotifications,
    },
    recentAudit:
      recentAudit.map(
        (
          item,
        ) => ({
          id:
            item.id,
          action:
            item.action,
          entityType:
            item.entity_type,
          entityId:
            item.entity_id,
          createdAt:
            item.created_at,
        }),
      ),
  };
}
