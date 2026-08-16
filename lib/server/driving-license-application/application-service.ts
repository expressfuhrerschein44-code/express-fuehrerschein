/**
 * Express-Führerschein
 * Server application service for "Mein Führerschein".
 */

import "server-only";

import {
  calculateApplicationPricing,
  DRIVING_LICENSE_APPLICATION_STORAGE_BUCKET,
  DRIVING_LICENSE_CLASSES,
  REQUIRED_APPLICATION_DOCUMENT_TYPES,
} from "@/data/driving-license-application";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  findProfileByUserId,
} from "@/lib/server/profile/profile-repository";

import {
  clearApplicationSignature,
  createDraftApplication,
  deleteApplicationDocument,
  findApplicationDocument,
  findDraftApplicationByUserId,
  submitDraftApplication,
  updateApplicationSignature,
  updateDraftApplication,
  upsertApplicationDocument,
} from "@/lib/server/driving-license-application/application-repository";

import {
  deleteApplicationStorageObject,
  uploadApplicationDocumentObject,
  uploadApplicationSignatureObject,
} from "@/lib/server/driving-license-application/application-storage";

import {
  sendApplicationSubmittedEmails,
} from "@/lib/server/driving-license-application/application-email-service";


import {
  activateSubmittedApplicationLicenseClasses,
} from "@/lib/server/driving-license-application/application-license-activation-service";

import {
  validateApplicationDocumentFile,
  validateApplicationSignatureFile,
  validateSaveDrivingLicenseApplicationInput,
  validateSubmitDrivingLicenseApplicationInput,
} from "@/lib/validation/driving-license-application";

import {
  DrivingLicenseApplicationServiceError,
} from "@/types/driving-license-application";

import type {
  DrivingLicenseApplication,
  DrivingLicenseApplicationDocument,
  DrivingLicenseApplicationDocumentType,
  DrivingLicenseApplicationPageData,
  DrivingLicenseApplicationSignatureType,
  UploadApplicationDocumentInput,
  UploadApplicationSignatureInput,
} from "@/types/driving-license-application";

async function currentUserId():
  Promise<string> {
  try {
    const session =
      await requireClientSession();

    return session
      .user
      .id;
  } catch {
    throw new DrivingLicenseApplicationServiceError(
      "UNAUTHENTICATED",

      "Bitte melde dich an, um deinen Führerscheinantrag zu bearbeiten.",
    );
  }
}

async function getOrCreateDraftForUser(
  userId:
    string,
): Promise<DrivingLicenseApplication> {
  const existing =
    await findDraftApplicationByUserId(
      userId,
    );

  if (
    existing
  ) {
    return existing;
  }

  return createDraftApplication(
    userId,
  );
}

function assertDraft(
  application:
    DrivingLicenseApplication,
): void {
  if (
    application.status !==
    "draft"
  ) {
    throw new DrivingLicenseApplicationServiceError(
      "APPLICATION_NOT_EDITABLE",

      "Dieser Antrag kann nicht mehr bearbeitet werden.",
    );
  }
}

export async function getDrivingLicenseApplicationPageData():
  Promise<DrivingLicenseApplicationPageData> {
  const userId =
    await currentUserId();

  try {
    const [
      profile,
      application,
    ] =
      await Promise.all([
        findProfileByUserId(
          userId,
        ),

        getOrCreateDraftForUser(
          userId,
        ),
      ]);

    if (
      !profile
    ) {
      throw new DrivingLicenseApplicationServiceError(
        "ACCOUNT_UNAVAILABLE",

        "Dein Profil konnte nicht gefunden werden.",
      );
    }

    const profileComplete =
      Boolean(
        profile.firstName.trim() &&
        profile.lastName.trim() &&
        profile.email.trim() &&
        profile.phoneE164.trim() &&
        profile.countryCode.trim() &&
        profile.city?.trim() &&
        profile.postalCode?.trim() &&
        profile.addressLine1?.trim(),
      );

    return {
      personalInformation: {
        firstName:
          profile.firstName,

        lastName:
          profile.lastName,

        email:
          profile.email,

        phoneE164:
          profile.phoneE164,

        countryCode:
          profile.countryCode,

        city:
          profile.city,

        postalCode:
          profile.postalCode,

        addressLine1:
          profile.addressLine1,

        profileComplete,
      },

      application,

      licenseClasses:
        DRIVING_LICENSE_CLASSES,
    };
  } catch (
    error:
      unknown
  ) {
    if (
      error instanceof
      DrivingLicenseApplicationServiceError
    ) {
      throw error;
    }

    console.error(
      "[DRIVING_LICENSE_APPLICATION_PAGE_ERROR]",
      error instanceof Error
        ? error.message
        : error,
    );

    throw new DrivingLicenseApplicationServiceError(
      "DATABASE_ERROR",

      "Der Führerscheinantrag konnte gerade nicht geladen werden.",
    );
  }
}

