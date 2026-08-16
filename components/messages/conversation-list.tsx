"use client";

import {
  Inbox,
  Plus,
} from "lucide-react";

import {
  ConversationCard,
} from "@/components/messages/conversation-card";

import type {
  ConversationSummaryView,
} from "@/types/messages";

export interface ConversationListProps {
  conversations: readonly ConversationSummaryView[];
  selectedConversationId: string | null;
  locale: string;
  timezone: string;
  onSelect: (conversationId: string) => void;
  onNew: () => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  locale,
  timezone,
  onSelect,
  onNew,
}: ConversationListProps) {
  return (
    <aside className="rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] lg:min-h-[620px]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
            Postfach
          </p>

          <h2 className="mt-1 text-[14px] font-black text-[#081529]">
            Unterhaltungen
          </h2>
        </div>

        <button
          type="button"
          onClick={
            onNew
          }
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0B63F6] text-white transition hover:bg-[#0958DC]"
          aria-label="Neue Nachricht"
          title="Neue Nachricht"
        >
          <Plus
            className="h-4 w-4"
            aria-hidden="true"
          />
        </button>
      </div>

      {conversations.length ? (
        <div className="mt-4 space-y-2.5">
          {conversations.map(
            (
              conversation,
            ) => (
              <ConversationCard
                key={
                  conversation.id
                }
                conversation={
                  conversation
                }
                active={
                  conversation.id ===
                  selectedConversationId
                }
                locale={
                  locale
                }
                timezone={
                  timezone
                }
                onSelect={
                  onSelect
                }
              />
            ),
          )}
        </div>
      ) : (
        <div className="mt-5 rounded-[15px] border border-dashed border-[#D7E0EB] bg-[#F8FAFD] px-4 py-8 text-center">
          <Inbox
            className="mx-auto h-5 w-5 text-[#8491A3]"
            aria-hidden="true"
          />

          <p className="mt-2 text-[9px] font-extrabold text-[#53647A]">
            Noch keine Nachrichten
          </p>

          <p className="mt-1 text-[8px] font-medium leading-4 text-[#8A97A8]">
            Starte eine neue Unterhaltung mit unserem Support.
          </p>
        </div>
      )}
    </aside>
  );
}
