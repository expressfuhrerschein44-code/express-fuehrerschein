import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  calculateExamReadiness,
} from "@/lib/server/theory/exam-readiness-service";

import {
  calculateTheoryLearningProgress,
  completeTheoryStudySession,
  registerTheoryStudyActivity,
  saveTheoryLessonProgress,
  startTheoryStudySession,
  syncTheoryLearningAggregate,
} from "@/lib/server/theory/learning-progress-service";

import {
  getTheoryOverviewData,
} from "@/lib/server/theory/theory-overview-service";

import {
  getTheoryContextForUser,
  getTheoryOverviewRepositorySnapshot,
} from "@/lib/server/theory/theory-repository";

import type {
  TheoryContext,
} from "@/lib/server/theory/theory-repository";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const NO_STORE_HEADERS = {
  "Cache-Control":
    "private, no-store, no-cache, must-revalidate, max-age=0",

  Pragma:
    "no-cache",

  Expires:
    "0",
} as const;

/* ==========================================================================
   RESPONSE HELPERS
   ========================================================================== */

function successResponse(
  data: unknown,
  status = 200,
) {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    {
      status,
      headers:
        NO_STORE_HEADERS,
    },
  );
}

function errorResponse(
  code: string,
  message: string,
  status: number,
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
      headers:
        NO_STORE_HEADERS,
    },
  );
}

/* ==========================================================================
   INPUT HELPERS
   ========================================================================== */

function stringValue(
  value: unknown,
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function numberValue(
  value: unknown,
  fallback = 0,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return fallback;
  }

  return value;
}

function nonNegativeNumber(
  value: unknown,
  fallback = 0,
): number {
  return Math.max(
    0,
    numberValue(
      value,
      fallback,
    ),
  );
}

function nonNegativeInteger(
  value: unknown,
  fallback = 0,
): number {
  return Math.max(
    0,
    Math.round(
      numberValue(
        value,
        fallback,
      ),
    ),
  );
}

function progressPercent(
  value: unknown,
): number {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        numberValue(
          value,
          0,
        ),
      ),
    ),
  );
}

function studySessionType(
  value: unknown,
):
  | "lesson"
  | "practice"
  | "review"
  | "other" {
  switch (
    value
  ) {
    case "lesson":
    case "practice":
    case "review":
    case "other":
      return value;

    default:
      return "lesson";
  }
}

/* ==========================================================================
   AGGREGATE SYNCHRONIZATION
   ========================================================================== */

/**
 * Rebuilds the derived Theorie aggregate after a real learner action.
 *
 * Important:
 * - the primary user action has already been persisted before this runs;
 * - aggregate synchronization is derived data;
 * - if aggregate synchronization temporarily fails, the learner's saved
 *   lesson/session must not be reported as failed;
 * - the next Theorie overview read can reconcile the aggregate again.
 */
async function syncAggregateAfterLearningActivity(
  context:
    TheoryContext,
): Promise<void> {
  if (
    !context
      .userLicenseClassId
  ) {
    return;
  }

  try {
    const snapshot =
      await getTheoryOverviewRepositorySnapshot(
        context.userId,
        context.locale,
      );

    const progress =
      calculateTheoryLearningProgress(
        snapshot,
      );

    const readiness =
      calculateExamReadiness(
        snapshot,
        progress,
      );

    await syncTheoryLearningAggregate(
      snapshot,
      readiness
        .readinessPercent,
      {
        touchActivity:
          true,
      },
    );
  } catch (
    error
  ) {
    /**
     * Do not convert an already successful lesson/session write into a
     * frontend failure just because the derived aggregate could not be
     * refreshed at this exact moment.
     *
     * getTheoryOverviewData() can rebuild it on a later request.
     */
    console.error(
      "[THEORY_PROGRESS_AGGREGATE_SYNC_ERROR]",
      error,
    );
  }
}

/* ==========================================================================
   GET
   ========================================================================== */

export async function GET() {
  try {
    const data =
      await getTheoryOverviewData();

    return successResponse(
      {
        status:
          data.status,

        progress:
          data.progress,

        statistics:
          data.statistics,

        readiness:
          data.readiness,
      },
    );
  } catch (
    error
  ) {
    console.error(
      "[THEORY_PROGRESS_GET_ERROR]",
      error,
    );

    return errorResponse(
      "THEORY_PROGRESS_FAILED",
      "Fortschritt konnte nicht geladen werden.",
      500,
    );
  }
}

/* ==========================================================================
   POST
   ========================================================================== */

