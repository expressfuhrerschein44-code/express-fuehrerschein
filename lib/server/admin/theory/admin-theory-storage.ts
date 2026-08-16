import "server-only";

const DEFAULT_BUCKET = "theory-media";

export class AdminTheoryStorageError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 500,
  ) {
    super(message);
    this.name = "AdminTheoryStorageError";
  }
}

function config() {
  const baseUrl =
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "";
  const bucket =
    process.env.THEORY_MEDIA_BUCKET?.trim() ||
    DEFAULT_BUCKET;

  if (!baseUrl || !serviceKey) {
    throw new AdminTheoryStorageError(
      "STORAGE_NOT_CONFIGURED",
      "Der private Theorie-Speicher ist nicht vollständig konfiguriert.",
      503,
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    serviceKey,
    bucket,
  };
}

function headers(serviceKey: string) {
  return {
    Authorization: `Bearer ${serviceKey}`,
    apikey: serviceKey,
  };
}

function safeFileName(name: string): string {
  const extension =
    name.includes(".")
      ? `.${name.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")}`
      : "";
  const base =
    name
      .replace(/\.[^.]+$/, "")
      .normalize("NFKD")
      .replace(/[^\w.-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "")
      .slice(0, 90) ||
    "media";

  return `${base}${extension}`;
}

export async function uploadTheoryQuestionMedia(input: {
  questionId: string;
  file: File;
}): Promise<{ bucket: string; path: string }> {
  const { baseUrl, serviceKey, bucket } = config();

  if (input.file.size <= 0 || input.file.size > 15 * 1024 * 1024) {
    throw new AdminTheoryStorageError(
      "INVALID_MEDIA_SIZE",
      "Die Datei muss zwischen 1 Byte und 15 MB groß sein.",
      400,
    );
  }

  const allowed = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
  ]);

  if (!allowed.has(input.file.type)) {
    throw new AdminTheoryStorageError(
      "INVALID_MEDIA_TYPE",
      "Erlaubt sind JPG, PNG, WEBP, GIF und MP4.",
      400,
    );
  }

  const path =
    `questions/${input.questionId}/${crypto.randomUUID()}-${safeFileName(input.file.name)}`;

  const response = await fetch(
    `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${path.split("/").map(encodeURIComponent).join("/")}`,
    {
      method: "POST",
      headers: {
        ...headers(serviceKey),
        "Content-Type": input.file.type || "application/octet-stream",
        "x-upsert": "false",
      },
      body: input.file,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new AdminTheoryStorageError(
      response.status === 404 ? "STORAGE_BUCKET_NOT_FOUND" : "STORAGE_UPLOAD_FAILED",
      response.status === 404
        ? `Der private Storage-Bucket "${bucket}" wurde nicht gefunden.`
        : `Das Theorie-Medium konnte nicht gespeichert werden.${detail ? ` (${detail.slice(0, 160)})` : ""}`,
      response.status === 404 ? 503 : 502,
    );
  }

  return { bucket, path };
}

export async function deleteTheoryMedia(path: string): Promise<void> {
  const { baseUrl, serviceKey, bucket } = config();
  const normalized = path.trim();

  if (!normalized) return;

  const response = await fetch(
    `${baseUrl}/storage/v1/object/${encodeURIComponent(bucket)}`,
    {
      method: "DELETE",
      headers: {
        ...headers(serviceKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: [normalized] }),
      cache: "no-store",
    },
  );

  if (!response.ok && response.status !== 404) {
    throw new AdminTheoryStorageError(
      "STORAGE_DELETE_FAILED",
      "Das Theorie-Medium konnte nicht gelöscht werden.",
      502,
    );
  }
}

export async function createTheoryMediaSignedUrl(
  path: string,
  expiresIn = 300,
): Promise<string> {
  const { baseUrl, serviceKey, bucket } = config();
  const normalized = path.trim();

  if (!normalized) {
    throw new AdminTheoryStorageError(
      "MEDIA_NOT_FOUND",
      "Für diese Frage ist kein Medium hinterlegt.",
      404,
    );
  }

  const response = await fetch(
    `${baseUrl}/storage/v1/object/sign/${encodeURIComponent(bucket)}/${normalized.split("/").map(encodeURIComponent).join("/")}`,
    {
      method: "POST",
      headers: {
        ...headers(serviceKey),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expiresIn: Math.max(60, Math.min(3600, Math.round(expiresIn))),
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new AdminTheoryStorageError(
      "SIGNED_URL_FAILED",
      "Das Theorie-Medium konnte nicht sicher geöffnet werden.",
      response.status === 404 ? 404 : 502,
    );
  }

  const payload = await response.json() as {
    signedURL?: string;
    signedUrl?: string;
  };

  const signed =
    payload.signedURL ||
    payload.signedUrl;

  if (!signed) {
    throw new AdminTheoryStorageError(
      "SIGNED_URL_FAILED",
      "Supabase hat keine signierte URL zurückgegeben.",
      502,
    );
  }

  return signed.startsWith("http")
    ? signed
    : `${baseUrl}/storage/v1${signed.startsWith("/") ? "" : "/"}${signed}`;
}
