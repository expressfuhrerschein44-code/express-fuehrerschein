import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getAdminApplicationDetail,
  reviewAdminApplication,
  toAdminApplicationsServiceError,
} from "@/lib/server/admin/applications/admin-applications-service";

import {
  getAuthPublicOrigin,
} from "@/lib/server/auth-origin";

import type {
  AdminApplicationsApiErrorResponse,
} from "@/types/admin-applications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE_HEADERS = {
  "Cache-Control":
    "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
} as const;

interface RouteContext {
  params: Promise<{
    applicationId: string;
  }>;
}

function errorResponse(
  error: unknown,
) {
  const serviceError =
    toAdminApplicationsServiceError(
      error,
    );

  const body:
    AdminApplicationsApiErrorResponse = {
    success: false,
    code: serviceError.code,
    message: serviceError.message,
    fields: serviceError.fields,
  };

  return NextResponse.json(
    body,
    {
      status: serviceError.status,
      headers: NO_STORE_HEADERS,
    },
  );
}

/**
 * Vérifie que les requêtes qui modifient
 * les données proviennent bien du domaine
 * public officiel de l'application.
 *
 * Important :
 * request.url ne doit pas servir de source
 * de vérité en production derrière un
 * reverse proxy comme Hostinger.
 */
function requestOriginAllowed(
  request: NextRequest,
): boolean {
  const origin =
    request.headers.get(
      "origin",
    );

  /*
   * En production, une requête de mutation
   * sans Origin est refusée.
   *
   * En développement local, elle reste
   * autorisée pour faciliter les tests.
   */
  if (!origin) {
    return (
      process.env.NODE_ENV !==
      "production"
    );
  }

  try {
    const incomingOrigin =
      new URL(
        origin,
      ).origin;

    const expectedOrigin =
      getAuthPublicOrigin(
        request,
      );

    return (
      incomingOrigin ===
      expectedOrigin
    );
  } catch {
    return false;
  }
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const {
    applicationId,
  } =
    await context.params;

  try {
    const data =
      await getAdminApplicationDetail(
        applicationId,
      );

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    return errorResponse(
      error,
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const {
    applicationId,
  } =
    await context.params;

  /*
   * Protection Origin / CSRF
   */
  if (
    !requestOriginAllowed(
      request,
    )
  ) {
    const body:
      AdminApplicationsApiErrorResponse = {
      success: false,
      code: "FORBIDDEN",
      message:
        "Die Anfrage stammt von einer nicht erlaubten Quelle.",
    };

    return NextResponse.json(
      body,
      {
        status: 403,
        headers: NO_STORE_HEADERS,
      },
    );
  }

  try {
    const rawBody =
      await request
        .json()
        .catch(
          () => null,
        );

    const data =
      await reviewAdminApplication(
        applicationId,
        rawBody,
        {
          userAgent:
            request.headers.get(
              "user-agent",
            ),
        },
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Der Antrag wurde aktualisiert.",
        data,
      },
      {
        status: 200,
        headers: NO_STORE_HEADERS,
      },
    );
  } catch (error) {
    return errorResponse(
      error,
    );
  }
}