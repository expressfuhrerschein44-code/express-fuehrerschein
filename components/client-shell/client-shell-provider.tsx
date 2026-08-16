"use client";

/**
 * Express-Führerschein
 * Client shell provider.
 *
 * Shared interactive state for:
 * - mobile hamburger drawer;
 * - desktop profile dropdown.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type {
  ReactNode,
} from "react";

import {
  useClientMobileMenu,
} from "@/hooks/use-client-mobile-menu";

interface ClientShellContextValue {
  isMobileMenuOpen:
    boolean;

  openMobileMenu:
    () => void;

  closeMobileMenu:
    () => void;

  toggleMobileMenu:
    () => void;

  isProfileMenuOpen:
    boolean;

  openProfileMenu:
    () => void;

  closeProfileMenu:
    () => void;

  toggleProfileMenu:
    () => void;
}

const ClientShellContext =
  createContext<ClientShellContextValue | null>(
    null,
  );

export interface ClientShellProviderProps {
  children:
    ReactNode;
}

export function ClientShellProvider({
  children,
}: ClientShellProviderProps) {
  const mobileMenu =
    useClientMobileMenu();

  const [
    isProfileMenuOpen,
    setIsProfileMenuOpen,
  ] =
    useState(
      false,
    );

  const openProfileMenu =
    useCallback(
      () => {
        setIsProfileMenuOpen(
          true,
        );
      },
      [],
    );

  const closeProfileMenu =
    useCallback(
      () => {
        setIsProfileMenuOpen(
          false,
        );
      },
      [],
    );

  const toggleProfileMenu =
    useCallback(
      () => {
        setIsProfileMenuOpen(
          (current) =>
            !current,
        );
      },
      [],
    );

  const value =
    useMemo<ClientShellContextValue>(
      () => ({
        isMobileMenuOpen:
          mobileMenu.isOpen,

        openMobileMenu:
          mobileMenu.open,

        closeMobileMenu:
          mobileMenu.close,

        toggleMobileMenu:
          mobileMenu.toggle,

        isProfileMenuOpen,

        openProfileMenu,

        closeProfileMenu,

        toggleProfileMenu,
      }),
      [
        mobileMenu.isOpen,
        mobileMenu.open,
        mobileMenu.close,
        mobileMenu.toggle,
        isProfileMenuOpen,
        openProfileMenu,
        closeProfileMenu,
        toggleProfileMenu,
      ],
    );

  return (
    <ClientShellContext.Provider
      value={
        value
      }
    >
      {children}
    </ClientShellContext.Provider>
  );
}

export function useClientShell():
  ClientShellContextValue {
  const context =
    useContext(
      ClientShellContext,
    );

  if (!context) {
    throw new Error(
      "useClientShell() muss innerhalb von <ClientShellProvider> verwendet werden.",
    );
  }

  return context;
}
