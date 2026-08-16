import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  AdminTheoryServiceError,
  getAdminTheoryQuestionDetail,
  requireAdminTheoryActor,
  setAdminTheoryQuestionMedia,
} from "@/lib/server/admin/theory/admin-theory-service";

import {
  AdminTheoryStorageError,
  createTheoryMediaSignedUrl,
  deleteTheoryMedia,
  uploadTheoryQuestionMedia,
} from "@/lib/server/admin/theory/admin-theory-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_STORE = {
  "Cache-Control": "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
} as const;

type Context = {
  params: Promise<{ questionId: string }>;
};

function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

function errorResponse(error: unknown) {
  if (error instanceof AdminTheoryServiceError) {
    return NextResponse.json(
      {
        ok: false,
        code: error.code,
        message: error.message,
        fields: error.fields,
        allowedValues: error.allowedValues,
      },
      {
        status: error.status,
        headers: NO_STORE,
      },
    );
  }

  if (error instanceof AdminTheoryStorageError) {
    return NextResponse.json(
      {
        ok: false,
        code: error.code,
        message: error.message,
      },
      {
        status: error.status,
        headers: NO_STORE,
      },
    );
  }

  console.error(
    "[Express-Führerschein] Admin Theorie media API error",
    error,
  );

  return NextResponse.json(
    {
      ok: false,
      code: "INTERNAL_ERROR",
      message: "Das Theorie-Medium konnte gerade nicht verarbeitet werden.",
    },
    {
      status: 500,
      headers: NO_STORE,
    },
  );
}

export async function GET(
  _request: NextRequest,
  context: Context,
) {
  try {
    await requireAdminTheoryActor();
    const { questionId } = await context.params;
    const question =
      await getAdminTheoryQuestionDetail(questionId);

    if (!question.mediaStoragePath) {
      return NextResponse.json(
        {
          ok: false,
          code: "MEDIA_NOT_FOUND",
          message: "Für diese Frage ist kein Medium hinterlegt.",
        },
        {
          status: 404,
          headers: NO_STORE,
        },
      );
    }

    const url =
      await createTheoryMediaSignedUrl(
        question.mediaStoragePath,
      );

    return NextResponse.json(
      {
        ok: true,
        data: {
          path: question.mediaStoragePath,
          url,
        },
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  context: Context,
) {
  if (!sameOrigin(request)) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_ORIGIN",
        message: "Die Anfrage stammt von einer nicht erlaubten Quelle.",
      },
      {
        status: 403,
        headers: NO_STORE,
      },
    );
  }

  try {
    await requireAdminTheoryActor();

    const { questionId } = await context.params;
    const current =
      await getAdminTheoryQuestionDetail(questionId);

    const form =
      await request.formData();

    const file =
      form.get("file");

    if (!(file instanceof File)) {
      throw new AdminTheoryStorageError(
        "FILE_REQUIRED",
        "Bitte wähle eine Mediendatei aus.",
        400,
      );
    }

    const uploaded =
      await uploadTheoryQuestionMedia({
        questionId,
        file,
      });

    try {
      const updated =
        await setAdminTheoryQuestionMedia(
          questionId,
          uploaded.path,
        );

      if (
        current.mediaStoragePath &&
        current.mediaStoragePath !== uploaded.path
      ) {
        void deleteTheoryMedia(
          current.mediaStoragePath,
        ).catch((error) => {
          console.error(
            "[Express-Führerschein] old theory media cleanup failed",
            error,
          );
        });
      }

      return NextResponse.json(
        {
          ok: true,
          data: updated,
        },
        {
          status: 201,
          headers: NO_STORE,
        },
      );
    } catch (error) {
      void deleteTheoryMedia(uploaded.path).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: Context,
) {
  if (!sameOrigin(request)) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_ORIGIN",
        message: "Die Anfrage stammt von einer nicht erlaubten Quelle.",
      },
      {
        status: 403,
        headers: NO_STORE,
      },
    );
  }

  try {
    await requireAdminTheoryActor();
    const { questionId } = await context.params;
    const current =
      await getAdminTheoryQuestionDetail(questionId);

    if (current.mediaStoragePath) {
      await deleteTheoryMedia(current.mediaStoragePath);
    }

    const updated =
      await setAdminTheoryQuestionMedia(
        questionId,
        null,
      );

    return NextResponse.json(
      {
        ok: true,
        data: updated,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
