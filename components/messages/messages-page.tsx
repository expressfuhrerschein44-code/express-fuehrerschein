"use client";

import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Send,
  X,
} from "lucide-react";

import {
  ConversationList,
} from "@/components/messages/conversation-list";

import {
  ConversationThread,
} from "@/components/messages/conversation-thread";

import {
  MessagesHeader,
} from "@/components/messages/messages-header";

import type {
  ConversationDetailView,
  ConversationSummaryView,
  MessagesPageData,
} from "@/types/messages";

export interface MessagesPageProps {
  data: MessagesPageData;
}

interface ApiSuccess<T> {
  ok: true;
  data: T;
}

interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
  };
}

type ApiResponse<T> =
  | ApiSuccess<T>
  | ApiError;

interface CreateConversationResponse {
  conversationId: string;
}

interface SendMessageResponse {
  messageId: string;
}

const conversationTypes = [
  {
    value:
      "general",
    label:
      "Allgemeine Frage",
  },
  {
    value:
      "application",
    label:
      "Führerscheinantrag",
  },
  {
    value:
      "praxis",
    label:
      "Praxis / Fahrstunde",
  },
  {
    value:
      "documents",
    label:
      "Dokumente",
  },
  {
    value:
      "payment",
    label:
      "Zahlung",
  },
  {
    value:
      "technical",
    label:
      "Technische Hilfe",
  },
  {
    value:
      "other",
    label:
      "Sonstige Anfrage",
  },
] as const;

