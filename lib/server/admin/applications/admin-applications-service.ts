/**
 * Express-Führerschein
 * Server service for the admin driving-license application module.
 */

import "server-only";

import { createHash } from "node:crypto";

import { cookies } from "next/headers";

import { DRIVING_LICENSE_APPLICATION_STORAGE_BUCKET } from "@/data/driving-license-application";
import { findProfileByUserId } from "@/lib/server/profile/profile-repository";
import {
  applyAdminApplicationReview,
  findAdminApplicationById,
  findAdminApplicationDocument,
  findAdminApplicationSignature,
  findAdminSessionByTokenHash,
  getAdminApplicationsStats,
  listAdminApplications,
  touchAdminSession,
} from "@/lib/server/admin/applications/admin-applications-repository";
import {
  AdminApplicationsValidationError,
  assertAdminApplicationId,
  assertAdminDocumentId,
  validateAdminApplicationReviewInput,
} from "@/lib/server/admin/applications/admin-applications-validation";
import type {
  AdminApplicationDetail,
  AdminApplicationDocument,
  AdminApplicationFileTarget,
  AdminApplicationListItem,
  AdminApplicationReviewResult,
  AdminApplicationTimelineItem,
  AdminApplicationViewStatus,
  AdminApplicationsApiErrorCode,
  AdminApplicationsPageData,
  AdminApplicationsQuery,
} from "@/types/admin-applications";

export class AdminApplicationsServiceError extends Error {
  readonly code: AdminApplicationsApiErrorCode;
  readonly status: number;
  readonly fields?: Record<string, string>;

