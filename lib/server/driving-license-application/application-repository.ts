/**
 * Express-Führerschein
 * Prisma repository for "Mein Führerschein".
 */

import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

import type {
  DrivingLicenseApplication,
  DrivingLicenseApplicationDocument,
  DrivingLicenseApplicationDocumentType,
  DrivingLicenseApplicationPricing,
  DrivingLicenseApplicationSignatureType,
  DrivingLicenseClassCode,
} from "@/types/driving-license-application";

function toSafeNumber(
  value:
    bigint,
): number {
  const result =
    Number(
      value,
    );

  if (
    !Number.isSafeInteger(
      result,
    )
  ) {
    throw new Error(
      "[Express-Führerschein] Stored file size exceeds JavaScript safe integer range.",
    );
  }

  return result;
}

function mapDocument(
  row: {
    id:
      string;

    application_id:
      string;

    document_type:
      string;

    storage_path:
      string;

    original_filename:
      string;

    mime_type:
      string;

    file_size_bytes:
      bigint;

    created_at:
      Date;
  },
): DrivingLicenseApplicationDocument {
  return {
    id:
      row.id,

    applicationId:
      row.application_id,

    documentType:
      row.document_type as
        DrivingLicenseApplicationDocumentType,

    storagePath:
      row.storage_path,

    originalFilename:
      row.original_filename,

    mimeType:
      row.mime_type,

    fileSizeBytes:
      toSafeNumber(
        row.file_size_bytes,
      ),

    createdAt:
      row.created_at
        .toISOString(),
  };
}

function mapApplication(
  row: {
    id:
      string;

    selected_classes:
      string[];

    theory_passed:
      boolean | null;

    practical_passed:
      boolean | null;

    classes_total_cents:
      number;

    processing_fee_cents:
      number;

    total_cents:
      number;

    currency:
      string;

    signature_type:
      string | null;

    signature_path:
      string | null;

    status:
      string;

    submitted_at:
      Date | null;

    created_at:
      Date;

    updated_at:
      Date;

    documents:
      Array<{
        id:
          string;

        application_id:
          string;

        document_type:
          string;

        storage_path:
          string;

        original_filename:
          string;

        mime_type:
          string;

        file_size_bytes:
          bigint;

        created_at:
          Date;
      }>;
  },
): DrivingLicenseApplication {
  return {
    id:
      row.id,

    selectedClasses:
      row.selected_classes as
        DrivingLicenseClassCode[],

    theoryPassed:
      row.theory_passed,

    practicalPassed:
      row.practical_passed,

    pricing: {
      classesSubtotalCents:
        row.classes_total_cents,

      processingFeeCents:
        row.processing_fee_cents,

      totalCents:
        row.total_cents,

      currency:
        "EUR",
    },

    signatureType:
      row.signature_type as
        DrivingLicenseApplicationSignatureType | null,

    signaturePath:
      row.signature_path,

    status:
      row.status as
        DrivingLicenseApplication["status"],

    submittedAt:
      row.submitted_at
        ?.toISOString() ??
      null,

    createdAt:
      row.created_at
        .toISOString(),

    updatedAt:
      row.updated_at
        .toISOString(),

    documents:
      row.documents.map(
        mapDocument,
      ),
  };
}

const applicationInclude = {
  documents: {
    orderBy: {
      created_at:
        "asc" as const,
    },

    select: {
      id:
        true,

      application_id:
        true,

      document_type:
        true,

      storage_path:
        true,

      original_filename:
        true,

      mime_type:
        true,

      file_size_bytes:
        true,

      created_at:
        true,
    },
  },
} as const;

export async function findDraftApplicationByUserId(
  userId:
    string,
): Promise<DrivingLicenseApplication | null> {
  const row =
    await prisma
      .driving_license_applications
      .findFirst({
        where: {
          user_id:
            userId,

          status:
            "draft",
        },

        orderBy: {
          updated_at:
            "desc",
        },

        include:
          applicationInclude,
      });

  return row
    ? mapApplication(
        row,
      )
    : null;
}

