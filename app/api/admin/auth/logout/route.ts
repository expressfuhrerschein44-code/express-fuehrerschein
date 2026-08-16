import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  writeAdminAuditLog,
} from "@/lib/server/admin/admin-audit";

import {
  revokeAdminSessionByTokenHash,
} from "@/lib/server/admin/admin-repository";

import {
  ADMIN_SESSION_COOKIE_NAME,
  hashAdminSessionToken,
} from "@/lib/server/admin/admin-session";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export async function POST(
  request:
    NextRequest,
) {
  const token =
    request.cookies.get(
      ADMIN_SESSION_COOKIE_NAME,
    )?.value;

  if (token) {
    const tokenHash =
      hashAdminSessionToken(
        token,
      );

    const revoked =
      await revokeAdminSessionByTokenHash(
        tokenHash,
      );

    if (revoked) {
      await writeAdminAuditLog({
        adminId:
          revoked.adminId,
        action:
          "ADMIN_LOGOUT",
        entityType:
          "admin_session",
        entityId:
          revoked.sessionId,
      });
    }
  }

  const response =
    NextResponse.redirect(
      new URL(
        "/admin/login",
        request.url,
      ),
      303,
    );

  response.cookies.set({
    name:
      ADMIN_SESSION_COOKIE_NAME,
    value:
      "",
    httpOnly:
      true,
    sameSite:
      "lax",
    secure:
      process.env.NODE_ENV ===
      "production",
    path:
      "/",
    expires:
      new Date(
        0,
      ),
    maxAge:
      0,
  });

  return response;
}
