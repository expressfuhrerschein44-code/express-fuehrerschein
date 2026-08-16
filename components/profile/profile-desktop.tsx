/**
 * Express-Führerschein
 * Desktop profile composition.
 */

import {
  AdditionalInformationCard,
} from "@/components/profile/additional/additional-information-card";

import {
  ProfileAccountCard,
} from "@/components/profile/account/profile-account-card";

import {
  ProfileSummaryCard,
} from "@/components/profile/identity/profile-summary-card";

import {
  PersonalInformationCard,
} from "@/components/profile/personal/personal-information-card";

import {
  ProfileSecurityCard,
} from "@/components/profile/security/profile-security-card";

import {
  ProfileTrustStrip,
} from "@/components/profile/trust/profile-trust-strip";

import type {
  ProfileData,
} from "@/types/profile";

export interface ProfileDesktopProps {
  data:
    ProfileData;

  onEdit:
    () => void;

  onChangePassword:
    () => void;

  onTwoFactor:
    () => void;

  onChangeEmail:
    () => void;

  onDeleteAccount:
    () => void;
}

export function ProfileDesktop({
  data,
  onEdit,
  onChangePassword,
  onTwoFactor,
  onChangeEmail,
  onDeleteAccount,
}: ProfileDesktopProps) {
  return (
    <div
      className="hidden lg:block"
    >
      <div
        className="mx-auto w-full max-w-[1440px] px-6 py-6 xl:px-7"
      >
        <div>
          <p
            className="text-[10px] font-medium text-[#718095]"
          >
            Profil{" "}
            <span
              className="px-2"
            >
              ›
            </span>{" "}
            Mein Profil
          </p>

          <h1
            className="mt-3 text-[22px] font-black tracking-[-0.025em] text-[#111C2B]"
          >
            Mein Profil
          </h1>

          <p
            className="mt-1 text-[11px] text-[#617086]"
          >
            Verwalte deine persönlichen Informationen und Kontoeinstellungen.
          </p>
        </div>

        <ProfileTrustStrip
          className="mt-6"
        />

        <div
          className="mt-5 grid grid-cols-[300px_minmax(0,1fr)] gap-4"
        >
          <aside
            className="space-y-4"
          >
            <ProfileSummaryCard
              data={
                data
              }
            />

            <ProfileSecurityCard
              twoFactorEnabled={
                data
                  .security
                  .twoFactorEnabled
              }
              onChangePassword={
                onChangePassword
              }
              onTwoFactor={
                onTwoFactor
              }
            />

            <ProfileAccountCard
              onChangeEmail={
                onChangeEmail
              }
              onDeleteAccount={
                onDeleteAccount
              }
            />
          </aside>

          <main
            className="space-y-4"
          >
            <PersonalInformationCard
              data={
                data
              }
              onEdit={
                onEdit
              }
            />

            <AdditionalInformationCard
              data={
                data
              }
            />
          </main>
        </div>

        <p
          className="mt-10 text-center text-[9px] text-[#7B899A]"
        >
          🔒 Deine Daten sind sicher und werden vertraulich behandelt.
        </p>
      </div>
    </div>
  );
}
