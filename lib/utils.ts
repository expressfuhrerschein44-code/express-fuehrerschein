/**
 * Express-Führerschein
 * Small framework-agnostic utilities.
 *
 * No external utility dependency is required here.
 */

/* -------------------------------------------------------------------------- */
/* Class names                                                                  */
/* -------------------------------------------------------------------------- */

export type ClassValue =
  | string
  | number
  | false
  | null
  | undefined
  | readonly ClassValue[]
  | { readonly [className: string]: boolean | null | undefined };

/**
 * Lightweight className composer.
 *
 * Example:
 * cn(
 *   "base",
 *   isActive && "active",
 *   { disabled: isDisabled },
 * )
 */
export function cn(...values: readonly ClassValue[]): string {
  const classes: string[] = [];

  const visit = (value: ClassValue): void => {
    if (!value) {
      return;
    }

    if (typeof value === "string" || typeof value === "number") {
      classes.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (typeof value === "object") {
      Object.entries(value).forEach(([className, enabled]) => {
        if (enabled) {
          classes.push(className);
        }
      });
    }
  };

  values.forEach(visit);

  return classes.join(" ");
}

/* -------------------------------------------------------------------------- */
/* Type / value guards                                                         */
/* -------------------------------------------------------------------------- */

export function isDefined<T>(
  value: T | null | undefined,
): value is T {
  return value !== null && value !== undefined;
}

export function assertNever(
  value: never,
  message = "Unexpected value",
): never {
  throw new Error(`${message}: ${String(value)}`);
}

export function clamp(
  value: number,
  min: number,
  max: number,
): number {
  if (min > max) {
    throw new Error("clamp(): min cannot be greater than max.");
  }

  return Math.min(Math.max(value, min), max);
}

/* -------------------------------------------------------------------------- */
/* Text                                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Creates a URL-friendly ASCII slug.
 * Intended for technical/public routes, not regulatory identifiers.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function truncate(
  value: string,
  maxLength: number,
  suffix = "…",
): string {
  if (maxLength < 0) {
    throw new Error("truncate(): maxLength must be positive.");
  }

  if (value.length <= maxLength) {
    return value;
  }

  if (maxLength <= suffix.length) {
    return suffix.slice(0, maxLength);
  }

  return `${value.slice(0, maxLength - suffix.length).trimEnd()}${suffix}`;
}

/* -------------------------------------------------------------------------- */
/* URLs                                                                         */
/* -------------------------------------------------------------------------- */

export function isExternalUrl(href: string): boolean {
  return /^(?:https?:)?\/\//i.test(href);
}

export function normalizeSiteUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function absoluteUrl(
  path: string,
  baseUrl: string,
): string {
  const normalizedBase = normalizeSiteUrl(baseUrl);

  if (isExternalUrl(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

/**
 * Adds/replaces a query string without mutating the current URL.
 */
export function withQuery(
  url: string,
  params: Readonly<Record<string, string | number | boolean | null | undefined>>,
): string {
  const [pathname, existingQuery = ""] = url.split("?");
  const searchParams = new URLSearchParams(existingQuery);

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      searchParams.delete(key);
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}

/* -------------------------------------------------------------------------- */
/* Arrays                                                                       */
/* -------------------------------------------------------------------------- */

export function sortByOrder<T extends { sortOrder?: number }>(
  items: readonly T[],
): T[] {
  return [...items].sort(
    (a, b) =>
      (a.sortOrder ?? Number.MAX_SAFE_INTEGER) -
      (b.sortOrder ?? Number.MAX_SAFE_INTEGER),
  );
}

/**
 * Creates chunks without mutating the original array.
 */
export function chunk<T>(
  items: readonly T[],
  size: number,
): T[][] {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error("chunk(): size must be a positive integer.");
  }

  const result: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Async                                                                        */
/* -------------------------------------------------------------------------- */

export function sleep(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, Math.max(0, milliseconds));
  });
}
