import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AdminCustomersServiceError,
  getAdminCustomerDetail,
} from "@/lib/server/admin/customers/admin-customers-service";

import type {
  AdminCustomerDetailView,
  AdminCustomersApiResponse,
} from "@/types/admin-customers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control":
    "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
} as const;

type RouteContext = {
  params: Promise<{
    userId: string;
  }>;
};

function errorResponse(error: unknown) {
  if (error instanceof AdminCustomersServiceError) {
    return NextResponse.json<
      AdminCustomersApiResponse<AdminCustomerDetailView>
    >(
      {
        ok: false,
        code: error.code,
        message: error.message,
        fields: error.fields,
      },
      {
        status: error.status,
        headers: NO_STORE_HEADERS,
      },
    );
  }

  console.error(
    "[Express-Führerschein] Admin Customer detail API error",
    error,
  );

  return NextResponse.json<
    AdminCustomersApiResponse<AdminCustomerDetailView>
  >(
    {
      ok: false,
      code: "INTERNAL_ERROR",
      message:
        "Die Kundendaten konnten gerade nicht verarbeitet werden.",
    },
    {
      status: 500,
      headers: NO_STORE_HEADERS,
    },
  );
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { userId } = await context.params;
    const data = await getAdminCustomerDetail(userId);

    return NextResponse.json<
      AdminCustomersApiResponse<AdminCustomerDetailView>
    >(
      {
        ok: true,
        data,
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
