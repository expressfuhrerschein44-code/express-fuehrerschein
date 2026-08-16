/* eslint-disable @next/next/no-img-element */

/**
 * Express-Führerschein
 * Shared user identity summary.
 *
 * Avatar contract:
 * - the server should provide a renderable local or absolute URL;
 * - a raw Supabase Storage object path is never rendered directly;
 * - initials are always the safe fallback.
 *
 * A native <img> is intentionally used for remote signed avatar URLs.
 * This avoids coupling private Supabase Storage avatars to Next.js
 * remotePatterns in next.config.ts.
 */

import Link from "next/link";

import {
  cn,
} from "@/lib/utils";

import type {
  ClientShellUser,
} from "@/types/client-shell";

export interface ClientUserSummaryProps {
  user:
    ClientShellUser;

  href?:
    string;

  inverse?:
    boolean;

  compact?:
    boolean;

  className?:
    string;
}

/* ==========================================================================
   AVATAR
   ========================================================================== */

function getSafeAvatarSrc(
  avatarPath:
    string | null | undefined,
): string | null {
  const value =
    avatarPath
      ?.trim();

  if (
    !value
  ) {
    return null;
  }

  /**
   * Local application asset.
   */
  if (
    value.startsWith(
      "/",
    )
  ) {
    return value;
  }

  /**
   * Absolute server-generated URL, including a signed Supabase URL.
   */
  try {
    const url =
      new URL(
        value,
      );

    if (
      url.protocol ===
        "https:" ||
      url.protocol ===
        "http:"
    ) {
      return url.toString();
    }
  } catch {
    /**
     * Raw object paths such as:
     *
     * user-id/avatar.png
     *
     * are intentionally rejected here.
     */
  }

  return null;
}

/* ==========================================================================
   COMPONENT
   ========================================================================== */

export function ClientUserSummary({
  user,

  href =
    "/profil",

  inverse =
    false,

  compact =
    false,

  className,
}: ClientUserSummaryProps) {
  const avatarSrc =
    getSafeAvatarSrc(
      user.avatarPath,
    );

  return (
    <Link
      href={
        href
      }
      className={cn(
        "group flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#1687FF] focus-visible:ring-offset-2",

        inverse
          ? "focus-visible:ring-offset-[#04111F]"
          : "focus-visible:ring-offset-white",

        className,
      )}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border",

          compact
            ? "h-9 w-9"
            : "h-11 w-11",

          inverse
            ? "border-white/25 bg-white/[0.08]"
            : "border-[#E3E9F0] bg-[#F1F4F8]",
        )}
      >
        {avatarSrc ? (
          <img
            src={
              avatarSrc
            }
            alt=""
            width={
              compact
                ? 36
                : 44
            }
            height={
              compact
                ? 36
                : 44
            }
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className={cn(
              "font-extrabold",

              compact
                ? "text-[11px]"
                : "text-[13px]",

              inverse
                ? "text-white"
                : "text-[#34465A]",
            )}
          >
            {
              user.initials
            }
          </span>
        )}
      </span>

      <span
        className="min-w-0"
      >
        <span
          className={cn(
            "block truncate font-bold",

            compact
              ? "text-[12px]"
              : "text-[13px]",

            inverse
              ? "text-white"
              : "text-[#111C2B]",
          )}
        >
          {
            user.displayName
          }
        </span>

        <span
          className={cn(
            "mt-0.5 block truncate text-[10px]",

            inverse
              ? "text-[#AFC0D2]"
              : "text-[#758496]",
          )}
        >
          Profil ansehen
        </span>
      </span>
    </Link>
  );
}
