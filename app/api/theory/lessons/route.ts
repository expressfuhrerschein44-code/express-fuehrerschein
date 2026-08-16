import { NextRequest, NextResponse } from "next/server";

import { requireClientSession } from "@/lib/server/client-session";
import {
  getGermanTheoryLessonPageData,
  listGermanTheoryLessonsForTopic,
} from "@/lib/server/theory/theory-lesson-service";
import { getTheoryContextForUser } from "@/lib/server/theory/theory-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  let session;

  try {
    session = await requireClientSession();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "UNAUTHENTICATED",
          message: "Bitte melde dich an, um Theorie zu lernen.",
        },
      },
      { status: 401 },
    );
  }

  try {
    const topicSlug = request.nextUrl.searchParams.get("topic")?.trim();
    const lessonSlug = request.nextUrl.searchParams.get("lesson")?.trim();

    if (!topicSlug) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "TOPIC_REQUIRED",
            message: "topic ist erforderlich.",
          },
        },
        { status: 400 },
      );
    }

    const context = await getTheoryContextForUser(
      session.user.id,
      session.user.preferredLocale,
    );

    if (context.countryCode !== "DE") {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "COUNTRY_NOT_AVAILABLE",
            message: "Das Theorieprogramm ist aktuell nur für Deutschland freigeschaltet.",
          },
        },
        { status: 409 },
      );
    }

    if (!context.userLicenseClassId) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "LICENSE_CLASS_REQUIRED",
            message: "Wähle zuerst eine aktive Führerscheinklasse aus.",
          },
        },
        { status: 409 },
      );
    }

    if (!context.programId) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "THEORY_PROGRAM_UNAVAILABLE",
            message: "Für diese Führerscheinklasse ist noch kein veröffentlichtes Theorieprogramm verfügbar.",
          },
        },
        { status: 404 },
      );
    }

    if (lessonSlug) {
      const lesson = await getGermanTheoryLessonPageData({
        userId: session.user.id,
        locale: session.user.preferredLocale,
        topicSlug,
        lessonSlug,
      });

      if (!lesson) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "LESSON_NOT_FOUND",
              message: "Lektion wurde nicht gefunden.",
            },
          },
          { status: 404 },
        );
      }

      return NextResponse.json({ ok: true, data: lesson });
    }

    const lessons = await listGermanTheoryLessonsForTopic({
      userId: session.user.id,
      locale: session.user.preferredLocale,
      topicSlug,
    });

    return NextResponse.json({
      ok: true,
      data: {
        countryCode: "DE",
        licenseClassCode: context.licenseClassCode,
        topicSlug,
        lessons,
      },
    });
  } catch (error) {
    console.error("[THEORY_LESSONS_ROUTE_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "THEORY_LESSONS_FAILED",
          message: "Lektionen konnten nicht geladen werden.",
        },
      },
      { status: 500 },
    );
  }
}
