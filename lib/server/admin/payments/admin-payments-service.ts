/**
 * Express-Führerschein
 * Admin payments service.
 *
 * Business rules live here. Prisma access stays in the repository.
 */

import "server-only";

import { createHash } from "node:crypto";

import type { Prisma } from "@prisma/client";
import { cookies } from "next/headers";

import {
  activateDraftAdminPayment,
  cancelAdminPayment,
  confirmAdminPayment,
  createAdminPayment,
  findActiveAdminActorByTokenHashes,
  findAdminPaymentById,
  findApplicationForPaymentCreation,
  getAdminPaymentStatusCounts,
  listAdminPayments,
  listApplicationsForPaymentCreation,
  listAdminPaymentAuditLogs,
  markAdminPaymentUnderReview,
  rejectAdminPayment,
  updateDraftAdminPayment,
  AdminPaymentsRepositoryError,
} from "@/lib/server/admin/payments/admin-payments-repository";

import {
  AdminPaymentValidationError,
  assertUuid,
  parseBankDetails,
  parseCreateAdminPaymentInput,
  parseUpdateAdminPaymentInput,
} from "@/lib/server/admin/payments/admin-payments-validation";

import type {
  AdminPaymentActor,
  AdminPaymentApplication,
  AdminPaymentBankDetails,
  AdminPaymentClient,
  AdminPaymentCreationApplication,
  AdminPaymentDetail,
  AdminPaymentListItem,
  AdminPaymentListStatusFilter,
  AdminPaymentStatus,
  AdminPaymentTimelineItem,
  AdminPaymentsPageData,
  CreateAdminPaymentInput,
  UpdateAdminPaymentInput,
} from "@/types/admin-payments";

export type AdminPaymentsServiceErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "CONFIGURATION_ERROR";

export class AdminPaymentsServiceError extends Error {
  constructor(
    public readonly code: AdminPaymentsServiceErrorCode,
    message: string,
    public readonly status: number,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AdminPaymentsServiceError";
  }
}

export interface AdminPaymentAuditContext {
  ipHash: string | null;
  userAgent: string | null;
}

function hashSessionTokenCandidate(
  value: string,
): string {
  return createHash("sha256")
    .update(value)
    .digest("hex");
}

/**
 * Resolves the already-authenticated back-office session without assuming a
 * cookie name. The existing admin login stores only a SHA-256 token hash in
 * `admin_sessions`; therefore every request cookie can safely be hashed and
 * matched against the active admin session table. No raw token is persisted
 * or exposed by this feature.
 */
export async function requireAdminPaymentActor(): Promise<AdminPaymentActor> {
  const cookieStore = await cookies();

  const tokenHashes = Array.from(
    new Set(
      cookieStore
        .getAll()
        .map((cookie) => cookie.value.trim())
        .filter(Boolean)
        .map(hashSessionTokenCandidate),
    ),
  );

  const actor =
    await findActiveAdminActorByTokenHashes(
      tokenHashes,
    );

  if (!actor) {
    throw new AdminPaymentsServiceError(
      "UNAUTHENTICATED",
      "Une session administrateur active est requise.",
      401,
    );
  }

  return {
    id: actor.id,
    role: actor.role,
    email: actor.email,
  };
}

function mapClient(row: {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}): AdminPaymentClient {
  const fullName = `${row.first_name} ${row.last_name}`
    .replace(/\s+/g, " ")
    .trim();

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: fullName || row.email,
    email: row.email,
  };
}

function mapApplication(
  row:
    | {
        id: string;
        application_reference: string | null;
        selected_classes: string[];
        classes_total_cents: number;
        processing_fee_cents: number;
        total_cents: number;
        currency: string;
        status: string;
        submitted_at: Date | null;
      }
    | null,
): AdminPaymentApplication | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    reference: row.application_reference,
    selectedClasses: [...row.selected_classes],
    classesTotalCents: row.classes_total_cents,
    processingFeeCents: row.processing_fee_cents,
    totalCents: row.total_cents,
    currency: row.currency,
    status: row.status,
    submittedAt: row.submitted_at?.toISOString() ?? null,
  };
}

