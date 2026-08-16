"use client";

/**
 * Express-Führerschein
 * Identity summary card.
 */

import {
  useRouter,
} from "next/navigation";

import {
  ProfileAvatar,
} from "@/components/profile/identity/profile-avatar";

import {
  ProfileAvatarUploader,
} from "@/components/profile/identity/profile-avatar-uploader";

import {
  ProfileCard,
} from "@/components/profile/shared/profile-card";

import {
  ProfileStatusBadge,
} from "@/components/profile/shared/profile-status-badge";

import {
  cn,
} from "@/lib/utils";

import type {
  ProfileData,
} from "@/types/profile";

export interface ProfileSummaryCardProps {
  data:
    ProfileData;

  compact?:
    boolean;

  className?:
    string;
}

function memberSince(
  iso:
    string,
): string {
  const date =
    new Date(
      iso,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "de-DE",
    {
      month:
        "long",

      year:
        "numeric",
    },
  ).format(
    date,
  );
}

export function ProfileSummaryCard({
  data,
  compact =
    false,
  className,
}: ProfileSummaryCardProps) {
  const router =
    useRouter();

  return (
    <ProfileCard
      className={cn(
        "text-center",
        compact
          ? "p-4"
          : "p-6",
        className,
      )}
    >
      <div
        className="flex justify-center"
      >
        <ProfileAvatar
          src={
            data
              .avatar
              .url
          }
          firstName={
            data
              .identity
              .firstName
          }
          lastName={
            data
              .identity
              .lastName
          }
          size={
            compact
              ? "md"
              : "lg"
          }
        />
      </div>

      <h2
        className={cn(
          "font-black tracking-[-0.02em] text-[#111C2B]",
          compact
            ? "mt-3 text-[15px]"
            : "mt-4 text-[16px]",
        )}
      >
        {
          data
            .identity
            .displayName
        }
      </h2>

      <p
        className="mt-1 text-[10px] text-[#69788A]"
      >
        Mitglied seit{" "}
        {
          memberSince(
            data
              .identity
              .memberSince,
          )
        }
      </p>

      <div
        className="mt-3 flex justify-center"
      >
        <ProfileStatusBadge
          verified={
            data
              .identity
              .emailVerified
          }
        />
      </div>

      <ProfileAvatarUploader
        hasAvatar={
          Boolean(
            data
              .avatar
              .path,
          )
        }
        onUpdated={
          () =>
            router
              .refresh()
        }
      />
    </ProfileCard>
  );
}
