import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

export interface PaymentApplicationRecord {
  id: string;
  selectedClasses: string[];
  classesTotalCents: number;
  processingFeeCents: number;
  totalCents: number;
  currency: string;
  status: string;
  submittedAt: Date | null;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  applicationId: string;
  paymentStage: string | null;
  stageOrder: number;
  paymentReference: string | null;
  amountCents: number;
  currency: string;
  status: string;
  description: string | null;
  activatedAt: Date | null;
  dueAt: Date | null;
  bankDetailsSnapshot: unknown;
  proofStorageBucket: string | null;
  proofStoragePath: string | null;
  proofOriginalFilename: string | null;
  proofMimeType: string | null;
  proofFileSizeBytes: bigint | null;
  proofSubmittedAt: Date | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentsRepositorySnapshot {
  application: PaymentApplicationRecord | null;
  payments: PaymentRecord[];
}

function mapApplication(
  application: {
    id: string;
    selected_classes: string[];
    classes_total_cents: number;
    processing_fee_cents: number;
    total_cents: number;
    currency: string;
    status: string;
    submitted_at: Date | null;
  },
): PaymentApplicationRecord {
  return {
    id:
      application.id,
    selectedClasses:
      application.selected_classes,
    classesTotalCents:
      application.classes_total_cents,
    processingFeeCents:
      application.processing_fee_cents,
    totalCents:
      application.total_cents,
    currency:
      application.currency,
    status:
      application.status,
    submittedAt:
      application.submitted_at,
  };
}

function mapPayment(
  payment: {
    id: string;
    user_id: string;
    application_id: string | null;
    payment_stage: string | null;
    stage_order: number;
    payment_reference: string | null;
    amount_cents: number;
    currency: string;
    status: string;
    description: string | null;
    activated_at: Date | null;
    due_at: Date | null;
    bank_details_snapshot: unknown;
    proof_storage_bucket: string | null;
    proof_storage_path: string | null;
    proof_original_filename: string | null;
    proof_mime_type: string | null;
    proof_file_size_bytes: bigint | null;
    proof_submitted_at: Date | null;
    reviewed_at: Date | null;
    rejection_reason: string | null;
    paid_at: Date | null;
    created_at: Date;
    updated_at: Date;
  },
): PaymentRecord | null {
  if (!payment.application_id) {
    return null;
  }

  return {
    id:
      payment.id,
    userId:
      payment.user_id,
    applicationId:
      payment.application_id,
    paymentStage:
      payment.payment_stage,
    stageOrder:
      payment.stage_order,
    paymentReference:
      payment.payment_reference,
    amountCents:
      payment.amount_cents,
    currency:
      payment.currency,
    status:
      payment.status,
    description:
      payment.description,
    activatedAt:
      payment.activated_at,
    dueAt:
      payment.due_at,
    bankDetailsSnapshot:
      payment.bank_details_snapshot,
    proofStorageBucket:
      payment.proof_storage_bucket,
    proofStoragePath:
      payment.proof_storage_path,
    proofOriginalFilename:
      payment.proof_original_filename,
    proofMimeType:
      payment.proof_mime_type,
    proofFileSizeBytes:
      payment.proof_file_size_bytes,
    proofSubmittedAt:
      payment.proof_submitted_at,
    reviewedAt:
      payment.reviewed_at,
    rejectionReason:
      payment.rejection_reason,
    paidAt:
      payment.paid_at,
    createdAt:
      payment.created_at,
    updatedAt:
      payment.updated_at,
  };
}

export async function findLatestSubmittedApplicationForUser(
  userId: string,
): Promise<PaymentApplicationRecord | null> {
  const application =
    await prisma.driving_license_applications.findFirst({
      where: {
        user_id:
          userId,
        submitted_at: {
          not:
            null,
        },
      },
      select: {
        id:
          true,
        selected_classes:
          true,
        classes_total_cents:
          true,
        processing_fee_cents:
          true,
        total_cents:
          true,
        currency:
          true,
        status:
          true,
        submitted_at:
          true,
      },
      orderBy: [
        {
          submitted_at:
            "desc",
        },
        {
          updated_at:
            "desc",
        },
      ],
    });

  return application
    ? mapApplication(
        application,
      )
    : null;
}

export async function listVisibleApplicationPayments(
  input: {
    userId: string;
    applicationId: string;
  },
): Promise<PaymentRecord[]> {
  const rows =
    await prisma.payments.findMany({
      where: {
        user_id:
          input.userId,
        application_id:
          input.applicationId,
        activated_at: {
          not:
            null,
        },
        NOT: {
          status:
            "draft",
        },
      },
      select: {
        id:
          true,
        user_id:
          true,
        application_id:
          true,
        payment_stage:
          true,
        stage_order:
          true,
        payment_reference:
          true,
        amount_cents:
          true,
        currency:
          true,
        status:
          true,
        description:
          true,
        activated_at:
          true,
        due_at:
          true,
        bank_details_snapshot:
          true,
        proof_storage_bucket:
          true,
        proof_storage_path:
          true,
        proof_original_filename:
          true,
        proof_mime_type:
          true,
        proof_file_size_bytes:
          true,
        proof_submitted_at:
          true,
        reviewed_at:
          true,
        rejection_reason:
          true,
        paid_at:
          true,
        created_at:
          true,
        updated_at:
          true,
      },
      orderBy: [
        {
          stage_order:
            "asc",
        },
        {
          activated_at:
            "asc",
        },
        {
          created_at:
            "asc",
        },
      ],
    });

  return rows
    .map(
      mapPayment,
    )
    .filter(
      (
        payment,
      ): payment is PaymentRecord =>
        payment !==
        null,
    );
}

export async function getPaymentsRepositorySnapshot(
  userId: string,
): Promise<PaymentsRepositorySnapshot> {
  const application =
    await findLatestSubmittedApplicationForUser(
      userId,
    );

  if (!application) {
    return {
      application:
        null,
      payments:
        [],
    };
  }

  const payments =
    await listVisibleApplicationPayments({
      userId,
      applicationId:
        application.id,
    });

  return {
    application,
    payments,
  };
}

export async function findVisiblePaymentForUser(
  input: {
    userId: string;
    paymentId: string;
  },
): Promise<PaymentRecord | null> {
  const row =
    await prisma.payments.findFirst({
      where: {
        id:
          input.paymentId,
        user_id:
          input.userId,
        application_id: {
          not:
            null,
        },
        activated_at: {
          not:
            null,
        },
        NOT: {
          status:
            "draft",
        },
      },
      select: {
        id:
          true,
        user_id:
          true,
        application_id:
          true,
        payment_stage:
          true,
        stage_order:
          true,
        payment_reference:
          true,
        amount_cents:
          true,
        currency:
          true,
        status:
          true,
        description:
          true,
        activated_at:
          true,
        due_at:
          true,
        bank_details_snapshot:
          true,
        proof_storage_bucket:
          true,
        proof_storage_path:
          true,
        proof_original_filename:
          true,
        proof_mime_type:
          true,
        proof_file_size_bytes:
          true,
        proof_submitted_at:
          true,
        reviewed_at:
          true,
        rejection_reason:
          true,
        paid_at:
          true,
        created_at:
          true,
        updated_at:
          true,
      },
    });

  return row
    ? mapPayment(
        row,
      )
    : null;
}

export async function findPaymentApplicationForUser(
  input: {
    userId: string;
    applicationId: string;
  },
): Promise<PaymentApplicationRecord | null> {
  const application =
    await prisma.driving_license_applications.findFirst({
      where: {
        id:
          input.applicationId,
        user_id:
          input.userId,
        submitted_at: {
          not:
            null,
        },
      },
      select: {
        id:
          true,
        selected_classes:
          true,
        classes_total_cents:
          true,
        processing_fee_cents:
          true,
        total_cents:
          true,
        currency:
          true,
        status:
          true,
        submitted_at:
          true,
      },
    });

  return application
    ? mapApplication(
        application,
      )
    : null;
}

export async function savePaymentProofMetadata(
  input: {
    userId: string;
    paymentId: string;
    storageBucket: string;
    storagePath: string;
    originalFilename: string;
    mimeType: string;
    fileSizeBytes: bigint;
    submittedAt: Date;
  },
): Promise<boolean> {
  const result =
    await prisma.payments.updateMany({
      where: {
        id:
          input.paymentId,
        user_id:
          input.userId,
        activated_at: {
          not:
            null,
        },
        status: {
          in: [
            "awaiting_payment",
            "rejected",
          ],
        },
      },
      data: {
        proof_storage_bucket:
          input.storageBucket,
        proof_storage_path:
          input.storagePath,
        proof_original_filename:
          input.originalFilename,
        proof_mime_type:
          input.mimeType,
        proof_file_size_bytes:
          input.fileSizeBytes,
        proof_submitted_at:
          input.submittedAt,
        status:
          "proof_submitted",
        reviewed_at:
          null,
        rejection_reason:
          null,
      },
    });

  return result.count ===
    1;
}
