/**
 * Express-Führerschein
 * Admin payment workflow view/input types.
 *
 * Important:
 * - These are application/view types only.
 * - Prisma model types are not duplicated here.
 * - Date values crossing the server/client boundary are ISO strings.
 */

export const ADMIN_PAYMENT_STATUSES = [
  "draft",
  "awaiting_payment",
  "proof_submitted",
  "under_review",
  "paid",
  "rejected",
  "cancelled",
] as const;

export type AdminPaymentStatus =
  (typeof ADMIN_PAYMENT_STATUSES)[number];

export type AdminPaymentListStatusFilter =
  | "all"
  | AdminPaymentStatus
  | "to_review";

export interface AdminPaymentActor {
  id: string;
  email: string | null;
  role: string;
}

export interface AdminPaymentBankDetails {
  accountHolder: string;
  bankName: string;
  iban: string;
  bic: string;
  country: string;
  reference: string;
  instructions: string;
}

export interface AdminPaymentClient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface AdminPaymentApplication {
  id: string;
  reference: string | null;
  selectedClasses: string[];
  classesTotalCents: number;
  processingFeeCents: number;
  totalCents: number;
  currency: string;
  status: string;
  submittedAt: string | null;
}

export interface AdminPaymentCreationApplication {
  id: string;
  reference: string | null;
  client: AdminPaymentClient;
  selectedClasses: string[];
  totalCents: number;
  currency: string;
  status: string;
  submittedAt: string | null;
  nextStageOrder: number;
}

export interface AdminPaymentListItem {
  id: string;
  client: AdminPaymentClient;
  application: AdminPaymentApplication | null;
  stage: string;
  stageOrder: number;
  reference: string | null;
  amountCents: number;
  currency: string;
  status: AdminPaymentStatus;
  hasProof: boolean;
  proofSubmittedAt: string | null;
  dueAt: string | null;
  activatedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentsStats {
  total: number;
  draft: number;
  awaitingPayment: number;
  toReview: number;
  paid: number;
  rejected: number;
  cancelled: number;
}

export interface AdminPaymentsFilters {
  query: string;
  status: AdminPaymentListStatusFilter;
}

export interface AdminPaymentsPageData {
  payments: AdminPaymentListItem[];
  stats: AdminPaymentsStats;
  filters: AdminPaymentsFilters;
  applications: AdminPaymentCreationApplication[];
}

export interface AdminPaymentProof {
  bucket: string;
  path: string;
  originalFilename: string | null;
  mimeType: string | null;
  fileSizeBytes: string | null;
  submittedAt: string | null;
}

export interface AdminPaymentTimelineItem {
  key: string;
  label: string;
  description: string | null;
  occurredAt: string;
  tone:
    | "neutral"
    | "info"
    | "success"
    | "warning"
    | "danger";
}

export interface AdminPaymentDetail {
  id: string;
  client: AdminPaymentClient;
  application: AdminPaymentApplication | null;
  provider: string;
  stage: string;
  stageOrder: number;
  reference: string | null;
  amountCents: number;
  currency: string;
  status: AdminPaymentStatus;
  description: string | null;
  dueAt: string | null;
  activatedAt: string | null;
  activatedByAdminId: string | null;
  reviewedAt: string | null;
  reviewedByAdminId: string | null;
  rejectionReason: string | null;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  bankDetails: AdminPaymentBankDetails | null;
  proof: AdminPaymentProof | null;
  timeline: AdminPaymentTimelineItem[];
}

export interface CreateAdminPaymentInput {
  applicationId: string;
  paymentStage: string;
  amountCents: number;
  stageOrder?: number;
  paymentReference?: string | null;
  description?: string | null;
  dueAt?: string | null;
  bankDetails: Omit<AdminPaymentBankDetails, "reference"> & {
    reference?: string | null;
  };
  activate?: boolean;
}

export interface UpdateAdminPaymentInput {
  paymentStage: string;
  amountCents: number;
  stageOrder: number;
  paymentReference?: string | null;
  description?: string | null;
  dueAt?: string | null;
  bankDetails: Omit<AdminPaymentBankDetails, "reference"> & {
    reference?: string | null;
  };
}

export type AdminPaymentMutationAction =
  | "update"
  | "activate"
  | "start_review"
  | "confirm"
  | "reject"
  | "cancel";

export interface AdminPaymentMutationRequest {
  action: AdminPaymentMutationAction;
  data?: unknown;
  reason?: string;
}

export interface AdminPaymentApiSuccess<T = unknown> {
  ok: true;
  data: T;
  message: string;
}

export interface AdminPaymentApiError {
  ok: false;
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export type AdminPaymentApiResponse<T = unknown> =
  | AdminPaymentApiSuccess<T>
  | AdminPaymentApiError;