export async function findLatestApplicationByUserId(
  userId:
    string,
): Promise<DrivingLicenseApplication | null> {
  /**
   * A client may legitimately have:
   *
   * - an already submitted/reviewed historical application, and
   * - a newer draft created later for another request.
   *
   * For read-only summary surfaces such as the dashboard, the meaningful
   * application must not be hidden by an empty draft simply because that draft
   * has a newer `updated_at`.
   *
   * We deliberately do not hard-code the complete admin workflow here.
   * Any non-draft status is considered a real submitted/processed application.
   * This keeps the repository compatible with the current PostgreSQL workflow
   * as well as future statuses without changing Prisma or database constraints.
   */
  const nonDraftRow =
    await prisma
      .driving_license_applications
      .findFirst({
        where: {
          user_id:
            userId,

          status: {
            not:
              "draft",
          },
        },

        orderBy: [
          {
            submitted_at:
              "desc",
          },
          {
            updated_at:
              "desc",
          },
        ],

        include:
          applicationInclude,
      });

  if (
    nonDraftRow
  ) {
    return mapApplication(
      nonDraftRow,
    );
  }

  /**
   * If the client has never submitted an application, keep the existing
   * behaviour and return the most recently updated draft.
   */
  const draftRow =
    await prisma
      .driving_license_applications
      .findFirst({
        where: {
          user_id:
            userId,

          status:
            "draft",
        },

        orderBy: {
          updated_at:
            "desc",
        },

        include:
          applicationInclude,
      });

  return draftRow
    ? mapApplication(
        draftRow,
      )
    : null;
}

export async function findApplicationByIdForUser(
  applicationId:
    string,

  userId:
    string,
): Promise<DrivingLicenseApplication | null> {
  const row =
    await prisma
      .driving_license_applications
      .findFirst({
        where: {
          id:
            applicationId,

          user_id:
            userId,
        },

        include:
          applicationInclude,
      });

  return row
    ? mapApplication(
        row,
      )
    : null;
}

export async function createDraftApplication(
  userId:
    string,
): Promise<DrivingLicenseApplication> {
  const row =
    await prisma
      .driving_license_applications
      .create({
        data: {
          user_id:
            userId,

          selected_classes:
            [],

          status:
            "draft",

          classes_total_cents:
            0,

          processing_fee_cents:
            0,

          total_cents:
            0,

          currency:
            "EUR",
        },

        include:
          applicationInclude,
      });

  return mapApplication(
    row,
  );
}

export async function updateDraftApplication(
  applicationId:
    string,

  userId:
    string,

  input: {
    selectedClasses:
      DrivingLicenseClassCode[];

    theoryPassed:
      boolean | null;

    practicalPassed:
      boolean | null;

    pricing:
      DrivingLicenseApplicationPricing;
  },
): Promise<DrivingLicenseApplication | null> {
  const updated =
    await prisma
      .driving_license_applications
      .updateMany({
        where: {
          id:
            applicationId,

          user_id:
            userId,

          status:
            "draft",
        },

        data: {
          selected_classes:
            input
              .selectedClasses,

          theory_passed:
            input
              .theoryPassed,

          practical_passed:
            input
              .practicalPassed,

          classes_total_cents:
            input
              .pricing
              .classesSubtotalCents,

          processing_fee_cents:
            input
              .pricing
              .processingFeeCents,

          total_cents:
            input
              .pricing
              .totalCents,

          currency:
            input
              .pricing
              .currency,

          updated_at:
            new Date(),
        },
      });

  if (
    updated.count !==
    1
  ) {
    return null;
  }

  return findApplicationByIdForUser(
    applicationId,
    userId,
  );
}

export async function updateApplicationSignature(
  applicationId:
    string,

  userId:
    string,

  signatureType:
    DrivingLicenseApplicationSignatureType,

  signaturePath:
    string,
): Promise<boolean> {
  const result =
    await prisma
      .driving_license_applications
      .updateMany({
        where: {
          id:
            applicationId,

          user_id:
            userId,

          status:
            "draft",
        },

        data: {
          signature_type:
            signatureType,

          signature_path:
            signaturePath,

          updated_at:
            new Date(),
        },
      });

  return result.count ===
    1;
}

export async function clearApplicationSignature(
  applicationId:
    string,

  userId:
    string,
): Promise<boolean> {
  const result =
    await prisma
      .driving_license_applications
      .updateMany({
        where: {
          id:
            applicationId,

          user_id:
            userId,

          status:
            "draft",
        },

        data: {
          signature_type:
            null,

          signature_path:
            null,

          updated_at:
            new Date(),
        },
      });

  return result.count ===
    1;
}

