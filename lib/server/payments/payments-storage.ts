import "server-only";

import {
  randomUUID,
} from "node:crypto";

const DEFAULT_PAYMENT_PROOF_BUCKET =
  "payment-proofs";

function getSupabaseUrl(): string {
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

  if (!value) {
    throw new Error(
      "[Express-Führerschein] SUPABASE_URL ist nicht konfiguriert.",
    );
  }

  return value;
}

function getServiceRoleKey(): string {
  const value =
    (
      process.env
        .SUPABASE_SERVICE_ROLE_KEY ??
      process.env
        .SUPABASE_SECRET_KEY
    )
      ?.trim();

  if (!value) {
    throw new Error(
      "[Express-Führerschein] Der private Supabase-Serverschlüssel ist nicht konfiguriert.",
    );
  }

  return value;
}

function getPaymentProofBucket(): string {
  return (
    process.env
      .PAYMENT_PROOF_STORAGE_BUCKET
      ?.trim() ||
    DEFAULT_PAYMENT_PROOF_BUCKET
  );
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
  value: string,
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
  bytes: Uint8Array,
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
  mimeType: string,
): string {
  switch (
    mimeType
  ) {
    case "application/pdf":
      return "pdf";

    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    default:
      return "bin";
  }
}

export interface UploadedPaymentProof {
  storageBucket: string;
  storagePath: string;
}

export async function uploadPaymentProofObject(
  input: {
    userId: string;
    applicationId: string;
    paymentId: string;
    bytes: Uint8Array;
    mimeType: string;
  },
): Promise<UploadedPaymentProof> {
  const storageBucket =
    getPaymentProofBucket();

  const extension =
    extensionFromMimeType(
      input.mimeType,
    );

  const storagePath =
    [
      input.userId,
      input.applicationId,
      input.paymentId,
      `${Date.now()}-${randomUUID()}.${extension}`,
    ].join(
      "/",
    );

  const response =
    await fetch(
      `${getSupabaseUrl()}/storage/v1/object/${encodeURIComponent(storageBucket)}/${encodeStoragePath(storagePath)}`,
      {
        method:
          "POST",
        headers: {
          ...storageHeaders(),
          "Content-Type":
            input.mimeType,
          "x-upsert":
            "false",
        },
        body:
          toArrayBuffer(
            input.bytes,
          ),
        cache:
          "no-store",
      },
    );

  if (!response.ok) {
    const detail =
      await response
        .text()
        .catch(
          () => "",
        );

    console.error(
      "[PAYMENT_PROOF_UPLOAD_ERROR]",
      response.status,
      detail,
    );

    throw new Error(
      "[Express-Führerschein] Der Zahlungsnachweis konnte nicht sicher gespeichert werden.",
    );
  }

  return {
    storageBucket,
    storagePath,
  };
}

export async function deletePaymentProofObject(
  input: {
    storageBucket: string;
    storagePath: string;
  },
): Promise<void> {
  const storageBucket =
    input.storageBucket
      .trim();

  const storagePath =
    input.storagePath
      .trim();

  if (
    !storageBucket ||
    !storagePath
  ) {
    return;
  }

  const response =
    await fetch(
      `${getSupabaseUrl()}/storage/v1/object/${encodeURIComponent(storageBucket)}`,
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
              storagePath,
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
          () => "",
        );

    console.error(
      "[PAYMENT_PROOF_DELETE_ERROR]",
      response.status,
      detail,
    );
  }
}