  constructor(
    code: AdminApplicationsApiErrorCode,
    message: string,
    status: number,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AdminApplicationsServiceError";
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

export interface AdminApplicationRequestMeta {
  userAgent?: string | null;
}

interface AdminContext {
  adminId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

function normalize(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function iso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function safeFileSize(value: bigint): number {
  const numberValue = Number(value);
  return Number.isSafeInteger(numberValue) && numberValue >= 0
    ? numberValue
    : 0;
}

function fallbackReference(id: string): string {
  return `EF-${id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

export function deriveAdminApplicationStatus(input: {
  rawStatus: string;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
}): AdminApplicationViewStatus {
  if (input.rejectedAt) return "rejected";
  if (input.approvedAt) return "approved";
  if (input.reviewedAt) return "under_review";
  if (input.rawStatus === "draft") return "draft";
  if (input.submittedAt || input.rawStatus === "submitted") return "submitted";
  return "other";
}

function documentTitle(documentType: string): string {
  const key = documentType.trim().toLowerCase().replace(/[-\s]/g, "_");

  if (
    ["id_front", "identity_front", "ausweis_vorderseite", "front", "identity_card_front"].includes(key)
  ) {
    return "Ausweis Vorderseite";
  }

  if (
    ["id_back", "identity_back", "ausweis_rueckseite", "back", "identity_card_back"].includes(key)
  ) {
    return "Ausweis Rückseite";
  }

  if (["photo", "passport_photo", "passfoto", "profile_photo"].includes(key)) {
    return "Passfoto";
  }

  return documentType
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function buildDocumentView(
  applicationId: string,
  row: {
    id: string;
    document_type: string;
    original_filename: string;
    mime_type: string;
    file_size_bytes: bigint;
    created_at: Date;
  },
): AdminApplicationDocument {
  const base = `/api/admin/applications/${encodeURIComponent(
    applicationId,
  )}/documents/${encodeURIComponent(row.id)}`;

  return {
    id: row.id,
    documentType: row.document_type,
    title: documentTitle(row.document_type),
    originalFilename: row.original_filename,
    mimeType: row.mime_type,
    fileSizeBytes: safeFileSize(row.file_size_bytes),
    createdAt: row.created_at.toISOString(),
    viewUrl: `${base}?disposition=inline`,
    downloadUrl: `${base}?disposition=attachment`,
  };
}

function buildTimeline(input: {
  createdAt: Date;
  submittedAt: Date | null;
  reviewedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
}): AdminApplicationTimelineItem[] {
  const items: AdminApplicationTimelineItem[] = [];

  items.push({
    key: "created",
    title: "Antrag erstellt",
    description: "Der Antrag wurde im Kundenbereich angelegt.",
    occurredAt: input.createdAt.toISOString(),
    tone: "neutral",
  });

  if (input.submittedAt) {
    items.push({
      key: "submitted",
      title: "Antrag eingereicht",
      description: "Der Kunde hat den Antrag offiziell übermittelt.",
      occurredAt: input.submittedAt.toISOString(),
      tone: "info",
    });
  }

  if (input.reviewedAt) {
    items.push({
      key: "reviewed",
      title: "Prüfung begonnen",
      description: "Der Antrag wurde durch die Administration geprüft.",
      occurredAt: input.reviewedAt.toISOString(),
      tone: "info",
    });
  }

  if (input.approvedAt) {
    items.push({
      key: "approved",
      title: "Antrag bestätigt",
      description: "Die administrative Prüfung wurde positiv abgeschlossen.",
      occurredAt: input.approvedAt.toISOString(),
      tone: "success",
    });
  }

  if (input.rejectedAt) {
    items.push({
      key: "rejected",
      title: "Antrag abgelehnt",
      description: input.rejectionReason || "Die administrative Prüfung wurde negativ abgeschlossen.",
      occurredAt: input.rejectedAt.toISOString(),
      tone: "danger",
    });
  }

  return items.sort(
    (left, right) =>
      new Date(left.occurredAt).getTime() - new Date(right.occurredAt).getTime(),
  );
}

async function resolveAdminContext(): Promise<AdminContext> {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const configuredName = process.env.ADMIN_SESSION_COOKIE_NAME?.trim();

  const preferredNames = [
    configuredName,
    "admin_session",
    "express_admin_session",
    "novera_admin_session",
  ].filter((value): value is string => Boolean(value));

  const orderedTokens: string[] = [];
  const seenTokens = new Set<string>();

  for (const name of preferredNames) {
    const token = cookieStore.get(name)?.value?.trim();
    if (token && !seenTokens.has(token)) {
      orderedTokens.push(token);
      seenTokens.add(token);
    }
  }

  /*
   * The exact cookie name belongs to the existing admin-login implementation.
   * If it differs from the conventional names above, every remaining cookie
   * is safely checked against admin_sessions.token_hash. A client session can
   * never authenticate here because its hash is not stored in admin_sessions.
   */
  for (const cookie of allCookies) {
    const token = cookie.value?.trim();
    if (token && !seenTokens.has(token)) {
      orderedTokens.push(token);
      seenTokens.add(token);
    }
  }

  const now = new Date();

  for (const token of orderedTokens) {
    const session = await findAdminSessionByTokenHash(hashToken(token));
    if (!session) continue;
    if (session.revoked_at) continue;
    if (session.expires_at.getTime() <= now.getTime()) continue;
    if (!session.admin.is_active) continue;

    const shouldTouch =
      !session.last_seen_at ||
      now.getTime() - session.last_seen_at.getTime() >= 5 * 60 * 1_000;

    if (shouldTouch) {
      await touchAdminSession(session.id, session.admin_id, now).catch((error) => {
        console.error("[ADMIN_APPLICATION_SESSION_TOUCH_ERROR]", error);
      });
    }

    return {
      adminId: session.admin.id,
      email: session.admin.email,
      firstName: session.admin.first_name,
      lastName: session.admin.last_name,
      role: session.admin.role,
    };
  }

  throw new AdminApplicationsServiceError(
    "UNAUTHENTICATED",
    "Bitte melde dich im Admin-Bereich an.",
    401,
  );
}

function mapListItem(row: Awaited<ReturnType<typeof listAdminApplications>>["rows"][number]): AdminApplicationListItem {
  return {
    id: row.id,
    reference: normalize(row.application_reference) || fallbackReference(row.id),
    userId: row.user_id,
    customer: {
      firstName: row.users.first_name,
      lastName: row.users.last_name,
      email: row.users.email,
      countryCode: row.users.country_code,
    },
    selectedClasses: row.selected_classes,
    totalCents: row.total_cents,
    currency: row.currency,
    status: deriveAdminApplicationStatus({
      rawStatus: row.status,
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at,
      approvedAt: row.approved_at,
      rejectedAt: row.rejected_at,
    }),
    rawStatus: row.status,
    submittedAt: iso(row.submitted_at),
    reviewedAt: iso(row.reviewed_at),
    approvedAt: iso(row.approved_at),
    rejectedAt: iso(row.rejected_at),
    documentCount: row._count.documents,
  };
}

export async function getAdminApplicationsPageData(
  query: AdminApplicationsQuery,
): Promise<AdminApplicationsPageData> {
  await resolveAdminContext();

  const [{ rows, total }, stats] = await Promise.all([
    listAdminApplications(query),
    getAdminApplicationsStats(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, totalPages);

  if (page !== query.page && total > 0) {
    return getAdminApplicationsPageData({ ...query, page });
  }

  return {
    items: rows.map(mapListItem),
    stats,
    query: { ...query, page },
    pagination: {
      page,
      pageSize: query.pageSize,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}

export async function getAdminApplicationDetail(
  rawApplicationId: string,
): Promise<AdminApplicationDetail> {
  await resolveAdminContext();

  let applicationId: string;
  try {
    applicationId = assertAdminApplicationId(rawApplicationId);
  } catch (error) {
    if (error instanceof AdminApplicationsValidationError) {
      throw new AdminApplicationsServiceError(
        "VALIDATION_ERROR",
        error.message,
        400,
        error.fields,
      );
    }
    throw error;
  }

  const row = await findAdminApplicationById(applicationId);
  if (!row) {
    throw new AdminApplicationsServiceError(
      "APPLICATION_NOT_FOUND",
      "Der Führerscheinantrag wurde nicht gefunden.",
      404,
    );
  }

  let profile: Awaited<ReturnType<typeof findProfileByUserId>> = null;
  try {
    profile = await findProfileByUserId(row.user_id);
  } catch (error) {
    console.error("[ADMIN_APPLICATION_PROFILE_READ_ERROR]", error);
  }

  const status = deriveAdminApplicationStatus({
    rawStatus: row.status,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
  });

  const signatureBase = `/api/admin/applications/${encodeURIComponent(
    row.id,
  )}/documents/signature`;
  const signatureAvailable = Boolean(row.signature_type && row.signature_path);

  return {
    id: row.id,
    reference: normalize(row.application_reference) || fallbackReference(row.id),
    userId: row.user_id,
    selectedClasses: row.selected_classes,
    theoryPassed: row.theory_passed,
    practicalPassed: row.practical_passed,
    classesTotalCents: row.classes_total_cents,
    processingFeeCents: row.processing_fee_cents,
    totalCents: row.total_cents,
    currency: row.currency,
    status,
    rawStatus: row.status,
    submittedAt: iso(row.submitted_at),
    reviewedAt: iso(row.reviewed_at),
    approvedAt: iso(row.approved_at),
    rejectedAt: iso(row.rejected_at),
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    customer: {
      id: row.users.id,
      firstName: profile?.firstName ?? row.users.first_name,
      lastName: profile?.lastName ?? row.users.last_name,
      email: profile?.email ?? row.users.email,
      phoneE164: profile?.phoneE164 ?? row.users.phone_e164,
      countryCode: profile?.countryCode ?? row.users.country_code,
      city: profile?.city ?? null,
      postalCode: profile?.postalCode ?? null,
      addressLine1: profile?.addressLine1 ?? null,
    },
    documents: row.documents.map((document) => buildDocumentView(row.id, document)),
    signature: {
      available: signatureAvailable,
      type: row.signature_type,
      viewUrl: signatureAvailable ? `${signatureBase}?disposition=inline` : null,
      downloadUrl: signatureAvailable ? `${signatureBase}?disposition=attachment` : null,
    },
    reviewer: row.reviewed_by_admin
      ? {
          id: row.reviewed_by_admin.id,
          firstName: row.reviewed_by_admin.first_name,
          lastName: row.reviewed_by_admin.last_name,
          email: row.reviewed_by_admin.email,
        }
      : null,
    timeline: buildTimeline({
      createdAt: row.created_at,
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at,
      approvedAt: row.approved_at,
      rejectedAt: row.rejected_at,
      rejectionReason: row.rejection_reason,
    }),
  };
}

export async function reviewAdminApplication(
  rawApplicationId: string,
  rawInput: unknown,
  requestMeta: AdminApplicationRequestMeta = {},
): Promise<AdminApplicationReviewResult> {
  const admin = await resolveAdminContext();

  let applicationId: string;
  let input;

  try {
    applicationId = assertAdminApplicationId(rawApplicationId);
    input = validateAdminApplicationReviewInput(rawInput);
  } catch (error) {
    if (error instanceof AdminApplicationsValidationError) {
      throw new AdminApplicationsServiceError(
        "VALIDATION_ERROR",
        error.message,
        422,
        error.fields,
      );
    }
    throw error;
  }

  const updated = await applyAdminApplicationReview({
    applicationId,
    adminId: admin.adminId,
    action: input.action,
    reason: input.reason ?? null,
    userAgent: requestMeta.userAgent?.slice(0, 512) ?? null,
  });

  if (!updated) {
    throw new AdminApplicationsServiceError(
      "APPLICATION_NOT_FOUND",
      "Der Führerscheinantrag wurde nicht gefunden.",
      404,
    );
  }

  return {
    applicationId: updated.id,
    status: deriveAdminApplicationStatus({
      rawStatus: updated.status,
      submittedAt: null,
      reviewedAt: updated.reviewed_at,
      approvedAt: updated.approved_at,
      rejectedAt: updated.rejected_at,
    }),
    reviewedAt: iso(updated.reviewed_at),
    approvedAt: iso(updated.approved_at),
    rejectedAt: iso(updated.rejected_at),
    rejectionReason: updated.rejection_reason,
  };
}

function mimeTypeFromPath(path: string, signatureType: string | null): string {
  const lower = path.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".png")) return "image/png";
  if (signatureType?.toLowerCase().includes("draw")) return "image/png";
  return "application/octet-stream";
}

function extensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "application/pdf":
      return ".pdf";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
    case "image/png":
      return ".png";
    default:
      return "";
  }
}

export async function getAdminApplicationFileTarget(
  rawApplicationId: string,
  rawDocumentId: string,
): Promise<AdminApplicationFileTarget> {
  await resolveAdminContext();

  let applicationId: string;
  let documentId: string;

  try {
    applicationId = assertAdminApplicationId(rawApplicationId);
    documentId = assertAdminDocumentId(rawDocumentId);
  } catch (error) {
    if (error instanceof AdminApplicationsValidationError) {
      throw new AdminApplicationsServiceError(
        "VALIDATION_ERROR",
        error.message,
        400,
        error.fields,
      );
    }
    throw error;
  }

  if (documentId === "signature") {
    const signature = await findAdminApplicationSignature(applicationId);
    if (!signature?.signature_path) {
      throw new AdminApplicationsServiceError(
        "DOCUMENT_NOT_FOUND",
        "Für diesen Antrag wurde keine Unterschrift gefunden.",
        404,
      );
    }

    const mimeType = mimeTypeFromPath(signature.signature_path, signature.signature_type);
    return {
      bucket: DRIVING_LICENSE_APPLICATION_STORAGE_BUCKET,
      storagePath: signature.signature_path,
      filename: `unterschrift${extensionFromMimeType(mimeType)}`,
      mimeType,
    };
  }

  const document = await findAdminApplicationDocument(applicationId, documentId);
  if (!document) {
    throw new AdminApplicationsServiceError(
      "DOCUMENT_NOT_FOUND",
      "Das Dokument wurde nicht gefunden.",
      404,
    );
  }

  return {
    bucket: document.storage_bucket,
    storagePath: document.storage_path,
    filename: document.original_filename,
    mimeType: document.mime_type,
  };
}

export function toAdminApplicationsServiceError(error: unknown): AdminApplicationsServiceError {
  if (error instanceof AdminApplicationsServiceError) return error;

  console.error("[ADMIN_APPLICATIONS_SERVICE_ERROR]", error);
  return new AdminApplicationsServiceError(
    "INTERNAL_ERROR",
    "Die Anfrage konnte derzeit nicht verarbeitet werden.",
    500,
  );
}
