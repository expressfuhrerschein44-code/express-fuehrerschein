import {
  AppointmentsPage,
} from "@/components/appointments/appointments-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getAppointmentsPageData,
} from "@/lib/server/appointments/appointments-service";

export const dynamic =
  "force-dynamic";

export default async function TerminePage() {
  const session =
    await requireClientSession();

  const data =
    await getAppointmentsPageData({
      userId:
        session.user.id,
      locale:
        session.user
          .preferredLocale,
    });

  return (
    <AppointmentsPage
      data={
        data
      }
    />
  );
}
