import {
  SettingsAccountCard,
} from "@/components/settings/settings-account-card";

import {
  SettingsHeader,
} from "@/components/settings/settings-header";

import {
  SettingsPreferencesForm,
} from "@/components/settings/settings-preferences-form";

import type {
  SettingsPageData,
} from "@/types/settings";

export interface SettingsPageProps {
  data:
    SettingsPageData;
}

export function SettingsPage({
  data,
}: SettingsPageProps) {
  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 pb-24 pt-4 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
      <SettingsHeader />

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <SettingsPreferencesForm
          preferences={
            data.preferences
          }
        />

        <SettingsAccountCard
          account={
            data.account
          }
        />
      </div>
    </main>
  );
}
