import {
  NextRequest,
  NextResponse,
} from "next/server";

import { LOGIN_ROUTES } from "@/data/login";
import { getAuthPublicOrigin } from "@/lib/server/auth-origin";
import { revokeCurrentAuthSession } from "@/lib/server/auth-session";

import type {
  LoginApiErrorResponse,
  LogoutResponse,
} from "@/types/login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control":
    "no-store, max-age=0",
  Pragma: "no-cache",
} as const;

function requestOriginAllowed(
  request: NextRequest,
): boolean {
  const origin =
    request.headers.get(
      "origin",
    );

  if (!origin) {
    return true;
  }

  try {
    return (
      new URL(origin).origin ===
      getAuthPublicOrigin(
        request,
      )
    );
  } catch {
    return false;
  }
}

export async function POST(
  request: NextRequest,
) {
  if (
    !requestOriginAllowed(
      request,
    )
  ) {
    return NextResponse.json<
      LoginApiErrorResponse
    >(
      {
        ok: false,
        error: {
          code:
            "INVALID_ORIGIN",
          message:
            "Die Anfrage stammt von einer nicht erlaubten Quelle.",
        },
      },
      {
        status: 403,
        headers:
          NO_STORE_HEADERS,
      },
    );
  }

  try {
    await revokeCurrentAuthSession();

    const response:
      LogoutResponse = {
      ok: true,
      data: {
        loggedOut: true,
        nextPath:
          LOGIN_ROUTES.login,
      },
    };

    return NextResponse.json(
      response,
      {
        status: 200,
        headers:
          NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    console.error(
      "[Express-Führerschein] logout failed",
      error,
    );

    return NextResponse.json<
      LoginApiErrorResponse
    >(
      {
        ok: false,
        error: {
          code:
            "LOGOUT_FAILED",
          message:
            "Die Sitzung konnte nicht beendet werden.",
        },
      },
      {
        status: 500,
        headers:
          NO_STORE_HEADERS,
      },
    );
  }
}
