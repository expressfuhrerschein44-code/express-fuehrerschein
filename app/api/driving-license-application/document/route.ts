/**
 * Express-Führerschein
 * Upload/replace/delete one required application document.
 */

import {
  NextResponse,
} from "next/server";

import {
  deleteCurrentApplicationDocument,
  uploadCurrentApplicationDocument,
} from "@/lib/server/driving-license-application/application-service";

import {
  DrivingLicenseApplicationServiceError,
} from "@/types/driving-license-application";

import type {
  DrivingLicenseApplicationDocumentType,
} from "@/types/driving-license-application";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const DOCUMENT_TYPES =
  new Set<string>([
    "id_front",
    "id_back",
    "portrait_photo",
  ]);

const ABSOLUTE_UPLOAD_LIMIT_BYTES =
  5 *
  1024 *
  1024;

function isDocumentType(
  value:
    unknown,
): value is
  DrivingLicenseApplicationDocumentType {
  return (
    typeof value ===
      "string" &&
    DOCUMENT_TYPES.has(
      value,
    )
  );
}

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

function serviceErrorResponse(
  error:
    DrivingLicenseApplicationServiceError,
) {
  return NextResponse.json(
    {
      ok:
        false,

      code:
        error.code,

      message:
        error.message,
    },
    {
      status:
        statusForCode(
          error.code,
        ),
    },
  );
}

export async function POST(
  request:
    Request,
) {
  try {
    const formData =
      await request.formData();

    const documentTypeValue =
      formData.get(
        "documentType",
      );

    const fileValue =
      formData.get(
        "file",
      );

    if (
      !isDocumentType(
        documentTypeValue,
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            "VALIDATION_ERROR",

          message:
            "Der Dokumenttyp ist ungültig.",
        },
        {
          status:
            422,
        },
      );
    }

    if (
      !(fileValue instanceof File)
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            "VALIDATION_ERROR",

          message:
            "Bitte wähle eine Datei aus.",
        },
        {
          status:
            422,
        },
      );
    }

    if (
      fileValue.size <=
        0 ||
      fileValue.size >
        ABSOLUTE_UPLOAD_LIMIT_BYTES
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            "DOCUMENT_TOO_LARGE",

          message:
            fileValue.size <=
            0
              ? "Die Datei ist leer oder ungültig."
              : "Die Datei ist zu groß. Maximal 5 MB sind erlaubt.",
        },
        {
          status:
            422,
        },
      );
    }

    const bytes =
      new Uint8Array(
        await fileValue
          .arrayBuffer(),
      );

    const document =
      await uploadCurrentApplicationDocument({
        documentType:
          documentTypeValue,

        bytes,

        mimeType:
          fileValue.type,

        originalFilename:
          fileValue.name,
      });

    return NextResponse.json(
      {
        ok:
          true,

        message:
          "Das Dokument wurde sicher hochgeladen.",

        data: {
          document,
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
      return serviceErrorResponse(
        error,
      );
    }

    console.error(
      "[DRIVING_LICENSE_APPLICATION_DOCUMENT_UPLOAD_ROUTE_ERROR]",
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
          "Das Dokument konnte gerade nicht hochgeladen werden.",
      },
      {
        status:
          500,
      },
    );
  }
}

export async function DELETE(
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

    const documentType =
      typeof input ===
        "object" &&
      input !==
        null &&
      "documentType" in
        input
        ? (
            input as {
              documentType?:
                unknown;
            }
          ).documentType
        : null;

    if (
      !isDocumentType(
        documentType,
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          code:
            "VALIDATION_ERROR",

          message:
            "Der Dokumenttyp ist ungültig.",
        },
        {
          status:
            422,
        },
      );
    }

    await deleteCurrentApplicationDocument(
      documentType,
    );

    return NextResponse.json(
      {
        ok:
          true,

        message:
          "Das Dokument wurde entfernt.",
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
      return serviceErrorResponse(
        error,
      );
    }

    console.error(
      "[DRIVING_LICENSE_APPLICATION_DOCUMENT_DELETE_ROUTE_ERROR]",
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
          "Das Dokument konnte gerade nicht entfernt werden.",
      },
      {
        status:
          500,
      },
    );
  }
}
