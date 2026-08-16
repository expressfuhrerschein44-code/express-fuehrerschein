/**
 * Express-Führerschein
 * Mobile profile composition.
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

export interface ProfileMobileProps {
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

export function ProfileMobile({
  data,
  onEdit,
  onChangePassword,
  onTwoFactor,
  onChangeEmail,
  onDeleteAccount,
}: ProfileMobileProps) {
  return (
    <div
      className="lg:hidden"
    >
      <div
        className="space-y-3 px-3 py-4"
      >
        <header
          className="px-1 py-2"
        >
          <h1
            className="text-[20px] font-black tracking-[-0.025em] text-[#111C2B]"
          >
            Mein Profil
          </h1>

          <p
            className="mt-1 text-[10px] leading-5 text-[#617086]"
          >
            Verwalte deine persönlichen Informationen und Kontoeinstellungen.
          </p>
        </header>

        <ProfileTrustStrip
          compact
        />

        <ProfileSummaryCard
          data={
            data
          }
          compact
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
          compact
        />

        <PersonalInformationCard
          data={
            data
          }
          onEdit={
            onEdit
          }
          compact
        />

        <AdditionalInformationCard
          data={
            data
          }
          compact
        />

        <ProfileAccountCard
          onChangeEmail={
            onChangeEmail
          }
          onDeleteAccount={
            onDeleteAccount
          }
          compact
        />

        <p
          className="px-4 pb-4 pt-2 text-center text-[9px] text-[#7B899A]"
        >
          🔒 Deine Daten werden vertraulich behandelt.
        </p>
      </div>
    </div>
  );
}
