import "server-only";

import {
  prisma,
} from "@/lib/server/prisma";

export interface MessageAttachmentRepositoryRecord {
  id: string;
  userId: string;
  title: string | null;
  originalFilename: string;
  mimeType: string;
  deletedAt: Date | null;
}

export interface MessageRepositoryRecord {
  id: string;
  senderType: string;
  senderUserId: string | null;
  body: string | null;
  readAt: Date | null;
  createdAt: Date;
  attachment: MessageAttachmentRepositoryRecord | null;
}

export interface ConversationSummaryRepositoryRecord {
  id: string;
  conversationType: string;
  subject: string | null;
  status: string;
  closedAt: Date | null;
  createdAt: Date;
  lastMessageAt: Date | null;
  updatedAt: Date;
  unreadCount: number;
  lastMessage: MessageRepositoryRecord | null;
}

export interface ConversationDetailRepositoryRecord {
  id: string;
  userId: string;
  conversationType: string;
  subject: string | null;
  status: string;
  closedAt: Date | null;
  createdAt: Date;
  lastMessageAt: Date | null;
  updatedAt: Date;
  messages: MessageRepositoryRecord[];
}

export interface MessagesRepositorySnapshot {
  activeLicenseClassCode: string | null;
  timezone: string;
  conversations: ConversationSummaryRepositoryRecord[];
  selectedConversation: ConversationDetailRepositoryRecord | null;
}

function mapMessage(
  input: {
    id: string;
    sender_type: string;
    sender_user_id: string | null;
    body: string | null;
    read_at: Date | null;
    created_at: Date;
    user_documents: {
      id: string;
      user_id: string;
      title: string | null;
      original_filename: string;
      mime_type: string;
      deleted_at: Date | null;
    } | null;
  },
): MessageRepositoryRecord {
  return {
    id:
      input.id,
    senderType:
      input.sender_type,
    senderUserId:
      input.sender_user_id,
    body:
      input.body,
    readAt:
      input.read_at,
    createdAt:
      input.created_at,
    attachment:
      input.user_documents
        ? {
            id:
              input.user_documents.id,
            userId:
              input.user_documents.user_id,
            title:
              input.user_documents.title,
            originalFilename:
              input.user_documents.original_filename,
            mimeType:
              input.user_documents.mime_type,
            deletedAt:
              input.user_documents.deleted_at,
          }
        : null,
  };
}

export async function listConversationSummariesForUser(
  userId: string,
): Promise<ConversationSummaryRepositoryRecord[]> {
  const conversations =
    await prisma.conversations.findMany({
      where: {
        user_id:
          userId,
      },

      select: {
        id:
          true,
        conversation_type:
          true,
        subject:
          true,
        status:
          true,
        closed_at:
          true,
        created_at:
          true,
        last_message_at:
          true,
        updated_at:
          true,

        messages: {
          orderBy: {
            created_at:
              "desc",
          },
          take:
            1,
          select: {
            id:
              true,
            sender_type:
              true,
            sender_user_id:
              true,
            body:
              true,
            read_at:
              true,
            created_at:
              true,
            user_documents: {
              select: {
                id:
                  true,
                user_id:
                  true,
                title:
                  true,
                original_filename:
                  true,
                mime_type:
                  true,
                deleted_at:
                  true,
              },
            },
          },
        },

        _count: {
          select: {
            messages: {
              where: {
                read_at:
                  null,
                NOT: {
                  sender_type:
                    "client",
                },
              },
            },
          },
        },
      },

      orderBy: [
        {
          last_message_at:
            "desc",
        },
        {
          updated_at:
            "desc",
        },
        {
          created_at:
            "desc",
        },
      ],
    });

  return conversations.map(
    (
      conversation,
    ) => ({
      id:
        conversation.id,
      conversationType:
        conversation.conversation_type,
      subject:
        conversation.subject,
      status:
        conversation.status,
      closedAt:
        conversation.closed_at,
      createdAt:
        conversation.created_at,
      lastMessageAt:
        conversation.last_message_at,
      updatedAt:
        conversation.updated_at,
      unreadCount:
        conversation._count.messages,
      lastMessage:
        conversation.messages[0]
          ? mapMessage(
              conversation.messages[0],
            )
          : null,
    }),
  );
}

