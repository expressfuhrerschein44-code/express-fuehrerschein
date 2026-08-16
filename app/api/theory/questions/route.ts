import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  findPublicTheoryQuestion,
  getTheoryContextForUser,
} from "@/lib/server/theory/theory-repository";

import {
  createTheoryNote,
  deleteTheoryNote,
  getTheoryNotes,
  reportTheoryQuestion,
  submitTheoryAnswer,
  updateTheoryNote,
} from "@/lib/server/theory/theory-question-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REPORT_REASONS = new Set([
  "incorrect_question",
  "incorrect_media",
  "translation",
  "technical",
  "other",
]);

export async function GET(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get("action");

    if (action === "notes") {
      const session = await requireClientSession();
      const rawTake = Number(request.nextUrl.searchParams.get("take") ?? "100");

      return NextResponse.json({
        ok: true,
        data: await getTheoryNotes({
          userId: session.user.id,
          locale: session.user.preferredLocale,
          take: Number.isFinite(rawTake)
            ? Math.max(1, Math.min(200, Math.round(rawTake)))
            : 100,
        }),
      });
    }

    const questionId = request.nextUrl.searchParams.get("id")?.trim();

    if (!questionId) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "QUESTION_ID_REQUIRED",
            message: "question id fehlt.",
          },
        },
        { status: 400 },
      );
    }

    const session = await requireClientSession();
    const context = await getTheoryContextForUser(
      session.user.id,
      session.user.preferredLocale,
    );

    const question = await findPublicTheoryQuestion(
      context,
      questionId,
    );

    if (!question) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "QUESTION_NOT_FOUND",
            message: "Theoriefrage wurde nicht gefunden.",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: question,
    });
  } catch (error) {
    console.error("[THEORY_QUESTION_GET_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "QUESTION_LOAD_FAILED",
          message: "Theoriefrage konnte nicht geladen werden.",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = typeof body.action === "string"
      ? body.action
      : "answer";

    const session = await requireClientSession();

    if (action === "answer") {
      const questionId = typeof body.questionId === "string"
        ? body.questionId.trim()
        : "";

      const mode = body.mode;

      if (
        !questionId
        || body.answerPayload === undefined || body.answerPayload === null
        || (
          mode !== "learning"
          && mode !== "practice"
          && mode !== "error_review"
        )
      ) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_QUESTION_ANSWER_REQUEST",
              message: "Ungültige Antwortanfrage.",
            },
          },
          { status: 400 },
        );
      }

      const data = await submitTheoryAnswer({
        userId: session.user.id,
        locale: session.user.preferredLocale,
        questionId,
        answerPayload: body.answerPayload,
        mode,
        trainingSessionId:
          typeof body.trainingSessionId === "string"
            ? body.trainingSessionId
            : null,
      });

      return NextResponse.json({
        ok: true,
        data,
      });
    }

    if (action === "report") {
      const questionId = typeof body.questionId === "string"
        ? body.questionId.trim()
        : "";
      const reason = typeof body.reason === "string"
        ? body.reason
        : "";

      if (!questionId || !REPORT_REASONS.has(reason)) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_REPORT_REQUEST",
              message: "Ungültige Meldung.",
            },
          },
          { status: 400 },
        );
      }

      const data = await reportTheoryQuestion({
        userId: session.user.id,
        locale: session.user.preferredLocale,
        questionId,
        reason: reason as
          | "incorrect_question"
          | "incorrect_media"
          | "translation"
          | "technical"
          | "other",
        message: typeof body.message === "string" ? body.message : null,
      });

      return NextResponse.json(
        {
          ok: true,
          data,
        },
        { status: 201 },
      );
    }

    if (action === "note" || action === "note_create") {
      const data = await createTheoryNote({
        userId: session.user.id,
        locale: session.user.preferredLocale,
        questionId:
          typeof body.questionId === "string"
            ? body.questionId
            : null,
        lessonId:
          typeof body.lessonId === "string"
            ? body.lessonId
            : null,
        body:
          typeof body.body === "string"
            ? body.body
            : "",
      });

      return NextResponse.json(
        {
          ok: true,
          data,
        },
        { status: 201 },
      );
    }

    if (action === "note_update") {
      const noteId = typeof body.noteId === "string" ? body.noteId : "";

      if (!noteId || typeof body.body !== "string") {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_NOTE_UPDATE",
              message: "noteId und body sind erforderlich.",
            },
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        ok: true,
        data: await updateTheoryNote({
          userId: session.user.id,
          locale: session.user.preferredLocale,
          noteId,
          body: body.body,
        }),
      });
    }

    if (action === "note_delete") {
      const noteId = typeof body.noteId === "string" ? body.noteId : "";

      if (!noteId) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "INVALID_NOTE_DELETE",
              message: "noteId ist erforderlich.",
            },
          },
          { status: 400 },
        );
      }

      await deleteTheoryNote({
        userId: session.user.id,
        locale: session.user.preferredLocale,
        noteId,
      });

      return NextResponse.json({
        ok: true,
        data: { deleted: true },
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_QUESTION_ACTION",
          message: "action muss answer, report, note_create, note_update oder note_delete sein.",
        },
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("[THEORY_QUESTION_POST_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "QUESTION_ACTION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Theorie-Aktion konnte nicht verarbeitet werden.",
        },
      },
      { status: 400 },
    );
  }
}