function normalizeStatus(value: string): AdminPaymentStatus {
  switch (value) {
    case "draft":
    case "awaiting_payment":
    case "proof_submitted":
    case "under_review":
    case "paid":
    case "rejected":
    case "cancelled":
      return value;
    default:
      // Older rows may still contain `pending`. They remain visible as drafts
      // instead of breaking the admin UI.
      return "draft";
  }
}

function mapListRow(
  row: Awaited<ReturnType<typeof listAdminPayments>>[number],
): AdminPaymentListItem {
  return {
    id: row.id,
    client: mapClient(row.users),
    application: mapApplication(row.application),
    stage: row.payment_stage ?? "Paiement",
    stageOrder: row.stage_order,
    reference: row.payment_reference,
    amountCents: row.amount_cents,
    currency: row.currency,
    status: normalizeStatus(row.status),
    hasProof: Boolean(row.proof_storage_path),
    proofSubmittedAt:
      row.proof_submitted_at?.toISOString() ?? null,
    dueAt: row.due_at?.toISOString() ?? null,
    activatedAt: row.activated_at?.toISOString() ?? null,
    paidAt: row.paid_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function parseBankSnapshot(
  value: Prisma.JsonValue | null,
): AdminPaymentBankDetails | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const record = value as Record<string, Prisma.JsonValue>;
  const text = (key: string): string => {
    const candidate = record[key];
    return typeof candidate === "string"
      ? candidate
      : "";
  };

  const result: AdminPaymentBankDetails = {
    accountHolder: text("accountHolder"),
    bankName: text("bankName"),
    iban: text("iban"),
    bic: text("bic"),
    country: text("country"),
    reference: text("reference"),
    instructions: text("instructions"),
  };

  const hasValue = Object.values(result).some(Boolean);
  return hasValue ? result : null;
}

type PaymentAuditRow = Awaited<
  ReturnType<typeof listAdminPaymentAuditLogs>
>[number];

function buildTimeline(
  row: {
    created_at: Date;
    activated_at: Date | null;
    proof_submitted_at: Date | null;
    reviewed_at: Date | null;
    paid_at: Date | null;
    status: string;
    rejection_reason: string | null;
  },
  auditRows?: PaymentAuditRow[],
): AdminPaymentTimelineItem[] {
  const items: AdminPaymentTimelineItem[] = [
    {
      key: "created",
      label: "Étape créée",
      description: "L’étape de paiement a été créée dans l’administration.",
      occurredAt: row.created_at.toISOString(),
      tone: "neutral",
    },
  ];

  if (auditRows && auditRows.length > 0) {
    const labels: Record<
      string,
      { label: string; tone: AdminPaymentTimelineItem["tone"] }
    > = {
      PAYMENT_CREATED: { label: "Étape créée", tone: "neutral" },
      PAYMENT_CREATED_AND_ACTIVATED: { label: "Étape créée et activée", tone: "info" },
      PAYMENT_UPDATED: { label: "Brouillon modifié", tone: "neutral" },
      PAYMENT_ACTIVATED: { label: "Paiement activé", tone: "info" },
      PAYMENT_REVIEW_STARTED: { label: "Vérification commencée", tone: "warning" },
      PAYMENT_CONFIRMED: { label: "Paiement confirmé", tone: "success" },
      PAYMENT_REJECTED: { label: "Paiement non confirmé", tone: "danger" },
      PAYMENT_CANCELLED: { label: "Paiement annulé", tone: "danger" },
    };

    const auditItems = auditRows.map((audit) => {
      const meta = labels[audit.action] ?? {
        label: audit.action,
        tone: "neutral" as const,
      };
      const adminName = audit.admin
        ? `${audit.admin.first_name} ${audit.admin.last_name}`.trim() ||
          audit.admin.email
        : null;

      return {
        key: `audit-${audit.id}`,
        label: meta.label,
        description: adminName
          ? `Action effectuée par ${adminName}.`
          : null,
        occurredAt: audit.created_at.toISOString(),
        tone: meta.tone,
      } satisfies AdminPaymentTimelineItem;
    });

    const proofItem: AdminPaymentTimelineItem[] = row.proof_submitted_at
      ? [
          {
            key: "client-proof",
            label: "Preuve reçue",
            description: "Le client a transmis un justificatif de paiement.",
            occurredAt: row.proof_submitted_at.toISOString(),
            tone: "warning",
          },
        ]
      : [];

    return [...auditItems, ...proofItem]
      .sort(
        (a, b) =>
          new Date(a.occurredAt).getTime() -
          new Date(b.occurredAt).getTime(),
      )
      .filter((item, index, all) => {
        if (index === 0) return true;
        const previous = all[index - 1];
        return !(
          previous?.label === item.label &&
          previous.occurredAt === item.occurredAt
        );
      });
  }

  if (row.activated_at) {
    items.push({
      key: "activated",
      label: "Paiement activé",
      description: "Le paiement est devenu visible dans l’espace client.",
      occurredAt: row.activated_at.toISOString(),
      tone: "info",
    });
  }

  if (row.proof_submitted_at) {
    items.push({
      key: "proof",
      label: "Preuve reçue",
      description: "Le client a transmis un justificatif de paiement.",
      occurredAt: row.proof_submitted_at.toISOString(),
      tone: "warning",
    });
  }

  if (
    row.reviewed_at &&
    row.status === "under_review"
  ) {
    items.push({
      key: "review",
      label: "Vérification commencée",
      description: "Un administrateur contrôle le paiement.",
      occurredAt: row.reviewed_at.toISOString(),
      tone: "info",
    });
  }

  if (row.status === "rejected" && row.reviewed_at) {
    items.push({
      key: "rejected",
      label: "Paiement non confirmé",
      description: row.rejection_reason,
      occurredAt: row.reviewed_at.toISOString(),
      tone: "danger",
    });
  }

  if (row.status === "cancelled" && row.reviewed_at) {
    items.push({
      key: "cancelled",
      label: "Paiement annulé",
      description: row.rejection_reason,
      occurredAt: row.reviewed_at.toISOString(),
      tone: "danger",
    });
  }

  if (row.paid_at) {
    items.push({
      key: "paid",
      label: "Paiement confirmé",
      description: "Le paiement a été validé par l’administration.",
      occurredAt: row.paid_at.toISOString(),
      tone: "success",
    });
  }

  return items.sort(
    (a, b) =>
      new Date(a.occurredAt).getTime() -
      new Date(b.occurredAt).getTime(),
  );
}

function mapDetailRow(
  row: NonNullable<
    Awaited<ReturnType<typeof findAdminPaymentById>>
  >,
  auditRows?: PaymentAuditRow[],
): AdminPaymentDetail {
  return {
    id: row.id,
    client: mapClient(row.users),
    application: mapApplication(row.application),
    provider: row.provider,
    stage: row.payment_stage ?? "Paiement",
    stageOrder: row.stage_order,
    reference: row.payment_reference,
    amountCents: row.amount_cents,
    currency: row.currency,
    status: normalizeStatus(row.status),
    description: row.description,
    dueAt: row.due_at?.toISOString() ?? null,
    activatedAt: row.activated_at?.toISOString() ?? null,
    activatedByAdminId: row.activated_by_admin_id,
    reviewedAt: row.reviewed_at?.toISOString() ?? null,
    reviewedByAdminId: row.reviewed_by_admin_id,
    rejectionReason: row.rejection_reason,
    paidAt: row.paid_at?.toISOString() ?? null,
    refundedAt: row.refunded_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    bankDetails: parseBankSnapshot(row.bank_details_snapshot),
    proof:
      row.proof_storage_bucket && row.proof_storage_path
        ? {
            bucket: row.proof_storage_bucket,
            path: row.proof_storage_path,
            originalFilename: row.proof_original_filename,
            mimeType: row.proof_mime_type,
            fileSizeBytes:
              row.proof_file_size_bytes?.toString() ?? null,
            submittedAt:
              row.proof_submitted_at?.toISOString() ?? null,
          }
        : null,
    timeline: buildTimeline(row, auditRows),
  };
}

function repositoryError(error: AdminPaymentsRepositoryError): never {
  if (error.code === "NOT_FOUND") {
    throw new AdminPaymentsServiceError(
      "NOT_FOUND",
      error.message,
      404,
    );
  }

  if (error.code === "APPLICATION_NOT_FOUND") {
    throw new AdminPaymentsServiceError(
      "NOT_FOUND",
      error.message,
      404,
    );
  }

  throw new AdminPaymentsServiceError(
    "CONFLICT",
    error.message,
    409,
  );
}

function validationError(error: AdminPaymentValidationError): never {
  throw new AdminPaymentsServiceError(
    "VALIDATION_ERROR",
    error.message,
    error.status,
    error.fields,
  );
}

function makePaymentReference(input: {
  requested: string | null | undefined;
  applicationReference: string | null;
  applicationId: string;
  stageOrder: number;
}): string {
  const requested = input.requested?.trim();

  if (requested) {
    return requested.slice(0, 128);
  }

  const applicationPart =
    input.applicationReference?.trim() ||
    input.applicationId.slice(0, 8).toUpperCase();

  return `${applicationPart}-P${Math.max(1, input.stageOrder)}`
    .replace(/\s+/g, "-")
    .slice(0, 128);
}

function toBankSnapshot(
  bankDetails: Omit<AdminPaymentBankDetails, "reference"> & {
    reference?: string | null;
  },
  reference: string,
): Prisma.InputJsonValue {
  return {
    accountHolder: bankDetails.accountHolder,
    bankName: bankDetails.bankName,
    iban: bankDetails.iban,
    bic: bankDetails.bic,
    country: bankDetails.country,
    reference,
    instructions: bankDetails.instructions,
  };
}

function ensureCompleteBankDetails(
  value: unknown,
): ReturnType<typeof parseBankDetails> {
  try {
    return parseBankDetails(value, {
      requireComplete: true,
    });
  } catch (error) {
    if (error instanceof AdminPaymentValidationError) {
      validationError(error);
    }
    throw error;
  }
}

export async function getAdminPaymentsPageData(input: {
  query: string;
  status: AdminPaymentListStatusFilter;
}): Promise<AdminPaymentsPageData> {
  await requireAdminPaymentActor();

  const [payments, counts, applications] = await Promise.all([
    listAdminPayments(input),
    getAdminPaymentStatusCounts(),
    listApplicationsForPaymentCreation(),
  ]);

  const countMap = new Map(
    counts.map((entry) => [entry.status, entry.count]),
  );

  const creationApplications: AdminPaymentCreationApplication[] =
    applications.map((application) => ({
      id: application.id,
      reference: application.application_reference,
      client: mapClient(application.users),
      selectedClasses: [...application.selected_classes],
      totalCents: application.total_cents,
      currency: application.currency,
      status: application.status,
      submittedAt:
        application.submitted_at?.toISOString() ?? null,
      nextStageOrder:
        (application.payments[0]?.stage_order ?? 0) + 1,
    }));

  return {
    payments: payments.map(mapListRow),
    stats: {
      total: counts.reduce(
        (sum, entry) => sum + entry.count,
        0,
      ),
      draft: countMap.get("draft") ?? 0,
      awaitingPayment:
        countMap.get("awaiting_payment") ?? 0,
      toReview:
        (countMap.get("proof_submitted") ?? 0) +
        (countMap.get("under_review") ?? 0),
      paid: countMap.get("paid") ?? 0,
      rejected: countMap.get("rejected") ?? 0,
      cancelled: countMap.get("cancelled") ?? 0,
    },
    filters: {
      query: input.query,
      status: input.status,
    },
    applications: creationApplications,
  };
}

export async function getAdminPaymentDetail(
  paymentId: string,
): Promise<AdminPaymentDetail> {
  await requireAdminPaymentActor();
  const id = assertUuid(paymentId, "Paiement");
  const [row, auditRows] = await Promise.all([
    findAdminPaymentById(id),
    listAdminPaymentAuditLogs(id),
  ]);

  if (!row) {
    throw new AdminPaymentsServiceError(
      "NOT_FOUND",
      "Paiement introuvable.",
      404,
    );
  }

  return mapDetailRow(row, auditRows);
}

export async function createPaymentFromAdmin(input: {
  rawInput: unknown;
  audit: AdminPaymentAuditContext;
}): Promise<AdminPaymentDetail> {
  const actor = await requireAdminPaymentActor();
  let parsed: CreateAdminPaymentInput;

  try {
    parsed = parseCreateAdminPaymentInput(input.rawInput);
  } catch (error) {
    if (error instanceof AdminPaymentValidationError) {
      validationError(error);
    }
    throw error;
  }

  const application =
    await findApplicationForPaymentCreation(
      parsed.applicationId,
    );

  if (!application) {
    throw new AdminPaymentsServiceError(
      "NOT_FOUND",
      "Le dossier soumis est introuvable ou n’est pas éligible à un paiement.",
      404,
    );
  }

  const stageOrder =
    parsed.stageOrder ??
    ((application.payments[0]?.stage_order ?? 0) + 1);
  const reference = makePaymentReference({
    requested: parsed.paymentReference,
    applicationReference:
      application.application_reference,
    applicationId: application.id,
    stageOrder,
  });

  let bankDetails = parsed.bankDetails;

  if (parsed.activate) {
    bankDetails = ensureCompleteBankDetails({
      ...parsed.bankDetails,
      reference,
    });
  }

  try {
    const row = await createAdminPayment({
      actorId: actor.id,
      payment: {
        userId: application.user_id,
        applicationId: application.id,
        provider: "bank_transfer",
        paymentStage: parsed.paymentStage,
        stageOrder,
        paymentReference: reference,
        amountCents: parsed.amountCents,
        currency: application.currency,
        status: parsed.activate
          ? "awaiting_payment"
          : "draft",
        description: parsed.description ?? null,
        activatedByAdminId: parsed.activate
          ? actor.id
          : null,
        activatedAt: parsed.activate
          ? new Date()
          : null,
        dueAt: parsed.dueAt
          ? new Date(parsed.dueAt)
          : null,
        bankDetailsSnapshot: toBankSnapshot(
          bankDetails,
          reference,
        ),
      },
      audit: input.audit,
    });

    return mapDetailRow(row);
  } catch (error) {
    if (error instanceof AdminPaymentsRepositoryError) {
      repositoryError(error);
    }
    throw error;
  }
}

export async function updatePaymentFromAdmin(input: {
  paymentId: string;
  rawInput: unknown;
  audit: AdminPaymentAuditContext;
}): Promise<AdminPaymentDetail> {
  const actor = await requireAdminPaymentActor();
  const paymentId = assertUuid(input.paymentId, "Paiement");
  let parsed: UpdateAdminPaymentInput;

  try {
    parsed = parseUpdateAdminPaymentInput(input.rawInput);
  } catch (error) {
    if (error instanceof AdminPaymentValidationError) {
      validationError(error);
    }
    throw error;
  }

  const current = await findAdminPaymentById(paymentId);

  if (!current) {
    throw new AdminPaymentsServiceError(
      "NOT_FOUND",
      "Paiement introuvable.",
      404,
    );
  }

  if (current.status !== "draft") {
    throw new AdminPaymentsServiceError(
      "CONFLICT",
      "Une étape déjà activée ne peut plus être modifiée. Annulez-la et créez une nouvelle étape si nécessaire.",
      409,
    );
  }

  const reference = makePaymentReference({
    requested: parsed.paymentReference,
    applicationReference:
      current.application?.application_reference ?? null,
    applicationId:
      current.application_id ?? current.id,
    stageOrder: parsed.stageOrder,
  });

  try {
    const row = await updateDraftAdminPayment({
      paymentId,
      actorId: actor.id,
      update: {
        paymentStage: parsed.paymentStage,
        stageOrder: parsed.stageOrder,
        paymentReference: reference,
        amountCents: parsed.amountCents,
        description: parsed.description ?? null,
        dueAt: parsed.dueAt
          ? new Date(parsed.dueAt)
          : null,
        bankDetailsSnapshot: toBankSnapshot(
          parsed.bankDetails,
          reference,
        ),
      },
      audit: input.audit,
    });

    return mapDetailRow(row);
  } catch (error) {
    if (error instanceof AdminPaymentsRepositoryError) {
      repositoryError(error);
    }
    throw error;
  }
}

export async function activatePaymentFromAdmin(input: {
  paymentId: string;
  audit: AdminPaymentAuditContext;
}): Promise<AdminPaymentDetail> {
  const actor = await requireAdminPaymentActor();
  const paymentId = assertUuid(input.paymentId, "Paiement");
  const current = await findAdminPaymentById(paymentId);

  if (!current) {
    throw new AdminPaymentsServiceError(
      "NOT_FOUND",
      "Paiement introuvable.",
      404,
    );
  }

  if (current.status !== "draft") {
    throw new AdminPaymentsServiceError(
      "CONFLICT",
      "Seul un paiement en brouillon peut être activé.",
      409,
    );
  }

  const currentBank = parseBankSnapshot(
    current.bank_details_snapshot,
  );
  const complete = ensureCompleteBankDetails(currentBank);
  const reference =
    current.payment_reference ||
    makePaymentReference({
      requested: null,
      applicationReference:
        current.application?.application_reference ?? null,
      applicationId:
        current.application_id ?? current.id,
      stageOrder: current.stage_order,
    });

  try {
    const row = await activateDraftAdminPayment({
      paymentId,
      actorId: actor.id,
      bankDetailsSnapshot: toBankSnapshot(
        complete,
        reference,
      ),
      audit: input.audit,
    });

    return mapDetailRow(row);
  } catch (error) {
    if (error instanceof AdminPaymentsRepositoryError) {
      repositoryError(error);
    }
    throw error;
  }
}

export async function startPaymentReviewFromAdmin(input: {
  paymentId: string;
  audit: AdminPaymentAuditContext;
}): Promise<AdminPaymentDetail> {
  const actor = await requireAdminPaymentActor();
  const paymentId = assertUuid(input.paymentId, "Paiement");

  try {
    return mapDetailRow(
      await markAdminPaymentUnderReview({
        paymentId,
        actorId: actor.id,
        audit: input.audit,
      }),
    );
  } catch (error) {
    if (error instanceof AdminPaymentsRepositoryError) {
      repositoryError(error);
    }
    throw error;
  }
}

async function sendPaymentStatusEmail(
  detail: AdminPaymentDetail,
  status: "paid" | "rejected",
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    console.warn(
      "[Express-Führerschein] RESEND_API_KEY fehlt; Zahlungsstatus-E-Mail wurde übersprungen.",
    );
    return;
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Express-Führerschein <noreply@express-fuhrerscheine.de>";
  const amount = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: detail.currency,
  }).format(detail.amountCents / 100);

  const subject =
    status === "paid"
      ? "Ihre Zahlung wurde bestätigt"
      : "Ihre Zahlung konnte nicht bestätigt werden";

  const statusText =
    status === "paid"
      ? `Ihre Zahlung über ${amount} wurde bestätigt.`
      : `Ihre Zahlung über ${amount} konnte nicht bestätigt werden.${
          detail.rejectionReason
            ? ` Grund: ${detail.rejectionReason}`
            : ""
        }`;

  const html = `
    <div style="font-family:Arial,sans-serif;color:#071426;line-height:1.6">
      <h2 style="margin:0 0 16px">Express-Führerschein</h2>
      <p>Hallo ${escapeHtml(detail.client.firstName || detail.client.fullName)},</p>
      <p>${escapeHtml(statusText)}</p>
      <p>Zahlungsstufe: <strong>${escapeHtml(detail.stage)}</strong></p>
      <p>Referenz: <strong>${escapeHtml(detail.reference || "-")}</strong></p>
      <p>Sie können den aktuellen Status jederzeit in Ihrem Zahlungsbereich einsehen.</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [detail.client.email],
      subject,
      html,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `[Express-Führerschein] Resend payment email failed (${response.status}): ${body.slice(0, 500)}`,
    );
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function confirmPaymentFromAdmin(input: {
  paymentId: string;
  audit: AdminPaymentAuditContext;
}): Promise<AdminPaymentDetail> {
  const actor = await requireAdminPaymentActor();
  const paymentId = assertUuid(input.paymentId, "Paiement");

  try {
    const detail = mapDetailRow(
      await confirmAdminPayment({
        paymentId,
        actorId: actor.id,
        audit: input.audit,
      }),
    );

    await sendPaymentStatusEmail(detail, "paid").catch(
      (error) => {
        console.error(
          "[Express-Führerschein] payment confirmation email failed",
          error,
        );
      },
    );

    return detail;
  } catch (error) {
    if (error instanceof AdminPaymentsRepositoryError) {
      repositoryError(error);
    }
    throw error;
  }
}

export async function rejectPaymentFromAdmin(input: {
  paymentId: string;
  reason: string;
  audit: AdminPaymentAuditContext;
}): Promise<AdminPaymentDetail> {
  const actor = await requireAdminPaymentActor();
  const paymentId = assertUuid(input.paymentId, "Paiement");
  const reason = input.reason.trim();

  if (reason.length < 3 || reason.length > 2_000) {
    throw new AdminPaymentsServiceError(
      "VALIDATION_ERROR",
      "Une raison de refus valide est obligatoire.",
      400,
      {
        reason: "Indiquez une raison entre 3 et 2 000 caractères.",
      },
    );
  }

  try {
    const detail = mapDetailRow(
      await rejectAdminPayment({
        paymentId,
        actorId: actor.id,
        reason,
        audit: input.audit,
      }),
    );

    await sendPaymentStatusEmail(detail, "rejected").catch(
      (error) => {
        console.error(
          "[Express-Führerschein] payment rejection email failed",
          error,
        );
      },
    );

    return detail;
  } catch (error) {
    if (error instanceof AdminPaymentsRepositoryError) {
      repositoryError(error);
    }
    throw error;
  }
}

export async function cancelPaymentFromAdmin(input: {
  paymentId: string;
  reason: string | null;
  audit: AdminPaymentAuditContext;
}): Promise<AdminPaymentDetail> {
  const actor = await requireAdminPaymentActor();
  const paymentId = assertUuid(input.paymentId, "Paiement");
  const reason = input.reason?.trim().slice(0, 2_000) || null;

  try {
    return mapDetailRow(
      await cancelAdminPayment({
        paymentId,
        actorId: actor.id,
        reason,
        audit: input.audit,
      }),
    );
  } catch (error) {
    if (error instanceof AdminPaymentsRepositoryError) {
      repositoryError(error);
    }
    throw error;
  }
}

export async function getAdminPaymentProofUrl(
  paymentId: string,
): Promise<string> {
  await requireAdminPaymentActor();
  const id = assertUuid(paymentId, "Paiement");
  const row = await findAdminPaymentById(id);

  if (
    !row ||
    !row.proof_storage_bucket ||
    !row.proof_storage_path
  ) {
    throw new AdminPaymentsServiceError(
      "NOT_FOUND",
      "Aucune preuve de paiement n’est disponible.",
      404,
    );
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim();
  const serviceRole =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRole) {
    throw new AdminPaymentsServiceError(
      "CONFIGURATION_ERROR",
      "Le stockage privé des preuves n’est pas configuré.",
      503,
    );
  }

  const encodedBucket = encodeURIComponent(
    row.proof_storage_bucket,
  );
  const encodedPath = row.proof_storage_path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/sign/${encodedBucket}/${encodedPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRole}`,
        apikey: serviceRole,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expiresIn: 60,
      }),
      cache: "no-store",
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | {
        signedURL?: string;
        signedUrl?: string;
      }
    | null;

  if (!response.ok) {
    throw new AdminPaymentsServiceError(
      "CONFIGURATION_ERROR",
      "Impossible d’ouvrir la preuve de paiement.",
      502,
    );
  }

  const signedPath =
    payload?.signedURL ?? payload?.signedUrl;

  if (!signedPath) {
    throw new AdminPaymentsServiceError(
      "CONFIGURATION_ERROR",
      "Supabase n’a pas retourné de lien sécurisé.",
      502,
    );
  }

  if (/^https?:\/\//i.test(signedPath)) {
    return signedPath;
  }

  const normalizedPath = signedPath.startsWith("/")
    ? signedPath
    : `/${signedPath}`;

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1${normalizedPath}`;
}
