/**
 * Express-Führerschein
 * Shared contracts for the "Mein Führerschein" application page.
 *
 * Values intentionally match the PostgreSQL constraints from the
 * driving-license application Prisma migration.
 */

export type DrivingLicenseClassCode =
  | "B"
  | "A"
  | "C"
  | "D"
  | "BE"
  | "AM";

export type DrivingLicenseApplicationStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "rejected";

export type DrivingLicenseApplicationDocumentType =
  | "id_front"
  | "id_back"
  | "portrait_photo";

export type DrivingLicenseApplicationSignatureType =
  | "drawn"
  | "uploaded";

export type DrivingLicenseApplicationCurrency = "EUR";

export interface DrivingLicenseClassOption {
  code: DrivingLicenseClassCode;
  label: string;
  vehicle: string;
  description: string;
  priceCents: number;
  image: string;
  sortOrder: number;
}

export interface DrivingLicenseApplicationPricing {
  classesSubtotalCents: number;
  processingFeeCents: number;
  totalCents: number;
  currency: DrivingLicenseApplicationCurrency;
}

export interface DrivingLicenseApplicationDocument {
  id: string;
  applicationId: string;
  documentType: DrivingLicenseApplicationDocumentType;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface DrivingLicenseApplication {
  id: string;
  selectedClasses: DrivingLicenseClassCode[];
  theoryPassed: boolean | null;
  practicalPassed: boolean | null;
  pricing: DrivingLicenseApplicationPricing;
  signatureType: DrivingLicenseApplicationSignatureType | null;
  signaturePath: string | null;
  status: DrivingLicenseApplicationStatus;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  documents: DrivingLicenseApplicationDocument[];
}

export interface DrivingLicenseApplicationPersonalInformation {
  firstName: string;
  lastName: string;
  email: string;
  phoneE164: string;
  countryCode: string;
  city: string | null;
  postalCode: string | null;
  addressLine1: string | null;
  profileComplete: boolean;
}

export interface DrivingLicenseApplicationPageData {
  personalInformation: DrivingLicenseApplicationPersonalInformation;
  application: DrivingLicenseApplication;
  licenseClasses: readonly DrivingLicenseClassOption[];
}

export interface SaveDrivingLicenseApplicationInput {
  selectedClasses: DrivingLicenseClassCode[];
  theoryPassed: boolean | null;
  practicalPassed: boolean | null;
}

export interface SubmitDrivingLicenseApplicationInput {
  selectedClasses: DrivingLicenseClassCode[];
  theoryPassed: boolean;
  practicalPassed: boolean;
}

export interface UploadApplicationDocumentInput {
  documentType: DrivingLicenseApplicationDocumentType;
  bytes: Uint8Array;
  mimeType: string;
  originalFilename: string;
}

export interface UploadApplicationSignatureInput {
  signatureType: DrivingLicenseApplicationSignatureType;
  bytes: Uint8Array;
  mimeType: string;
  originalFilename: string;
}

export type DrivingLicenseApplicationApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHENTICATED"
  | "ACCOUNT_UNAVAILABLE"
  | "APPLICATION_NOT_FOUND"
  | "APPLICATION_NOT_EDITABLE"
  | "PROFILE_INCOMPLETE"
  | "DOCUMENT_REQUIRED"
  | "DOCUMENT_INVALID_TYPE"
  | "DOCUMENT_TOO_LARGE"
  | "SIGNATURE_REQUIRED"
  | "SIGNATURE_INVALID_TYPE"
  | "SIGNATURE_TOO_LARGE"
  | "STORAGE_NOT_CONFIGURED"
  | "STORAGE_ERROR"
  | "DATABASE_ERROR"
  | "EMAIL_DELIVERY_ERROR"
  | "INTERNAL_ERROR";

export interface DrivingLicenseApplicationApiSuccess<T = undefined> {
  ok: true;
  message: string;
  data?: T;
}

export interface DrivingLicenseApplicationApiError {
  ok: false;
  code: DrivingLicenseApplicationApiErrorCode;
  message: string;
  fields?: Record<string, string>;
}

export type DrivingLicenseApplicationApiResponse<T = undefined> =
  | DrivingLicenseApplicationApiSuccess<T>
  | DrivingLicenseApplicationApiError;

export class DrivingLicenseApplicationServiceError extends Error {
  constructor(
    public readonly code: DrivingLicenseApplicationApiErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "DrivingLicenseApplicationServiceError";
  }
}