export async function saveCurrentDrivingLicenseApplication(
  rawInput:
    unknown,
): Promise<DrivingLicenseApplication> {
  const userId =
    await currentUserId();

  const validation =
    validateSaveDrivingLicenseApplicationInput(
      rawInput,
    );

  if (
    !validation.success
  ) {
    throw new DrivingLicenseApplicationServiceError(
      "VALIDATION_ERROR",

      "Die Antragsdaten sind ungültig.",

      validation.errors,
    );
  }

  const draft =
    await getOrCreateDraftForUser(
      userId,
    );

  assertDraft(
    draft,
  );

  const pricing =
    calculateApplicationPricing(
      validation.data
        .selectedClasses,
    );

  const updated =
    await updateDraftApplication(
      draft.id,
      userId,
      {
        selectedClasses:
          validation.data
            .selectedClasses,

        theoryPassed:
          validation.data
            .theoryPassed,

        practicalPassed:
          validation.data
            .practicalPassed,

        pricing,
      },
    );

  if (
    !updated
  ) {
    throw new DrivingLicenseApplicationServiceError(
      "APPLICATION_NOT_EDITABLE",

      "Der Antrag konnte nicht mehr bearbeitet werden.",
    );
  }

  return updated;
}

export async function uploadCurrentApplicationDocument(
  input:
    UploadApplicationDocumentInput,
): Promise<DrivingLicenseApplicationDocument> {
  const userId =
    await currentUserId();

  const validation =
    validateApplicationDocumentFile(
      input.documentType,
      input.mimeType,
      input.bytes.byteLength,
    );

  if (
    !validation.success
  ) {
    const message =
      validation.errors.file ??
      "Das Dokument ist ungültig.";

    throw new DrivingLicenseApplicationServiceError(
      message.includes("groß")
        ? "DOCUMENT_TOO_LARGE"
        : "DOCUMENT_INVALID_TYPE",

      message,

      validation.errors,
    );
  }

  const draft =
    await getOrCreateDraftForUser(
      userId,
    );

  assertDraft(
    draft,
  );

  const existing =
    await findApplicationDocument(
      draft.id,
      userId,
      input.documentType,
    );

  const storagePath =
    await uploadApplicationDocumentObject({
      userId,

      applicationId:
        draft.id,

      documentType:
        input.documentType,

      bytes:
        input.bytes,

      mimeType:
        input.mimeType,
    });

  try {
    const document =
      await upsertApplicationDocument({
        applicationId:
          draft.id,

        userId,

        documentType:
          input.documentType,

        storageBucket:
          DRIVING_LICENSE_APPLICATION_STORAGE_BUCKET,

        storagePath,

        originalFilename:
          input.originalFilename
            .trim()
            .slice(
              0,
              255,
            ) ||
          "document",

        mimeType:
          input.mimeType,

        fileSizeBytes:
          input.bytes.byteLength,
      });

    if (
      existing &&
      existing.storagePath !==
        storagePath
    ) {
      await deleteApplicationStorageObject(
        existing.storagePath,
      ).catch(
        (
          error:
            unknown,
        ) => {
          console.error(
            "[DRIVING_LICENSE_OLD_DOCUMENT_DELETE_ERROR]",
            error,
          );
        },
      );
    }

    return document;
  } catch (
    error:
      unknown
  ) {
    await deleteApplicationStorageObject(
      storagePath,
    ).catch(
      () =>
        undefined,
    );

    throw error;
  }
}

