/**
 * Express-Führerschein
 * Client application-shell shared contracts.
 *
 * This file contains serializable data only.
 */

import type {
  SupportedCountryCode,
} from "@/types/country";

import type {
  ResolvedClientNavigationItem,
} from "@/types/client-navigation";

export type ClientShellLocale =
  | "de"
  | "fr"
  | "nl"
  | "es"
  | "it"
  | "en";

export interface ClientShellUser {
  id:
    string;

  firstName:
    string;

  lastName:
    string;

  displayName:
    string;

  initials:
    string;

  email:
    string;

  countryCode:
    SupportedCountryCode;

  preferredLocale:
    ClientShellLocale;

  timezone:
    string;

  avatarPath:
    string | null;
}

export interface ClientShellPrimaryLicenseClass {
  id:
    string;

  code:
    string;

  status:
    string;

  isPrimary:
    boolean;

  targetExamDate:
    string | null;
}

export interface ClientShellNotificationSummary {
  unreadMessages:
    number;

  unreadNotifications:
    number;
}

export interface ClientShellData {
  user:
    ClientShellUser;

  primaryLicenseClass:
    ClientShellPrimaryLicenseClass | null;

  notifications:
    ClientShellNotificationSummary;

  navigation:
    readonly ResolvedClientNavigationItem[];

  bottomNavigation:
    readonly ResolvedClientNavigationItem[];
}

export type ClientShellServiceErrorCode =
  | "UNAUTHENTICATED"
  | "ACCOUNT_UNAVAILABLE"
  | "DATABASE_ERROR";

export class ClientShellServiceError
  extends Error {
  readonly code:
    ClientShellServiceErrorCode;

  constructor(
    code:
      ClientShellServiceErrorCode,
    message:
      string,
  ) {
    super(message);

    this.name =
      "ClientShellServiceError";

    this.code =
      code;
  }
}
