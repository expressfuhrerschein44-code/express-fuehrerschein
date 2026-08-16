/**
 * Express-Führerschein
 * Desktop client header.
 */

import {
  ClientLanguageSelector,
} from "@/components/client-shell/shared/client-language-selector";

import {
  DesktopProfileMenu,
} from "@/components/client-shell/desktop/desktop-profile-menu";

import type {
  ClientShellUser,
} from "@/types/client-shell";

export interface DesktopClientHeaderProps {
  user:
    ClientShellUser;
}

function greetingForCurrentTime() {
  const hour =
    new Date()
      .getHours();

  if (
    hour <
    11
  ) {
    return "Guten Morgen";
  }

  if (
    hour <
    18
  ) {
    return "Guten Tag";
  }

  return "Guten Abend";
}

export function DesktopClientHeader({
  user,
}: DesktopClientHeaderProps) {
  const greeting =
    greetingForCurrentTime();

  return (
    <header
      className="hidden h-[88px] items-center justify-between border-b border-[#EEF1F5] bg-white/95 px-6 backdrop-blur lg:flex xl:px-8"
    >
      <div
        className="min-w-0"
      >
        <h1
          className="truncate text-[18px] font-extrabold tracking-[-0.02em] text-[#101B2B]"
        >
          {greeting},{" "}
          {
            user.firstName
          }{" "}
          <span
            aria-hidden="true"
          >
            👋
          </span>
        </h1>

        <p
          className="mt-1 text-[11px] text-[#65758A]"
        >
          Weiter so! Du bist auf dem besten Weg.
        </p>
      </div>

      <div
        className="flex items-center gap-3"
      >
        <ClientLanguageSelector
          locale={
            user.preferredLocale
          }
        />

        <DesktopProfileMenu
          user={
            user
          }
        />
      </div>
    </header>
  );
}
