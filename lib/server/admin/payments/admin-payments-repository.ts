/**
 * Express-Führerschein
 * Admin payments repository.
 *
 * This is the only file in the admin payments feature that talks directly
 * to Prisma. Business rules stay in admin-payments-service.ts.
 */

import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/server/prisma";

import type {
  AdminPaymentListStatusFilter,
} from "@/types/admin-payments";

export class AdminPaymentsRepositoryError extends Error {
  constructor(
    public readonly code:
      | "NOT_FOUND"
      | "CONFLICT"
      | "APPLICATION_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "AdminPaymentsRepositoryError";
  }
}

const clientSelect = {
  id: true,
  first_name: true,
  last_name: true,
  email: true,
} satisfies Prisma.usersSelect;

const applicationSelect = {
  id: true,
  user_id: true,
  application_reference: true,
  selected_classes: true,
  classes_total_cents: true,
  processing_fee_cents: true,
  total_cents: true,
  currency: true,
  status: true,
  submitted_at: true,
} satisfies Prisma.driving_license_applicationsSelect;

const paymentListSelect = {
  id: true,
  user_id: true,
  application_id: true,
  payment_stage: true,
  stage_order: true,
  payment_reference: true,
  amount_cents: true,
  currency: true,
  status: true,
  proof_storage_path: true,
  proof_submitted_at: true,
  due_at: true,
  activated_at: true,
  paid_at: true,
  created_at: true,
  updated_at: true,
  users: {
    select: clientSelect,
  },
  application: {
    select: applicationSelect,
  },
} satisfies Prisma.paymentsSelect;

const paymentDetailSelect = {
  id: true,
  user_id: true,
  subscription_id: true,
  application_id: true,
  provider: true,
  payment_stage: true,
  stage_order: true,
  payment_reference: true,
  amount_cents: true,
  currency: true,
  status: true,
  description: true,
  activated_by_admin_id: true,
  reviewed_by_admin_id: true,
  activated_at: true,
  due_at: true,
  bank_details_snapshot: true,
  proof_storage_bucket: true,
  proof_storage_path: true,
  proof_original_filename: true,
  proof_mime_type: true,
  proof_file_size_bytes: true,
  proof_submitted_at: true,
  reviewed_at: true,
  rejection_reason: true,
  paid_at: true,
  refunded_at: true,
  created_at: true,
  updated_at: true,
  users: {
    select: clientSelect,
  },
  application: {
    select: applicationSelect,
  },
} satisfies Prisma.paymentsSelect;

export type AdminPaymentListRow =
  Prisma.paymentsGetPayload<{
    select: typeof paymentListSelect;
  }>;

export type AdminPaymentDetailRow =
  Prisma.paymentsGetPayload<{
    select: typeof paymentDetailSelect;
  }>;

export interface AdminPaymentRepositoryAuditContext {
  ipHash: string | null;
  userAgent: string | null;
}

export interface CreatePaymentPersistenceInput {
  userId: string;
  applicationId: string;
  provider: string;
  paymentStage: string;
  stageOrder: number;
  paymentReference: string;
  amountCents: number;
  currency: string;
  status: "draft" | "awaiting_payment";
  description: string | null;
  activatedByAdminId: string | null;
  activatedAt: Date | null;
  dueAt: Date | null;
  bankDetailsSnapshot: Prisma.InputJsonValue;
}

export interface UpdateDraftPaymentPersistenceInput {
  paymentStage: string;
  stageOrder: number;
  paymentReference: string;
  amountCents: number;
  description: string | null;
  dueAt: Date | null;
  bankDetailsSnapshot: Prisma.InputJsonValue;
}

