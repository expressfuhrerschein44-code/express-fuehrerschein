import "server-only";

function getSupabaseUrl(): string {
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

  if (!value) {
    throw new Error(
      "[Express-Führerschein] SUPABASE_URL ist nicht konfiguriert.",
    );
  }

  return value;
}

function getServiceRoleKey(): string {
  const value =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY
      ?.trim();

  if (!value) {
    throw new Error(
      "[Express-Führerschein] SUPABASE_SERVICE_ROLE_KEY ist nicht konfiguriert.",
    );
  }

  return value;
}

function storageHeaders():
  Record<string, string> {
  const key =
    getServiceRoleKey();

  return {
    Authorization:
      `Bearer ${key}`,
    apikey:
      key,
  };
}

function encodeStoragePath(
  value: string,
): string {
  return value
    .split(
      "/",
    )
    .map(
      (
        part,
      ) =>
        encodeURIComponent(
          part,
        ),
    )
    .join(
      "/",
    );
}

export async function createDocumentStorageSignedUrl(
  input: {
    storageBucket: string;
    storagePath: string;
    expiresInSeconds?: number;
  },
): Promise<string> {
  const storageBucket =
    input.storageBucket
      .trim();

  const storagePath =
    input.storagePath
      .trim();

  if (
    !storageBucket ||
    !storagePath
  ) {
    throw new Error(
      "[Express-Führerschein] Ungültiger Dokument-Speicherpfad.",
    );
  }

  const expiresIn =
    Math.max(
      60,
      Math.min(
        900,
        Math.round(
          input.expiresInSeconds ??
          300,
        ),
      ),
    );

  const response =
    await fetch(
      `${getSupabaseUrl()}/storage/v1/object/sign/${encodeURIComponent(storageBucket)}/${encodeStoragePath(storagePath)}`,
      {
        method:
          "POST",

        headers: {
          ...storageHeaders(),

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            expiresIn,
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
      "[DOCUMENT_STORAGE_SIGN_ERROR]",
      response.status,
      detail,
    );

    throw new Error(
      "[Express-Führerschein] Das Dokument konnte nicht sicher geöffnet werden.",
    );
  }

  const payload =
    await response
      .json()
      .catch(
        () => null,
      ) as
      | {
          signedURL?: string;
          signedUrl?: string;
        }
      | null;

  const signed =
    payload?.signedURL ??
    payload?.signedUrl;

  if (!signed) {
    throw new Error(
      "[Express-Führerschein] Supabase hat keine signierte Dokument-URL zurückgegeben.",
    );
  }

  return /^https?:\/\//i.test(
    signed,
  )
    ? signed
    : `${getSupabaseUrl()}${signed.startsWith("/") ? "" : "/"}${signed}`;
}
