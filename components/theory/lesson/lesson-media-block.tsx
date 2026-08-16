/* eslint-disable @next/next/no-img-element */
"use client";

import {
  FileImage,
  Film,
} from "lucide-react";

export type LessonMediaType = "IMAGE" | "VIDEO";

export interface LessonMediaBlockProps {
  blockId: string;
  type: LessonMediaType;
  title?: string | null;
  text?: string | null;
  mediaStoragePath?: string | null;
  mediaAlt?: string | null;
}

function sourceFor(
  blockId: string,
  mediaStoragePath?: string | null,
): string | null {
  const value = mediaStoragePath?.trim();
  if (!value) return null;

  if (
    value.startsWith("https://")
    || value.startsWith("http://")
    || value.startsWith("/")
  ) {
    return value;
  }

  return `/api/theory/media?blockId=${encodeURIComponent(blockId)}`;
}

export function LessonMediaBlock({
  blockId,
  type,
  title = null,
  text = null,
  mediaStoragePath = null,
  mediaAlt = null,
}: LessonMediaBlockProps) {
  const src = sourceFor(blockId, mediaStoragePath);

  if (!src) {
    const Icon = type === "VIDEO" ? Film : FileImage;

    return (
      <section className="rounded-[16px] border border-dashed border-[#CBD6E4] bg-[#F8FAFD] p-6 text-center">
        <Icon className="mx-auto h-5 w-5 text-[#8190A3]" aria-hidden="true" />
        <p className="mt-2 text-[10px] font-extrabold text-[#53647A]">
          Medium nicht verfügbar
        </p>
        <p className="mt-1 text-[9px] leading-4 text-[#7A899C]">
          Für diesen Lernblock ist aktuell keine Medienquelle hinterlegt.
        </p>
      </section>
    );
  }

  if (type === "VIDEO") {
    return (
      <figure className="overflow-hidden rounded-[16px] border border-[#E5EAF2] bg-white shadow-[0_8px_24px_rgba(17,40,70,0.03)]">
        <video
          controls
          preload="metadata"
          playsInline
          className="aspect-video w-full bg-black object-contain"
          aria-label={mediaAlt ?? title ?? "Theorie-Video"}
        >
          <source src={src} />
          Dein Browser unterstützt dieses Video nicht.
        </video>

        {title || text ? (
          <figcaption className="border-t border-[#EEF2F7] px-4 py-3">
            {title ? (
              <p className="text-[10px] font-extrabold text-[#081529]">
                {title}
              </p>
            ) : null}
            {text ? (
              <p className="mt-1 whitespace-pre-line text-[10px] leading-5 text-[#66758A]">
                {text}
              </p>
            ) : null}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <figure className="overflow-hidden rounded-[16px] border border-[#E5EAF2] bg-white shadow-[0_8px_24px_rgba(17,40,70,0.03)]">
      <img
        src={src}
        alt={mediaAlt ?? title ?? "Theorie-Illustration"}
        loading="lazy"
        className="h-auto max-h-[640px] w-full object-contain"
      />

      {title || text ? (
        <figcaption className="border-t border-[#EEF2F7] px-4 py-3">
          {title ? (
            <p className="text-[10px] font-extrabold text-[#081529]">
              {title}
            </p>
          ) : null}
          {text ? (
            <p className="mt-1 whitespace-pre-line text-[10px] leading-5 text-[#66758A]">
              {text}
            </p>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
