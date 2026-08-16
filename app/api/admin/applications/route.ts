import { NextResponse } from "next/server";

import {
  getAdminApplicationsPageData,
  toAdminApplicationsServiceError,
} from "@/lib/server/admin/applications/admin-applications-service";
import { parseAdminApplicationsSearchParams } from "@/lib/server/admin/applications/admin-applications-validation";
import type { AdminApplicationsApiErrorResponse } from "@/types/admin-applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
} as const;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = parseAdminApplicationsSearchParams(url.searchParams);
    const data = await getAdminApplicationsPageData(query);

    return NextResponse.json(
      { success: true, data },
      { status: 200, headers: NO_STORE_HEADERS },
    );
  } catch (error) {
    const serviceError = toAdminApplicationsServiceError(error);
    const body: AdminApplicationsApiErrorResponse = {
      success: false,
      code: serviceError.code,
      message: serviceError.message,
      fields: serviceError.fields,
    };

    return NextResponse.json(body, {
      status: serviceError.status,
      headers: NO_STORE_HEADERS,
    });
  }
}