export async function POST(
  request:
    NextRequest,
) {
  try {
    let body:
      Record<
        string,
        unknown
      >;

    try {
      body =
        await request
          .json() as Record<
            string,
            unknown
          >;
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Die Anfrage enthält keine gültigen JSON-Daten.",
        400,
      );
    }

    const session =
      await requireClientSession();

    const context =
      await getTheoryContextForUser(
        session.user.id,
        session
          .user
          .preferredLocale,
      );

    const action =
      stringValue(
        body.action,
      );

    /* ======================================================================
       LESSON PROGRESS
       ====================================================================== */

    if (
      action ===
      "lesson_progress"
    ) {
      const lessonId =
        stringValue(
          body.lessonId,
        );

      if (
        !lessonId
      ) {
        return errorResponse(
          "LESSON_ID_REQUIRED",
          "lessonId fehlt.",
          400,
        );
      }

      const savedProgress =
        await saveTheoryLessonProgress(
          context,
          {
            lessonId,

            progressPercent:
              progressPercent(
                body.progressPercent,
              ),

            currentBlockIndex:
              nonNegativeInteger(
                body.currentBlockIndex,
              ),

            completed:
              body.completed ===
              true,

            activeSecondsDelta:
              nonNegativeNumber(
                body.activeSecondsDelta,
              ),
          },
        );

      /**
       * A lesson block was really visited/saved.
       *
       * Recalculate:
       * - completed lessons;
       * - question coverage currently stored;
       * - topics;
       * - exams;
       * - readiness;
       * - total learning aggregate.
       */
      await syncAggregateAfterLearningActivity(
        context,
      );

      return successResponse(
        savedProgress,
      );
    }

    /* ======================================================================
       STUDY SESSION START
       ====================================================================== */

    if (
      action ===
      "study_start"
    ) {
      const data =
        await startTheoryStudySession(
          context,
          {
            lessonId:
              stringValue(
                body.lessonId,
              ) ||
              null,

            sessionType:
              studySessionType(
                body.sessionType,
              ),
          },
        );

      /**
       * No complete aggregate rebuild here.
       *
       * Starting a timer does not itself change:
       * - completed lessons;
       * - question coverage;
       * - topics;
       * - exam activity.
       *
       * Avoid an unnecessary expensive database snapshot.
       */
      return successResponse(
        data,
        201,
      );
    }

    /* ======================================================================
       STUDY SESSION HEARTBEAT
       ====================================================================== */

    if (
      action ===
      "study_activity"
    ) {
      const studySessionId =
        stringValue(
          body.studySessionId,
        );

      if (
        !studySessionId
      ) {
        return errorResponse(
          "STUDY_SESSION_ID_REQUIRED",
          "studySessionId fehlt.",
          400,
        );
      }

      const data =
        await registerTheoryStudyActivity(
          context,
          {
            sessionId:
              studySessionId,

            activeSecondsDelta:
              nonNegativeNumber(
                body.activeSecondsDelta,
              ),
          },
        );

      /**
       * IMPORTANT:
       *
       * Do not run getTheoryOverviewRepositorySnapshot() on every heartbeat.
       * LessonPlayer can send several activity heartbeats while a learner is
       * reading a lesson.
       *
       * Recalculating every global statistic on every heartbeat would create
       * unnecessary Prisma/database traffic.
       *
       * The full duration is reconciled when the session finishes.
       */
      return successResponse(
        data,
      );
    }

    /* ======================================================================
       STUDY SESSION FINISH
       ====================================================================== */

    if (
      action ===
      "study_finish"
    ) {
      const studySessionId =
        stringValue(
          body.studySessionId,
        );

      if (
        !studySessionId
      ) {
        return errorResponse(
          "STUDY_SESSION_ID_REQUIRED",
          "studySessionId fehlt.",
          400,
        );
      }

      const data =
        await completeTheoryStudySession(
          context,
          {
            sessionId:
              studySessionId,

            activeSecondsDelta:
              nonNegativeNumber(
                body.activeSecondsDelta,
              ),

            abandoned:
              body.abandoned ===
              true,
          },
        );

      /**
       * The persisted study duration has now changed.
       * Refresh the derived learning aggregate once at the end.
       */
      await syncAggregateAfterLearningActivity(
        context,
      );

      return successResponse(
        data,
      );
    }

    /* ======================================================================
       UNKNOWN ACTION
       ====================================================================== */

    return errorResponse(
      "INVALID_PROGRESS_ACTION",
      "action muss lesson_progress, study_start, study_activity oder study_finish sein.",
      400,
    );
  } catch (
    error
  ) {
    console.error(
      "[THEORY_PROGRESS_POST_ERROR]",
      error,
    );

    return errorResponse(
      "THEORY_PROGRESS_UPDATE_FAILED",
      error instanceof Error
        ? error.message
        : "Fortschritt konnte nicht gespeichert werden.",
      400,
    );
  }
}