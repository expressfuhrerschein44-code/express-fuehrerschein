import "server-only";

import {
  createClientMessage,
  createConversationWithFirstMessage,
  findConversationDetailForUser,
  getMessagesRepositorySnapshot,
  markConversationSupportMessagesRead,
} from "@/lib/server/messages/messages-repository";

import type {
  ConversationDetailRepositoryRecord,
  ConversationSummaryRepositoryRecord,
  MessageRepositoryRecord,
} from "@/lib/server/messages/messages-repository";

import type {
  ClientShellLocale,
} from "@/types/client-shell";

import type {
  ConversationDetailView,
  ConversationStatusView,
  ConversationSummaryView,
  CreateConversationInput,
  MessageSenderView,
  MessageView,
  MessagesPageData,
  SendMessageInput,
} from "@/types/messages";

const ALLOWED_CONVERSATION_TYPES =
  new Set([
    "general",
    "application",
    "praxis",
    "documents",
    "payment",
    "technical",
    "other",
  ]);

export class MessagesServiceError
  extends Error {
  readonly code:
    string;

  readonly status:
    number;

  constructor(
    code:
      string,
    message:
      string,
    status =
      400,
  ) {
    super(
      message,
    );

    this.name =
      "MessagesServiceError";

    this.code =
      code;

    this.status =
      status;
  }
}

function cleanText(
  value:
    string,
  maxLength:
    number,
): string {
  return value
    .replace(
      /\r\n/g,
      "\n",
    )
    .trim()
    .slice(
      0,
      maxLength,
    );
}

function normalizeConversationType(
  value:
    string,
): string {
  const normalized =
    value
      .trim()
      .toLowerCase();

  return ALLOWED_CONVERSATION_TYPES.has(
    normalized,
  )
    ? normalized
    : "other";
}

function normalizeStatus(
  value:
    string,
): ConversationStatusView {
  switch (
    value
      .trim()
      .toLowerCase()
  ) {
    case "open":
      return "open";

    case "in_progress":
      return "in_progress";

    case "waiting_for_user":
      return "waiting_for_user";

    case "resolved":
      return "resolved";

    case "closed":
      return "closed";

    default:
      return "other";
  }
}

function normalizeSenderType(
  value:
    string,
): MessageSenderView {
  switch (
    value
      .trim()
      .toLowerCase()
  ) {
    case "client":
      return "client";

    case "support":
    case "admin":
      return "support";

    case "system":
      return "system";

    default:
      return "other";
  }
}

function isClosed(
  input: {
    status: string;
    closedAt: Date | null;
  },
): boolean {
  return Boolean(
    input.closedAt,
  ) ||
    input.status
      .trim()
      .toLowerCase() ===
      "closed";
}

function messagePreview(
  message:
    MessageRepositoryRecord | null,
): string | null {
  if (!message) {
    return null;
  }

  const body =
    message.body
      ?.replace(
        /\s+/g,
        " ",
      )
      .trim();

  if (body) {
    return body.length >
      90
      ? `${body.slice(0, 87)}...`
      : body;
  }

  if (
    message.attachment
  ) {
    return "Dokument";
  }

  return null;
}

function mapMessage(
  input: {
    userId: string;
    message: MessageRepositoryRecord;
  },
): MessageView {
  const senderType =
    normalizeSenderType(
      input.message
        .senderType,
    );

  const attachment =
    input.message
      .attachment &&
    input.message
      .attachment
      .userId ===
      input.userId &&
    !input.message
      .attachment
      .deletedAt
      ? {
          documentId:
            input.message
              .attachment
              .id,
          title:
            input.message
              .attachment
              .title
              ?.trim() ||
            input.message
              .attachment
              .originalFilename,
          originalFilename:
            input.message
              .attachment
              .originalFilename,
          mimeType:
            input.message
              .attachment
              .mimeType,
        }
      : null;

  return {
    id:
      input.message.id,
    senderType,
    rawSenderType:
      input.message
        .senderType,
    body:
      input.message.body,
    attachment,
    readAt:
      input.message
        .readAt
        ?.toISOString() ??
      null,
    createdAt:
      input.message
        .createdAt
        .toISOString(),
    isOwn:
      senderType ===
        "client" &&
      input.message
        .senderUserId ===
        input.userId,
  };
}

function mapSummary(
  conversation:
    ConversationSummaryRepositoryRecord,
): ConversationSummaryView {
  const lastMessageAt =
    conversation.lastMessageAt ??
    conversation.lastMessage
      ?.createdAt ??
    conversation.updatedAt ??
    conversation.createdAt;

  return {
    id:
      conversation.id,
    conversationType:
      conversation.conversationType,
    subject:
      conversation.subject
        ?.trim() ||
      "Nachricht",
    status:
      normalizeStatus(
        conversation.status,
      ),
    rawStatus:
      conversation.status,
    lastMessageAt:
      lastMessageAt.toISOString(),
    lastMessagePreview:
      messagePreview(
        conversation.lastMessage,
      ),
    unreadCount:
      Math.max(
        0,
        conversation.unreadCount,
      ),
    closed:
      isClosed({
        status:
          conversation.status,
        closedAt:
          conversation.closedAt,
      }),
  };
}

