"use client";

import {
  FileText,
} from "lucide-react";

import type {
  MessageView,
} from "@/types/messages";

export interface MessageBubbleProps {
  message: MessageView;
  locale: string;
  timezone: string;
}

function formatTime(
  value: string,
  locale: string,
  timezone: string,
): string {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      locale || "de",
      {
        day:
          "2-digit",
        month:
          "short",
        hour:
          "2-digit",
        minute:
          "2-digit",
        hour12:
          false,
        timeZone:
          timezone,
      },
    ).format(
      date,
    );
  } catch {
    return "—";
  }
}

export function MessageBubble({
  message,
  locale,
  timezone,
}: MessageBubbleProps) {
  if (
    message.senderType ===
    "system"
  ) {
    return (
      <div className="my-3 text-center">
        <span className="inline-flex max-w-[90%] rounded-full bg-[#F4F6F9] px-3 py-1.5 text-[7px] font-semibold text-[#78879A]">
          {message.body ??
            "Systemnachricht"}
        </span>
      </div>
    );
  }

  const own =
    message.isOwn;

  return (
    <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[88%] sm:max-w-[76%] ${own ? "text-right" : "text-left"}`}>
        <p className="mb-1 px-1 text-[7px] font-extrabold text-[#8190A3]">
          {own
            ? "Du"
            : message.senderType ===
                "support"
              ? "Support"
              : "Nachricht"}
        </p>

        <div className={`rounded-[16px] px-3.5 py-3 ${
          own
            ? "rounded-br-[5px] bg-[#0B63F6] text-white"
            : "rounded-bl-[5px] border border-[#E5EAF2] bg-[#F8FAFD] text-[#223248]"
        }`}>
          {message.body ? (
            <p className="whitespace-pre-line break-words text-[9px] font-medium leading-[1.55]">
              {message.body}
            </p>
          ) : null}

          {message.attachment ? (
            <a
              href={`/api/documents/${encodeURIComponent(message.attachment.documentId)}`}
              target="_blank"
              rel="noreferrer"
              className={`mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5 text-left ${
                own
                  ? "bg-white/12 text-white"
                  : "border border-[#E1E7EF] bg-white text-[#34445A]"
              }`}
            >
              <FileText
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />

              <span className="min-w-0">
                <span className="block truncate text-[8px] font-extrabold">
                  {message.attachment.title}
                </span>

                <span className={`mt-0.5 block truncate text-[7px] ${
                  own
                    ? "text-white/70"
                    : "text-[#8390A2]"
                }`}>
                  {message.attachment.originalFilename}
                </span>
              </span>
            </a>
          ) : null}
        </div>

        <p className="mt-1 px-1 text-[7px] font-medium text-[#98A4B3]">
          {formatTime(
            message.createdAt,
            locale,
            timezone,
          )}
        </p>
      </div>
    </div>
  );
}
