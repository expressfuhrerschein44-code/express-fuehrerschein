import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  SettingsServiceError,
  updateSettings,
} from "@/lib/server/settings/settings-service";

import type {
  SettingsLocale,
} from "@/types/settings";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function noStoreHeaders():
  Record<string, string> {
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
              "SETTINGS_INVALID_REQUEST",
            message:
              "Ungültige Einstellungsanfrage.",
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

    const preferredLocale =
      typeof body.preferredLocale ===
        "string"
        ? body.preferredLocale
        : "";

    const timezone =
      typeof body.timezone ===
        "string"
        ? body.timezone
        : "";

    const session =
      await requireClientSession();

    const data =
      await updateSettings({
        userId:
          session.user.id,
        data: {
          preferredLocale:
            preferredLocale as
            SettingsLocale,
          timezone,
        },
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
  } catch (
    error
  ) {
    if (
      error instanceof
      SettingsServiceError
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
      "[SETTINGS_UPDATE_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,
        error: {
          code:
            "SETTINGS_UPDATE_FAILED",
          message:
            "Die Einstellungen konnten nicht gespeichert werden.",
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
