import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AdminAuthError,
  hashAdminIp,
  loginAdmin,
} from "@/lib/server/admin/admin-auth-service";

import {
  getAdminSessionCookieOptions,
} from "@/lib/server/admin/admin-session";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function getRequestIp(
  request:
    NextRequest,
): string | null {
  const forwarded =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwarded) {
    return forwarded
      .split(
        ",",
      )[0]
      ?.trim() ||
      null;
  }

  return request.headers.get(
    "x-real-ip",
  );
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
              "ADMIN_INVALID_REQUEST",
            message:
              "Ungültige Anfrage.",
          },
        },
        {
          status:
            400,
        },
      );
    }

    const email =
      typeof body.email ===
        "string"
        ? body.email
        : "";

    const password =
      typeof body.password ===
        "string"
        ? body.password
        : "";

    const rememberMe =
      body.rememberMe ===
      true;

    const rawIp =
      getRequestIp(
        request,
      );

    const userAgent =
      request.headers.get(
        "user-agent",
      );

    const result =
      await loginAdmin({
        email,
        password,
        rememberMe,
        ipHash:
          hashAdminIp(
            rawIp,
          ),
        userAgent,
      });

    const response =
      NextResponse.json(
        {
          ok:
            true,
          data: {
            admin: {
              firstName:
                result.admin
                  .firstName,
              lastName:
                result.admin
                  .lastName,
              role:
                result.admin
                  .role,
            },
          },
        },
        {
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );

    response.cookies.set({
      ...getAdminSessionCookieOptions(
        result.expiresAt,
      ),
      value:
        result.token,
    });

    return response;
  } catch (
    error
  ) {
    if (
      error instanceof
      AdminAuthError
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
          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    console.error(
      "[ADMIN_LOGIN_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,
        error: {
          code:
            "ADMIN_LOGIN_FAILED",
          message:
            "Die Anmeldung konnte nicht durchgeführt werden.",
        },
      },
      {
        status:
          500,
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}
