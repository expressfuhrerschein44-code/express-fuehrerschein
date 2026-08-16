import "server-only";

import {
  findPaymentApplicationForUser,
  findVisiblePaymentForUser,
  getPaymentsRepositorySnapshot,
  savePaymentProofMetadata,
} from "@/lib/server/payments/payments-repository";

import {
  deletePaymentProofObject,
  uploadPaymentProofObject,
} from "@/lib/server/payments/payments-storage";

import type {
  PaymentApplicationRecord,
  PaymentRecord,
} from "@/lib/server/payments/payments-repository";

import type {
  PaymentApplicationSummaryView,
  PaymentBankDetailsView,
  PaymentDetailView,
  PaymentProofSubmissionResult,
  PaymentStatusView,
  PaymentStepView,
  PaymentsPageData,
} from "@/types/payments";

const MAX_PAYMENT_PROOF_BYTES =
  10 *
  1024 *
  1024;

const ALLOWED_PAYMENT_PROOF_MIME_TYPES =
  new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
  ]);

export class PaymentsServiceError
  extends Error {
  readonly code: string;
  readonly status: number;

  constructor(
    code: string,
    message: string,
    status =
      400,
  ) {
    super(
      message,
    );

    this.name =
      "PaymentsServiceError";

    this.code =
      code;

    this.status =
      status;
  }
}

function safeNumber(
  value: bigint | null,
): number | null {
  if (
    value ===
    null
  ) {
    return null;
  }

  const converted =
    Number(
      value,
    );

  return Number.isFinite(
    converted,
  )
    ? Math.max(
        0,
        converted,
      )
    : null;
}

function normalizePaymentStatus(
  value: string,
): PaymentStatusView {
  switch (
    value
      .trim()
      .toLowerCase()
  ) {
    case "draft":
      return "draft";

    case "awaiting_payment":
      return "awaiting_payment";

    case "proof_submitted":
      return "proof_submitted";

    case "under_review":
      return "under_review";

    case "paid":
      return "paid";

    case "rejected":
      return "rejected";

    case "cancelled":
    case "canceled":
      return "cancelled";

    default:
      return "other";
  }
}

function paymentStageTitle(
  paymentStage: string | null,
  description: string | null,
): string {
  const descriptionValue =
    description
      ?.trim();

  if (descriptionValue) {
    return descriptionValue;
  }

  switch (
    paymentStage
      ?.trim()
      .toLowerCase()
  ) {
    case "processing_fee":
      return "Bearbeitungsgebühr";

    case "first_installment":
      return "Erste Rate";

    case "second_installment":
      return "Zweite Rate";

    case "remaining_balance":
      return "Restbetrag";

    case "license_fee":
      return "Führerscheingebühr";

    default:
      return "Zahlung";
  }
}