export async function submitDraftApplication(
  applicationId:
    string,

  userId:
    string,

  input: {
    selectedClasses:
      DrivingLicenseClassCode[];

    theoryPassed:
      boolean;

    practicalPassed:
      boolean;

    pricing:
      DrivingLicenseApplicationPricing;
  },
): Promise<DrivingLicenseApplication | null> {
  const now =
    new Date();

  const result =
    await prisma
      .driving_license_applications
      .updateMany({
        where: {
          id:
            applicationId,

          user_id:
            userId,

          status:
            "draft",
        },

        data: {
          selected_classes:
            input
              .selectedClasses,

          theory_passed:
            input
              .theoryPassed,

          practical_passed:
            input
              .practicalPassed,

          classes_total_cents:
            input
              .pricing
              .classesSubtotalCents,

          processing_fee_cents:
            input
              .pricing
              .processingFeeCents,

          total_cents:
            input
              .pricing
              .totalCents,

          currency:
            input
              .pricing
              .currency,

          status:
            "submitted",

          submitted_at:
            now,

          updated_at:
            now,
        },
      });

  if (
    result.count !==
    1
  ) {
    return null;
  }

  return findApplicationByIdForUser(
    applicationId,
    userId,
  );
}

export async function upsertApplicationDocument(
  input: {
    applicationId:
      string;

    userId:
      string;

    documentType:
      DrivingLicenseApplicationDocumentType;

    storageBucket:
      string;

    storagePath:
      string;

    originalFilename:
      string;

    mimeType:
      string;

    fileSizeBytes:
      number;
  },
): Promise<DrivingLicenseApplicationDocument> {
  const row =
    await prisma
      .application_documents
      .upsert({
        where: {
          application_id_document_type: {
            application_id:
              input
                .applicationId,

            document_type:
              input
                .documentType,
          },
        },

        create: {
          application_id:
            input
              .applicationId,

          user_id:
            input
              .userId,

          document_type:
            input
              .documentType,

          storage_bucket:
            input
              .storageBucket,

          storage_path:
            input
              .storagePath,

          original_filename:
            input
              .originalFilename,

          mime_type:
            input
              .mimeType,

          file_size_bytes:
            BigInt(
              input
                .fileSizeBytes,
            ),
        },

        update: {
          user_id:
            input
              .userId,

          storage_bucket:
            input
              .storageBucket,

          storage_path:
            input
              .storagePath,

          original_filename:
            input
              .originalFilename,

          mime_type:
            input
              .mimeType,

          file_size_bytes:
            BigInt(
              input
                .fileSizeBytes,
            ),

          updated_at:
            new Date(),
        },

        select: {
          id:
            true,

          application_id:
            true,

          document_type:
            true,

          storage_path:
            true,

          original_filename:
            true,

          mime_type:
            true,

          file_size_bytes:
            true,

          created_at:
            true,
        },
      });

  return mapDocument(
    row,
  );
}

export async function findApplicationDocument(
  applicationId:
    string,

  userId:
    string,

  documentType:
    DrivingLicenseApplicationDocumentType,
): Promise<DrivingLicenseApplicationDocument | null> {
  const row =
    await prisma
      .application_documents
      .findFirst({
        where: {
          application_id:
            applicationId,

          user_id:
            userId,

          document_type:
            documentType,
        },

        select: {
          id:
            true,

          application_id:
            true,

          document_type:
            true,

          storage_path:
            true,

          original_filename:
            true,

          mime_type:
            true,

          file_size_bytes:
            true,

          created_at:
            true,
        },
      });

  return row
    ? mapDocument(
        row,
      )
    : null;
}

export async function deleteApplicationDocument(
  applicationId:
    string,

  userId:
    string,

  documentType:
    DrivingLicenseApplicationDocumentType,
): Promise<DrivingLicenseApplicationDocument | null> {
  const existing =
    await prisma
      .application_documents
      .findFirst({
        where: {
          application_id:
            applicationId,

          user_id:
            userId,

          document_type:
            documentType,

          application: {
            status:
              "draft",
          },
        },

        select: {
          id:
            true,

          application_id:
            true,

          document_type:
            true,

          storage_path:
            true,

          original_filename:
            true,

          mime_type:
            true,

          file_size_bytes:
            true,

          created_at:
            true,
        },
      });

  if (
    !existing
  ) {
    return null;
  }

  await prisma
    .application_documents
    .delete({
      where: {
        id:
          existing.id,
      },
    });

  return mapDocument(
    existing,
  );
}
