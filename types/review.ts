/**
 * Express-Führerschein
 * Review / testimonial types
 *
 * Reviews are expected to come from backend/admin.
 * The frontend should not invent ratings, names or verification states.
 */

export type ReviewStatus =
  | "draft"
  | "pending"
  | "published"
  | "archived";

export type ReviewSource =
  | "internal"
  | "trustpilot"
  | "google"
  | "other";

export interface ReviewAuthor {
  /**
   * Public first name or approved display name.
   */
  firstName: string;

  /**
   * Optional last-name initial only, e.g. "M."
   */
  lastNameInitial?: string;

  /**
   * Optional avatar public URL/path.
   */
  avatarUrl?: string;
}

export interface ReviewRating {
  /**
   * Numeric rating.
   * Usually 1–5, but kept generic for future providers.
   */
  value: number;

  /**
   * Maximum possible score.
   * Example: 5.
   */
  max: number;
}

export interface Review {
  /**
   * Stable backend/database identifier.
   */
  id: string;

  author: ReviewAuthor;

  /**
   * Short review content approved for publication.
   */
  comment: string;

  rating: ReviewRating;

  /**
   * ISO country code, e.g. DE, AT, CH.
   */
  countryCode: string;

  /**
   * Driving licence class code, e.g. B, A, BE.
   */
  licenseClassCode?: string;

  /**
   * Human-readable localized class label when provided by backend.
   */
  licenseClassLabel?: string;

  /**
   * Whether the review was actually verified by the platform/provider.
   */
  verified: boolean;

  source: ReviewSource;

  status: ReviewStatus;

  /**
   * ISO 8601 date string.
   */
  publishedAt?: string;

  /**
   * Optional external review URL when applicable.
   */
  sourceUrl?: string;

  /**
   * Controls Home visibility.
   */
  featured?: boolean;

  /**
   * CMS/admin sort order.
   */
  sortOrder?: number;
}

/**
 * Lightweight shape used by the Home review cards.
 */
export type HomeReview = Pick<
  Review,
  | "id"
  | "author"
  | "comment"
  | "rating"
  | "countryCode"
  | "licenseClassCode"
  | "licenseClassLabel"
  | "verified"
  | "source"
  | "publishedAt"
  | "featured"
  | "sortOrder"
>;
