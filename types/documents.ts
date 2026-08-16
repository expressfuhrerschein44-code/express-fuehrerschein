export type DocumentsPageStatus =
  | "ready"
  | "no_active_license_class";

export type DocumentSourceView =
  | "user"
  | "application";

export type DocumentStatusView =
  | "uploaded"
  | "pending"
  | "verified"
  | "rejected"
  | "submitted"
  | "other";

export interface DocumentView {
  id: string;
  source: DocumentSourceView;
  documentType: string;
  title: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  status: DocumentStatusView;
  rawStatus: string;
  rejectionReason: string | null;
  expiresOn: string | null;
  uploadedAt: string;
}

export interface DocumentsOverviewView {
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  rejectedDocuments: number;
}

export interface DocumentsPageData {
  status: DocumentsPageStatus;
  licenseClassCode: string | null;
  overview: DocumentsOverviewView;
  applicationDocuments: DocumentView[];
  userDocuments: DocumentView[];
}

export interface DocumentStorageLocator {
  documentId: string;
  source: DocumentSourceView;
  storageBucket: string;
  storagePath: string;
  originalFilename: string;
  mimeType: string;
}
