/**
 * Express-Führerschein
 * Private profile-avatar storage adapter.
 *
 * Compatibility goals:
 * - no additional npm dependency;
 * - no Prisma dependency;
 * - fetch BodyInit is always a real ArrayBuffer;
 * - Supabase service-role key remains server-only.
 */

import "server-only";

import {
  randomUUID,
} from "node:crypto";

import {
  PROFILE_AVATAR_BUCKET,
  PROFILE_AVATAR_MIME_TYPES,
  PROFILE_LIMITS,
} from "@/data/profile";

import type {
  ProfileAvatarUploadInput,
  ProfileAvatarUploadResult,
} from "@/types/profile";

import {
  ProfileServiceError,
} from "@/types/profile";

/* ==========================================================================
   CONFIG
   ========================================================================== */

function getSupabaseUrl():
  string {
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

  if (
    !value
  ) {
    throw new ProfileServiceError(
      "AVATAR_STORAGE_NOT_CONFIGURED",

      "Der Profilbild-Speicher ist noch nicht konfiguriert.",
    );
  }

  return value;
}

function getServiceRoleKey():
  string {
  const value =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY
      ?.trim();

  if (
    !value
  ) {
    throw new ProfileServiceError(
      "AVATAR_STORAGE_NOT_CONFIGURED",

      "Der Profilbild-Speicher ist noch nicht konfiguriert.",
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

/* ==========================================================================
   HELPERS
   ========================================================================== */

function encodeStoragePath(
  path:
    string,
): string {
  return path
    .split(
      "/",
    )
    .map(
      (
        segment,
      ) =>
        encodeURIComponent(
          segment,
        ),
    )
    .join(
      "/",
    );
}

function extensionForMimeType(
  mimeType:
    string,
): string {
  switch (
    mimeType
  ) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      throw new ProfileServiceError(
        "AVATAR_INVALID_TYPE",

        "Dieses Bildformat wird für Profilbilder nicht unterstützt.",
      );
  }
}

/**
 * TypeScript DOM's BodyInit can reject Uint8Array<ArrayBufferLike>.
 * Copying into a fresh Uint8Array guarantees a plain ArrayBuffer body.
 */
function toArrayBuffer(
  bytes:
    Uint8Array,
): ArrayBuffer {
  const copy =
    new Uint8Array(
      bytes.byteLength,
    );

  copy.set(
    bytes,
  );

  return copy.buffer;
}

/* ==========================================================================
   SIGNED URL
   ========================================================================== */

export async function createProfileAvatarSignedUrl(
  path:
    string,

  expiresInSeconds =
    3600,
): Promise<string | null> {
  const normalized =
    path.trim();

  if (
    !normalized
  ) {
    return null;
  }

  try {
    const response =
      await fetch(
        `${getSupabaseUrl()}/storage/v1/object/sign/${PROFILE_AVATAR_BUCKET}/${encodeStoragePath(normalized)}`,
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
              expiresIn:
                Math.max(
                  60,
                  Math.min(
                    86_400,
                    Math.round(
                      expiresInSeconds,
                    ),
                  ),
                ),
            }),

          cache:
            "no-store",
        },
      );

    if (
      !response.ok
    ) {
      return null;
    }

    const payload =
      await response
        .json()
        .catch(
          () =>
            null,
        ) as
        | {
            signedURL?:
              string;

            signedUrl?:
              string;
          }
        | null;

    const signed =
      payload?.signedURL ??
      payload?.signedUrl;

    if (
      !signed
    ) {
      return null;
    }

    if (
      /^https?:\/\//i.test(
        signed,
      )
    ) {
      return signed;
    }

    return `${getSupabaseUrl()}${signed.startsWith("/") ? "" : "/"}${signed}`;
  } catch {
    /**
     * Avatar rendering must never make the entire Profile page fail.
     * Upload/delete still fail loudly because they are explicit write actions.
     */
    return null;
  }
}

/* ==========================================================================
   UPLOAD
   ========================================================================== */

export async function uploadProfileAvatar(
  input:
    ProfileAvatarUploadInput,
): Promise<ProfileAvatarUploadResult> {
  if (
    input.bytes.byteLength >
    PROFILE_LIMITS
      .avatarMaxBytes
  ) {
    throw new ProfileServiceError(
      "AVATAR_TOO_LARGE",

      "Das Profilbild ist zu groß.",
    );
  }

  if (
    !PROFILE_AVATAR_MIME_TYPES
      .includes(
        input.mimeType as
          typeof PROFILE_AVATAR_MIME_TYPES[number],
      )
  ) {
    throw new ProfileServiceError(
      "AVATAR_INVALID_TYPE",

      "Dieses Bildformat wird für Profilbilder nicht unterstützt.",
    );
  }

  const extension =
    extensionForMimeType(
      input.mimeType,
    );

  const objectPath =
    [
      input.userId,
      `${Date.now()}-${randomUUID()}.${extension}`,
    ].join(
      "/",
    );

  const response =
    await fetch(
      `${getSupabaseUrl()}/storage/v1/object/${PROFILE_AVATAR_BUCKET}/${encodeStoragePath(objectPath)}`,
      {
        method:
          "POST",

        headers: {
          ...storageHeaders(),

          "Content-Type":
            input.mimeType,

          "x-upsert":
            "false",
        },

        body:
          toArrayBuffer(
            input.bytes,
          ),

        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    const detail =
      await response
        .text()
        .catch(
          () =>
            "",
        );

    throw new Error(
      `[Express-Führerschein] Avatar upload failed (${response.status}): ${detail}`,
    );
  }

  return {
    path:
      objectPath,

    url:
      await createProfileAvatarSignedUrl(
        objectPath,
      ),
  };
}

/* ==========================================================================
   DELETE
   ========================================================================== */

export async function deleteProfileAvatar(
  path:
    string,
): Promise<void> {
  const normalized =
    path.trim();

  if (
    !normalized
  ) {
    return;
  }

  const response =
    await fetch(
      `${getSupabaseUrl()}/storage/v1/object/${PROFILE_AVATAR_BUCKET}`,
      {
        method:
          "DELETE",

        headers: {
          ...storageHeaders(),

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            prefixes: [
              normalized,
            ],
          }),

        cache:
          "no-store",
      },
    );

  if (
    !response.ok &&
    response.status !==
      404
  ) {
    const detail =
      await response
        .text()
        .catch(
          () =>
            "",
        );

    throw new Error(
      `[Express-Führerschein] Avatar delete failed (${response.status}): ${detail}`,
    );
  }
}
