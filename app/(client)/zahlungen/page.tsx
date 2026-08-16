import {
  PaymentsPage,
} from "@/components/payments/payments-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getPaymentsPageData,
} from "@/lib/server/payments/payments-service";

export const dynamic =
  "force-dynamic";

export default async function ZahlungenPage() {
  const session =
    await requireClientSession();

  const data =
    await getPaymentsPageData(
      session.user.id,
    );

  return (
    <PaymentsPage
      data={
        data
      }
    />
  );
}
