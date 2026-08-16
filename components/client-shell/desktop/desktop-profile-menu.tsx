"use client";

/**
 * Express-Führerschein
 * Desktop profile dropdown.
 */

import {
  useEffect,
  useRef,
} from "react";

import Link from "next/link";

import {
  CLIENT_PROFILE_MENU,
  CLIENT_ROUTES,
} from "@/data/client-navigation";

import {
  useClientShell,
} from "@/components/client-shell/client-shell-provider";

import {
  ClientLogoutButton,
} from "@/components/client-shell/shared/client-logout-button";

import type {
  ClientShellUser,
} from "@/types/client-shell";

export interface DesktopProfileMenuProps {
  user:
    ClientShellUser;
}

export function DesktopProfileMenu({
  user,
}: DesktopProfileMenuProps) {
  const {
    isProfileMenuOpen,

    closeProfileMenu,

    toggleProfileMenu,
  } =
    useClientShell();

  const containerRef =
    useRef<HTMLDivElement>(
      null,
    );

  useEffect(
    () => {
      if (
        !isProfileMenuOpen
      ) {
        return;
      }

      function handlePointerDown(
        event:
          MouseEvent,
      ) {
        if (
          containerRef.current &&
          !containerRef.current.contains(
            event.target as
              Node,
          )
        ) {
          closeProfileMenu();
        }
      }

      function handleKeyDown(
        event:
          KeyboardEvent,
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          closeProfileMenu();
        }
      }

      document.addEventListener(
        "mousedown",
        handlePointerDown,
      );

      window.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        document.removeEventListener(
          "mousedown",
          handlePointerDown,
        );

        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },
    [
      isProfileMenuOpen,
      closeProfileMenu,
    ],
  );

  return (
    <div
      ref={
        containerRef
      }
      className="relative"
    >
      <button
        type="button"
        onClick={
          toggleProfileMenu
        }
        aria-expanded={
          isProfileMenuOpen
        }
        aria-haspopup="menu"
        className="flex min-w-[190px] items-center gap-3 rounded-[10px] px-2 py-1.5 text-left outline-none transition hover:bg-[#F6F8FB] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EDF1F5] text-[12px] font-extrabold text-[#3E5066]"
        >
          {
            user.initials
          }
        </span>

        <span
          className="min-w-0 flex-1"
        >
          <span
            className="block truncate text-[12px] font-bold text-[#172233]"
          >
            {
              user.displayName
            }
          </span>

          <span
            className="mt-0.5 block text-[10px] text-[#78879A]"
          >
            {
              CLIENT_PROFILE_MENU.profileLabel
            }
          </span>
        </span>

        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-[#65758A] transition-transform ${
            isProfileMenuOpen
              ? "rotate-180"
              : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="m6 8 4 4 4-4" />
        </svg>
      </button>

      {isProfileMenuOpen ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] rounded-[12px] border border-[#E2E8F0] bg-white p-1.5 shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
        >
          <Link
            href={
              CLIENT_ROUTES.profile
            }
            onClick={
              closeProfileMenu
            }
            role="menuitem"
            className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-[12px] font-semibold text-[#263548] outline-none transition hover:bg-[#F5F8FB] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
          >
            <span>
              👤
            </span>

            {
              CLIENT_PROFILE_MENU.profileLabel
            }
          </Link>

          <Link
            href={
              CLIENT_ROUTES.settings
            }
            onClick={
              closeProfileMenu
            }
            role="menuitem"
            className="flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-[12px] font-semibold text-[#263548] outline-none transition hover:bg-[#F5F8FB] focus-visible:ring-2 focus-visible:ring-[#0878FF]"
          >
            <span>
              ⚙
            </span>

            {
              CLIENT_PROFILE_MENU.settingsLabel
            }
          </Link>

          <div
            className="my-1 h-px bg-[#EBEFF4]"
          />

          <ClientLogoutButton
            variant="menu"
          />
        </div>
      ) : null}
    </div>
  );
}
