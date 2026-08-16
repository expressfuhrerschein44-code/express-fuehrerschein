/**
 * Express-Führerschein
 * Admin payments validation and request-safety helpers.
 */

import "server-only";

import { createHash } from "node:crypto";

import type {
  AdminPaymentBankDetails,
  AdminPaymentListStatusFilter,
  AdminPaymentMutationAction,
  CreateAdminPaymentInput,
  UpdateAdminPaymentInput,
} from "@/types/admin-payments";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_STATUSES = new Set<AdminPaymentListStatusFilter>([
  "all",
  "to_review",
  "draft",
  "awaiting_payment",
  "proof_submitted",
  "under_review",
  "paid",
  "rejected",
  "cancelled",
]);

const ALLOWED_ACTIONS = new Set<AdminPaymentMutationAction>([
  "update",
  "activate",
  "start_review",
  "confirm",
  "reject",
  "cancel",
]);

export class AdminPaymentValidationError extends Error {
  readonly code = "VALIDATION_ERROR";
  readonly status = 400;

  constructor(
    message: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AdminPaymentValidationError";
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return {};
  }

  return value as Record<string, unknown>;
}

function readString(
  value: unknown,
  options?: {
    required?: boolean;
    min?: number;
    max?: number;
    field?: string;
    label?: string;
  },
): string {
  const field = options?.field ?? "value";
  const label = options?.label ?? "Valeur";
  const normalized =
    typeof value === "string"
      ? value.trim()
      : "";

  if (options?.required && !normalized) {
    throw new AdminPaymentValidationError(
      `${label} est obligatoire.`,
      { [field]: `${label} est obligatoire.` },
    );
  }

  if (
    normalized &&
    options?.min !== undefined &&
    normalized.length < options.min
  ) {
    throw new AdminPaymentValidationError(
      `${label} est trop court.`,
      { [field]: `${label} est trop court.` },
    );
  }

  if (
    normalized &&
    options?.max !== undefined &&
    normalized.length > options.max
  ) {
    throw new AdminPaymentValidationError(
      `${label} est trop long.`,
      { [field]: `${label} est trop long.` },
    );
  }

  return normalized;
}

function readInteger(
  value: unknown,
  options: {
    min: number;
    max: number;
    field: string;
    label: string;
  },
): number {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  if (
    !Number.isSafeInteger(numeric) ||
    numeric < options.min ||
    numeric > options.max
  ) {
    throw new AdminPaymentValidationError(
      `${options.label} est invalide.`,
      {
        [options.field]:
          `${options.label} est invalide.`,
      },
    );
  }

  return numeric;
}

function readNullableDate(
  value: unknown,
  field = "dueAt",
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value !== "string") {
    throw new AdminPaymentValidationError(
      "La date d’échéance est invalide.",
      { [field]: "La date d’échéance est invalide." },
    );
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new AdminPaymentValidationError(
      "La date d’échéance est invalide.",
      { [field]: "La date d’échéance est invalide." },
    );
  }

  return parsed.toISOString();
}

