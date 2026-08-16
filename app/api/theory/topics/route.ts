import { NextRequest, NextResponse } from "next/server";

import { requireClientSession } from "@/lib/server/client-session";
import { getTheoryContextForUser } from "@/lib/server/theory/theory-repository";
import {
  getGermanTheoryTopicPageData,
  listGermanTheoryTopicsForUser,
} from "@/lib/server/theory/theory-topic-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getSessionOrResponse() {
  try {
    return {
      session: await requireClientSession(),
      response: null,
    } as const;
  } catch {
    return {
      session: null,
      response: NextResponse.json(
        {
          ok: false,
          error: {
            code: "UNAUTHENTICATED",
            message: "Bitte melde dich an, um Theorie zu lernen.",
          },
        },
        { status: 401 },
      ),
    } as const;
  }
}

export async function GET(request: NextRequest) {
  const auth = await getSessionOrResponse();
  if (!auth.session) return auth.response;

  try {
    const context = await getTheoryContextForUser(
      auth.session.user.id,
      auth.session.user.preferredLocale,
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

    const slug = request.nextUrl.searchParams.get("slug")?.trim();

    if (slug) {
      const topic = await getGermanTheoryTopicPageData({
        userId: auth.session.user.id,
        locale: auth.session.user.preferredLocale,
        topicSlug: slug,
      });

      if (!topic) {
        return NextResponse.json(
          {
            ok: false,
            error: {
              code: "TOPIC_NOT_FOUND",
              message: "Thema wurde nicht gefunden.",
            },
          },
          { status: 404 },
        );
      }

      return NextResponse.json({ ok: true, data: topic });
    }

    const topics = await listGermanTheoryTopicsForUser(
      auth.session.user.id,
      auth.session.user.preferredLocale,
    );

    return NextResponse.json({
      ok: true,
      data: {
        countryCode: "DE",
        licenseClassCode: context.licenseClassCode,
        programId: context.programId,
        topics,
      },
    });
  } catch (error) {
    console.error("[THEORY_TOPICS_ROUTE_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "THEORY_TOPICS_FAILED",
          message: "Themen konnten nicht geladen werden.",
        },
      },
      { status: 500 },
    );
  }
}
