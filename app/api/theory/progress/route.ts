import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  completeTheoryStudySession,
  registerTheoryStudyActivity,
  saveTheoryLessonProgress,
  startTheoryStudySession,
} from "@/lib/server/theory/learning-progress-service";

import {
  getTheoryOverviewData,
} from "@/lib/server/theory/theory-overview-service";

import {
  getTheoryContextForUser,
} from "@/lib/server/theory/theory-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getTheoryOverviewData();

    return NextResponse.json({
      ok: true,
      data: {
        status: data.status,
        progress: data.progress,
        statistics: data.statistics,
        readiness: data.readiness,
      },
    });
  } catch (error) {
    console.error("[THEORY_PROGRESS_GET_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "THEORY_PROGRESS_FAILED",
          message: "Fortschritt konnte nicht geladen werden.",
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

    const context = await getTheoryContextForUser(
      session.user.id,
      session.user.preferredLocale,
    );

    if (body.action === "lesson_progress") {
      const lessonId = typeof body.lessonId === "string"
        ? body.lessonId
        : "";

      if (!lessonId) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "LESSON_ID_REQUIRED",
              message: "lessonId fehlt.",
            },
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        ok: true,
        data: await saveTheoryLessonProgress(context, {
          lessonId,
          progressPercent:
            typeof body.progressPercent === "number"
              ? body.progressPercent
              : 0,
          currentBlockIndex:
            typeof body.currentBlockIndex === "number"
              ? body.currentBlockIndex
              : 0,
          completed: body.completed === true,
          activeSecondsDelta:
            typeof body.activeSecondsDelta === "number"
              ? body.activeSecondsDelta
              : 0,
        }),
      });
    }

    if (body.action === "study_start") {
      const sessionType = body.sessionType;
      const allowed =
        sessionType === "lesson"
        || sessionType === "practice"
        || sessionType === "review"
        || sessionType === "other";

      return NextResponse.json(
        {
          ok: true,
          data: await startTheoryStudySession(context, {
            lessonId:
              typeof body.lessonId === "string"
                ? body.lessonId
                : null,
            sessionType: allowed ? sessionType : "lesson",
          }),
        },
        { status: 201 },
      );
    }

    if (body.action === "study_activity") {
      const studySessionId = typeof body.studySessionId === "string"
        ? body.studySessionId
        : "";

      if (!studySessionId) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "STUDY_SESSION_ID_REQUIRED",
              message: "studySessionId fehlt.",
            },
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        ok: true,
        data: await registerTheoryStudyActivity(context, {
          sessionId: studySessionId,
          activeSecondsDelta:
            typeof body.activeSecondsDelta === "number"
              ? body.activeSecondsDelta
              : 0,
        }),
      });
    }

    if (body.action === "study_finish") {
      const studySessionId = typeof body.studySessionId === "string"
        ? body.studySessionId
        : "";

      if (!studySessionId) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "STUDY_SESSION_ID_REQUIRED",
              message: "studySessionId fehlt.",
            },
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        ok: true,
        data: await completeTheoryStudySession(context, {
          sessionId: studySessionId,
          activeSecondsDelta:
            typeof body.activeSecondsDelta === "number"
              ? body.activeSecondsDelta
              : 0,
          abandoned: body.abandoned === true,
        }),
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_PROGRESS_ACTION",
          message:
            "action muss lesson_progress, study_start, study_activity oder study_finish sein.",
        },
      },
      { status: 400 },
    );
  } catch (error) {
    console.error("[THEORY_PROGRESS_POST_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "THEORY_PROGRESS_UPDATE_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Fortschritt konnte nicht gespeichert werden.",
        },
      },
      { status: 400 },
    );
  }
}
