/**
 * Express-Führerschein
 * Client IP extraction.
 *
 * Proxy headers are trustworthy only when the production host/CDN overwrites
 * them. The deployment configuration remains the trust boundary.
 */

export interface ClientIpResult {
  ip: string | null;
  source:
    | "cf-connecting-ip"
    | "x-vercel-forwarded-for"
    | "x-forwarded-for"
    | "x-real-ip"
    | "forwarded"
    | "none";
}

function sanitizeIpCandidate(value: string | null): string | null {
  if (!value) return null;

  let candidate = value.trim().replace(/^"|"$/g, "");

  if (candidate.startsWith("[") && candidate.includes("]")) {
    candidate = candidate.slice(1, candidate.indexOf("]"));
  } else if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(candidate)) {
    candidate = candidate.split(":")[0] ?? "";
  }

  if (
    candidate.length === 0 ||
    candidate.length > 64 ||
    /[\s,;]/.test(candidate) ||
    !/^[0-9a-fA-F:.]+$/.test(candidate)
  ) {
    return null;
  }

  return candidate;
}

function firstForwardedFor(value: string | null): string | null {
  if (!value) return null;
  return sanitizeIpCandidate(value.split(",")[0]?.trim() ?? null);
}

function parseForwardedHeader(value: string | null): string | null {
  if (!value) return null;

  const firstEntry = value.split(",")[0] ?? "";
  const forPart = firstEntry
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.toLowerCase().startsWith("for="));

  if (!forPart) return null;

  const raw = forPart.slice(4).trim();

  if (raw.toLowerCase() === "unknown" || raw.startsWith("_")) {
    return null;
  }

  return sanitizeIpCandidate(raw);
}

export function getClientIp(headers: Headers): ClientIpResult {
  const cloudflare = sanitizeIpCandidate(headers.get("cf-connecting-ip"));
  if (cloudflare) return { ip: cloudflare, source: "cf-connecting-ip" };

  const vercel = firstForwardedFor(headers.get("x-vercel-forwarded-for"));
  if (vercel) return { ip: vercel, source: "x-vercel-forwarded-for" };

  const forwardedFor = firstForwardedFor(headers.get("x-forwarded-for"));
  if (forwardedFor) return { ip: forwardedFor, source: "x-forwarded-for" };

  const realIp = sanitizeIpCandidate(headers.get("x-real-ip"));
  if (realIp) return { ip: realIp, source: "x-real-ip" };

  const forwarded = parseForwardedHeader(headers.get("forwarded"));
  if (forwarded) return { ip: forwarded, source: "forwarded" };

  return { ip: null, source: "none" };
}

export function anonymizeIp(ip: string | null): string | null {
  if (!ip) return null;

  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }

  if (ip.includes(":")) {
    return `${ip.split(":").slice(0, 4).join(":")}::`;
  }

  return null;
}
