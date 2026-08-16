/**
 * Express-Führerschein
 * Save/update the authenticated user's current driving-license draft.
 */

import {
  NextResponse,
} from "next/server";

import {
  saveCurrentDrivingLicenseApplication,
} from "@/lib/server/driving-license-application/application-service";

import {
  DrivingLicenseApplicationServiceError,
} from "@/types/driving-license-application";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

function statusForCode(
  code:
    DrivingLicenseApplicationServiceError["code"],
): number {
  switch (
    code
  ) {
    case "UNAUTHENTICATED":
      return 401;

    case "ACCOUNT_UNAVAILABLE":
      return 403;

    case "APPLICATION_NOT_FOUND":
      return 404;

    case "APPLICATION_NOT_EDITABLE":
      return 409;

    case "VALIDATION_ERROR":
    case "PROFILE_INCOMPLETE":
    case "DOCUMENT_REQUIRED":
    case "DOCUMENT_INVALID_TYPE":
    case "DOCUMENT_TOO_LARGE":
    case "SIGNATURE_REQUIRED":
    case "SIGNATURE_INVALID_TYPE":
    case "SIGNATURE_TOO_LARGE":
      return 422;

    case "STORAGE_NOT_CONFIGURED":
    case "STORAGE_ERROR":
    case "DATABASE_ERROR":
      return 503;

    case "EMAIL_DELIVERY_ERROR":
      return 502;

    default:
      return 500;
  }
}

function fieldsFromDetails(
  details:
    unknown,
): Record<string, string> | undefined {
  if (
    typeof details !==
      "object" ||
    details ===
      null ||
    Array.isArray(
      details,
    )
  ) {
    return undefined;
  }

  const entries =
    Object.entries(
      details,
    ).filter(
      (
        entry,
      ): entry is
        [string, string] =>
        typeof entry[1] ===
          "string",
    );

  return entries.length >
    0
    ? Object.fromEntries(
        entries,
      )
    : undefined;
}

export async function POST(
  request:
    Request,
) {
  try {
    const input =
      await request
        .json()
        .catch(
          () =>
            null,
        );

    const application =
      await saveCurrentDrivingLicenseApplication(
        input,
      );

    return NextResponse.json(
      {
        ok:
          true,

        message:
          "Der Antrag wurde gespeichert.",

        data: {
          application,
        },
      },
      {
        status:
          200,
      },
    );
  } catch (
    error:
      unknown
  ) {
    if (
      error instanceof
      DrivingLicenseApplicationServiceError
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            error.code,

          message:
            error.message,

          fields:
            fieldsFromDetails(
              error.details,
            ),
        },
        {
          status:
            statusForCode(
              error.code,
            ),
        },
      );
    }

    console.error(
      "[DRIVING_LICENSE_APPLICATION_SAVE_ROUTE_ERROR]",
      error instanceof Error
        ? error.message
        : error,
    );

    return NextResponse.json(
      {
        ok:
          false,

        code:
          "INTERNAL_ERROR",

        message:
          "Der Antrag konnte gerade nicht gespeichert werden.",
      },
      {
        status:
          500,
      },
    );
  }
}
