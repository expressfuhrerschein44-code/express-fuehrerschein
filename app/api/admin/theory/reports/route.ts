import {
  NextResponse,
} from "next/server";

import {
  AdminTheoryServiceError,
  getAdminTheoryPageData,
} from "@/lib/server/admin/theory/admin-theory-service";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const NO_STORE = {
  "Cache-Control":
    "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma:
    "no-cache",
  Expires:
    "0",
} as const;

function serviceError(
  error:
    AdminTheoryServiceError,
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
      allowedValues:
        error.allowedValues,
    },
    {
      status:
        error.status,
      headers:
        NO_STORE,
    },
  );
}

function unexpected(
  error:
    unknown,
) {
  console.error(
    "[Express-Führerschein] Admin Theorie API error",
    error,
  );

  return NextResponse.json(
    {
      ok:
        false,
      code:
        "INTERNAL_ERROR",
      message:
        "Die Theoriedaten konnten gerade nicht verarbeitet werden.",
    },
    {
      status:
        500,
      headers:
        NO_STORE,
    },
  );
}

export async function GET() {
  try {
    const data =
      await getAdminTheoryPageData();

    return NextResponse.json(
      {
        ok:
          true,
        data:
          data.reports,
      },
      {
        headers:
          NO_STORE,
      },
    );
  } catch (
    error
  ) {
    return error instanceof
      AdminTheoryServiceError
      ? serviceError(
          error,
        )
      : unexpected(
          error,
        );
  }
}