import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AdminPraxisServiceError,
  getAdminPraxisAppointment,
  mutateAdminPraxisAppointment,
} from "@/lib/server/admin/praxis/admin-praxis-service";

import type {
  AdminPraxisApiResponse,
  AdminPraxisAppointmentDetailView,
} from "@/types/admin-praxis";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

type RouteContext = {
  params:
    Promise<{
      appointmentId:
        string;
    }>;
};

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

function errorResponse(
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

function internalError(
  error:
    unknown,
) {
  console.error(
    "[Express-Führerschein] admin Praxis detail API failed",
    error,
  );

  return NextResponse.json(
    {
      ok:
        false,
      code:
        "INTERNAL_ERROR",
      message:
        "Der Praxistermin konnte gerade nicht verarbeitet werden.",
    },
    {
      status:
        500,
      headers:
        NO_STORE_HEADERS,
    },
  );
}

export async function GET(
  _request:
    NextRequest,
  context:
    RouteContext,
) {
  const {
    appointmentId,
  } =
    await context.params;

  try {
    const data =
      await getAdminPraxisAppointment(
        appointmentId,
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
        headers:
          NO_STORE_HEADERS,
      },
    );
  } catch (
    error
  ) {
    return error instanceof
      AdminPraxisServiceError
      ? errorResponse(
          error,
        )
      : internalError(
          error,
        );
  }
}

export async function PATCH(
  request:
    NextRequest,
  context:
    RouteContext,
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

  const {
    appointmentId,
  } =
    await context.params;

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
      await mutateAdminPraxisAppointment(
        appointmentId,
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
        headers:
          NO_STORE_HEADERS,
      },
    );
  } catch (
    error
  ) {
    return error instanceof
      AdminPraxisServiceError
      ? errorResponse(
          error,
        )
      : internalError(
          error,
        );
  }
}