function buildPaymentsWhere(
  query: string,
  status: AdminPaymentListStatusFilter,
): Prisma.paymentsWhereInput {
  const and: Prisma.paymentsWhereInput[] = [
    {
      application_id: {
        not: null,
      },
    },
  ];

  if (query) {
    and.push({
      OR: [
        {
          payment_reference: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          payment_stage: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          users: {
            is: {
              OR: [
                {
                  first_name: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  last_name: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        },
        {
          application: {
            is: {
              application_reference: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        },
      ],
    });
  }

  if (status === "to_review") {
    and.push({
      status: {
        in: ["proof_submitted", "under_review"],
      },
    });
  } else if (status !== "all") {
    and.push({ status });
  }

  if (and.length === 0) {
    return {};
  }

  if (and.length === 1) {
    return and[0] ?? {};
  }

  return { AND: and };
}

export async function findActiveAdminActorByTokenHashes(
  tokenHashes: readonly string[],
): Promise<{
  id: string;
  email: string;
  role: string;
} | null> {
  const hashes = Array.from(
    new Set(
      tokenHashes
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ).slice(0, 64);

  if (hashes.length === 0) {
    return null;
  }

  const now = new Date();

  const session = await prisma.admin_sessions.findFirst({
    where: {
      token_hash: {
        in: hashes,
      },
      revoked_at: null,
      expires_at: {
        gt: now,
      },
      admin: {
        is: {
          is_active: true,
        },
      },
    },
    select: {
      id: true,
      last_seen_at: true,
      admin: {
        select: {
          id: true,
          email: true,
          role: true,
          is_active: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  if (!session || !session.admin.is_active) {
    return null;
  }

  const shouldTouch =
    !session.last_seen_at ||
    now.getTime() - session.last_seen_at.getTime() >=
      5 * 60 * 1000;

  if (shouldTouch) {
    await prisma.admin_sessions
      .updateMany({
        where: {
          id: session.id,
          revoked_at: null,
          expires_at: {
            gt: now,
          },
        },
        data: {
          last_seen_at: now,
        },
      })
      .catch(() => undefined);

    await prisma.admin_users
      .updateMany({
        where: {
          id: session.admin.id,
          is_active: true,
        },
        data: {
          last_seen_at: now,
        },
      })
      .catch(() => undefined);
  }

  return {
    id: session.admin.id,
    email: session.admin.email,
    role: session.admin.role,
  };
}

export async function listAdminPayments(input: {
  query: string;
  status: AdminPaymentListStatusFilter;
  take?: number;
}): Promise<AdminPaymentListRow[]> {
  const take = Math.min(
    200,
    Math.max(1, input.take ?? 100),
  );

  return prisma.payments.findMany({
    where: buildPaymentsWhere(
      input.query,
      input.status,
    ),
    select: paymentListSelect,
    orderBy: [
      { updated_at: "desc" },
      { created_at: "desc" },
    ],
    take,
  });
}

export async function getAdminPaymentStatusCounts(): Promise<
  Array<{ status: string; count: number }>
> {
  const rows = await prisma.payments.groupBy({
    by: ["status"],
    where: {
      application_id: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
  });

  return rows.map((row) => ({
    status: row.status,
    count: row._count._all,
  }));
}

export async function listApplicationsForPaymentCreation(
  take = 150,
) {
  return prisma.driving_license_applications.findMany({
    where: {
      submitted_at: {
        not: null,
      },
      status: {
        notIn: ["draft", "cancelled"],
      },
    },
    select: {
      ...applicationSelect,
      users: {
        select: clientSelect,
      },
      payments: {
        select: {
          stage_order: true,
        },
        orderBy: {
          stage_order: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      submitted_at: "desc",
    },
    take: Math.min(300, Math.max(1, take)),
  });
}

export async function findApplicationForPaymentCreation(
  applicationId: string,
) {
  return prisma.driving_license_applications.findFirst({
    where: {
      id: applicationId,
      submitted_at: {
        not: null,
      },
      status: {
        notIn: ["draft", "cancelled"],
      },
    },
    select: {
      ...applicationSelect,
      users: {
        select: clientSelect,
      },
      payments: {
        select: {
          stage_order: true,
        },
        orderBy: {
          stage_order: "desc",
        },
        take: 1,
      },
    },
  });
}

export async function findAdminPaymentById(
  paymentId: string,
): Promise<AdminPaymentDetailRow | null> {
  return prisma.payments.findFirst({
    where: {
      id: paymentId,
      application_id: {
        not: null,
      },
    },
    select: paymentDetailSelect,
  });
}

export async function createAdminPayment(input: {
  actorId: string;
  payment: CreatePaymentPersistenceInput;
  audit: AdminPaymentRepositoryAuditContext;
}): Promise<AdminPaymentDetailRow> {
  const createdId = await prisma.$transaction(
    async (tx) => {
      const created = await tx.payments.create({
        data: {
          user_id: input.payment.userId,
          application_id: input.payment.applicationId,
          provider: input.payment.provider,
          payment_stage: input.payment.paymentStage,
          stage_order: input.payment.stageOrder,
          payment_reference: input.payment.paymentReference,
          amount_cents: input.payment.amountCents,
          currency: input.payment.currency,
          status: input.payment.status,
          description: input.payment.description,
          activated_by_admin_id:
            input.payment.activatedByAdminId,
          activated_at: input.payment.activatedAt,
          due_at: input.payment.dueAt,
          bank_details_snapshot:
            input.payment.bankDetailsSnapshot,
        },
        select: {
          id: true,
        },
      });

      await tx.admin_audit_logs.create({
        data: {
          admin_id: input.actorId,
          target_user_id: input.payment.userId,
          action:
            input.payment.status === "awaiting_payment"
              ? "PAYMENT_CREATED_AND_ACTIVATED"
              : "PAYMENT_CREATED",
          entity_type: "payment",
          entity_id: created.id,
          metadata: {
            applicationId: input.payment.applicationId,
            paymentStage: input.payment.paymentStage,
            amountCents: input.payment.amountCents,
            currency: input.payment.currency,
            stageOrder: input.payment.stageOrder,
          },
          ip_hash: input.audit.ipHash,
          user_agent: input.audit.userAgent,
        },
      });

      if (input.payment.status === "awaiting_payment") {
        await tx.user_notifications.create({
          data: {
            user_id: input.payment.userId,
            type: "payment",
            title: "Neue Zahlung freigeschaltet",
            message:
              "Eine neue Zahlung wurde für deinen Führerscheinantrag freigeschaltet.",
            href: `/zahlungen/${created.id}`,
          },
        });
      }

      return created.id;
    },
  );

  const created = await findAdminPaymentById(createdId);

  if (!created) {
    throw new AdminPaymentsRepositoryError(
      "NOT_FOUND",
      "Le paiement créé est introuvable.",
    );
  }

  return created;
}

export async function updateDraftAdminPayment(input: {
  paymentId: string;
  actorId: string;
  update: UpdateDraftPaymentPersistenceInput;
  audit: AdminPaymentRepositoryAuditContext;
}): Promise<AdminPaymentDetailRow> {
  await prisma.$transaction(async (tx) => {
    const result = await tx.payments.updateMany({
      where: {
        id: input.paymentId,
        application_id: {
          not: null,
        },
        status: "draft",
      },
      data: {
        payment_stage: input.update.paymentStage,
        stage_order: input.update.stageOrder,
        payment_reference: input.update.paymentReference,
        amount_cents: input.update.amountCents,
        description: input.update.description,
        due_at: input.update.dueAt,
        bank_details_snapshot:
          input.update.bankDetailsSnapshot,
      },
    });

    if (result.count !== 1) {
      throw new AdminPaymentsRepositoryError(
        "CONFLICT",
        "Seul un paiement en brouillon peut être modifié.",
      );
    }

    const payment = await tx.payments.findUnique({
      where: { id: input.paymentId },
      select: {
        user_id: true,
      },
    });

    if (!payment) {
      throw new AdminPaymentsRepositoryError(
        "NOT_FOUND",
        "Paiement introuvable.",
      );
    }

    await tx.admin_audit_logs.create({
      data: {
        admin_id: input.actorId,
        target_user_id: payment.user_id,
        action: "PAYMENT_UPDATED",
        entity_type: "payment",
        entity_id: input.paymentId,
        metadata: {
          paymentStage: input.update.paymentStage,
          amountCents: input.update.amountCents,
          stageOrder: input.update.stageOrder,
        },
        ip_hash: input.audit.ipHash,
        user_agent: input.audit.userAgent,
      },
    });
  });

  const updated = await findAdminPaymentById(input.paymentId);

  if (!updated) {
    throw new AdminPaymentsRepositoryError(
      "NOT_FOUND",
      "Paiement introuvable.",
    );
  }

  return updated;
}

export async function activateDraftAdminPayment(input: {
  paymentId: string;
  actorId: string;
  bankDetailsSnapshot: Prisma.InputJsonValue;
  audit: AdminPaymentRepositoryAuditContext;
}): Promise<AdminPaymentDetailRow> {
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const result = await tx.payments.updateMany({
      where: {
        id: input.paymentId,
        application_id: {
          not: null,
        },
        status: "draft",
      },
      data: {
        status: "awaiting_payment",
        activated_at: now,
        activated_by_admin_id: input.actorId,
        bank_details_snapshot:
          input.bankDetailsSnapshot,
      },
    });

    if (result.count !== 1) {
      throw new AdminPaymentsRepositoryError(
        "CONFLICT",
        "Ce paiement ne peut plus être activé.",
      );
    }

    const payment = await tx.payments.findUnique({
      where: { id: input.paymentId },
      select: {
        user_id: true,
      },
    });

    if (!payment) {
      throw new AdminPaymentsRepositoryError(
        "NOT_FOUND",
        "Paiement introuvable.",
      );
    }

    await Promise.all([
      tx.admin_audit_logs.create({
        data: {
          admin_id: input.actorId,
          target_user_id: payment.user_id,
          action: "PAYMENT_ACTIVATED",
          entity_type: "payment",
          entity_id: input.paymentId,
          metadata: {
            activatedAt: now.toISOString(),
          },
          ip_hash: input.audit.ipHash,
          user_agent: input.audit.userAgent,
        },
      }),
      tx.user_notifications.create({
        data: {
          user_id: payment.user_id,
          type: "payment",
          title: "Neue Zahlung freigeschaltet",
          message:
            "Eine neue Zahlung wurde für deinen Führerscheinantrag freigeschaltet.",
          href: `/zahlungen/${input.paymentId}`,
        },
      }),
    ]);
  });

  const updated = await findAdminPaymentById(input.paymentId);

  if (!updated) {
    throw new AdminPaymentsRepositoryError(
      "NOT_FOUND",
      "Paiement introuvable.",
    );
  }

  return updated;
}

async function transitionPayment(input: {
  paymentId: string;
  actorId: string;
  fromStatuses: string[];
  toStatus: string;
  action: string;
  update: Prisma.paymentsUncheckedUpdateManyInput;
  audit: AdminPaymentRepositoryAuditContext;
  notification?: {
    title: string;
    message: string;
  };
  metadata?: Prisma.InputJsonValue;
}): Promise<AdminPaymentDetailRow> {
  await prisma.$transaction(async (tx) => {
    const result = await tx.payments.updateMany({
      where: {
        id: input.paymentId,
        application_id: {
          not: null,
        },
        status: {
          in: input.fromStatuses,
        },
      },
      data: {
        ...input.update,
        status: input.toStatus,
      },
    });

    if (result.count !== 1) {
      throw new AdminPaymentsRepositoryError(
        "CONFLICT",
        "Le statut actuel du paiement ne permet pas cette action.",
      );
    }

    const payment = await tx.payments.findUnique({
      where: { id: input.paymentId },
      select: {
        user_id: true,
      },
    });

    if (!payment) {
      throw new AdminPaymentsRepositoryError(
        "NOT_FOUND",
        "Paiement introuvable.",
      );
    }

    await tx.admin_audit_logs.create({
      data: {
        admin_id: input.actorId,
        target_user_id: payment.user_id,
        action: input.action,
        entity_type: "payment",
        entity_id: input.paymentId,
        metadata: input.metadata ?? {},
        ip_hash: input.audit.ipHash,
        user_agent: input.audit.userAgent,
      },
    });

    if (input.notification) {
      await tx.user_notifications.create({
        data: {
          user_id: payment.user_id,
          type: "payment",
          title: input.notification.title,
          message: input.notification.message,
          href: `/zahlungen/${input.paymentId}`,
        },
      });
    }
  });

  const updated = await findAdminPaymentById(input.paymentId);

  if (!updated) {
    throw new AdminPaymentsRepositoryError(
      "NOT_FOUND",
      "Paiement introuvable.",
    );
  }

  return updated;
}

export function markAdminPaymentUnderReview(input: {
  paymentId: string;
  actorId: string;
  audit: AdminPaymentRepositoryAuditContext;
}) {
  const now = new Date();

  return transitionPayment({
    paymentId: input.paymentId,
    actorId: input.actorId,
    fromStatuses: ["proof_submitted"],
    toStatus: "under_review",
    action: "PAYMENT_REVIEW_STARTED",
    update: {
      reviewed_at: now,
      reviewed_by_admin_id: input.actorId,
    },
    audit: input.audit,
    metadata: {
      reviewedAt: now.toISOString(),
    },
  });
}

export function confirmAdminPayment(input: {
  paymentId: string;
  actorId: string;
  audit: AdminPaymentRepositoryAuditContext;
}) {
  const now = new Date();

  return transitionPayment({
    paymentId: input.paymentId,
    actorId: input.actorId,
    fromStatuses: ["under_review"],
    toStatus: "paid",
    action: "PAYMENT_CONFIRMED",
    update: {
      reviewed_at: now,
      reviewed_by_admin_id: input.actorId,
      paid_at: now,
      rejection_reason: null,
    },
    audit: input.audit,
    notification: {
      title: "Zahlung bestätigt",
      message:
        "Deine Zahlung wurde bestätigt. Vielen Dank.",
    },
    metadata: {
      paidAt: now.toISOString(),
    },
  });
}

export function rejectAdminPayment(input: {
  paymentId: string;
  actorId: string;
  reason: string;
  audit: AdminPaymentRepositoryAuditContext;
}) {
  const now = new Date();

  return transitionPayment({
    paymentId: input.paymentId,
    actorId: input.actorId,
    fromStatuses: ["under_review"],
    toStatus: "rejected",
    action: "PAYMENT_REJECTED",
    update: {
      reviewed_at: now,
      reviewed_by_admin_id: input.actorId,
      rejection_reason: input.reason,
      paid_at: null,
    },
    audit: input.audit,
    notification: {
      title: "Zahlung nicht bestätigt",
      message:
        `Deine Zahlung konnte nicht bestätigt werden. Grund: ${input.reason}`,
    },
    metadata: {
      rejectedAt: now.toISOString(),
      reason: input.reason,
    },
  });
}

export function cancelAdminPayment(input: {
  paymentId: string;
  actorId: string;
  reason: string | null;
  audit: AdminPaymentRepositoryAuditContext;
}) {
  const now = new Date();

  return transitionPayment({
    paymentId: input.paymentId,
    actorId: input.actorId,
    fromStatuses: ["draft", "awaiting_payment"],
    toStatus: "cancelled",
    action: "PAYMENT_CANCELLED",
    update: {
      reviewed_at: now,
      reviewed_by_admin_id: input.actorId,
      rejection_reason: input.reason,
    },
    audit: input.audit,
    notification: {
      title: "Zahlung storniert",
      message: input.reason
        ? `Die Zahlung wurde storniert. Grund: ${input.reason}`
        : "Die Zahlung wurde storniert.",
    },
    metadata: {
      cancelledAt: now.toISOString(),
      reason: input.reason,
    },
  });
}

export async function listAdminPaymentAuditLogs(
  paymentId: string,
) {
  return prisma.admin_audit_logs.findMany({
    where: {
      entity_type: "payment",
      entity_id: paymentId,
    },
    select: {
      id: true,
      action: true,
      metadata: true,
      created_at: true,
      admin: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
    orderBy: {
      created_at: "asc",
    },
    take: 200,
  });
}
