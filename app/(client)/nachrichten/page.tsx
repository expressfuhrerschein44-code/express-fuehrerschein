import {
  MessagesPage,
} from "@/components/messages/messages-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getMessagesPageData,
} from "@/lib/server/messages/messages-service";

export const dynamic =
  "force-dynamic";

export default async function NachrichtenPage() {
  const session =
    await requireClientSession();

  const data =
    await getMessagesPageData({
      userId:
        session.user.id,
      locale:
        session.user
          .preferredLocale,
    });

  return (
    <MessagesPage
      data={
        data
      }
    />
  );
}
