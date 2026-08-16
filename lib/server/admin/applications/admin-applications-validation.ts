/**
 * Express-Führerschein
 * Validation helpers for the admin application module.
 */

import type {
  AdminApplicationReviewInput,
  AdminApplicationViewStatus,
  AdminApplicationsQuery,
} from "@/types/admin-applications";

export const ADMIN_APPLICATION_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_STATUSES = new Set<AdminApplicationViewStatus | "all">([
  "all",
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "other",
]);

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export class AdminApplicationsValidationError extends Error {
  readonly fields: Record<string, string>;

  constructor(message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = "AdminApplicationsValidationError";
    this.fields = fields;
  }
}

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function parsePositiveInteger(
  value: unknown,
  fallback: number,
  maximum: number,
): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function assertAdminApplicationId(value: unknown): string {
  const normalized = normalizeText(value, 64);
  if (!ADMIN_APPLICATION_UUID_PATTERN.test(normalized)) {
    throw new AdminApplicationsValidationError(
      "Die Antrag-ID ist ungültig.",
      { applicationId: "Ungültige Antrag-ID." },
    );
  }
  return normalized;
}

export function assertAdminDocumentId(value: unknown): string {
  const normalized = normalizeText(value, 64);
  if (normalized === "signature") return normalized;
  if (!ADMIN_APPLICATION_UUID_PATTERN.test(normalized)) {
    throw new AdminApplicationsValidationError(
      "Die Dokument-ID ist ungültig.",
      { documentId: "Ungültige Dokument-ID." },
    );
  }
  return normalized;
}

export function parseAdminApplicationsSearchParams(
  searchParams: URLSearchParams,
): AdminApplicationsQuery {
  return parseAdminApplicationsQueryRecord({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    licenseClass: searchParams.get("licenseClass") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}

export function parseAdminApplicationsQueryRecord(
  input: Record<string, string | string[] | undefined>,
): AdminApplicationsQuery {
  const search = normalizeText(firstValue(input.q), 120);
  const rawStatus = normalizeText(firstValue(input.status), 32).toLowerCase();
  const status = ALLOWED_STATUSES.has(
    rawStatus as AdminApplicationViewStatus | "all",
  )
    ? (rawStatus as AdminApplicationViewStatus | "all")
    : "all";

  const licenseClass = normalizeText(
    firstValue(input.licenseClass),
    8,
  ).toUpperCase();

  return {
    search,
    status,
    licenseClass,
    page: parsePositiveInteger(firstValue(input.page), DEFAULT_PAGE, 100_000),
    pageSize: parsePositiveInteger(
      firstValue(input.pageSize),
      DEFAULT_PAGE_SIZE,
      MAX_PAGE_SIZE,
    ),
  };
}

export function validateAdminApplicationReviewInput(
  input: unknown,
): AdminApplicationReviewInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new AdminApplicationsValidationError(
      "Die Anfrage enthält keine gültigen Daten.",
      { body: "Ungültige Daten." },
    );
  }

  const record = input as Record<string, unknown>;
  const action = normalizeText(record.action, 32);

  if (
    action !== "start_review" &&
    action !== "approve" &&
    action !== "reject"
  ) {
    throw new AdminApplicationsValidationError(
      "Die gewählte Aktion ist ungültig.",
      { action: "Ungültige Aktion." },
    );
  }

  const reason = normalizeText(record.reason, 2_000);

  if (action === "reject" && reason.length < 5) {
    throw new AdminApplicationsValidationError(
      "Bitte gib einen nachvollziehbaren Ablehnungsgrund an.",
      { reason: "Mindestens 5 Zeichen erforderlich." },
    );
  }

  return {
    action,
    reason: reason || null,
  };
}
