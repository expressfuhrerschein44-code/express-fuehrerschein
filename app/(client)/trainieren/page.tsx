import {
  TrainingPage,
} from "@/components/training/training-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getTrainingPageData,
} from "@/lib/server/training/training-service";

export const dynamic =
  "force-dynamic";

export default async function TrainierenPage() {
  const session =
    await requireClientSession();

  const data =
    await getTrainingPageData({
      userId:
        session.user.id,
      locale:
        session.user.preferredLocale,
    });

  return (
    <TrainingPage
      data={data}
    />
  );
}
