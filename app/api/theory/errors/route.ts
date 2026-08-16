import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getTheoryErrors,
} from "@/lib/server/theory/theory-error-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const rawTake = Number(
      request.nextUrl.searchParams.get("take") ?? "50",
    );

    const take = Number.isFinite(rawTake)
      ? Math.max(1, Math.min(100, Math.round(rawTake)))
      : 50;

    const session = await requireClientSession();

    return NextResponse.json({
      ok: true,
      data: await getTheoryErrors({
        userId: session.user.id,
        locale: session.user.preferredLocale,
        take,
      }),
    });
  } catch (error) {
    console.error("[THEORY_ERRORS_ROUTE_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "THEORY_ERRORS_FAILED",
          message: "Fehlerfragen konnten nicht geladen werden.",
        },
      },
      { status: 500 },
    );
  }
}
