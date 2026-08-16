/**
 * Express-Führerschein
 * Account actions card.
 */

import {
  ProfileActionRow,
} from "@/components/profile/shared/profile-action-row";

import {
  ProfileCard,
} from "@/components/profile/shared/profile-card";

import {
  cn,
} from "@/lib/utils";

export interface ProfileAccountCardProps {
  onChangeEmail:
    () => void;

  onDeleteAccount:
    () => void;

  compact?:
    boolean;

  className?:
    string;
}

export function ProfileAccountCard({
  onChangeEmail,
  onDeleteAccount,
  compact =
    false,
  className,
}: ProfileAccountCardProps) {
  return (
    <ProfileCard
      className={cn(
        compact
          ? "p-3"
          : "p-4",
        className,
      )}
    >
      <h2
        className="px-2 text-[13px] font-extrabold text-[#111C2B]"
      >
        Konto
      </h2>

      <div
        className="mt-2"
      >
        <ProfileActionRow
          label="E-Mail-Adresse ändern"
          onClick={
            onChangeEmail
          }
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect
                x="4"
                y="6"
                width="16"
                height="12"
                rx="2"
              />
              <path
                d="m5 8 7 5 7-5"
              />
            </svg>
          }
        />

        <ProfileActionRow
          label="Konto löschen"
          onClick={
            onDeleteAccount
          }
          destructive
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M5 7h14M9 7V5h6v2M8 10v7M12 10v7M16 10v7M7 7l1 13h8l1-13"
              />
            </svg>
          }
        />
      </div>
    </ProfileCard>
  );
}
