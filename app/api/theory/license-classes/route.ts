import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";
import {
  changePrimaryGermanLicenseClass,
  getGermanLicenseClassesForUser,
  getPrimaryGermanLicenseClassForUser,
} from "@/lib/server/license-classes/user-license-class-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireClientSession();

    const [classes, primary] = await Promise.all([
      getGermanLicenseClassesForUser(session.user.id),
      getPrimaryGermanLicenseClassForUser(session.user.id),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        countryCode: "DE",
        primary,
        classes,
      },
    });
  } catch (error) {
    console.error("[THEORY_LICENSE_CLASSES_GET_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "LICENSE_CLASSES_LOAD_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Führerscheinklassen konnten nicht geladen werden.",
        },
      },
      { status: 400 },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const licenseClassCode =
      typeof body.licenseClassCode === "string"
        ? body.licenseClassCode
        : "";

    if (!licenseClassCode) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "LICENSE_CLASS_REQUIRED",
            message: "licenseClassCode ist erforderlich.",
          },
        },
        { status: 400 },
      );
    }

    const session = await requireClientSession();

    const primary = await changePrimaryGermanLicenseClass({
      userId: session.user.id,
      licenseClassCode,
    });

    return NextResponse.json({
      ok: true,
      data: { primary },
    });
  } catch (error) {
    console.error("[THEORY_LICENSE_CLASSES_POST_ERROR]", error);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "LICENSE_CLASS_CHANGE_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Führerscheinklasse konnte nicht gewechselt werden.",
        },
      },
      { status: 400 },
    );
  }
}
