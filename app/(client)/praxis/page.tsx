import {
  PraxisPage,
} from "@/components/praxis/praxis-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getPraxisPageData,
} from "@/lib/server/praxis/praxis-service";

export const dynamic =
  "force-dynamic";

export default async function PraxisRoutePage() {
  const session =
    await requireClientSession();

  const data =
    await getPraxisPageData(
      session.user.id,
    );

  return (
    <PraxisPage
      initialData={
        data
      }
    />
  );
}