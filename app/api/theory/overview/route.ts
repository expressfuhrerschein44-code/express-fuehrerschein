import { NextResponse } from "next/server";

import {
  getTheoryOverviewData,
  TheoryOverviewServiceError,
} from "@/lib/server/theory/theory-overview-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      data: await getTheoryOverviewData(),
    });
  } catch (error) {
    if (error instanceof TheoryOverviewServiceError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        {
          status: error.code === "UNAUTHENTICATED" ? 401 : 503,
        },
      );
    }

    console.error("[THEORY_OVERVIEW_ROUTE_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "THEORY_OVERVIEW_FAILED",
          message: "Die Theorie-Daten konnten nicht geladen werden.",
        },
      },
      { status: 500 },
    );
  }
}
