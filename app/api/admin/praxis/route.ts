import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AdminPraxisServiceError,
  createAdminPraxisAppointment,
  getAdminPraxisPageData,
} from "@/lib/server/admin/praxis/admin-praxis-service";

import type {
  AdminPraxisApiResponse,
  AdminPraxisAppointmentDetailView,
  AdminPraxisPageData,
} from "@/types/admin-praxis";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const NO_STORE_HEADERS = {
  "Cache-Control":
    "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma:
    "no-cache",
  Expires:
    "0",
} as const;

function sameOrigin(
  request:
    NextRequest,
): boolean {
  const origin =
    request.headers.get(
      "origin",
    );

  if (!origin) {
    return true;
  }

  try {
    return (
      new URL(origin).host ===
      request.nextUrl.host
    );
  } catch {
    return false;
  }
}

function serviceErrorResponse(
  error:
    AdminPraxisServiceError,
) {
  return NextResponse.json(
    {
      ok:
        false,
      code:
        error.code,
      message:
        error.message,
      fields:
        error.fields,
    },
    {
      status:
        error.status,
      headers:
        NO_STORE_HEADERS,
    },
  );
}

function unexpectedErrorResponse(
  error:
    unknown,
) {
  console.error(
    "[Express-Führerschein] admin Praxis API failed",
    error,
  );

  return NextResponse.json(
    {
      ok:
        false,
      code:
        "INTERNAL_ERROR",
      message:
        "Die Praxisdaten konnten gerade nicht verarbeitet werden.",
    },
    {
      status:
        500,
      headers:
        NO_STORE_HEADERS,
    },
  );
}

export async function GET() {
  try {
    const data =
      await getAdminPraxisPageData();

    return NextResponse.json<
      AdminPraxisApiResponse<AdminPraxisPageData>
    >(
      {
        ok:
          true,
        data,
      },
      {
        headers:
          NO_STORE_HEADERS,
      },
    );
  } catch (
    error
  ) {
    return error instanceof
      AdminPraxisServiceError
      ? serviceErrorResponse(
          error,
        )
      : unexpectedErrorResponse(
          error,
        );
  }
}

export async function POST(
  request:
    NextRequest,
) {
  if (
    !sameOrigin(
      request,
    )
  ) {
    return NextResponse.json(
      {
        ok:
          false,
        code:
          "INVALID_ORIGIN",
        message:
          "Die Anfrage stammt von einer nicht erlaubten Quelle.",
      },
      {
        status:
          403,
        headers:
          NO_STORE_HEADERS,
      },
    );
  }

  let body:
    unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        ok:
          false,
        code:
          "INVALID_JSON",
        message:
          "Die Anfrage enthält keine gültigen JSON-Daten.",
      },
      {
        status:
          400,
        headers:
          NO_STORE_HEADERS,
      },
    );
  }

  try {
    const data =
      await createAdminPraxisAppointment(
        body,
      );

    return NextResponse.json<
      AdminPraxisApiResponse<AdminPraxisAppointmentDetailView>
    >(
      {
        ok:
          true,
        data,
      },
      {
        status:
          201,
        headers:
          NO_STORE_HEADERS,
      },
    );
  } catch (
    error
  ) {
    return error instanceof
      AdminPraxisServiceError
      ? serviceErrorResponse(
          error,
        )
      : unexpectedErrorResponse(
          error,
        );
  }
}
