/* ==========================================================================
   EXPRESS-FÜHRERSCHEIN
   CLIENT PAYMENT TYPES
   ========================================================================== */

/* ==========================================================================
   PAYMENT STATUS
   ========================================================================== */

export type PaymentStatusView =
  | "draft"
  | "awaiting_payment"
  | "proof_submitted"
  | "under_review"
  | "paid"
  | "rejected"
  | "cancelled"
  | "other";


/* ==========================================================================
   BANK DETAILS
   ========================================================================== */

export interface PaymentBankDetailsView {
  accountHolder: string | null;

  bankName: string | null;

  iban: string | null;

  bic: string | null;

  country: string | null;

  reference: string | null;

  instructions: string | null;
}


/* ==========================================================================
   APPLICATION SUMMARY
   ========================================================================== */

export interface PaymentApplicationSummaryView {
  id: string;

  selectedClasses: string[];

  classesTotalCents: number;

  processingFeeCents: number;

  totalCents: number;

  currency: string;

  status: string;

  submittedAt: string | null;
}


/* ==========================================================================
   PAYMENT STEP
   ========================================================================== */

export interface PaymentStepView {
  id: string;

  stage: string | null;

  stageOrder: number;

  title: string;

  amountCents: number;

  currency: string;

  status: PaymentStatusView;

  /**
   * Original status stored in PostgreSQL.
   *
   * Kept separately so the frontend can safely normalize
   * unknown / legacy values to "other" without losing the
   * original database value.
   */
  rawStatus: string;

  paymentReference: string | null;

  activatedAt: string | null;

  dueAt: string | null;

  /**
   * Set only after the payment has actually been confirmed.
   */
  paidAt: string | null;

  proofSubmittedAt: string | null;

  rejectionReason: string | null;

  /**
   * Indicates whether the client is currently allowed
   * to submit a payment proof.
   */
  canPay: boolean;
}


/* ==========================================================================
   PAYMENTS PAGE
   ========================================================================== */

export interface PaymentsPageData {
  application:
    PaymentApplicationSummaryView | null;

  payments:
    PaymentStepView[];
}


/* ==========================================================================
   PAYMENT DETAIL
   ========================================================================== */

export interface PaymentDetailView
  extends PaymentStepView {
  applicationId: string;

  applicationClasses: string[];

  bankDetails:
    PaymentBankDetailsView;

  proofOriginalFilename:
    string | null;

  proofMimeType:
    string | null;

  proofFileSizeBytes:
    number | null;
}


/* ==========================================================================
   PAYMENT PROOF SUBMISSION
   ========================================================================== */

export interface PaymentProofSubmissionResult {
  paymentId: string;

  status:
    "proof_submitted";

  proofSubmittedAt:
    string;
}


/* ==========================================================================
   PAYMENT INVOICE
   ========================================================================== */

/**
 * Public/client representation of invoice availability.
 *
 * Important:
 * This type does NOT determine whether an invoice can be generated.
 * The server route remains the source of truth and verifies:
 *
 * - authenticated client;
 * - payment ownership;
 * - status === "paid";
 * - paid_at exists.
 */
export interface PaymentInvoiceView {
  paymentId: string;

  available: boolean;

  /**
   * Date on which the payment was confirmed.
   */
  paidAt: string | null;

  /**
   * Secure server route used for the PDF download.
   *
   * Example:
   * /api/payments/<paymentId>/invoice
   */
  downloadUrl: string | null;
}


/* ==========================================================================
   PAYMENT INVOICE DOWNLOAD
   ========================================================================== */

/**
 * Useful when a client component needs only the minimum
 * information required to display a PDF invoice action.
 *
 * This does not duplicate Prisma models.
 */
export interface PaymentInvoiceDownloadView {
  paymentId: string;

  status:
    PaymentStatusView;

  paidAt:
    string | null;
}


/* ==========================================================================
   PAYMENT INVOICE API ERROR
   ========================================================================== */

export type PaymentInvoiceApiErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_PAYMENT_ID"
  | "PAYMENT_NOT_FOUND"
  | "INVOICE_NOT_AVAILABLE"
  | "PAYMENT_DATE_MISSING"
  | "INVALID_PAYMENT_AMOUNT"
  | "INVOICE_GENERATION_FAILED";


export interface PaymentInvoiceApiErrorResponse {
  success: false;

  code:
    PaymentInvoiceApiErrorCode;

  message: string;
}