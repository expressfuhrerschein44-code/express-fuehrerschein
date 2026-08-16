/**
 * Express-Führerschein
 * Private Supabase Storage adapter for application documents/signatures.
 */

import "server-only";

import {
  randomUUID,
} from "node:crypto";

import {
  DRIVING_LICENSE_APPLICATION_STORAGE_BUCKET,
} from "@/data/driving-license-application";

import {
  DrivingLicenseApplicationServiceError,
} from "@/types/driving-license-application";

import type {
  DrivingLicenseApplicationDocumentType,
  DrivingLicenseApplicationSignatureType,
} from "@/types/driving-license-application";

function getSupabaseUrl():
  string {
  const value =
    (
      process.env
        .SUPABASE_URL ??
      process.env
        .NEXT_PUBLIC_SUPABASE_URL
    )
      ?.trim()
      .replace(
        /\/+$/,
        "",
      );

  if (
    !value
  ) {
    throw new DrivingLicenseApplicationServiceError(
      "STORAGE_NOT_CONFIGURED",

      "Der Dokumentenspeicher ist noch nicht konfiguriert.",
    );
  }

  return value;
}

function getServiceRoleKey():
  string {
  const value =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY
      ?.trim();

  if (
    !value
  ) {
    throw new DrivingLicenseApplicationServiceError(
      "STORAGE_NOT_CONFIGURED",

      "Der Dokumentenspeicher ist noch nicht konfiguriert.",
    );
  }

  return value;
}

function storageHeaders():
  Record<string, string> {
  const key =
    getServiceRoleKey();

  return {
    Authorization:
      `Bearer ${key}`,

    apikey:
      key,
  };
}

function encodeStoragePath(
  value:
    string,
): string {
  return value
    .split(
      "/",
    )
    .map(
      (
        part,
      ) =>
        encodeURIComponent(
          part,
        ),
    )
    .join(
      "/",
    );
}

function toArrayBuffer(
  bytes:
    Uint8Array,
): ArrayBuffer {
  const copy =
    new Uint8Array(
      bytes.byteLength,
    );

  copy.set(
    bytes,
  );

  return copy.buffer;
}

function extensionFromMimeType(
  mimeType:
    string,
): string {
  switch (
    mimeType
  ) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "application/pdf":
      return "pdf";

    default:
      return "bin";
  }
}

function documentFolder(
  documentType:
    DrivingLicenseApplicationDocumentType,
): string {
  switch (
    documentType
  ) {
    case "id_front":
      return "id-front";

    case "id_back":
      return "id-back";

    case "portrait_photo":
      return "portrait";
  }
}

async function uploadPrivateObject(
  storagePath:
    string,

  bytes:
    Uint8Array,

  mimeType:
    string,
): Promise<void> {
  const response =
    await fetch(
      `${getSupabaseUrl()}/storage/v1/object/${DRIVING_LICENSE_APPLICATION_STORAGE_BUCKET}/${encodeStoragePath(storagePath)}`,
      {
        method:
          "POST",

        headers: {
          ...storageHeaders(),

          "Content-Type":
            mimeType,

          "x-upsert":
            "false",
        },

        body:
          toArrayBuffer(
            bytes,
          ),

        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    const detail =
      await response
        .text()
        .catch(
          () =>
            "",
        );

    console.error(
      "[DRIVING_LICENSE_STORAGE_UPLOAD_ERROR]",
      response.status,
      detail,
    );

    throw new DrivingLicenseApplicationServiceError(
      "STORAGE_ERROR",

      "Die Datei konnte nicht sicher gespeichert werden.",
    );
  }
}

export async function uploadApplicationDocumentObject(
  input: {
    userId:
      string;

    applicationId:
      string;

    documentType:
      DrivingLicenseApplicationDocumentType;

    bytes:
      Uint8Array;

    mimeType:
      string;
  },
): Promise<string> {
  const extension =
    extensionFromMimeType(
      input.mimeType,
    );

  const storagePath =
    [
      input.userId,
      input.applicationId,
      documentFolder(
        input.documentType,
      ),
      `${Date.now()}-${randomUUID()}.${extension}`,
    ].join(
      "/",
    );

  await uploadPrivateObject(
    storagePath,
    input.bytes,
    input.mimeType,
  );

  return storagePath;
}

export async function uploadApplicationSignatureObject(
  input: {
    userId:
      string;

    applicationId:
      string;

    signatureType:
      DrivingLicenseApplicationSignatureType;

    bytes:
      Uint8Array;

    mimeType:
      string;
  },
): Promise<string> {
  const extension =
    extensionFromMimeType(
      input.mimeType,
    );

  const storagePath =
    [
      input.userId,
      input.applicationId,
      "signature",
      `${input.signatureType}-${Date.now()}-${randomUUID()}.${extension}`,
    ].join(
      "/",
    );

  await uploadPrivateObject(
    storagePath,
    input.bytes,
    input.mimeType,
  );

  return storagePath;
}

export async function deleteApplicationStorageObject(
  storagePath:
    string,
): Promise<void> {
  const normalized =
    storagePath
      .trim();

  if (
    !normalized
  ) {
    return;
  }

  const response =
    await fetch(
      `${getSupabaseUrl()}/storage/v1/object/${DRIVING_LICENSE_APPLICATION_STORAGE_BUCKET}`,
      {
        method:
          "DELETE",

        headers: {
          ...storageHeaders(),

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            prefixes: [
              normalized,
            ],
          }),

        cache:
          "no-store",
      },
    );

  if (
    !response.ok &&
    response.status !==
      404
  ) {
    const detail =
      await response
        .text()
        .catch(
          () =>
            "",
        );

    console.error(
      "[DRIVING_LICENSE_STORAGE_DELETE_ERROR]",
      response.status,
      detail,
    );

    throw new DrivingLicenseApplicationServiceError(
      "STORAGE_ERROR",

      "Die Datei konnte nicht aus dem sicheren Speicher entfernt werden.",
    );
  }
}

export async function createApplicationStorageSignedUrl(
  storagePath:
    string,

  expiresInSeconds =
    300,
): Promise<string | null> {
  const normalized =
    storagePath
      .trim();

  if (
    !normalized
  ) {
    return null;
  }

  try {
    const response =
      await fetch(
        `${getSupabaseUrl()}/storage/v1/object/sign/${DRIVING_LICENSE_APPLICATION_STORAGE_BUCKET}/${encodeStoragePath(normalized)}`,
        {
          method:
            "POST",

          headers: {
            ...storageHeaders(),

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              expiresIn:
                Math.max(
                  60,
                  Math.min(
                    3600,
                    Math.round(
                      expiresInSeconds,
                    ),
                  ),
                ),
            }),

          cache:
            "no-store",
        },
      );

    if (
      !response.ok
    ) {
      return null;
    }

    const payload =
      await response
        .json()
        .catch(
          () =>
            null,
        ) as
        | {
            signedURL?:
              string;

            signedUrl?:
              string;
          }
        | null;

    const signed =
      payload?.signedURL ??
      payload?.signedUrl;

    if (
      !signed
    ) {
      return null;
    }

    return /^https?:\/\//i.test(
      signed,
    )
      ? signed
      : `${getSupabaseUrl()}${signed.startsWith("/") ? "" : "/"}${signed}`;
  } catch {
    return null;
  }
}
