/**
 * Express-Führerschein
 * Shared types for the admin driving-license application module.
 */

export type AdminApplicationViewStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "other";

export type AdminApplicationReviewAction =
  | "start_review"
  | "approve"
  | "reject";

export interface AdminApplicationsQuery {
  search: string;
  status: AdminApplicationViewStatus | "all";
  licenseClass: string;
  page: number;
  pageSize: number;
}

export interface AdminApplicationsStats {
  total: number;
  newCount: number;
  underReview: number;
  approved: number;
  rejected: number;
}

export interface AdminApplicationListCustomer {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
}

export interface AdminApplicationListItem {
  id: string;
  reference: string;
  userId: string;
  customer: AdminApplicationListCustomer;
  selectedClasses: string[];
  totalCents: number;
  currency: string;
  status: AdminApplicationViewStatus;
  rawStatus: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  documentCount: number;
}

export interface AdminApplicationsPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AdminApplicationsPageData {
  items: AdminApplicationListItem[];
  stats: AdminApplicationsStats;
  query: AdminApplicationsQuery;
  pagination: AdminApplicationsPagination;
}

export interface AdminApplicationCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneE164: string;
  countryCode: string;
  city: string | null;
  postalCode: string | null;
  addressLine1: string | null;
}

export interface AdminApplicationDocument {
  id: string;
  documentType: string;
  title: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
  viewUrl: string;
  downloadUrl: string;
}

export interface AdminApplicationSignature {
  available: boolean;
  type: string | null;
  viewUrl: string | null;
  downloadUrl: string | null;
}

export interface AdminApplicationReviewer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AdminApplicationTimelineItem {
  key: string;
  title: string;
  description: string | null;
  occurredAt: string;
  tone: "neutral" | "info" | "success" | "danger";
}

export interface AdminApplicationDetail {
  id: string;
  reference: string;
  userId: string;
  selectedClasses: string[];
  theoryPassed: boolean | null;
  practicalPassed: boolean | null;
  classesTotalCents: number;
  processingFeeCents: number;
  totalCents: number;
  currency: string;
  status: AdminApplicationViewStatus;
  rawStatus: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  customer: AdminApplicationCustomer;
  documents: AdminApplicationDocument[];
  signature: AdminApplicationSignature;
  reviewer: AdminApplicationReviewer | null;
  timeline: AdminApplicationTimelineItem[];
}

export interface AdminApplicationReviewInput {
  action: AdminApplicationReviewAction;
  reason?: string | null;
}

export interface AdminApplicationReviewResult {
  applicationId: string;
  status: AdminApplicationViewStatus;
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
}

export interface AdminApplicationFileTarget {
  bucket: string;
  storagePath: string;
  filename: string;
  mimeType: string;
}

export type AdminApplicationsApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "APPLICATION_NOT_FOUND"
  | "DOCUMENT_NOT_FOUND"
  | "STORAGE_CONFIGURATION_ERROR"
  | "STORAGE_DOWNLOAD_ERROR"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export interface AdminApplicationsApiErrorResponse {
  success: false;
  code: AdminApplicationsApiErrorCode;
  message: string;
  fields?: Record<string, string>;
}
