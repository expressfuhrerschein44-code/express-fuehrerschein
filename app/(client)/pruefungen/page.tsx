import {
  ExamsPage,
} from "@/components/exams/exams-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getExamsPageData,
} from "@/lib/server/theory/theory-exam-service";

export const dynamic =
  "force-dynamic";

export default async function PruefungenPage() {
  const session =
    await requireClientSession();

  const data =
    await getExamsPageData({
      userId:
        session.user.id,
      locale:
        session.user
          .preferredLocale,
    });

  return (
    <ExamsPage
      data={
        data
      }
    />
  );
}