export async function deleteCurrentApplicationDocument(
  documentType:
    DrivingLicenseApplicationDocumentType,
): Promise<void> {
  const userId =
    await currentUserId();

  const draft =
    await getOrCreateDraftForUser(
      userId,
    );

  assertDraft(
    draft,
  );

  const document =
    await deleteApplicationDocument(
      draft.id,
      userId,
      documentType,
    );

  if (
    document
  ) {
    await deleteApplicationStorageObject(
      document.storagePath,
    ).catch(
      (
        error:
          unknown,
      ) => {
        console.error(
          "[DRIVING_LICENSE_DOCUMENT_STORAGE_DELETE_ERROR]",
          error,
        );
      },
    );
  }
}

export async function uploadCurrentApplicationSignature(
  input:
    UploadApplicationSignatureInput,
): Promise<{
  signatureType:
    DrivingLicenseApplicationSignatureType;

  signaturePath:
    string;
}> {
  const userId =
    await currentUserId();

  const validation =
    validateApplicationSignatureFile(
      input.signatureType,
      input.mimeType,
      input.bytes.byteLength,
    );

  if (
    !validation.success
  ) {
    const message =
      validation.errors.signature ??
      "Die Unterschrift ist ungültig.";

    throw new DrivingLicenseApplicationServiceError(
      message.includes("groß")
        ? "SIGNATURE_TOO_LARGE"
        : "SIGNATURE_INVALID_TYPE",

      message,

      validation.errors,
    );
  }

  const draft =
    await getOrCreateDraftForUser(
      userId,
    );

  assertDraft(
    draft,
  );

  const oldSignaturePath =
    draft.signaturePath;

  const storagePath =
    await uploadApplicationSignatureObject({
      userId,

      applicationId:
        draft.id,

      signatureType:
        input.signatureType,

      bytes:
        input.bytes,

      mimeType:
        input.mimeType,
    });

  const updated =
    await updateApplicationSignature(
      draft.id,
      userId,
      input.signatureType,
      storagePath,
    );

  if (
    !updated
  ) {
    await deleteApplicationStorageObject(
      storagePath,
    ).catch(
      () =>
        undefined,
    );

    throw new DrivingLicenseApplicationServiceError(
      "APPLICATION_NOT_EDITABLE",

      "Die Unterschrift konnte nicht mehr gespeichert werden.",
    );
  }

  if (
    oldSignaturePath &&
    oldSignaturePath !==
      storagePath
  ) {
    await deleteApplicationStorageObject(
      oldSignaturePath,
    ).catch(
      (
        error:
          unknown,
      ) => {
        console.error(
          "[DRIVING_LICENSE_OLD_SIGNATURE_DELETE_ERROR]",
          error,
        );
      },
    );
  }

  return {
    signatureType:
      input.signatureType,

    signaturePath:
      storagePath,
  };
}

export async function deleteCurrentApplicationSignature():
  Promise<void> {
  const userId =
    await currentUserId();

  const draft =
    await getOrCreateDraftForUser(
      userId,
    );

  assertDraft(
    draft,
  );

  const storagePath =
    draft.signaturePath;

  await clearApplicationSignature(
    draft.id,
    userId,
  );

  if (
    storagePath
  ) {
    await deleteApplicationStorageObject(
      storagePath,
    ).catch(
      (
        error:
          unknown,
      ) => {
        console.error(
          "[DRIVING_LICENSE_SIGNATURE_STORAGE_DELETE_ERROR]",
          error,
        );
      },
    );
  }
}

