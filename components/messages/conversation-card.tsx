"use client";

import {
  ChevronRight,
  MessageSquare,
} from "lucide-react";

import type {
  ConversationSummaryView,
} from "@/types/messages";

export interface ConversationCardProps {
  conversation: ConversationSummaryView;
  active: boolean;
  locale: string;
  timezone: string;
  onSelect: (conversationId: string) => void;
}

function formatDate(
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

export function ConversationCard({
  conversation,
  active,
  locale,
  timezone,
  onSelect,
}: ConversationCardProps) {
  return (
    <button
      type="button"
      onClick={() =>
        onSelect(
          conversation.id,
        )
      }
      className={`flex w-full items-start gap-3 rounded-[14px] border p-3.5 text-left transition ${
        active
          ? "border-[#BDD2F4] bg-[#F3F7FF]"
          : "border-[#E7ECF3] bg-white hover:border-[#CDD9E8] hover:bg-[#FAFBFD]"
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
        active
          ? "bg-[#0B63F6] text-white"
          : "bg-[#EFF5FF] text-[#0B63F6]"
      }`}>
        <MessageSquare
          className="h-4 w-4"
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-[10px] font-extrabold text-[#081529]">
            {conversation.subject}
          </p>

          <span className="shrink-0 text-[7px] font-bold text-[#8A97A8]">
            {formatDate(
              conversation.lastMessageAt,
              locale,
              timezone,
            )}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-[8px] font-medium leading-3.5 text-[#748398]">
          {conversation.lastMessagePreview ??
            "Noch keine Nachricht"}
        </p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[7px] font-extrabold uppercase tracking-[0.04em] text-[#6D7C90]">
            {conversation.closed
              ? "Geschlossen"
              : conversation.rawStatus}
          </span>

          {conversation.unreadCount >
          0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#0B63F6] px-1.5 py-0.5 text-[7px] font-extrabold text-white">
              {conversation.unreadCount}
            </span>
          ) : (
            <ChevronRight
              className="h-3.5 w-3.5 text-[#A0AABA]"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </button>
  );
}