function normalizeIban(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

function normalizeBic(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}

export function assertUuid(
  value: string,
  label = "Identifiant",
): string {
  const normalized = value.trim();

  if (!UUID_PATTERN.test(normalized)) {
    throw new AdminPaymentValidationError(
      `${label} invalide.`,
    );
  }

  return normalized;
}

export function parseAdminPaymentFilters(input: {
  q?: string | string[] | undefined;
  status?: string | string[] | undefined;
}): {
  query: string;
  status: AdminPaymentListStatusFilter;
} {
  const rawQuery = Array.isArray(input.q)
    ? input.q[0]
    : input.q;
  const rawStatus = Array.isArray(input.status)
    ? input.status[0]
    : input.status;

  const query = (rawQuery ?? "")
    .trim()
    .slice(0, 120);

  const statusCandidate =
    (rawStatus ?? "all").trim() as AdminPaymentListStatusFilter;

  return {
    query,
    status: ALLOWED_STATUSES.has(statusCandidate)
      ? statusCandidate
      : "all",
  };
}

export function parseBankDetails(
  input: unknown,
  options?: {
    requireComplete?: boolean;
  },
): Omit<AdminPaymentBankDetails, "reference"> & {
  reference: string | null;
} {
  const record = asRecord(input);
  const required = options?.requireComplete ?? false;

  const accountHolder = readString(record.accountHolder, {
    required,
    min: required ? 2 : undefined,
    max: 160,
    field: "accountHolder",
    label: "Le titulaire du compte",
  });

  const bankName = readString(record.bankName, {
    required,
    min: required ? 2 : undefined,
    max: 160,
    field: "bankName",
    label: "La banque",
  });

  const ibanRaw = readString(record.iban, {
    required,
    max: 64,
    field: "iban",
    label: "L’IBAN",
  });
  const iban = normalizeIban(ibanRaw);

  if (
    iban &&
    !/^[A-Z]{2}[0-9A-Z]{13,32}$/.test(iban)
  ) {
    throw new AdminPaymentValidationError(
      "L’IBAN est invalide.",
      { iban: "L’IBAN est invalide." },
    );
  }

  const bicRaw = readString(record.bic, {
    required,
    max: 16,
    field: "bic",
    label: "Le BIC",
  });
  const bic = normalizeBic(bicRaw);

  if (
    bic &&
    !/^[A-Z0-9]{8}([A-Z0-9]{3})?$/.test(bic)
  ) {
    throw new AdminPaymentValidationError(
      "Le BIC est invalide.",
      { bic: "Le BIC est invalide." },
    );
  }

  const country = readString(record.country, {
    required,
    min: required ? 2 : undefined,
    max: 80,
    field: "country",
    label: "Le pays bancaire",
  });

  const reference = readString(record.reference, {
    max: 128,
    field: "reference",
    label: "La référence de paiement",
  });

  const instructions = readString(record.instructions, {
    max: 2_000,
    field: "instructions",
    label: "Les instructions",
  });

  return {
    accountHolder,
    bankName,
    iban,
    bic,
    country,
    reference: reference || null,
    instructions,
  };
}

export function parseCreateAdminPaymentInput(
  input: unknown,
): CreateAdminPaymentInput {
  const record = asRecord(input);
  const activate = record.activate === true;
  const applicationId = assertUuid(
    readString(record.applicationId, {
      required: true,
      field: "applicationId",
      label: "Le dossier",
    }),
    "Dossier",
  );

  const paymentStage = readString(record.paymentStage, {
    required: true,
    min: 2,
    max: 64,
    field: "paymentStage",
    label: "L’étape de paiement",
  });

  const amountCents = readInteger(record.amountCents, {
    min: 1,
    max: 100_000_000,
    field: "amountCents",
    label: "Le montant",
  });

  const stageOrder =
    record.stageOrder === undefined ||
    record.stageOrder === null ||
    record.stageOrder === ""
      ? undefined
      : readInteger(record.stageOrder, {
          min: 0,
          max: 10_000,
          field: "stageOrder",
          label: "L’ordre de l’étape",
        });

  const paymentReference = readString(
    record.paymentReference,
    {
      max: 128,
      field: "paymentReference",
      label: "La référence de paiement",
    },
  );

  const description = readString(record.description, {
    max: 255,
    field: "description",
    label: "La description",
  });

  const dueAt = readNullableDate(record.dueAt);
  const bankDetails = parseBankDetails(record.bankDetails, {
    requireComplete: activate,
  });

  return {
    applicationId,
    paymentStage,
    amountCents,
    stageOrder,
    paymentReference: paymentReference || null,
    description: description || null,
    dueAt,
    bankDetails,
    activate,
  };
}

export function parseUpdateAdminPaymentInput(
  input: unknown,
): UpdateAdminPaymentInput {
  const record = asRecord(input);

  const paymentStage = readString(record.paymentStage, {
    required: true,
    min: 2,
    max: 64,
    field: "paymentStage",
    label: "L’étape de paiement",
  });

  const amountCents = readInteger(record.amountCents, {
    min: 1,
    max: 100_000_000,
    field: "amountCents",
    label: "Le montant",
  });

  const stageOrder = readInteger(record.stageOrder, {
    min: 0,
    max: 10_000,
    field: "stageOrder",
    label: "L’ordre de l’étape",
  });

  const paymentReference = readString(
    record.paymentReference,
    {
      max: 128,
      field: "paymentReference",
      label: "La référence de paiement",
    },
  );

  const description = readString(record.description, {
    max: 255,
    field: "description",
    label: "La description",
  });

  return {
    paymentStage,
    amountCents,
    stageOrder,
    paymentReference: paymentReference || null,
    description: description || null,
    dueAt: readNullableDate(record.dueAt),
    bankDetails: parseBankDetails(record.bankDetails),
  };
}

export function parseAdminPaymentAction(
  input: unknown,
): {
  action: AdminPaymentMutationAction;
  data: unknown;
  reason: string | null;
} {
  const record = asRecord(input);
  const action = readString(record.action, {
    required: true,
    field: "action",
    label: "L’action",
  }) as AdminPaymentMutationAction;

  if (!ALLOWED_ACTIONS.has(action)) {
    throw new AdminPaymentValidationError(
      "Action de paiement non autorisée.",
    );
  }

  let reason: string | null = null;

  if (action === "reject" || action === "cancel") {
    const normalized = readString(record.reason, {
      required: action === "reject",
      min: action === "reject" ? 3 : undefined,
      max: 2_000,
      field: "reason",
      label: "La raison",
    });

    reason = normalized || null;
  }

  return {
    action,
    data: record.data,
    reason,
  };
}

export function getRequestAuditContext(request: Request): {
  ipHash: string | null;
  userAgent: string | null;
} {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const rawIp =
    forwarded ||
    request.headers.get("x-real-ip")?.trim() ||
    "";

  return {
    ipHash: rawIp
      ? createHash("sha256")
          .update(rawIp)
          .digest("hex")
      : null,
    userAgent:
      request.headers
        .get("user-agent")
        ?.trim()
        .slice(0, 512) || null,
  };
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");

  if (!origin) {
    return;
  }

  const host = request.headers.get("host");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const expectedHost = forwardedHost || host;

  if (!expectedHost) {
    throw new AdminPaymentValidationError(
      "Origine de requête impossible à vérifier.",
    );
  }

  let originHost = "";

  try {
    originHost = new URL(origin).host;
  } catch {
    throw new AdminPaymentValidationError(
      "Origine de requête invalide.",
    );
  }

  if (originHost !== expectedHost) {
    throw new AdminPaymentValidationError(
      "Origine de requête non autorisée.",
    );
  }
}
