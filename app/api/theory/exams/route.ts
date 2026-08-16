import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  completeTheoryExam,
  startTheoryExam,
  submitTheoryExamAnswer,
  TheoryExamServiceError,
} from "@/lib/server/theory/theory-exam-service";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function noStoreHeaders():
  Record<
    string,
    string
  > {
  return {
    "Cache-Control":
      "private, no-store, max-age=0",
  };
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
          ok:
            false,
          error: {
            code:
              "INVALID_REQUEST",
            message:
              "Ungültige Prüfungsanfrage.",
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

    const action =
      typeof body.action ===
        "string"
        ? body.action
        : "";

    const session =
      await requireClientSession();

    if (
      action ===
      "start"
    ) {
      const data =
        await startTheoryExam({
          userId:
            session.user.id,
          locale:
            session.user
              .preferredLocale,
        });

      return NextResponse.json(
        {
          ok:
            true,
          data,
        },
        {
          status:
            201,
          headers:
            noStoreHeaders(),
        },
      );
    }

    if (
      action ===
      "answer"
    ) {
      const attemptId =
        typeof body.attemptId ===
          "string"
          ? body.attemptId
              .trim()
          : "";

      const questionId =
        typeof body.questionId ===
          "string"
          ? body.questionId
              .trim()
          : "";

      if (
        !attemptId ||
        !questionId ||
        body.answerPayload ===
          undefined ||
        body.answerPayload ===
          null
      ) {
        return NextResponse.json(
          {
            ok:
              false,
            error: {
              code:
                "INVALID_ANSWER_REQUEST",
              message:
                "attemptId, questionId und answerPayload sind erforderlich.",
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

      const data =
        await submitTheoryExamAnswer({
          userId:
            session.user.id,
          locale:
            session.user
              .preferredLocale,
          attemptId,
          questionId,
          answerPayload:
            body.answerPayload,
        });

      return NextResponse.json(
        {
          ok:
            true,
          data,
        },
        {
          headers:
            noStoreHeaders(),
        },
      );
    }

    if (
      action ===
      "finish"
    ) {
      const attemptId =
        typeof body.attemptId ===
          "string"
          ? body.attemptId
              .trim()
          : "";

      if (!attemptId) {
        return NextResponse.json(
          {
            ok:
              false,
            error: {
              code:
                "INVALID_FINISH_REQUEST",
              message:
                "attemptId ist erforderlich.",
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

      const reason =
        body.reason ===
          "timeout"
          ? "timeout"
          : "manual";

      const data =
        await completeTheoryExam({
          userId:
            session.user.id,
          locale:
            session.user
              .preferredLocale,
          attemptId,
          reason,
        });

      return NextResponse.json(
        {
          ok:
            true,
          data,
        },
        {
          headers:
            noStoreHeaders(),
        },
      );
    }

    return NextResponse.json(
      {
        ok:
          false,
        error: {
          code:
            "INVALID_EXAM_ACTION",
          message:
            "action muss start, answer oder finish sein.",
        },
      },
      {
        status:
          400,
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
      TheoryExamServiceError
    ) {
      return NextResponse.json(
        {
          ok:
            false,
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
      "[THEORY_EXAM_API_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,
        error: {
          code:
            "EXAM_ACTION_FAILED",
          message:
            error instanceof
            Error
              ? error.message
              : "Die Prüfungsaktion konnte nicht verarbeitet werden.",
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
