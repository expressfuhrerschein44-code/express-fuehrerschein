/**
 * Express-Führerschein
 * Personal information read-only card.
 */

import {
  ProfileCard,
} from "@/components/profile/shared/profile-card";

import {
  ProfileField,
} from "@/components/profile/shared/profile-field";

import {
  ProfileSectionHeader,
} from "@/components/profile/shared/profile-section-header";

import {
  PROFILE_COUNTRIES,
} from "@/data/profile";

import {
  cn,
} from "@/lib/utils";

import type {
  ProfileData,
} from "@/types/profile";

export interface PersonalInformationCardProps {
  data:
    ProfileData;

  onEdit:
    () => void;

  compact?:
    boolean;

  className?:
    string;
}

export function PersonalInformationCard({
  data,
  onEdit,
  compact =
    false,
  className,
}: PersonalInformationCardProps) {
  const country =
    PROFILE_COUNTRIES.find(
      (
        item,
      ) =>
        item.code ===
        data.identity
          .countryCode,
    );

  return (
    <ProfileCard
      className={cn(
        compact
          ? "p-4"
          : "p-5",
        className,
      )}
    >
      <ProfileSectionHeader
        title="Persönliche Informationen"
        actionLabel="Bearbeiten"
        onAction={
          onEdit
        }
      />

      <div
        className={cn(
          "mt-5 grid",
          compact
            ? "grid-cols-1 gap-4"
            : "grid-cols-2 gap-x-6 gap-y-5",
        )}
      >
        <ProfileField
          label="Vorname"
          value={
            data
              .identity
              .firstName
          }
        />

        <ProfileField
          label="Nachname"
          value={
            data
              .identity
              .lastName
          }
        />

        <ProfileField
          label="E-Mail-Adresse"
          value={
            data
              .identity
              .email
          }
        />

        <ProfileField
          label="Telefonnummer"
          value={
            data
              .identity
              .phoneE164
          }
        />

        <ProfileField
          label="Land"
          value={
            country
              ? `${country.flag} ${country.label}`
              : data
                  .identity
                  .countryCode
          }
        />

        <ProfileField
          label="Stadt"
          value={
            data
              .address
              .city
          }
        />

        <ProfileField
          label="Adresse"
          value={
            data
              .address
              .addressLine1
          }
        />

        <ProfileField
          label="Postleitzahl"
          value={
            data
              .address
              .postalCode
          }
        />
      </div>
    </ProfileCard>
  );
}
