import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";
import {
  getGermanTheoryExamResultDetail,
  listGermanTheoryExamResults,
} from "@/lib/server/theory/theory-result-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
) {
  try {
    const session = await requireClientSession();
    const attemptId = request.nextUrl.searchParams
      .get("attemptId")
      ?.trim();

    if (attemptId) {
      const data = await getGermanTheoryExamResultDetail({
        userId: session.user.id,
        locale: session.user.preferredLocale,
        attemptId,
      });

      if (!data) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "EXAM_RESULT_NOT_FOUND",
              message: "Prüfungsergebnis wurde nicht gefunden.",
            },
          },
          { status: 404 },
        );
      }

      return NextResponse.json({ ok: true, data });
    }

    const rawTake = Number(
      request.nextUrl.searchParams.get("take") ?? "50",
    );

    const take = Number.isFinite(rawTake)
      ? Math.max(1, Math.min(100, Math.round(rawTake)))
      : 50;

    const data = await listGermanTheoryExamResults({
      userId: session.user.id,
      locale: session.user.preferredLocale,
      take,
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("[THEORY_RESULTS_GET_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "THEORY_RESULTS_LOAD_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Prüfungsergebnisse konnten nicht geladen werden.",
        },
      },
      { status: 400 },
    );
  }
}
