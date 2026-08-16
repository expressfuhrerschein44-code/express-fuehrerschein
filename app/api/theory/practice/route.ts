import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  completeTheoryPractice,
  getPracticeQuestion,
  startTheoryPractice,
} from "@/lib/server/theory/theory-practice-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRACTICE_KINDS = new Set([
  "random",
  "topic",
  "errors",
  "favorites",
  "quick",
]);

export async function GET(request: NextRequest) {
  try {
    const questionId = request.nextUrl.searchParams
      .get("questionId")
      ?.trim();

    if (!questionId) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "QUESTION_ID_REQUIRED",
            message: "questionId fehlt.",
          },
        },
        { status: 400 },
      );
    }

    const session = await requireClientSession();

    const data = await getPracticeQuestion({
      userId: session.user.id,
      locale: session.user.preferredLocale,
      questionId,
    });

    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "QUESTION_NOT_FOUND",
            message: "Trainingsfrage wurde nicht gefunden.",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });
  } catch (error) {
    console.error("[THEORY_PRACTICE_GET_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "PRACTICE_LOAD_FAILED",
          message: "Training konnte nicht geladen werden.",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const session = await requireClientSession();

    if (body.action === "start") {
      const kind = typeof body.kind === "string" ? body.kind : "";

      if (!PRACTICE_KINDS.has(kind)) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_PRACTICE_KIND",
              message: "Ungültiger Trainingsmodus.",
            },
          },
          { status: 400 },
        );
      }

      const data = await startTheoryPractice({
        userId: session.user.id,
        locale: session.user.preferredLocale,
        kind: kind as
          | "random"
          | "topic"
          | "errors"
          | "favorites"
          | "quick",
        topicId:
          typeof body.topicId === "string"
            ? body.topicId
            : null,
        questionCount:
          typeof body.questionCount === "number"
            ? body.questionCount
            : undefined,
      });

      return NextResponse.json(
        {
          ok: true,
          data,
        },
        { status: 201 },
      );
    }

    if (body.action === "finish") {
      const sessionId = typeof body.sessionId === "string"
        ? body.sessionId
        : "";

      if (!sessionId) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "SESSION_ID_REQUIRED",
              message: "sessionId fehlt.",
            },
          },
          { status: 400 },
        );
      }

      const data = await completeTheoryPractice({
        userId: session.user.id,
        locale: session.user.preferredLocale,
        sessionId,
        activeDurationSeconds:
          typeof body.activeDurationSeconds === "number"
            ? body.activeDurationSeconds
            : 0,
      });

      return NextResponse.json({
        ok: true,
        data,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_PRACTICE_ACTION",
          message: "action muss start oder finish sein.",
        },
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("[THEORY_PRACTICE_POST_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "PRACTICE_ACTION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Training konnte nicht verarbeitet werden.",
        },
      },
      { status: 400 },
    );
  }
}
