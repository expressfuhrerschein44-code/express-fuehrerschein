"use client";

/**
 * Express-Führerschein
 * Avatar upload/delete controller.
 */

import {
  useRef,
  useState,
} from "react";

import {
  PROFILE_AVATAR_MIME_TYPES,
  PROFILE_LIMITS,
} from "@/data/profile";

export interface ProfileAvatarUploaderProps {
  hasAvatar:
    boolean;

  onUpdated?:
    () => void;
}

export function ProfileAvatarUploader({
  hasAvatar,
  onUpdated,
}: ProfileAvatarUploaderProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    busy,
    setBusy,
  ] =
    useState(
      false,
    );

  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );

  async function upload(
    file:
      File,
  ) {
    if (
      !PROFILE_AVATAR_MIME_TYPES
        .includes(
          file.type as
            typeof PROFILE_AVATAR_MIME_TYPES[number],
        )
    ) {
      setMessage(
        "Bitte verwende JPG, PNG oder WEBP.",
      );

      return;
    }

    if (
      file.size >
      PROFILE_LIMITS
        .avatarMaxBytes
    ) {
      setMessage(
        "Das Profilbild darf maximal 8 MB groß sein.",
      );

      return;
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    setBusy(
      true,
    );

    setMessage(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/profile/avatar/upload",
          {
            method:
              "POST",

            body:
              formData,
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () =>
              null,
          ) as
          | {
              message?:
                string;
            }
          | null;

      if (
        !response.ok
      ) {
        setMessage(
          payload?.message ??
            "Das Profilbild konnte nicht hochgeladen werden.",
        );

        return;
      }

      setMessage(
        "Profilbild aktualisiert.",
      );

      onUpdated?.();
    } catch {
      setMessage(
        "Das Profilbild konnte nicht hochgeladen werden.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  async function remove() {
    setBusy(
      true,
    );

    setMessage(
      null,
    );

    try {
      const response =
        await fetch(
          "/api/profile/avatar/delete",
          {
            method:
              "DELETE",
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () =>
              null,
          ) as
          | {
              message?:
                string;
            }
          | null;

      if (
        !response.ok
      ) {
        setMessage(
          payload?.message ??
            "Das Profilbild konnte nicht entfernt werden.",
        );

        return;
      }

      setMessage(
        "Profilbild entfernt.",
      );

      onUpdated?.();
    } catch {
      setMessage(
        "Das Profilbild konnte nicht entfernt werden.",
      );
    } finally {
      setBusy(
        false,
      );
    }
  }

  return (
    <div
      className="mt-4"
    >
      <input
        ref={
          inputRef
        }
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={
          (
            event,
          ) => {
            const file =
              event
                .target
                .files?.[0];

            if (
              file
            ) {
              void upload(
                file,
              );
            }

            event
              .currentTarget
              .value =
              "";
          }
        }
      />

      <div
        className="flex flex-wrap items-center justify-center gap-2"
      >
        <button
          type="button"
          disabled={
            busy
          }
          onClick={
            () =>
              inputRef
                .current
                ?.click()
          }
          className="inline-flex h-8 items-center justify-center rounded-lg border border-[#D9E2EC] bg-white px-3 text-[9px] font-bold text-[#33445A] outline-none transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#0878FF]"
        >
          {
            busy
              ? "Bitte warten..."
              : "Foto ändern"
          }
        </button>

        {hasAvatar ? (
          <button
            type="button"
            disabled={
              busy
            }
            onClick={
              () =>
                void remove()
            }
            className="inline-flex h-8 items-center justify-center rounded-lg px-3 text-[9px] font-bold text-[#F04444] outline-none transition hover:bg-[#FFF4F4] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#F04444]"
          >
            Entfernen
          </button>
        ) : null}
      </div>

      {message ? (
        <p
          className="mt-2 text-center text-[9px] leading-4 text-[#6D7C8F]"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
