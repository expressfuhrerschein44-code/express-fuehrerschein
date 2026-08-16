import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  prisma,
} from "@/lib/server/prisma";

import {
  getTheoryContextForUser,
} from "@/lib/server/theory/theory-repository";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const SIGNED_URL_TTL_SECONDS =
  300;

function noStoreHeaders():
  Record<string, string> {
  return {
    "Cache-Control":
      "private, no-store, max-age=0",
  };
}

function jsonError(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        message,
      },
    },
    {
      status,
      headers:
        noStoreHeaders(),
    },
  );
}

function getSupabaseUrl():
  string | null {
  const value =
    (
      process.env
        .SUPABASE_URL ??
      process.env
        .NEXT_PUBLIC_SUPABASE_URL
    )
      ?.trim()
      .replace(
        /\/+$/,
        "",
      );

  return value ||
    null;
}

function getServiceRoleKey():
  string | null {
  const value =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY
      ?.trim();

  return value ||
    null;
}

/**
 * Keep Theorie media independent from
 * driving-license application documents.
 *
 * No bucket name is hard-coded here.
 */
function getTheoryMediaBucket():
  string | null {
  const value =
    process.env
      .THEORY_MEDIA_STORAGE_BUCKET
      ?.trim();

  return value ||
    null;
}

function encodeStoragePath(
  value: string,
): string {
  return value
    .split("/")
    .map((part) =>
      encodeURIComponent(
        part,
      ),
    )
    .join("/");
}

async function createSignedUrl(
  storagePath: string,
): Promise<string | null> {
  const supabaseUrl =
    getSupabaseUrl();

  const serviceRoleKey =
    getServiceRoleKey();

  const bucket =
    getTheoryMediaBucket();

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !bucket
  ) {
    return null;
  }

  const response =
    await fetch(
      `${supabaseUrl}/storage/v1/object/sign/${encodeURIComponent(
        bucket,
      )}/${encodeStoragePath(
        storagePath,
      )}`,
      {
        method:
          "POST",

        headers: {
          Authorization:
            `Bearer ${serviceRoleKey}`,

          apikey:
            serviceRoleKey,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            expiresIn:
              SIGNED_URL_TTL_SECONDS,
          }),

        cache:
          "no-store",
      },
    );

  if (!response.ok) {
    const detail =
      await response
        .text()
        .catch(
          () => "",
        );

    console.error(
      "[THEORY_MEDIA_SIGN_ERROR]",
      response.status,
      detail,
    );

    return null;
  }

  const payload =
    await response
      .json()
      .catch(
        () => null,
      ) as
        | {
            signedURL?:
              string;

            signedUrl?:
              string;
          }
        | null;

  const signedPath =
    payload?.signedURL ??
    payload?.signedUrl ??
    null;

  if (!signedPath) {
    return null;
  }

  if (
    /^https?:\/\//i.test(
      signedPath,
    )
  ) {
    return signedPath;
  }

  return `${supabaseUrl}${
    signedPath.startsWith("/")
      ? ""
      : "/"
  }${signedPath}`;
}

function todayUtc():
  Date {
  const now =
    new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    ),
  );
}

export async function GET(
  request: NextRequest,
) {
  const blockId =
    request
      .nextUrl
      .searchParams
      .get("blockId")
      ?.trim() ??
    "";

  if (!blockId) {
    return jsonError(
      "blockId fehlt.",
      400,
    );
  }

  try {
    /**
     * Never accept a raw storage path from the browser.
     *
     * The browser supplies only blockId.
     * The real path is read from the database after
     * verifying the authenticated user's Theorie program.
     */
    const session =
      await requireClientSession();

    const context =
      await getTheoryContextForUser(
        session.user.id,
        session.user
          .preferredLocale,
      );

    if (
      !context.programId ||
      !context.userLicenseClassId
    ) {
      return jsonError(
        "Keine aktive Theorie-Zuordnung.",
        403,
      );
    }

    const date =
      todayUtc();

    const block =
      await prisma
        .theory_lesson_content_blocks
        .findFirst({
          where: {
            id:
              blockId,

            is_active:
              true,

            block_type: {
              in: [
                "IMAGE",
                "VIDEO",
              ],
            },

            theory_lessons: {
              status:
                "published",

              AND: [
                {
                  OR: [
                    {
                      valid_from:
                        null,
                    },
                    {
                      valid_from: {
                        lte:
                          date,
                      },
                    },
                  ],
                },
                {
                  OR: [
                    {
                      valid_until:
                        null,
                    },
                    {
                      valid_until: {
                        gte:
                          date,
                      },
                    },
                  ],
                },
              ],

              theory_topics: {
                program_id:
                  context.programId,

                is_active:
                  true,
              },
            },
          },

          select: {
            id:
              true,

            media_storage_path:
              true,
          },
        });

    if (
      !block ||
      !block.media_storage_path
        ?.trim()
    ) {
      return jsonError(
        "Medium wurde nicht gefunden.",
        404,
      );
    }

    const storagePath =
      block
        .media_storage_path
        .trim();

    /**
     * These are already directly usable sources.
     * In normal operation LessonMediaBlock bypasses this
     * API for them, but keeping support here is harmless.
     */
    if (
      /^https?:\/\//i.test(
        storagePath,
      )
    ) {
      return NextResponse.redirect(
        storagePath,
        {
          status:
            307,

          headers:
            noStoreHeaders(),
        },
      );
    }

    if (
      storagePath.startsWith("/")
    ) {
      const destination =
        new URL(
          storagePath,
          request.nextUrl.origin,
        );

      return NextResponse.redirect(
        destination,
        {
          status:
            307,

          headers:
            noStoreHeaders(),
        },
      );
    }

    if (
      !getTheoryMediaBucket()
    ) {
      console.error(
        "[THEORY_MEDIA_CONFIGURATION_ERROR] THEORY_MEDIA_STORAGE_BUCKET fehlt.",
      );

      return jsonError(
        "Der Theorie-Medienspeicher ist noch nicht konfiguriert.",
        503,
      );
    }

    const signedUrl =
      await createSignedUrl(
        storagePath,
      );

    if (!signedUrl) {
      return jsonError(
        "Das Medium konnte gerade nicht geladen werden.",
        503,
      );
    }

    /**
     * Redirecting instead of proxying the whole file is intentional.
     *
     * This is especially useful for videos because Supabase can then
     * handle streaming/range requests directly.
     */
    return NextResponse.redirect(
      signedUrl,
      {
        status:
          307,

        headers:
          noStoreHeaders(),
      },
    );
  } catch (
    error:
      unknown
  ) {
    console.error(
      "[THEORY_MEDIA_ERROR]",
      error instanceof Error
        ? error.message
        : error,
    );

    return jsonError(
      "Das Medium konnte gerade nicht geladen werden.",
      500,
    );
  }
}