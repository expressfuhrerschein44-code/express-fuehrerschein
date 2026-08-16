/**
 * Express-Führerschein
 * Driving licence class types
 *
 * Important:
 * - The frontend must not hard-code legal rules.
 * - These types describe data coming from the data layer / API / CMS.
 * - Country-specific availability and regulation remain backend-driven.
 */

export type LicenseClassCode =
  | "AM"
  | "A1"
  | "A2"
  | "A"
  | "B"
  | "B17"
  | "BE"
  | "C1"
  | "C1E"
  | "C"
  | "CE"
  | "D1"
  | "D1E"
  | "D"
  | "DE"
  | "L"
  | "T"
  | (string & {});

/**
 * Main visual families used by the public site.
 * This is presentation metadata, not a legal classification.
 */
export type LicenseVehicleType =
  | "car"
  | "motorcycle"
  | "truck"
  | "bus"
  | "trailer"
  | "scooter"
  | "tractor"
  | "other";

export type LicenseClassStatus =
  | "active"
  | "inactive"
  | "coming-soon"
  | "archived";

export interface LicenseClassImage {
  /**
   * Public path, e.g.
   * /images/home/license-classes/klasse-b.webp
   */
  src: string;

  /**
   * Translation-independent fallback alt text.
   * Localized alt text can still come from messages.
   */
  alt?: string;

  width?: number;
  height?: number;
}

export interface LicenseClass {
  /**
   * Stable internal identifier from API/database.
   */
  id: string;

  /**
   * Public/legal class code such as B, A, C, BE, AM.
   */
  code: LicenseClassCode;

  /**
   * Localized display name when data already comes translated.
   * Example: "Klasse B".
   */
  name: string;

  /**
   * Short human-readable vehicle label.
   * Example: "PKW".
   */
  vehicleLabel: string;

  /**
   * Presentation family for icon/image fallback.
   */
  vehicleType: LicenseVehicleType;

  /**
   * Optional short description.
   */
  description?: string;

  /**
   * Optional card image.
   */
  image?: LicenseClassImage;

  /**
   * Whether the class is highlighted on the public Home.
   */
  featured?: boolean;

  /**
   * Whether this card should initially appear selected.
   * For the current Home architecture, Klasse B may be selected.
   */
  selectedByDefault?: boolean;

  /**
   * Controls availability without deleting historical content.
   */
  status: LicenseClassStatus;

  /**
   * Country codes where the class is currently available.
   * Legal rules are not stored here.
   */
  countryCodes?: readonly string[];

  /**
   * Sort position from CMS/admin.
   */
  sortOrder?: number;

  /**
   * Public destination for the class detail page.
   */
  href?: string;
}

/**
 * Compact shape useful for Home cards.
 */
export type HomeLicenseClass = Pick<
  LicenseClass,
  | "id"
  | "code"
  | "name"
  | "vehicleLabel"
  | "vehicleType"
  | "image"
  | "featured"
  | "selectedByDefault"
  | "status"
  | "sortOrder"
  | "href"
>;