export async function submitCurrentDrivingLicenseApplication(
  rawInput:
    unknown,
): Promise<{
  application:
    DrivingLicenseApplication;

  email: {
    clientSent:
      boolean;

    adminSent:
      boolean;
  };
}> {
  const userId =
    await currentUserId();

  const validation =
    validateSubmitDrivingLicenseApplicationInput(
      rawInput,
    );

  if (
    !validation.success
  ) {
    throw new DrivingLicenseApplicationServiceError(
      "VALIDATION_ERROR",

      "Bitte vervollständige den Antrag.",

      validation.errors,
    );
  }

  const [
    profile,
    draft,
  ] =
    await Promise.all([
      findProfileByUserId(
        userId,
      ),

      getOrCreateDraftForUser(
        userId,
      ),
    ]);

  if (
    !profile
  ) {
    throw new DrivingLicenseApplicationServiceError(
      "ACCOUNT_UNAVAILABLE",

      "Dein Profil konnte nicht gefunden werden.",
    );
  }

  assertDraft(
    draft,
  );

  const profileComplete =
    Boolean(
      profile.firstName.trim() &&
      profile.lastName.trim() &&
      profile.email.trim() &&
      profile.phoneE164.trim() &&
      profile.countryCode.trim() &&
      profile.city?.trim() &&
      profile.postalCode?.trim() &&
      profile.addressLine1?.trim(),
    );

  if (
    !profileComplete
  ) {
    throw new DrivingLicenseApplicationServiceError(
      "PROFILE_INCOMPLETE",

      "Bitte vervollständige zuerst deine persönlichen Informationen im Profil.",
    );
  }

  const documentTypes =
    new Set(
      draft.documents.map(
        (
          document,
        ) =>
          document.documentType,
      ),
    );

  const missingDocument =
    REQUIRED_APPLICATION_DOCUMENT_TYPES.find(
      (
        type,
      ) =>
        !documentTypes.has(
          type,
        ),
    );

  if (
    missingDocument
  ) {
    throw new DrivingLicenseApplicationServiceError(
      "DOCUMENT_REQUIRED",

      "Bitte lade alle erforderlichen Dokumente hoch.",

      {
        documentType:
          missingDocument,
      },
    );
  }

  if (
    !draft.signatureType ||
    !draft.signaturePath
  ) {
    throw new DrivingLicenseApplicationServiceError(
      "SIGNATURE_REQUIRED",

      "Bitte füge deine Unterschrift hinzu.",
    );
  }

  const pricing =
    calculateApplicationPricing(
      validation.data
        .selectedClasses,
    );

  const submitted =
    await submitDraftApplication(
      draft.id,
      userId,
      {
        selectedClasses:
          validation.data
            .selectedClasses,

        theoryPassed:
          validation.data
            .theoryPassed,

        practicalPassed:
          validation.data
            .practicalPassed,

        pricing,
      },
    );

  if (
    !submitted
  ) {
    throw new DrivingLicenseApplicationServiceError(
      "APPLICATION_NOT_EDITABLE",

      "Der Antrag wurde bereits übermittelt oder kann nicht mehr bearbeitet werden.",
    );
  }

  /**
   * Germany-first Theorie enrollment.
   *
   * The application itself remains "submitted" and continues through the
   * existing administrative review workflow. We only create/update
   * user_license_classes here so the client can immediately access the
   * correct Theorie program after a successful submission.
   *
   * Activation is idempotent because user_license_classes is unique on
   * (user_id, license_class_code).
   */
  if (
    profile.countryCode
      .trim()
      .toUpperCase() ===
    "DE"
  ) {
    try {
      await activateSubmittedApplicationLicenseClasses({
        applicationId:
          submitted.id,

        applicationStatus:
          submitted.status,

        userId,

        countryCode:
          profile.countryCode,

        licenseClassCodes:
          submitted.selectedClasses,

        primaryLicenseClassCode:
          submitted.selectedClasses[0] ??
          null,
      });
    } catch (
      error:
        unknown
    ) {
      /**
       * Never convert an already-successful application submission into a
       * client-visible failure. The one-time synchronization script included
       * with this patch can repair a rare transient activation failure.
       */
      console.error(
        "[DRIVING_LICENSE_CLASS_ACTIVATION_AFTER_SUBMIT_ERROR]",
        error instanceof Error
          ? error.message
          : error,
      );
    }
  }

  const email =
    await sendApplicationSubmittedEmails(
      {
        firstName:
          profile.firstName,

        lastName:
          profile.lastName,

        email:
          profile.email,
      },

      submitted,
    );

  return {
    application:
      submitted,

    email,
  };
}
