/**
 * Express-Führerschein
 * Public auth origin and safe internal return paths.
 */

export type OAuthProviderName = "google" | "apple";

function normalizeOrigin(value: string): string {
  const url = new URL(value.trim());
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Ungültiges Auth-Origin-Protokoll.");
  }
  return url.origin;
}

export function getAuthPublicOrigin(request?: Request): string {
  const configured =
    process.env.AUTH_PUBLIC_ORIGIN?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return normalizeOrigin(configured);
  }

  if (process.env.NODE_ENV !== "production" && request) {
    return new URL(request.url).origin;
  }

  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  throw new Error("[Express-Führerschein] AUTH_PUBLIC_ORIGIN fehlt in Produktion.");
}

export function getOAuthCallbackUrl(
  provider: OAuthProviderName,
  request?: Request,
): string {
  return new URL(
    `/api/auth/oauth/${provider}/callback`,
    getAuthPublicOrigin(request),
  ).toString();
}

export function sanitizeReturnPath(
  value: string | null | undefined,
  fallback = "/",
): string {
  if (!value) return fallback;

  const candidate = value.trim();
  if (
    candidate.length === 0 ||
    candidate.length > 2048 ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(candidate)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate, "https://internal.invalid");
    if (parsed.origin !== "https://internal.invalid") return fallback;
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}
