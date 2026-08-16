import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AdminTheoryServiceError,
  getAdminTheoryProgramDetail,
  updateAdminTheoryProgram,
} from "@/lib/server/admin/theory/admin-theory-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
} as const;

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function serviceError(error: AdminTheoryServiceError) {
  return NextResponse.json(
    {
      ok: false,
      code: error.code,
      message: error.message,
      fields: error.fields,
      allowedValues: error.allowedValues,
    },
    {
      status: error.status,
      headers: NO_STORE,
    },
  );
}

function unexpected(error: unknown) {
  console.error("[Express-Führerschein] Admin Theorie API error", error);
  return NextResponse.json(
    {
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Die Theoriedaten konnten gerade nicht verarbeitet werden.",
    },
    {
      status: 500,
      headers: NO_STORE,
    },
  );
}

function invalidOrigin() {
  return NextResponse.json(
    {
      ok: false,
      code: "INVALID_ORIGIN",
      message: "Die Anfrage stammt von einer nicht erlaubten Quelle.",
    },
    {
      status: 403,
      headers: NO_STORE,
    },
  );
}

async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AdminTheoryServiceError(
      "INVALID_JSON",
      "Die Anfrage enthält keine gültigen JSON-Daten.",
      400,
    );
  }
}

type Context = {
  params: Promise<{ programId: string }>;
};

export async function GET(
  _request: NextRequest,
  context: Context,
) {
  try {
    const { programId } = await context.params;
    const data =
      await getAdminTheoryProgramDetail(programId);

    return NextResponse.json(
      { ok: true, data },
      { headers: NO_STORE },
    );
  } catch (error) {
    return error instanceof AdminTheoryServiceError
      ? serviceError(error)
      : unexpected(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: Context,
) {
  if (!sameOrigin(request)) return invalidOrigin();

  try {
    const { programId } = await context.params;
    const body =
      await readJson(request) as {
        action?: string;
        data?: unknown;
      };

    const data =
      await updateAdminTheoryProgram(
        programId,
        body.data ?? body,
        body.action ?? "update",
      );

    return NextResponse.json(
      { ok: true, data },
      { headers: NO_STORE },
    );
  } catch (error) {
    return error instanceof AdminTheoryServiceError
      ? serviceError(error)
      : unexpected(error);
  }
}
