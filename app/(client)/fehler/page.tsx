import {
  ErrorsPage,
} from "@/components/errors/errors-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getErrorsPageData,
} from "@/lib/server/errors/errors-service";

export const dynamic =
  "force-dynamic";

export default async function FehlerPage() {
  const session =
    await requireClientSession();

  const data =
    await getErrorsPageData({
      userId:
        session.user.id,
      locale:
        session.user
          .preferredLocale,
    });

  return (
    <ErrorsPage
      data={
        data
      }
    />
  );
}
