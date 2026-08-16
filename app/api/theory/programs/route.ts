import { NextResponse } from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";
import {
  getCurrentGermanTheoryProgramForUser,
  listAvailableGermanTheoryProgramsForUser,
} from "@/lib/server/theory/theory-program-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireClientSession();

    const [current, available] = await Promise.all([
      getCurrentGermanTheoryProgramForUser(
        session.user.id,
        session.user.preferredLocale,
      ),
      listAvailableGermanTheoryProgramsForUser(
        session.user.id,
      ),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        countryCode: "DE",
        current,
        available,
      },
    });
  } catch (error) {
    console.error("[THEORY_PROGRAMS_GET_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "THEORY_PROGRAMS_LOAD_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Theorieprogramme konnten nicht geladen werden.",
        },
      },
      { status: 400 },
    );
  }
}
