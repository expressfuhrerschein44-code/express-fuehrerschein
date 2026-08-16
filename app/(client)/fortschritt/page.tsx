import {
  ProgressPage,
} from "@/components/progress/progress-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getProgressPageData,
} from "@/lib/server/progress/progress-service";

export const dynamic =
  "force-dynamic";

export default async function FortschrittPage() {
  const session =
    await requireClientSession();

  const data =
    await getProgressPageData({
      userId:
        session.user.id,
      locale:
        session.user.preferredLocale,
    });

  return (
    <ProgressPage
      data={
        data
      }
    />
  );
}
