/**
 * Express-Führerschein
 * Client-space navigation contracts.
 *
 * Shared by:
 * - desktop sidebar;
 * - mobile drawer;
 * - mobile bottom navigation;
 * - active-route helpers.
 *
 * Keep this file serializable and UI-framework agnostic.
 */

export type ClientNavigationItemId =
  | "dashboard"
  | "theory"
  | "license"
  | "practice"
  | "progress"
  | "training"
  | "exams"
  | "errors"
  | "appointments"
  | "documents"
  | "messages"
  | "payments"
  | "settings"
  | "support"
  | "profile";

export type ClientNavigationIcon =
  | "home"
  | "book"
  | "car"
  | "user"
  | "chart"
  | "sparkles"
  | "clipboard-check"
  | "alert-circle"
  | "calendar"
  | "file"
  | "message"
  | "credit-card"
  | "settings"
  | "help-circle";

export type ClientNavigationBadgeKey =
  | "unreadMessages"
  | "unreadNotifications";

export type ClientNavigationMatchMode =
  | "exact"
  | "prefix";

export interface ClientNavigationItem {
  id:
    ClientNavigationItemId;

  label:
    string;

  href:
    string;

  icon:
    ClientNavigationIcon;

  /**
   * exact:
   * Only the exact pathname activates the item.
   *
   * prefix:
   * Child routes also keep the parent item active.
   *
   * Example:
   * /theorie/verkehrszeichen -> Theorie remains active.
   */
  match:
    ClientNavigationMatchMode;

  /**
   * Optional dynamic badge.
   *
   * The data file never contains a fake/hard-coded count.
   * Counts are resolved by the server shell service.
   */
  badgeKey?:
    ClientNavigationBadgeKey;

  /**
   * Whether this item belongs to the desktop/sidebar and
   * mobile drawer navigation.
   */
  showInMainNavigation:
    boolean;

  /**
   * Whether this item belongs to the 5-item mobile bottom navigation.
   */
  showInBottomNavigation:
    boolean;

  /**
   * Visually emphasizes the central mobile action.
   */
  prominentOnMobile?:
    boolean;
}

export interface ResolvedClientNavigationItem
  extends ClientNavigationItem {
  badgeCount:
    number | null;
}

export interface ClientNavigationBadgeValues {
  unreadMessages:
    number;

  unreadNotifications:
    number;
}
