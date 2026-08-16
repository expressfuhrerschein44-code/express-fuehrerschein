import { NextRequest, NextResponse } from "next/server";

import {
  getAdminApplicationFileTarget,
  toAdminApplicationsServiceError,
} from "@/lib/server/admin/applications/admin-applications-service";
import type { AdminApplicationsApiErrorResponse } from "@/types/admin-applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{
    applicationId: string;
    documentId: string;
  }>;
}

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
} as const;

function encodeStoragePath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function sanitizeFilename(filename: string): string {
  const sanitized = filename
    .replace(/[\r\n"]/g, "")
    .replace(/[\\/]/g, "-")
    .trim();

  return sanitized || "dokument";
}

function storageConfiguration(): {
  url: string;
  serviceRoleKey: string;
} {
  const url = (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ""
  )
    .trim()
    .replace(/\/+$/, "");

  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_PRIVATE_STORAGE_NOT_CONFIGURED");
  }

  return { url, serviceRoleKey };
}

function apiError(
  code: AdminApplicationsApiErrorResponse["code"],
  message: string,
  status: number,
) {
  return NextResponse.json<AdminApplicationsApiErrorResponse>(
    { success: false, code, message },
    { status, headers: NO_STORE_HEADERS },
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { applicationId, documentId } = await context.params;

  try {
    const target = await getAdminApplicationFileTarget(applicationId, documentId);

    let config: ReturnType<typeof storageConfiguration>;
    try {
      config = storageConfiguration();
    } catch {
      return apiError(
        "STORAGE_CONFIGURATION_ERROR",
        "Der private Dokumentenspeicher ist nicht vollständig konfiguriert.",
        503,
      );
    }

    const storageUrl =
      `${config.url}/storage/v1/object/authenticated/` +
      `${encodeURIComponent(target.bucket)}/` +
      encodeStoragePath(target.storagePath);

    const storageResponse = await fetch(storageUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${config.serviceRoleKey}`,
        apikey: config.serviceRoleKey,
      },
    });

    if (!storageResponse.ok || !storageResponse.body) {
      console.error("[ADMIN_APPLICATION_STORAGE_DOWNLOAD_ERROR]", {
        applicationId,
        documentId,
        bucket: target.bucket,
        status: storageResponse.status,
      });

      return apiError(
        "STORAGE_DOWNLOAD_ERROR",
        storageResponse.status === 404
          ? "Die gespeicherte Datei wurde nicht gefunden."
          : "Die Datei konnte derzeit nicht geladen werden.",
        storageResponse.status === 404 ? 404 : 502,
      );
    }

    const disposition =
      new URL(request.url).searchParams.get("disposition") === "attachment"
        ? "attachment"
        : "inline";

    const responseMimeType = storageResponse.headers.get("content-type");
    const mimeType =
      responseMimeType && responseMimeType !== "application/octet-stream"
        ? responseMimeType
        : target.mimeType || "application/octet-stream";

    const headers = new Headers(NO_STORE_HEADERS);
    headers.set("Content-Type", mimeType);
    headers.set(
      "Content-Disposition",
      `${disposition}; filename="${sanitizeFilename(target.filename)}"`,
    );
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

    const length = storageResponse.headers.get("content-length");
    if (length) headers.set("Content-Length", length);

    return new Response(storageResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    const serviceError = toAdminApplicationsServiceError(error);
    return apiError(serviceError.code, serviceError.message, serviceError.status);
  }
}
