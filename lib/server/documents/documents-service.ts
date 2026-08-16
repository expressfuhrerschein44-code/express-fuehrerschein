import "server-only";

import {
  findDocumentStorageLocatorForUser,
  getDocumentsRepositorySnapshot,
} from "@/lib/server/documents/documents-repository";

import type {
  DocumentStatusView,
  DocumentsPageData,
  DocumentStorageLocator,
  DocumentView,
} from "@/types/documents";

function normalizeUserDocumentStatus(
  value: string,
): DocumentStatusView {
  switch (
    value
      .trim()
      .toLowerCase()
  ) {
    case "uploaded":
      return "uploaded";

    case "pending":
    case "processing":
    case "under_review":
    case "in_review":
      return "pending";

    case "verified":
    case "approved":
      return "verified";

    case "rejected":
      return "rejected";

    default:
      return "other";
  }
}

function applicationDocumentTitle(
  documentType: string,
  fallback: string,
): string {
  switch (
    documentType
      .trim()
      .toLowerCase()
  ) {
    case "id_front":
      return "Personalausweis – Vorderseite";

    case "id_back":
      return "Personalausweis – Rückseite";

    case "portrait_photo":
      return "Passfoto";

    default:
      return fallback;
  }
}

function cleanTitle(
  title: string | null,
  fallback: string,
): string {
  const normalized =
    title?.trim();

  return normalized ||
    fallback;
}

function toUserDocumentView(
  input: {
    id: string;
    documentType: string;
    title: string | null;
    originalFilename: string;
    mimeType: string;
    fileSizeBytes: number;
    status: string;
    rejectionReason: string | null;
    expiresOn: Date | null;
    uploadedAt: Date;
  },
): DocumentView {
  return {
    id:
      input.id,
    source:
      "user",
    documentType:
      input.documentType,
    title:
      cleanTitle(
        input.title,
        input.originalFilename,
      ),
    originalFilename:
      input.originalFilename,
    mimeType:
      input.mimeType,
    fileSizeBytes:
      Math.max(
        0,
        input.fileSizeBytes,
      ),
    status:
      normalizeUserDocumentStatus(
        input.status,
      ),
    rawStatus:
      input.status,
    rejectionReason:
      input.rejectionReason,
    expiresOn:
      input.expiresOn
        ?.toISOString() ??
      null,
    uploadedAt:
      input.uploadedAt.toISOString(),
  };
}

function toApplicationDocumentView(
  input: {
    id: string;
    documentType: string;
    originalFilename: string;
    mimeType: string;
    fileSizeBytes: number;
    submittedAt: Date | null;
    createdAt: Date;
  },
): DocumentView {
  const submitted =
    Boolean(
      input.submittedAt,
    );

  return {
    id:
      input.id,
    source:
      "application",
    documentType:
      input.documentType,
    title:
      applicationDocumentTitle(
        input.documentType,
        input.originalFilename,
      ),
    originalFilename:
      input.originalFilename,
    mimeType:
      input.mimeType,
    fileSizeBytes:
      Math.max(
        0,
        input.fileSizeBytes,
      ),
    status:
      submitted
        ? "submitted"
        : "uploaded",
    rawStatus:
      submitted
        ? "submitted"
        : "uploaded",
    rejectionReason:
      null,
    expiresOn:
      null,
    uploadedAt:
      input.createdAt.toISOString(),
  };
}

export async function getDocumentsPageData(
  input: {
    userId: string;
  },
): Promise<DocumentsPageData> {
  const snapshot =
    await getDocumentsRepositorySnapshot({
      userId:
        input.userId,
    });

  const userDocuments =
    snapshot.userDocuments.map(
      toUserDocumentView,
    );

  const applicationDocuments =
    snapshot.applicationDocuments.map(
      toApplicationDocumentView,
    );

  const allDocuments = [
    ...applicationDocuments,
    ...userDocuments,
  ];

  return {
    status:
      snapshot
        .activeLicenseClassCode
        ? "ready"
        : "no_active_license_class",

    licenseClassCode:
      snapshot
        .activeLicenseClassCode,

    overview: {
      totalDocuments:
        allDocuments.length,

      verifiedDocuments:
        userDocuments.filter(
          (
            document,
          ) =>
            document.status ===
            "verified",
        ).length,

      pendingDocuments:
        userDocuments.filter(
          (
            document,
          ) =>
            document.status ===
              "pending" ||
            document.status ===
              "uploaded",
        ).length,

      rejectedDocuments:
        userDocuments.filter(
          (
            document,
          ) =>
            document.status ===
            "rejected",
        ).length,
    },

    applicationDocuments,
    userDocuments,
  };
}

export async function getDocumentStorageLocator(
  input: {
    userId: string;
    documentId: string;
  },
): Promise<DocumentStorageLocator | null> {
  return findDocumentStorageLocatorForUser(
    input,
  );
}
