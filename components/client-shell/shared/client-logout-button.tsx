"use client";

/**
 * Express-Führerschein
 * Shared logout button.
 */

import {
  useState,
} from "react";

import {
  CLIENT_ROUTES,
} from "@/data/client-navigation";

import {
  cn,
} from "@/lib/utils";

export interface ClientLogoutButtonProps {
  className?:
    string;

  variant?:
    "drawer"
    | "menu";
}

interface LogoutPayload {
  ok?:
    boolean;

  nextPath?:
    string;
}

export function ClientLogoutButton({
  className,

  variant =
    "drawer",
}: ClientLogoutButtonProps) {
  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );

  async function handleLogout() {
    if (
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(
      true,
    );

    try {
      const response =
        await fetch(
          CLIENT_ROUTES.logoutApi,
          {
            method:
              "POST",

            credentials:
              "same-origin",

            headers: {
              Accept:
                "application/json",
            },
          },
        );

      let payload:
        LogoutPayload | null =
        null;

      try {
        payload =
          await response.json() as
            LogoutPayload;
      } catch {
        payload =
          null;
      }

      const nextPath =
        payload
          ?.nextPath ??
        CLIENT_ROUTES.login;

      window.location.assign(
        nextPath,
      );
    } catch {
      window.location.assign(
        CLIENT_ROUTES.login,
      );
    }
  }

  return (
    <button
      type="button"
      onClick={
        handleLogout
      }
      disabled={
        isSubmitting
      }
      className={cn(
        "inline-flex items-center justify-center gap-2 outline-none transition disabled:cursor-wait disabled:opacity-60",
        variant ===
          "drawer"
          ? "h-12 w-full rounded-[8px] border border-[#52667D] bg-transparent px-4 text-[13px] font-semibold text-white hover:border-[#70859D] hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-[#1687FF]"
          : "min-h-10 w-full justify-start rounded-lg px-3 text-[12px] font-semibold text-[#D74242] hover:bg-[#FFF2F2] focus-visible:ring-2 focus-visible:ring-[#1687FF]",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 5H5v14h5" />
        <path d="M14 8l4 4-4 4" />
        <path d="M18 12H9" />
      </svg>

      <span>
        {isSubmitting
          ? "Abmelden..."
          : "Abmelden"}
      </span>
    </button>
  );
}
