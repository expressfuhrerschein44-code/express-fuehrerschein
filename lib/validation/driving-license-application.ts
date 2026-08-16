/**
 * Express-Führerschein
 * Dependency-free validation for the "Mein Führerschein" application.
 */

import {
  APPLICATION_DOCUMENTS,
  APPLICATION_SIGNATURES,
  DRIVING_LICENSE_CLASS_CODES,
} from "@/data/driving-license-application";

import type {
  DrivingLicenseApplicationDocumentType,
  DrivingLicenseApplicationSignatureType,
  DrivingLicenseClassCode,
  SaveDrivingLicenseApplicationInput,
  SubmitDrivingLicenseApplicationInput,
} from "@/types/driving-license-application";

export type ApplicationValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: Record<string, string> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLicenseClassCode(value: string): value is DrivingLicenseClassCode {
  return (DRIVING_LICENSE_CLASS_CODES as readonly string[]).includes(value);
}

function normalizeSelectedClasses(value: unknown): DrivingLicenseClassCode[] {
  if (!Array.isArray(value)) return [];

  const classes = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toUpperCase())
    .filter(isLicenseClassCode);

  return Array.from(new Set(classes));
}

function normalizeNullableBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function validateSaveDrivingLicenseApplicationInput(
  raw: unknown,
): ApplicationValidationResult<SaveDrivingLicenseApplicationInput> {
  if (!isRecord(raw)) {
    return {
      success: false,
      errors: { form: "Die Antragsdaten sind ungültig." },
    };
  }

  return {
    success: true,
    data: {
      selectedClasses: normalizeSelectedClasses(raw.selectedClasses),
      theoryPassed: normalizeNullableBoolean(raw.theoryPassed),
      practicalPassed: normalizeNullableBoolean(raw.practicalPassed),
    },
  };
}

export function validateSubmitDrivingLicenseApplicationInput(
  raw: unknown,
): ApplicationValidationResult<SubmitDrivingLicenseApplicationInput> {
  const save = validateSaveDrivingLicenseApplicationInput(raw);

  if (!save.success) return save;

  const errors: Record<string, string> = {};

  if (save.data.selectedClasses.length === 0) {
    errors.selectedClasses =
      "Bitte wähle mindestens eine Führerscheinklasse aus.";
  }

  if (typeof save.data.theoryPassed !== "boolean") {
    errors.theoryPassed =
      "Bitte beantworte die Frage zur Theorieprüfung.";
  }

  if (typeof save.data.practicalPassed !== "boolean") {
    errors.practicalPassed =
      "Bitte beantworte die Frage zur praktischen Prüfung.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      selectedClasses: save.data.selectedClasses,
      theoryPassed: save.data.theoryPassed as boolean,
      practicalPassed: save.data.practicalPassed as boolean,
    },
  };
}

export function validateApplicationDocumentFile(
  documentType: DrivingLicenseApplicationDocumentType,
  mimeType: string,
  sizeBytes: number,
): ApplicationValidationResult<{
  documentType: DrivingLicenseApplicationDocumentType;
  mimeType: string;
  sizeBytes: number;
}> {
  const config = APPLICATION_DOCUMENTS.find((item) => item.type === documentType);

  if (!config) {
    return {
      success: false,
      errors: { documentType: "Dieser Dokumenttyp wird nicht unterstützt." },
    };
  }

  if (!config.allowedMimeTypes.includes(mimeType)) {
    return {
      success: false,
      errors: { file: "Dieses Dateiformat wird nicht unterstützt." },
    };
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return {
      success: false,
      errors: { file: "Die Datei ist leer oder ungültig." },
    };
  }

  if (sizeBytes > config.maxBytes) {
    return {
      success: false,
      errors: { file: "Die Datei ist zu groß." },
    };
  }

  return {
    success: true,
    data: { documentType, mimeType, sizeBytes },
  };
}

export function validateApplicationSignatureFile(
  signatureType: DrivingLicenseApplicationSignatureType,
  mimeType: string,
  sizeBytes: number,
): ApplicationValidationResult<{
  signatureType: DrivingLicenseApplicationSignatureType;
  mimeType: string;
  sizeBytes: number;
}> {
  const config = APPLICATION_SIGNATURES[signatureType];

  if (!config) {
    return {
      success: false,
      errors: { signatureType: "Diese Signaturmethode wird nicht unterstützt." },
    };
  }

  if (!config.allowedMimeTypes.includes(mimeType)) {
    return {
      success: false,
      errors: { signature: "Dieses Dateiformat wird nicht unterstützt." },
    };
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return {
      success: false,
      errors: { signature: "Die Unterschrift ist leer oder ungültig." },
    };
  }

  if (sizeBytes > config.maxBytes) {
    return {
      success: false,
      errors: { signature: "Die Unterschrift-Datei ist zu groß." },
    };
  }

  return {
    success: true,
    data: { signatureType, mimeType, sizeBytes },
  };
}
