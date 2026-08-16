import type {
  AdminCustomersQuery,
} from "@/types/admin-customers";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function firstValue(
  value: string | string[] | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function positiveInteger(
  value: string,
  fallback: number,
  maximum: number,
): number {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, maximum);
}

function safeText(
  value: string,
  maxLength: number,
): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .slice(0, maxLength)
    .trim();
}

export function isAdminCustomerUuid(
  value: string,
): boolean {
  return UUID_RE.test(value.trim());
}

export function parseAdminCustomersQuery(
  input:
    | Record<string, string | string[] | undefined>
    | URLSearchParams,
): AdminCustomersQuery {
  const source =
    input instanceof URLSearchParams
      ? Object.fromEntries(input.entries())
      : input;

  const page = positiveInteger(
    firstValue(source.page),
    1,
    1_000_000,
  );

  const pageSize = positiveInteger(
    firstValue(source.pageSize),
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
  );

  const country = safeText(
    firstValue(source.country).toUpperCase(),
    2,
  );

  return {
    page,
    pageSize,
    search: safeText(firstValue(source.search), 120),
    country:
      country.length === 2
        ? country
        : "",
    accountStatus: safeText(
      firstValue(source.accountStatus),
      32,
    ),
    licenseClass: safeText(
      firstValue(source.licenseClass).toUpperCase(),
      8,
    ),
    applicationStatus: safeText(
      firstValue(source.applicationStatus),
      32,
    ),
  };
}
