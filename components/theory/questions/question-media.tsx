"use client";

import { useMemo, useState } from "react";
import { ImageOff, PlayCircle } from "lucide-react";

export type QuestionMediaKind = "image" | "video";

export interface QuestionMediaProps {
  mediaUrl?: string | null;
  mediaAlt?: string | null;
  mediaKind?: QuestionMediaKind;
  questionType?: string | null;
  className?: string;
}

function inferMediaKind(
  mediaUrl: string,
  questionType?: string | null,
): QuestionMediaKind {
  if (questionType?.trim().toUpperCase() === "VIDEO") {
    return "video";
  }

  const cleanUrl = mediaUrl.split("?")[0]?.toLowerCase() ?? "";
  if (/\.(mp4|webm|ogg|mov|m4v)$/.test(cleanUrl)) {
    return "video";
  }

  return "image";
}

export function QuestionMedia({
  mediaUrl,
  mediaAlt = "Abbildung zur Theoriefrage",
  mediaKind,
  questionType,
  className = "",
}: QuestionMediaProps) {
  const [failed, setFailed] = useState(false);

  const kind = useMemo(() => {
    if (!mediaUrl) return "image" as const;
    return mediaKind ?? inferMediaKind(mediaUrl, questionType);
  }, [mediaKind, mediaUrl, questionType]);

  if (!mediaUrl) {
    return null;
  }

  if (failed) {
    return (
      <div
        role="status"
        className={`flex min-h-[180px] w-full items-center justify-center rounded-2xl border border-dashed border-[#D8E0EB] bg-[#F7F9FC] p-6 text-center ${className}`}
      >
        <div className="max-w-sm">
          <ImageOff className="mx-auto h-6 w-6 text-[#8795A8]" aria-hidden="true" />
          <p className="mt-2 text-[11px] font-bold text-[#53647A]">
            Medium konnte nicht geladen werden.
          </p>
          <p className="mt-1 text-[10px] leading-4 text-[#7A899D]">
            Du kannst die Frage trotzdem beantworten oder das Problem melden.
          </p>
        </div>
      </div>
    );
  }

  if (kind === "video") {
    return (
      <figure className={`overflow-hidden rounded-2xl border border-[#E3E8F0] bg-[#061427] ${className}`}>
        <div className="relative aspect-video w-full bg-black">
          <video
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
            aria-label={mediaAlt || "Video zur Theoriefrage"}
          >
            <source src={mediaUrl} />
            Dein Browser unterstützt dieses Video nicht.
          </video>
        </div>
        <figcaption className="flex items-center gap-2 border-t border-white/10 px-3 py-2 text-[9px] font-semibold text-white/75">
          <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
          Video zur Frage
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className={`overflow-hidden rounded-2xl border border-[#E3E8F0] bg-[#F7F9FC] ${className}`}>
      {/* Native img avoids requiring extra Next.js remotePatterns for signed/private media URLs. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaUrl}
        alt={mediaAlt || "Abbildung zur Theoriefrage"}
        loading="eager"
        decoding="async"
        className="max-h-[520px] w-full object-contain"
        onError={() => setFailed(true)}
      />
    </figure>
  );
}