function recordValue(
  record: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (
    const key of keys
  ) {
    const value =
      record[
        key
      ];

    if (
      typeof value ===
        "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return null;
}

function parseBankDetails(
  snapshot: unknown,
  paymentReference: string | null,
): PaymentBankDetailsView {
  if (
    !snapshot ||
    typeof snapshot !==
      "object" ||
    Array.isArray(
      snapshot,
    )
  ) {
    return {
      accountHolder:
        null,
      bankName:
        null,
      iban:
        null,
      bic:
        null,
      country:
        null,
      reference:
        paymentReference,
      instructions:
        null,
    };
  }

  const record =
    snapshot as Record<
      string,
      unknown
    >;

  return {
    accountHolder:
      recordValue(
        record,
        [
          "accountHolder",
          "account_holder",
          "holder",
        ],
      ),
    bankName:
      recordValue(
        record,
        [
          "bankName",
          "bank_name",
          "bank",
        ],
      ),
    iban:
      recordValue(
        record,
        [
          "iban",
          "IBAN",
        ],
      ),
    bic:
      recordValue(
        record,
        [
          "bic",
          "BIC",
          "swift",
        ],
      ),
    country:
      recordValue(
        record,
        [
          "country",
          "countryName",
          "country_name",
        ],
      ),
    reference:
      recordValue(
        record,
        [
          "reference",
          "paymentReference",
          "payment_reference",
        ],
      ) ??
      paymentReference,
    instructions:
      recordValue(
        record,
        [
          "instructions",
          "instruction",
          "note",
        ],
      ),
  };
}

function mapApplication(
  application: PaymentApplicationRecord,
): PaymentApplicationSummaryView {
  return {
    id:
      application.id,
    selectedClasses:
      application.selectedClasses,
    classesTotalCents:
      application.classesTotalCents,
    processingFeeCents:
      application.processingFeeCents,
    totalCents:
      application.totalCents,
    currency:
      application.currency,
    status:
      application.status,
    submittedAt:
      application.submittedAt
        ?.toISOString() ??
      null,
  };
}

function mapPaymentStep(
  payment: PaymentRecord,
): PaymentStepView {
  const status =
    normalizePaymentStatus(
      payment.status,
    );

  return {
    id:
      payment.id,
    stage:
      payment.paymentStage,
    stageOrder:
      payment.stageOrder,
    title:
      paymentStageTitle(
        payment.paymentStage,
        payment.description,
      ),
    amountCents:
      Math.max(
        0,
        payment.amountCents,
      ),
    currency:
      payment.currency,
    status,
    rawStatus:
      payment.status,
    paymentReference:
      payment.paymentReference,
    activatedAt:
      payment.activatedAt
        ?.toISOString() ??
      null,
    dueAt:
      payment.dueAt
        ?.toISOString() ??
      null,
    paidAt:
      payment.paidAt
        ?.toISOString() ??
      null,
    proofSubmittedAt:
      payment.proofSubmittedAt
        ?.toISOString() ??
      null,
    rejectionReason:
      payment.rejectionReason,
    canPay:
      status ===
        "awaiting_payment" ||
      status ===
        "rejected",
  };
}

export async function getPaymentsPageData(
  userId: string,
): Promise<PaymentsPageData> {
  const snapshot =
    await getPaymentsRepositorySnapshot(
      userId,
    );

  return {
    application:
      snapshot.application
        ? mapApplication(
            snapshot.application,
          )
        : null,
    payments:
      snapshot.payments.map(
        mapPaymentStep,
      ),
  };
}

export async function getPaymentDetail(
  input: {
    userId: string;
    paymentId: string;
  },
): Promise<PaymentDetailView | null> {
  const payment =
    await findVisiblePaymentForUser(
      input,
    );

  if (!payment) {
    return null;
  }

  const application =
    await findPaymentApplicationForUser({
      userId:
        input.userId,
      applicationId:
        payment.applicationId,
    });

  if (!application) {
    return null;
  }

  return {
    ...mapPaymentStep(
      payment,
    ),
    applicationId:
      application.id,
    applicationClasses:
      application.selectedClasses,
    bankDetails:
      parseBankDetails(
        payment.bankDetailsSnapshot,
        payment.paymentReference,
      ),
    proofOriginalFilename:
      payment.proofOriginalFilename,
    proofMimeType:
      payment.proofMimeType,
    proofFileSizeBytes:
      safeNumber(
        payment.proofFileSizeBytes,
      ),
  };
}

export async function submitPaymentProof(
  input: {
    userId: string;
    paymentId: string;
    originalFilename: string;
    mimeType: string;
    bytes: Uint8Array;
  },
): Promise<PaymentProofSubmissionResult> {
  const payment =
    await findVisiblePaymentForUser({
      userId:
        input.userId,
      paymentId:
        input.paymentId,
    });

  if (!payment) {
    throw new PaymentsServiceError(
      "PAYMENT_NOT_FOUND",
      "Die Zahlung wurde nicht gefunden.",
      404,
    );
  }

  const normalizedStatus =
    normalizePaymentStatus(
      payment.status,
    );

  if (
    normalizedStatus !==
      "awaiting_payment" &&
    normalizedStatus !==
      "rejected"
  ) {
    throw new PaymentsServiceError(
      "PAYMENT_PROOF_NOT_ALLOWED",
      "Für diese Zahlung kann aktuell kein neuer Zahlungsnachweis eingereicht werden.",
      409,
    );
  }

  const mimeType =
    input.mimeType
      .trim()
      .toLowerCase();

  if (
    !ALLOWED_PAYMENT_PROOF_MIME_TYPES.has(
      mimeType,
    )
  ) {
    throw new PaymentsServiceError(
      "PAYMENT_PROOF_TYPE_NOT_ALLOWED",
      "Erlaubt sind PDF-, JPG- und PNG-Dateien.",
      400,
    );
  }

  if (
    input.bytes.byteLength <=
      0 ||
    input.bytes.byteLength >
      MAX_PAYMENT_PROOF_BYTES
  ) {
    throw new PaymentsServiceError(
      "PAYMENT_PROOF_SIZE_INVALID",
      "Der Zahlungsnachweis darf maximal 10 MB groß sein.",
      400,
    );
  }

  const application =
    await findPaymentApplicationForUser({
      userId:
        input.userId,
      applicationId:
        payment.applicationId,
    });

  if (!application) {
    throw new PaymentsServiceError(
      "PAYMENT_APPLICATION_NOT_FOUND",
      "Der zugehörige Führerscheinantrag wurde nicht gefunden.",
      404,
    );
  }

  const uploaded =
    await uploadPaymentProofObject({
      userId:
        input.userId,
      applicationId:
        application.id,
      paymentId:
        payment.id,
      bytes:
        input.bytes,
      mimeType,
    });

  const submittedAt =
    new Date();

  const saved =
    await savePaymentProofMetadata({
      userId:
        input.userId,
      paymentId:
        payment.id,
      storageBucket:
        uploaded.storageBucket,
      storagePath:
        uploaded.storagePath,
      originalFilename:
        input.originalFilename
          .trim()
          .slice(
            0,
            255,
          ) ||
        "zahlungsnachweis",
      mimeType,
      fileSizeBytes:
        BigInt(
          input.bytes.byteLength,
        ),
      submittedAt,
    });

  if (!saved) {
    await deletePaymentProofObject({
      storageBucket:
        uploaded.storageBucket,
      storagePath:
        uploaded.storagePath,
    });

    throw new PaymentsServiceError(
      "PAYMENT_STATE_CHANGED",
      "Der Zahlungsstatus hat sich geändert. Bitte lade die Seite neu.",
      409,
    );
  }

  if (
    payment.proofStorageBucket &&
    payment.proofStoragePath
  ) {
    await deletePaymentProofObject({
      storageBucket:
        payment.proofStorageBucket,
      storagePath:
        payment.proofStoragePath,
    });
  }

  return {
    paymentId:
      payment.id,
    status:
      "proof_submitted",
    proofSubmittedAt:
      submittedAt.toISOString(),
  };
}
