import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  answerTheoryPracticeQuestion,
} from "@/lib/server/theory/theory-practice-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = {
  "Cache-Control":
    "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
} as const;

type Context = {
  params: Promise<{
    questionId: string;
  }>;
};

function errorResponse(
  status: number,
  code: string,
  message: string,
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
      },
    },
    {
      status,
      headers: NO_STORE,
    },
  );
}

export async function POST(
  request: NextRequest,
  context: Context,
) {
  try {
    const { questionId } =
      await context.params;

    const normalizedQuestionId =
      questionId.trim();

    if (!normalizedQuestionId) {
      return errorResponse(
        400,
        "QUESTION_ID_REQUIRED",
        "questionId fehlt.",
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return errorResponse(
        400,
        "INVALID_JSON",
        "Die Anfrage enthält keine gültigen JSON-Daten.",
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return errorResponse(
        400,
        "INVALID_ANSWER_PAYLOAD",
        "Die Antwortdaten sind ungültig.",
      );
    }

    const row = body as
      Record<string, unknown>;

    const selectedOptionIds =
      Array.isArray(
        row.selectedOptionIds,
      )
        ? row.selectedOptionIds
            .filter(
              (
                value,
              ): value is string =>
                typeof value ===
                "string",
            )
            .map((value) =>
              value.trim(),
            )
            .filter(Boolean)
        : [];

    if (!selectedOptionIds.length) {
      return errorResponse(
        400,
        "ANSWER_REQUIRED",
        "Wähle zuerst eine Antwort aus.",
      );
    }

    const trainingSessionId =
      typeof row.sessionId ===
        "string" &&
      row.sessionId.trim()
        ? row.sessionId.trim()
        : null;

    const session =
      await requireClientSession();

    const data =
      await answerTheoryPracticeQuestion(
        {
          userId:
            session.user.id,
          locale:
            session.user
              .preferredLocale,
          questionId:
            normalizedQuestionId,
          selectedOptionIds,
          trainingSessionId,
        },
      );

    return NextResponse.json(
      {
        ok: true,
        data,
      },
      {
        headers: NO_STORE,
      },
    );
  } catch (error) {
    console.error(
      "[THEORY_PRACTICE_ANSWER_ERROR]",
      error,
    );

    return errorResponse(
      400,
      "ANSWER_FAILED",
      error instanceof Error
        ? error.message
        : "Die Antwort konnte nicht ausgewertet werden.",
    );
  }
}
