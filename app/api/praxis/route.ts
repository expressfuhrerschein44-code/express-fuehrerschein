import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  createPraxisLessonRequest,
  getPraxisPageData,
  PraxisServiceError,
} from "@/lib/server/praxis/praxis-service";

import type {
  CreatePraxisLessonRequestInput,
} from "@/types/praxis";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function noStoreHeaders():
  Record<string, string> {
  return {
    "Cache-Control":
      "private, no-store, max-age=0",
  };
}

export async function GET() {
  try {
    const session =
      await requireClientSession();

    const data =
      await getPraxisPageData(
        session.user.id,
      );

    return NextResponse.json(
      {
        ok: true,
        data,
      },
      {
        headers:
          noStoreHeaders(),
      },
    );
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[PRAXIS_GET_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: {
          code:
            "PRAXIS_LOAD_FAILED",
          message:
            "Praxisdaten konnten nicht geladen werden.",
        },
      },
      {
        status:
          500,
        headers:
          noStoreHeaders(),
      },
    );
  }
}

export async function POST(
  request:
    NextRequest,
) {
  try {
    const body =
      await request
        .json()
        .catch(
          () => null,
        ) as
        | Record<
            string,
            unknown
          >
        | null;

    if (!body) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code:
              "INVALID_REQUEST",
            message:
              "Ungültige Anfrage.",
          },
        },
        {
          status:
            400,
          headers:
            noStoreHeaders(),
        },
      );
    }

    const input:
      CreatePraxisLessonRequestInput =
      {
        date:
          typeof body.date ===
          "string"
            ? body.date
            : "",
        time:
          typeof body.time ===
          "string"
            ? body.time
            : "",
        location:
          typeof body.location ===
          "string"
            ? body.location
            : "",
        note:
          typeof body.note ===
          "string"
            ? body.note
            : "",
      };

    const session =
      await requireClientSession();

    const data =
      await createPraxisLessonRequest(
        session.user.id,
        input,
      );

    return NextResponse.json(
      {
        ok: true,
        data,
      },
      {
        status:
          201,
        headers:
          noStoreHeaders(),
      },
    );
  } catch (
    error:
      unknown
  ) {
    if (
      error instanceof
      PraxisServiceError
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code:
              error.code,
            message:
              error.message,
          },
        },
        {
          status:
            error.status,
          headers:
            noStoreHeaders(),
        },
      );
    }

    console.error(
      "[PRAXIS_POST_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok: false,
        error: {
          code:
            "PRAXIS_REQUEST_FAILED",
          message:
            "Die Fahrstunden-Anfrage konnte nicht gespeichert werden.",
        },
      },
      {
        status:
          500,
        headers:
          noStoreHeaders(),
      },
    );
  }
}
