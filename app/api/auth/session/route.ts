import {
  NextResponse,
} from "next/server";

import { getAuthSession } from "@/lib/server/auth-session";
import { userRepository } from "@/lib/server/repositories/user-repository";

import type {
  LoginSessionResponse,
} from "@/types/login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control":
    "no-store, max-age=0",
  Pragma: "no-cache",
} as const;

export async function GET() {
  try {
    const session =
      await getAuthSession();

    if (!session) {
      const response:
        LoginSessionResponse = {
        ok: true,
        data: {
          authenticated:
            false,
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
    }

    const user =
      await userRepository.findById(
        session.userId,
      );

    if (
      !user ||
      user.status !== "active"
    ) {
      const response:
        LoginSessionResponse = {
        ok: true,
        data: {
          authenticated:
            false,
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
    }

    const response:
      LoginSessionResponse = {
      ok: true,
      data: {
        authenticated: true,
        user: {
          id: user.id,
          firstName:
            user.firstName,
          lastName:
            user.lastName,
          email: user.email,
          countryCode:
            user.countryCode,
        },
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
      "[Express-Führerschein] session lookup failed",
      error,
    );

    const response:
      LoginSessionResponse = {
      ok: false,
      error: {
        code:
          "SESSION_LOOKUP_FAILED",
        message:
          "Die Sitzung konnte nicht geprüft werden.",
      },
    };

    return NextResponse.json(
      response,
      {
        status: 500,
        headers:
          NO_STORE_HEADERS,
      },
    );
  }
}
