/**
 * Express-Führerschein
 * Additional profile information.
 */

import {
  ProfileCard,
} from "@/components/profile/shared/profile-card";

import {
  ProfileEmptyValue,
} from "@/components/profile/shared/profile-empty-value";

import {
  PROFILE_LOCALES,
} from "@/data/profile";

import {
  cn,
} from "@/lib/utils";

import type {
  ProfileData,
} from "@/types/profile";

export interface AdditionalInformationCardProps {
  data:
    ProfileData;

  compact?:
    boolean;

  className?:
    string;
}

function formatDate(
  date:
    string | null,
): string | null {
  if (
    !date
  ) {
    return null;
  }

  const value =
    new Date(
      `${date}T00:00:00.000Z`,
    );

  if (
    Number.isNaN(
      value.getTime(),
    )
  ) {
    return date;
  }

  return new Intl.DateTimeFormat(
    "de-DE",
  ).format(
    value,
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label:
    string;

  value:
    string | null;

  icon:
    React.ReactNode;
}) {
  return (
    <div
      className="grid grid-cols-[36px_minmax(0,1fr)] items-center gap-3 border-b border-[#E9EDF2] py-3 last:border-b-0"
    >
      <span
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4F7FB] text-[#53667F]"
      >
        {icon}
      </span>

      <div
        className="grid min-w-0 gap-2 sm:grid-cols-[1fr_1fr]"
      >
        <span
          className="text-[10px] text-[#56677C]"
        >
          {label}
        </span>

        <span
          className="break-words text-[10px] font-semibold text-[#172233]"
        >
          {value ? (
            value
          ) : (
            <ProfileEmptyValue />
          )}
        </span>
      </div>
    </div>
  );
}

const iconClass =
  "h-4 w-4";

export function AdditionalInformationCard({
  data,
  compact =
    false,
  className,
}: AdditionalInformationCardProps) {
  const language =
    PROFILE_LOCALES.find(
      (
        locale,
      ) =>
        locale.code ===
        data.preferences
          .preferredLocale,
    )
      ?.label ??
    data.preferences
      .preferredLocale;

  return (
    <ProfileCard
      className={cn(
        compact
          ? "p-4"
          : "p-5",
        className,
      )}
    >
      <h2
        className="text-[15px] font-extrabold text-[#111C2B]"
      >
        Zusätzliche Informationen
      </h2>

      <div
        className="mt-4"
      >
        <DetailRow
          label="Geburtsdatum"
          value={
            formatDate(
              data
                .additional
                .birthDate,
            )
          }
          icon={
            <svg
              viewBox="0 0 24 24"
              className={
                iconClass
              }
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
              />
              <path
                d="M12 8v4l2.5 2"
              />
            </svg>
          }
        />

        <DetailRow
          label="Geburtsort"
          value={
            data
              .additional
              .birthPlace
          }
          icon={
            <svg
              viewBox="0 0 24 24"
              className={
                iconClass
              }
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"
              />
              <circle
                cx="12"
                cy="10"
                r="2"
              />
            </svg>
          }
        />

        <DetailRow
          label="Führerscheinnummer (falls vorhanden)"
          value={
            data
              .additional
              .drivingLicenseNumber
          }
          icon={
            <svg
              viewBox="0 0 24 24"
              className={
                iconClass
              }
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect
                x="4"
                y="5"
                width="16"
                height="14"
                rx="2"
              />
              <path
                d="M8 10h8M8 14h5"
              />
            </svg>
          }
        />

        <DetailRow
          label="Sprache"
          value={
            language
          }
          icon={
            <svg
              viewBox="0 0 24 24"
              className={
                iconClass
              }
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M5 8h10M10 4v4c0 4-2 7-5 9M7 13c2 1 4 2 7 2M16 11l3 8M14.5 16h6"
              />
            </svg>
          }
        />
      </div>
    </ProfileCard>
  );
}
