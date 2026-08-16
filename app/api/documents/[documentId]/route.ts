import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getDocumentStorageLocator,
} from "@/lib/server/documents/documents-service";

import {
  createDocumentStorageSignedUrl,
} from "@/lib/server/documents/documents-storage";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params:
      Promise<{
        documentId:
          string;
      }>;
  },
) {
  try {
    const {
      documentId:
        rawDocumentId,
    } =
      await params;

    const documentId =
      decodeURIComponent(
        rawDocumentId,
      ).trim();

    if (!documentId) {
      return NextResponse.json(
        {
          ok:
            false,
          error: {
            code:
              "DOCUMENT_ID_REQUIRED",
            message:
              "documentId fehlt.",
          },
        },
        {
          status:
            400,
          headers: {
            "Cache-Control":
              "private, no-store, max-age=0",
          },
        },
      );
    }

    const session =
      await requireClientSession();

    const locator =
      await getDocumentStorageLocator({
        userId:
          session.user.id,
        documentId,
      });

    if (!locator) {
      return NextResponse.json(
        {
          ok:
            false,
          error: {
            code:
              "DOCUMENT_NOT_FOUND",
            message:
              "Dokument wurde nicht gefunden.",
          },
        },
        {
          status:
            404,
          headers: {
            "Cache-Control":
              "private, no-store, max-age=0",
          },
        },
      );
    }

    const signedUrl =
      await createDocumentStorageSignedUrl({
        storageBucket:
          locator.storageBucket,
        storagePath:
          locator.storagePath,
        expiresInSeconds:
          300,
      });

    return NextResponse.redirect(
      signedUrl,
      {
        status:
          302,
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      },
    );
  } catch (
    error
  ) {
    console.error(
      "[DOCUMENT_OPEN_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,
        error: {
          code:
            "DOCUMENT_OPEN_FAILED",
          message:
            "Das Dokument konnte nicht geöffnet werden.",
        },
      },
      {
        status:
          500,
        headers: {
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      },
    );
  }
}
