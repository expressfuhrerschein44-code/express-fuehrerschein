"use client";

/**
 * Express-Führerschein
 * Required application document list.
 */

import {
  APPLICATION_DOCUMENTS,
} from "@/data/driving-license-application";

import {
  DocumentUploadItem,
} from "@/components/driving-license-application/document-upload-item";

import type {
  DrivingLicenseApplicationDocument,
  DrivingLicenseApplicationDocumentType,
} from "@/types/driving-license-application";

export interface DocumentUploadSectionProps {
  documents:
    DrivingLicenseApplicationDocument[];

  busy:
    boolean;

  onUpload:
    (
      documentType:
        DrivingLicenseApplicationDocumentType,

      file:
        File,
    ) =>
      Promise<boolean>;

  onDelete:
    (
      documentType:
        DrivingLicenseApplicationDocumentType,
    ) =>
      Promise<boolean>;
}

export function DocumentUploadSection({
  documents,

  busy,

  onUpload,

  onDelete,
}: DocumentUploadSectionProps) {
  return (
    <div className="space-y-2">
      {APPLICATION_DOCUMENTS.map(
        (
          item,
        ) => (
          <DocumentUploadItem
            key={
              item.type
            }
            documentType={
              item.type
            }
            label={
              item.label
            }
            description={
              `${item.description} · Max. ${Math.round(item.maxBytes / 1024 / 1024)} MB`
            }
            accept={
              item.accept
            }
            document={
              documents.find(
                (
                  document,
                ) =>
                  document.documentType ===
                  item.type,
              ) ??
              null
            }
            busy={
              busy
            }
            onUpload={
              onUpload
            }
            onDelete={
              onDelete
            }
          />
        ),
      )}
    </div>
  );
}
