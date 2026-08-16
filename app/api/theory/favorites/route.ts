import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getFavoriteTheoryQuestions,
  getTheoryFavoriteCapability,
  listFavoriteTheoryQuestionIds,
  setTheoryQuestionFavorite,
} from "@/lib/server/theory/theory-favorite-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await requireClientSession();
    const rawTake = Number(
      request.nextUrl.searchParams.get("take") ?? "100",
    );

    const take = Number.isFinite(rawTake)
      ? Math.max(1, Math.min(200, Math.round(rawTake)))
      : 100;

    const [capability, questionIds, questions] = await Promise.all([
      getTheoryFavoriteCapability({
        userId: session.user.id,
        locale: session.user.preferredLocale,
      }),
      listFavoriteTheoryQuestionIds({
        userId: session.user.id,
        locale: session.user.preferredLocale,
      }),
      getFavoriteTheoryQuestions({
        userId: session.user.id,
        locale: session.user.preferredLocale,
        take,
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        capability,
        questionIds,
        questions,
      },
    });
  } catch (error) {
    console.error("[THEORY_FAVORITES_GET_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FAVORITES_LOAD_FAILED",
          message: "Markierte Fragen konnten nicht geladen werden.",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;

    const questionId = typeof body.questionId === "string"
      ? body.questionId.trim()
      : "";

    if (!questionId || typeof body.favorite !== "boolean") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_FAVORITE_REQUEST",
            message: "questionId und favorite sind erforderlich.",
          },
        },
        { status: 400 },
      );
    }

    const session = await requireClientSession();

    return NextResponse.json({
      ok: true,
      data: await setTheoryQuestionFavorite({
        userId: session.user.id,
        locale: session.user.preferredLocale,
        questionId,
        favorite: body.favorite,
      }),
    });
  } catch (error) {
    console.error("[THEORY_FAVORITES_POST_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "FAVORITE_UPDATE_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Markierung konnte nicht gespeichert werden.",
        },
      },
      { status: 400 },
    );
  }
}
