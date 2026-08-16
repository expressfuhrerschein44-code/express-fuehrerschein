/**
 * Express-Führerschein
 * Profile security actions.
 */

import {
  ProfileActionRow,
} from "@/components/profile/shared/profile-action-row";

import {
  ProfileCard,
} from "@/components/profile/shared/profile-card";

import {
  TwoFactorStatus,
} from "@/components/profile/security/two-factor-status";

import {
  cn,
} from "@/lib/utils";

export interface ProfileSecurityCardProps {
  twoFactorEnabled:
    boolean;

  onChangePassword:
    () => void;

  onTwoFactor:
    () => void;

  compact?:
    boolean;

  className?:
    string;
}

export function ProfileSecurityCard({
  twoFactorEnabled,
  onChangePassword,
  onTwoFactor,
  compact =
    false,
  className,
}: ProfileSecurityCardProps) {
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
        Sicherheit
      </h2>

      <div
        className="mt-2"
      >
        <ProfileActionRow
          label="Passwort ändern"
          onClick={
            onChangePassword
          }
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M8 10V8a4 4 0 1 1 8 0v2"
              />
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2"
              />
            </svg>
          }
        />

        <ProfileActionRow
          label="Zwei-Faktor-Authentifizierung"
          onClick={
            onTwoFactor
          }
          trailing={
            <TwoFactorStatus
              enabled={
                twoFactorEnabled
              }
            />
          }
          icon={
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M12 3 19 6v5c0 4.5-2.8 7.7-7 10-4.2-2.3-7-5.5-7-10V6l7-3Z"
              />
              <path
                d="m9.5 12 1.7 1.7 3.5-3.7"
              />
            </svg>
          }
        />
      </div>
    </ProfileCard>
  );
}
