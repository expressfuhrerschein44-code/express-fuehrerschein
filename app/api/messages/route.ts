import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  createConversation,
  getConversationDetail,
  markConversationAsRead,
  MessagesServiceError,
  sendMessage,
} from "@/lib/server/messages/messages-service";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

function noStoreHeaders():
  Record<string, string> {
  return {
    "Cache-Control":
      "private, no-store, max-age=0",
  };
}

export async function GET(
  request: NextRequest,
) {
  try {
    const conversationId =
      request.nextUrl
        .searchParams
        .get(
          "conversationId",
        )
        ?.trim() ??
      "";

    if (!conversationId) {
      return NextResponse.json(
        {
          ok:
            false,
          error: {
            code:
              "CONVERSATION_ID_REQUIRED",
            message:
              "conversationId fehlt.",
          },
        },
        {
          status:
            400,
          headers:
            noStoreHeaders(),
        },
      );
    }

    const session =
      await requireClientSession();

    const data =
      await getConversationDetail({
        userId:
          session.user.id,
        conversationId,
      });

    if (!data) {
      return NextResponse.json(
        {
          ok:
            false,
          error: {
            code:
              "CONVERSATION_NOT_FOUND",
            message:
              "Die Unterhaltung wurde nicht gefunden.",
          },
        },
        {
          status:
            404,
          headers:
            noStoreHeaders(),
        },
      );
    }

    return NextResponse.json(
      {
        ok:
          true,
        data,
      },
      {
        headers:
          noStoreHeaders(),
      },
    );
  } catch (
    error
  ) {
    console.error(
      "[MESSAGES_GET_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,
        error: {
          code:
            "MESSAGES_LOAD_FAILED",
          message:
            "Die Unterhaltung konnte nicht geladen werden.",
        },
      },
      {
        status:
          500,
        headers:
          noStoreHeaders(),
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request
        .json()
        .catch(
          () => null,
        ) as
        | Record<
            string,
            unknown
          >
        | null;

    if (!body) {
      return NextResponse.json(
        {
          ok:
            false,
          error: {
            code:
              "INVALID_REQUEST",
            message:
              "Ungültige Nachrichtenanfrage.",
          },
        },
        {
          status:
            400,
          headers:
            noStoreHeaders(),
        },
      );
    }

    const action =
      typeof body.action ===
        "string"
        ? body.action
        : "";

    const session =
      await requireClientSession();

    if (
      action ===
      "create_conversation"
    ) {
      const data =
        await createConversation({
          userId:
            session.user.id,
          data: {
            conversationType:
              typeof body.conversationType ===
                "string"
                ? body.conversationType
                : "general",
            subject:
              typeof body.subject ===
                "string"
                ? body.subject
                : "",
            body:
              typeof body.body ===
                "string"
                ? body.body
                : "",
          },
        });

      return NextResponse.json(
        {
          ok:
            true,
          data,
        },
        {
          status:
            201,
          headers:
            noStoreHeaders(),
        },
      );
    }

    if (
      action ===
      "send"
    ) {
      const data =
        await sendMessage({
          userId:
            session.user.id,
          data: {
            conversationId:
              typeof body.conversationId ===
                "string"
                ? body.conversationId
                : "",
            body:
              typeof body.body ===
                "string"
                ? body.body
                : "",
          },
        });

      return NextResponse.json(
        {
          ok:
            true,
          data,
        },
        {
          status:
            201,
          headers:
            noStoreHeaders(),
        },
      );
    }

    if (
      action ===
      "mark_read"
    ) {
      await markConversationAsRead({
        userId:
          session.user.id,
        conversationId:
          typeof body.conversationId ===
            "string"
            ? body.conversationId
            : "",
      });

      return NextResponse.json(
        {
          ok:
            true,
          data: {
            read:
              true,
          },
        },
        {
          headers:
            noStoreHeaders(),
        },
      );
    }

    return NextResponse.json(
      {
        ok:
          false,
        error: {
          code:
            "INVALID_MESSAGE_ACTION",
          message:
            "action muss create_conversation, send oder mark_read sein.",
        },
      },
      {
        status:
          400,
        headers:
          noStoreHeaders(),
      },
    );
  } catch (
    error
  ) {
    if (
      error instanceof
      MessagesServiceError
    ) {
      return NextResponse.json(
        {
          ok:
            false,
          error: {
            code:
              error.code,
            message:
              error.message,
          },
        },
        {
          status:
            error.status,
          headers:
            noStoreHeaders(),
        },
      );
    }

    console.error(
      "[MESSAGES_POST_ERROR]",
      error,
    );

    return NextResponse.json(
      {
        ok:
          false,
        error: {
          code:
            "MESSAGE_ACTION_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Die Nachrichtenaktion konnte nicht verarbeitet werden.",
        },
      },
      {
        status:
          500,
        headers:
          noStoreHeaders(),
      },
    );
  }
}