export function MessagesPage({
  data,
}: MessagesPageProps) {
  const [
    conversations,
    setConversations,
  ] =
    useState<
      ConversationSummaryView[]
    >(
      data.conversations,
    );

  const [
    selected,
    setSelected,
  ] =
    useState<
      ConversationDetailView | null
    >(
      data.selectedConversation,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  const [
    sending,
    setSending,
  ] =
    useState(
      false,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );

  const [
    newOpen,
    setNewOpen,
  ] =
    useState(
      data.conversations.length ===
        0,
    );

  const [
    newType,
    setNewType,
  ] =
    useState(
      "general",
    );

  const [
    newSubject,
    setNewSubject,
  ] =
    useState(
      "",
    );

  const [
    newBody,
    setNewBody,
  ] =
    useState(
      "",
    );

  const [
    creating,
    setCreating,
  ] =
    useState(
      false,
    );

  async function apiPost<T>(
    body:
      Record<
        string,
        unknown
      >,
  ): Promise<T> {
    const response =
      await fetch(
        "/api/messages",
        {
          method:
            "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify(
              body,
            ),
        },
      );

    const payload =
      await response
        .json()
        .catch(
          () => null,
        ) as
        | ApiResponse<T>
        | null;

    if (
      !response.ok ||
      !payload ||
      !payload.ok
    ) {
      throw new Error(
        payload &&
        !payload.ok
          ? payload.error
              .message
          : "Die Aktion konnte nicht durchgeführt werden.",
      );
    }

    return payload.data;
  }

  async function loadConversation(
    conversationId:
      string,
  ) {
    if (
      loading &&
      selected?.id ===
        conversationId
    ) {
      return;
    }

    setLoading(
      true,
    );

    setError(
      null,
    );

    setNewOpen(
      false,
    );

    try {
      const response =
        await fetch(
          `/api/messages?conversationId=${encodeURIComponent(conversationId)}`,
          {
            method:
              "GET",
            cache:
              "no-store",
          },
        );

      const payload =
        await response
          .json()
          .catch(
            () => null,
          ) as
          | ApiResponse<ConversationDetailView>
          | null;

      if (
        !response.ok ||
        !payload ||
        !payload.ok
      ) {
        throw new Error(
          payload &&
          !payload.ok
            ? payload.error
                .message
            : "Die Unterhaltung konnte nicht geladen werden.",
        );
      }

      setSelected(
        payload.data,
      );

      setConversations(
        (
          current,
        ) =>
          current.map(
            (
              conversation,
            ) =>
              conversation.id ===
              conversationId
                ? {
                    ...conversation,
                    unreadCount:
                      0,
                  }
                : conversation,
          ),
      );

      void apiPost<{
        read: boolean;
      }>({
        action:
          "mark_read",
        conversationId,
      }).catch(
        () => {
          // Der Inhalt bleibt nutzbar, auch wenn das Lesestatus-Update fehlschlägt.
        },
      );
    } catch (
      exception
    ) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Die Unterhaltung konnte nicht geladen werden.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }

  async function refreshSelected(
    conversationId:
      string,
  ) {
    const response =
      await fetch(
        `/api/messages?conversationId=${encodeURIComponent(conversationId)}`,
        {
          method:
            "GET",
          cache:
            "no-store",
        },
      );

    const payload =
      await response
        .json()
        .catch(
          () => null,
        ) as
        | ApiResponse<ConversationDetailView>
        | null;

    if (
      response.ok &&
      payload &&
      payload.ok
    ) {
      setSelected(
        payload.data,
      );
    }
  }

  async function sendCurrentMessage(
    body:
      string,
  ): Promise<boolean> {
    if (
      !selected ||
      sending
    ) {
      return false;
    }

    setSending(
      true,
    );

    setError(
      null,
    );

    try {
      await apiPost<SendMessageResponse>({
        action:
          "send",
        conversationId:
          selected.id,
        body,
      });

      await refreshSelected(
        selected.id,
      );

      setConversations(
        (
          current,
        ) => {
          const now =
            new Date()
              .toISOString();

          const updated =
            current.map(
              (
                conversation,
              ) =>
                conversation.id ===
                selected.id
                  ? {
                      ...conversation,
                      lastMessageAt:
                        now,
                      lastMessagePreview:
                        body.length >
                        90
                          ? `${body.slice(0, 87)}...`
                          : body,
                    }
                  : conversation,
            );

          return [
            ...updated,
          ].sort(
            (
              left,
              right,
            ) =>
              new Date(
                right.lastMessageAt,
              ).getTime() -
              new Date(
                left.lastMessageAt,
              ).getTime(),
          );
        },
      );

      return true;
    } catch (
      exception
    ) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Die Nachricht konnte nicht gesendet werden.",
      );

      return false;
    } finally {
      setSending(
        false,
      );
    }
  }

  async function createNewConversation(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      creating
    ) {
      return;
    }

    setCreating(
      true,
    );

    setError(
      null,
    );

    try {
      const created =
        await apiPost<CreateConversationResponse>({
          action:
            "create_conversation",
          conversationType:
            newType,
          subject:
            newSubject,
          body:
            newBody,
        });

      const now =
        new Date()
          .toISOString();

      const summary:
        ConversationSummaryView =
        {
          id:
            created.conversationId,
          conversationType:
            newType,
          subject:
            newSubject.trim(),
          status:
            "open",
          rawStatus:
            "open",
          lastMessageAt:
            now,
          lastMessagePreview:
            newBody.trim().length >
            90
              ? `${newBody.trim().slice(0, 87)}...`
              : newBody.trim(),
          unreadCount:
            0,
          closed:
            false,
        };

      setConversations(
        (
          current,
        ) => [
          summary,
          ...current,
        ],
      );

      setNewSubject(
        "",
      );

      setNewBody(
        "",
      );

      setNewType(
        "general",
      );

      setNewOpen(
        false,
      );

      await loadConversation(
        created.conversationId,
      );
    } catch (
      exception
    ) {
      setError(
        exception instanceof Error
          ? exception.message
          : "Die Unterhaltung konnte nicht erstellt werden.",
      );
    } finally {
      setCreating(
        false,
      );
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <MessagesHeader
        status={
          data.status
        }
        licenseClassCode={
          data.licenseClassCode
        }
      />

      {data.status ===
      "no_active_license_class" ? (
        <div
          role="status"
          className="mt-4 flex items-start gap-2.5 rounded-[14px] border border-[#F1D6A6] bg-[#FFF9EE] px-4 py-3"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0 text-[#B7791F]"
            aria-hidden="true"
          />

          <p className="text-[9px] font-bold leading-4 text-[#8A6117]">
            Aktuell ist keine aktive Führerscheinklasse hinterlegt. Die Support-Messaging-Funktion bleibt trotzdem verfügbar.
          </p>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-[14px] border border-[#F1CACA] bg-[#FFF7F7] px-4 py-3 text-[9px] font-bold leading-4 text-[#A53030]"
        >
          {error}
        </div>
      ) : null}

      {newOpen ? (
        <section className="mt-4 rounded-[20px] border border-[#E5EAF2] bg-white p-4 shadow-[0_10px_28px_rgba(17,40,70,0.04)] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
                Neue Unterhaltung
              </p>

              <h2 className="mt-1 text-[16px] font-black text-[#081529]">
                Nachricht an den Support
              </h2>
            </div>

            {conversations.length ? (
              <button
                type="button"
                onClick={() =>
                  setNewOpen(
                    false,
                  )
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E1E7EF] text-[#718096]"
                aria-label="Schließen"
              >
                <X
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
              </button>
            ) : null}
          </div>

          <form
            onSubmit={
              createNewConversation
            }
            className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <label className="block">
              <span className="mb-1.5 block text-[8px] font-extrabold text-[#53647A]">
                Kategorie
              </span>

              <select
                value={
                  newType
                }
                disabled={
                  creating
                }
                onChange={(
                  event,
                ) =>
                  setNewType(
                    event.target.value,
                  )
                }
                className="min-h-10 w-full rounded-xl border border-[#DCE4EF] bg-white px-3 text-[9px] font-semibold text-[#223248] outline-none focus:border-[#0B63F6]"
              >
                {conversationTypes.map(
                  (
                    item,
                  ) => (
                    <option
                      key={
                        item.value
                      }
                      value={
                        item.value
                      }
                    >
                      {item.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[8px] font-extrabold text-[#53647A]">
                Betreff
              </span>

              <input
                type="text"
                value={
                  newSubject
                }
                disabled={
                  creating
                }
                maxLength={200}
                onChange={(
                  event,
                ) =>
                  setNewSubject(
                    event.target.value,
                  )
                }
                placeholder="z. B. Frage zu meinem Führerschein"
                className="min-h-10 w-full rounded-xl border border-[#DCE4EF] bg-white px-3 text-[9px] font-semibold text-[#223248] outline-none focus:border-[#0B63F6]"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[8px] font-extrabold text-[#53647A]">
                Nachricht
              </span>

              <textarea
                value={
                  newBody
                }
                disabled={
                  creating
                }
                rows={4}
                maxLength={5000}
                onChange={(
                  event,
                ) =>
                  setNewBody(
                    event.target.value,
                  )
                }
                placeholder="Guten Tag, ich habe eine Frage..."
                className="w-full resize-y rounded-xl border border-[#DCE4EF] bg-white px-3 py-2.5 text-[9px] font-medium leading-4 text-[#223248] outline-none focus:border-[#0B63F6]"
              />
            </label>

            <div className="sm:col-span-2 sm:text-right">
              <button
                type="submit"
                disabled={
                  creating ||
                  !newSubject.trim() ||
                  !newBody.trim()
                }
                className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#0B63F6] px-5 text-[9px] font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto"
              >
                {creating ? (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Send
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                )}

                {creating
                  ? "Wird gesendet..."
                  : "Nachricht senden"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className={`${selected ? "hidden lg:block" : "block"}`}>
          <ConversationList
            conversations={
              conversations
            }
            selectedConversationId={
              selected?.id ??
              null
            }
            locale={
              data.locale
            }
            timezone={
              data.timezone
            }
            onSelect={
              loadConversation
            }
            onNew={() =>
              setNewOpen(
                true,
              )
            }
          />
        </div>

        <div className={`${!selected && !loading ? "hidden lg:block" : "block"}`}>
          {selected ? (
            <button
              type="button"
              onClick={() =>
                setSelected(
                  null,
                )
              }
              className="mb-2 inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-[#DCE4EF] bg-white px-3 text-[8px] font-extrabold text-[#53647A] lg:hidden"
            >
              <ArrowLeft
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              Unterhaltungen
            </button>
          ) : null}

          <ConversationThread
            conversation={
              selected
            }
            loading={
              loading
            }
            locale={
              data.locale
            }
            timezone={
              data.timezone
            }
            sendingDisabled={
              sending
            }
            onSend={
              sendCurrentMessage
            }
          />
        </div>
      </div>
    </main>
  );
}
