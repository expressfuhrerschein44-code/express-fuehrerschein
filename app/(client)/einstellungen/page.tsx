import {
  SettingsPage,
} from "@/components/settings/settings-page";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  getSettingsPageData,
} from "@/lib/server/settings/settings-service";

export const dynamic =
  "force-dynamic";

export default async function EinstellungenPage() {
  const session =
    await requireClientSession();

  const data =
    await getSettingsPageData(
      session.user.id,
    );

  return (
    <SettingsPage
      data={
        data
      }
    />
  );
}