function mapDetail(
  input: {
    userId: string;
    conversation: ConversationDetailRepositoryRecord;
  },
): ConversationDetailView {
  const lastMessage =
    input.conversation
      .messages[
        input.conversation
          .messages
          .length -
        1
      ];

  const lastMessageAt =
    input.conversation
      .lastMessageAt ??
    lastMessage
      ?.createdAt ??
    input.conversation
      .updatedAt ??
    input.conversation
      .createdAt;

  return {
    id:
      input.conversation.id,
    conversationType:
      input.conversation
        .conversationType,
    subject:
      input.conversation
        .subject
        ?.trim() ||
      "Nachricht",
    status:
      normalizeStatus(
        input.conversation
          .status,
      ),
    rawStatus:
      input.conversation
        .status,
    closed:
      isClosed({
        status:
          input.conversation
            .status,
        closedAt:
          input.conversation
            .closedAt,
      }),
    createdAt:
      input.conversation
        .createdAt
        .toISOString(),
    lastMessageAt:
      lastMessageAt
        .toISOString(),
    messages:
      input.conversation
        .messages
        .map(
          (
            message,
          ) =>
            mapMessage({
              userId:
                input.userId,
              message,
            }),
        ),
  };
}

export async function getMessagesPageData(
  input: {
    userId: string;
    locale: ClientShellLocale;
    selectedConversationId?: string | null;
  },
): Promise<MessagesPageData> {
  const snapshot =
    await getMessagesRepositorySnapshot({
      userId:
        input.userId,
      selectedConversationId:
        input.selectedConversationId,
    });

  return {
    status:
      snapshot
        .activeLicenseClassCode
        ? "ready"
        : "no_active_license_class",

    licenseClassCode:
      snapshot
        .activeLicenseClassCode,

    locale:
      input.locale,

    timezone:
      snapshot.timezone,

    conversations:
      snapshot.conversations.map(
        mapSummary,
      ),

    selectedConversation:
      snapshot.selectedConversation
        ? mapDetail({
            userId:
              input.userId,
            conversation:
              snapshot.selectedConversation,
          })
        : null,
  };
}

export async function getConversationDetail(
  input: {
    userId: string;
    conversationId: string;
  },
): Promise<ConversationDetailView | null> {
  const conversation =
    await findConversationDetailForUser({
      userId:
        input.userId,
      conversationId:
        input.conversationId,
    });

  if (!conversation) {
    return null;
  }

  return mapDetail({
    userId:
      input.userId,
    conversation,
  });
}

export async function createConversation(
  input: {
    userId: string;
    data: CreateConversationInput;
  },
): Promise<{
  conversationId: string;
}> {
  const conversationType =
    normalizeConversationType(
      input.data
        .conversationType,
    );

  const subject =
    cleanText(
      input.data.subject,
      200,
    );

  const body =
    cleanText(
      input.data.body,
      5000,
    );

  if (!subject) {
    throw new MessagesServiceError(
      "SUBJECT_REQUIRED",
      "Bitte gib einen Betreff ein.",
      400,
    );
  }

  if (!body) {
    throw new MessagesServiceError(
      "MESSAGE_REQUIRED",
      "Bitte schreibe eine Nachricht.",
      400,
    );
  }

  const conversationId =
    await createConversationWithFirstMessage({
      userId:
        input.userId,
      conversationType,
      subject,
      body,
    });

  return {
    conversationId,
  };
}

export async function sendMessage(
  input: {
    userId: string;
    data: SendMessageInput;
  },
): Promise<{
  messageId: string;
}> {
  const conversationId =
    input.data
      .conversationId
      .trim();

  const body =
    cleanText(
      input.data.body,
      5000,
    );

  if (!conversationId) {
    throw new MessagesServiceError(
      "CONVERSATION_ID_REQUIRED",
      "conversationId fehlt.",
      400,
    );
  }

  if (!body) {
    throw new MessagesServiceError(
      "MESSAGE_REQUIRED",
      "Bitte schreibe eine Nachricht.",
      400,
    );
  }

  const messageId =
    await createClientMessage({
      userId:
        input.userId,
      conversationId,
      body,
    });

  if (!messageId) {
    throw new MessagesServiceError(
      "CONVERSATION_NOT_AVAILABLE",
      "Die Unterhaltung wurde nicht gefunden oder ist bereits geschlossen.",
      409,
    );
  }

  return {
    messageId,
  };
}

export async function markConversationAsRead(
  input: {
    userId: string;
    conversationId: string;
  },
): Promise<void> {
  const conversationId =
    input.conversationId
      .trim();

  if (!conversationId) {
    throw new MessagesServiceError(
      "CONVERSATION_ID_REQUIRED",
      "conversationId fehlt.",
      400,
    );
  }

  const updated =
    await markConversationSupportMessagesRead({
      userId:
        input.userId,
      conversationId,
    });

  if (!updated) {
    throw new MessagesServiceError(
      "CONVERSATION_NOT_FOUND",
      "Die Unterhaltung wurde nicht gefunden.",
      404,
    );
  }
}
