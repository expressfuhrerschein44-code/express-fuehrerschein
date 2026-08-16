"use client";

/**
 * Express-Führerschein
 * Mobile client menu state.
 *
 * Responsibilities:
 * - open / close / toggle;
 * - close automatically after navigation;
 * - close on Escape;
 * - lock document scrolling while drawer is open;
 * - restore the previous body overflow value on cleanup.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePathname,
} from "next/navigation";

export interface UseClientMobileMenuResult {
  isOpen:
    boolean;

  open:
    () => void;

  close:
    () => void;

  toggle:
    () => void;
}

export function useClientMobileMenu():
  UseClientMobileMenuResult {
  const pathname =
    usePathname();

  const [isOpen, setIsOpen] =
    useState(false);

  const previousPathnameRef =
    useRef(
      pathname,
    );

  const open =
    useCallback(
      () => {
        setIsOpen(
          true,
        );
      },
      [],
    );

  const close =
    useCallback(
      () => {
        setIsOpen(
          false,
        );
      },
      [],
    );

  const toggle =
    useCallback(
      () => {
        setIsOpen(
          (current) =>
            !current,
        );
      },
      [],
    );

  /* ------------------------------------------------------------------------
     Close after route change
     ------------------------------------------------------------------------ */

  useEffect(
    () => {
      if (
        previousPathnameRef.current !==
        pathname
      ) {
        previousPathnameRef.current =
          pathname;

        setIsOpen(
          false,
        );
      }
    },
    [
      pathname,
    ],
  );

  /* ------------------------------------------------------------------------
     Escape key
     ------------------------------------------------------------------------ */

  useEffect(
    () => {
      if (!isOpen) {
        return;
      }

      function handleKeyDown(
        event:
          KeyboardEvent,
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          setIsOpen(
            false,
          );
        }
      }

      window.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },
    [
      isOpen,
    ],
  );

  /* ------------------------------------------------------------------------
     Body scroll lock
     ------------------------------------------------------------------------ */

  useEffect(
    () => {
      if (!isOpen) {
        return;
      }

      const previousOverflow =
        document.body.style.overflow;

      document.body.style.overflow =
        "hidden";

      return () => {
        document.body.style.overflow =
          previousOverflow;
      };
    },
    [
      isOpen,
    ],
  );

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
