"use client";

import {
  useEffect,
  useRef,
} from "react";

import {
  Inbox,
  Loader2,
} from "lucide-react";

import {
  MessageBubble,
} from "@/components/messages/message-bubble";

import {
  MessageComposer,
} from "@/components/messages/message-composer";

import type {
  ConversationDetailView,
} from "@/types/messages";

export interface ConversationThreadProps {
  conversation: ConversationDetailView | null;
  loading?: boolean;
  locale: string;
  timezone: string;
  sendingDisabled?: boolean;
  onSend: (body: string) => Promise<boolean>;
}

function statusLabel(
  value: string,
  closed: boolean,
): string {
  if (closed) {
    return "Geschlossen";
  }

  switch (
    value
      .trim()
      .toLowerCase()
  ) {
    case "open":
      return "Offen";

    case "in_progress":
      return "In Bearbeitung";

    case "waiting_for_user":
      return "Antwort erforderlich";

    case "resolved":
      return "Gelöst";

    case "closed":
      return "Geschlossen";

    default:
      return value ||
        "Offen";
  }
}

export function ConversationThread({
  conversation,
  loading = false,
  locale,
  timezone,
  sendingDisabled = false,
  onSend,
}: ConversationThreadProps) {
  const endRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  useEffect(
    () => {
      if (
        conversation
          ?.messages
          .length
      ) {
        endRef.current
          ?.scrollIntoView({
            block:
              "end",
          });
      }
    },
    [
      conversation
        ?.id,
      conversation
        ?.messages
        .length,
    ],
  );

  if (loading) {
    return (
      <section className="flex min-h-[520px] items-center justify-center rounded-[20px] border border-[#E5EAF2] bg-white shadow-[0_10px_28px_rgba(17,40,70,0.04)] lg:min-h-[620px]">
        <div className="text-center">
          <Loader2
            className="mx-auto h-5 w-5 animate-spin text-[#0B63F6]"
            aria-hidden="true"
          />

          <p className="mt-2 text-[8px] font-bold text-[#718096]">
            Unterhaltung wird geladen...
          </p>
        </div>
      </section>
    );
  }

  if (!conversation) {
    return (
      <section className="flex min-h-[520px] items-center justify-center rounded-[20px] border border-[#E5EAF2] bg-white p-6 text-center shadow-[0_10px_28px_rgba(17,40,70,0.04)] lg:min-h-[620px]">
        <div>
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
            <Inbox
              className="h-5 w-5"
              aria-hidden="true"
            />
          </span>

          <p className="mt-3 text-[11px] font-extrabold text-[#34445A]">
            Keine Unterhaltung ausgewählt
          </p>

          <p className="mt-1 text-[8px] font-medium text-[#8491A3]">
            Wähle eine Unterhaltung aus oder starte eine neue Nachricht.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[520px] flex-col overflow-hidden rounded-[20px] border border-[#E5EAF2] bg-white shadow-[0_10px_28px_rgba(17,40,70,0.04)] lg:min-h-[620px]">
      <header className="border-b border-[#EDF1F6] px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[12px] font-black text-[#081529]">
              {conversation.subject}
            </p>

            <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.05em] text-[#7C899B]">
              Support · {statusLabel(
                conversation.rawStatus,
                conversation.closed,
              )}
            </p>
          </div>

          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[7px] font-extrabold ${
            conversation.closed
              ? "bg-[#F3F5F8] text-[#718096]"
              : "bg-[#F1FBF6] text-[#0C8B59]"
          }`}>
            {conversation.closed
              ? "Geschlossen"
              : "Aktiv"}
          </span>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-white px-4 py-4 sm:px-5">
        {conversation.messages.length ? (
          conversation.messages.map(
            (
              message,
            ) => (
              <MessageBubble
                key={
                  message.id
                }
                message={
                  message
                }
                locale={
                  locale
                }
                timezone={
                  timezone
                }
              />
            ),
          )
        ) : (
          <div className="py-12 text-center">
            <p className="text-[8px] font-bold text-[#8491A3]">
              Noch keine Nachrichten in dieser Unterhaltung.
            </p>
          </div>
        )}

        <div
          ref={
            endRef
          }
        />
      </div>

      <MessageComposer
        disabled={
          sendingDisabled
        }
        closed={
          conversation.closed
        }
        onSend={
          onSend
        }
      />
    </section>
  );
}