export async function findConversationDetailForUser(
  input: {
    userId: string;
    conversationId: string;
  },
): Promise<ConversationDetailRepositoryRecord | null> {
  const conversation =
    await prisma.conversations.findFirst({
      where: {
        id:
          input.conversationId,
        user_id:
          input.userId,
      },

      select: {
        id:
          true,
        user_id:
          true,
        conversation_type:
          true,
        subject:
          true,
        status:
          true,
        closed_at:
          true,
        created_at:
          true,
        last_message_at:
          true,
        updated_at:
          true,

        messages: {
          orderBy: {
            created_at:
              "asc",
          },

          select: {
            id:
              true,
            sender_type:
              true,
            sender_user_id:
              true,
            body:
              true,
            read_at:
              true,
            created_at:
              true,

            user_documents: {
              select: {
                id:
                  true,
                user_id:
                  true,
                title:
                  true,
                original_filename:
                  true,
                mime_type:
                  true,
                deleted_at:
                  true,
              },
            },
          },
        },
      },
    });

  if (!conversation) {
    return null;
  }

  return {
    id:
      conversation.id,
    userId:
      conversation.user_id,
    conversationType:
      conversation.conversation_type,
    subject:
      conversation.subject,
    status:
      conversation.status,
    closedAt:
      conversation.closed_at,
    createdAt:
      conversation.created_at,
    lastMessageAt:
      conversation.last_message_at,
    updatedAt:
      conversation.updated_at,
    messages:
      conversation.messages.map(
        mapMessage,
      ),
  };
}

export async function getMessagesRepositorySnapshot(
  input: {
    userId: string;
    selectedConversationId?: string | null;
  },
): Promise<MessagesRepositorySnapshot> {
  const [
    user,
    conversations,
  ] =
    await Promise.all([
      prisma.users.findUnique({
        where: {
          id:
            input.userId,
        },

        select: {
          id:
            true,

          user_profile: {
            select: {
              timezone:
                true,
            },
          },

          user_license_classes: {
            where: {
              status:
                "active",
            },

            orderBy: [
              {
                is_primary:
                  "desc",
              },
              {
                started_at:
                  "asc",
              },
            ],

            take:
              1,

            select: {
              license_class_code:
                true,
            },
          },
        },
      }),

      listConversationSummariesForUser(
        input.userId,
      ),
    ]);

  if (!user) {
    throw new Error(
      "[Express-Führerschein] Benutzer wurde nicht gefunden.",
    );
  }

  const selectedConversationId =
    input.selectedConversationId
      ?.trim() ||
    conversations[0]
      ?.id ||
    null;

  const selectedConversation =
    selectedConversationId
      ? await findConversationDetailForUser({
          userId:
            input.userId,
          conversationId:
            selectedConversationId,
        })
      : null;

  return {
    activeLicenseClassCode:
      user.user_license_classes[0]
        ?.license_class_code ??
      null,

    timezone:
      user.user_profile
        ?.timezone
        ?.trim() ||
      "Europe/Berlin",

    conversations,

    selectedConversation,
  };
}

export async function createConversationWithFirstMessage(
  input: {
    userId: string;
    conversationType: string;
    subject: string;
    body: string;
  },
): Promise<string> {
  const now =
    new Date();

  const created =
    await prisma.$transaction(
      async (
        tx,
      ) => {
        const conversation =
          await tx.conversations.create({
            data: {
              user_id:
                input.userId,
              conversation_type:
                input.conversationType,
              subject:
                input.subject,
              status:
                "open",
              last_message_at:
                now,
            },

            select: {
              id:
                true,
            },
          });

        await tx.conversation_messages.create({
          data: {
            conversation_id:
              conversation.id,
            sender_type:
              "client",
            sender_user_id:
              input.userId,
            body:
              input.body,
            read_at:
              now,
          },
        });

        return conversation.id;
      },
    );

  return created;
}

export async function createClientMessage(
  input: {
    userId: string;
    conversationId: string;
    body: string;
  },
): Promise<string | null> {
  const now =
    new Date();

  return prisma.$transaction(
    async (
      tx,
    ) => {
      const conversation =
        await tx.conversations.findFirst({
          where: {
            id:
              input.conversationId,
            user_id:
              input.userId,
          },

          select: {
            id:
              true,
            status:
              true,
            closed_at:
              true,
          },
        });

      if (
        !conversation ||
        conversation.closed_at ||
        conversation.status ===
          "closed"
      ) {
        return null;
      }

      const message =
        await tx.conversation_messages.create({
          data: {
            conversation_id:
              conversation.id,
            sender_type:
              "client",
            sender_user_id:
              input.userId,
            body:
              input.body,
            read_at:
              now,
          },

          select: {
            id:
              true,
          },
        });

      await tx.conversations.update({
        where: {
          id:
            conversation.id,
        },

        data: {
          last_message_at:
            now,
        },
      });

      return message.id;
    },
  );
}

export async function markConversationSupportMessagesRead(
  input: {
    userId: string;
    conversationId: string;
  },
): Promise<boolean> {
  const conversation =
    await prisma.conversations.findFirst({
      where: {
        id:
          input.conversationId,
        user_id:
          input.userId,
      },

      select: {
        id:
          true,
      },
    });

  if (!conversation) {
    return false;
  }

  await prisma.conversation_messages.updateMany({
    where: {
      conversation_id:
        conversation.id,
      read_at:
        null,
      NOT: {
        sender_type:
          "client",
      },
    },

    data: {
      read_at:
        new Date(),
    },
  });

  return true;
}
