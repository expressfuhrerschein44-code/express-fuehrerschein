"use client";

/**
 * Express-Führerschein
 * Active client route hook.
 *
 * Used by:
 * - desktop sidebar;
 * - mobile hamburger drawer;
 * - mobile bottom navigation.
 */

import {
  useMemo,
} from "react";

import {
  usePathname,
} from "next/navigation";

import {
  CLIENT_NAVIGATION,
} from "@/data/client-navigation";

import type {
  ClientNavigationItem,
  ClientNavigationItemId,
} from "@/types/client-navigation";

/* ==========================================================================
   PATH HELPERS
   ========================================================================== */

function normalizePathname(
  pathname:
    string,
): string {
  const trimmed =
    pathname.trim();

  if (
    trimmed === "" ||
    trimmed === "/"
  ) {
    return "/";
  }

  return trimmed.replace(
    /\/+$/,
    "",
  );
}

export function isClientRouteActive(
  pathname:
    string,

  item:
    Pick<
      ClientNavigationItem,
      "href" | "match"
    >,
): boolean {
  const currentPath =
    normalizePathname(
      pathname,
    );

  const targetPath =
    normalizePathname(
      item.href,
    );

  if (
    item.match ===
    "exact"
  ) {
    return (
      currentPath ===
      targetPath
    );
  }

  return (
    currentPath ===
      targetPath ||
    currentPath.startsWith(
      `${targetPath}/`,
    )
  );
}

/* ==========================================================================
   HOOK
   ========================================================================== */

export function useActiveClientRoute(
  items:
    readonly ClientNavigationItem[] =
      CLIENT_NAVIGATION,
) {
  const pathname =
    usePathname();

  return useMemo(
    () => {
      const normalizedPathname =
        normalizePathname(
          pathname,
        );

      const activeItem =
        items.find(
          (item) =>
            isClientRouteActive(
              normalizedPathname,
              item,
            ),
        ) ??
        null;

      const activeId:
        ClientNavigationItemId | null =
        activeItem?.id ??
        null;

      return {
        pathname:
          normalizedPathname,

        activeItem,

        activeId,

        isActive(
          item:
            Pick<
              ClientNavigationItem,
              "href" | "match"
            >,
        ): boolean {
          return isClientRouteActive(
            normalizedPathname,
            item,
          );
        },
      };
    },
    [
      pathname,
      items,
    ],
  );
}
