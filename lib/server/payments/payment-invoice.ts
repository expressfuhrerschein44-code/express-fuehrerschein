/**
 * Express-Führerschein
 * Payment invoice service.
 *
 * Responsibilities:
 * - authenticate the client;
 * - verify payment ownership;
 * - allow invoices only for confirmed payments;
 * - load invoice data from PostgreSQL through Prisma;
 * - generate a deterministic PDF invoice;
 * - never trust userId / amount / status received from the browser.
 */

import "server-only";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  prisma,
} from "@/lib/server/prisma";

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

const PDF_MIME_TYPE =
  "application/pdf" as const;

const A4_WIDTH = 595;
const A4_HEIGHT = 842;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/* ==========================================================================
   ERROR TYPES
   ========================================================================== */

export type PaymentInvoiceErrorCode =
  | "UNAUTHENTICATED"
  | "INVALID_PAYMENT_ID"
  | "PAYMENT_NOT_FOUND"
  | "INVOICE_NOT_AVAILABLE"
  | "PAYMENT_DATE_MISSING"
  | "INVALID_PAYMENT_AMOUNT"
  | "INVOICE_GENERATION_FAILED";

export class PaymentInvoiceError extends Error {
  readonly code:
    PaymentInvoiceErrorCode;

  readonly status:
    number;

  constructor(
    code:
      PaymentInvoiceErrorCode,
    message:
      string,
    status:
      number,
  ) {
    super(message);

    this.name =
      "PaymentInvoiceError";

    this.code =
      code;

    this.status =
      status;
  }
}

/* ==========================================================================
   PUBLIC TYPES
   ========================================================================== */

export interface PaymentInvoiceIssuer {
  name:
    string;

  addressLines:
    string[];

  email:
    string | null;

  website:
    string | null;

  taxNumber:
    string | null;

  vatId:
    string | null;
}

export interface PaymentInvoiceCustomer {
  name:
    string;

  email:
    string;

  countryCode:
    string;
}

export interface PaymentInvoiceApplication {
  id:
    string | null;

  licenseClasses:
    string[];
}

export interface PaymentInvoicePayment {
  id:
    string;

  stage:
    string;

  reference:
    string;

  description:
    string | null;

  amountCents:
    number;

  currency:
    string;

  paidAt:
    Date;
}

export interface PaymentInvoiceData {
  invoiceNumber:
    string;

  invoiceDate:
    string;

  paymentDate:
    string;

  issuer:
    PaymentInvoiceIssuer;

  customer:
    PaymentInvoiceCustomer;

  application:
    PaymentInvoiceApplication;

  payment:
    PaymentInvoicePayment;
}

export interface GeneratedPaymentInvoice {
  paymentId:
    string;

  invoiceNumber:
    string;

  filename:
    string;

  mimeType:
    typeof PDF_MIME_TYPE;

  buffer:
    Buffer;

  paidAt:
    Date;

  amountCents:
    number;

  currency:
    string;
}

/* ==========================================================================
   INTERNAL DATABASE TYPE
   ========================================================================== */

type PaymentInvoiceDatabaseRow = {
  id:
    string;

  user_id:
    string;

  application_id:
    string | null;

  payment_stage:
    string | null;

  payment_reference:
    string | null;

  amount_cents:
    number;

  currency:
    string;

  status:
    string;

  description:
    string | null;

  paid_at:
    Date | null;

  users: {
    first_name:
      string;

    last_name:
      string;

    email:
      string;

    country_code:
      string;
  };

  application: {
    id:
      string;

    selected_classes:
      string[];
  } | null;
};

/* ==========================================================================
   BASIC HELPERS
   ========================================================================== */

function normalizeText(
  value:
    | string
    | null
    | undefined,
): string {
  return value?.trim() ?? "";
}

function optionalEnvironmentValue(
  name:
    string,
): string | null {
  const value =
    process.env[name]
      ?.trim();

  return value
    ? value
    : null;
}

function assertPaymentId(
  paymentId:
    string,
): string {
  const normalized =
    normalizeText(
      paymentId,
    );

  if (
    !normalized ||
    !UUID_PATTERN.test(
      normalized,
    )
  ) {
    throw new PaymentInvoiceError(
      "INVALID_PAYMENT_ID",
      "Die Zahlungs-ID ist ungültig.",
      400,
    );
  }

  return normalized;
}

/* ==========================================================================
   ISSUER
   ========================================================================== */

/**
 * Optional .env.local values:
 *
 * INVOICE_ISSUER_NAME=
 * INVOICE_ISSUER_ADDRESS_LINE_1=
 * INVOICE_ISSUER_ADDRESS_LINE_2=
 * INVOICE_ISSUER_POSTAL_CODE=
 * INVOICE_ISSUER_CITY=
 * INVOICE_ISSUER_COUNTRY=
 * INVOICE_ISSUER_EMAIL=
 * INVOICE_ISSUER_WEBSITE=
 * INVOICE_ISSUER_TAX_NUMBER=
 * INVOICE_ISSUER_VAT_ID=
 */
export function getPaymentInvoiceIssuer():
  PaymentInvoiceIssuer {
  const addressLine1 =
    optionalEnvironmentValue(
      "INVOICE_ISSUER_ADDRESS_LINE_1",
    );

  const addressLine2 =
    optionalEnvironmentValue(
      "INVOICE_ISSUER_ADDRESS_LINE_2",
    );

  const postalCode =
    optionalEnvironmentValue(
      "INVOICE_ISSUER_POSTAL_CODE",
    );

  const city =
    optionalEnvironmentValue(
      "INVOICE_ISSUER_CITY",
    );

  const country =
    optionalEnvironmentValue(
      "INVOICE_ISSUER_COUNTRY",
    );

  const postalCity =
    [
      postalCode,
      city,
    ]
      .filter(Boolean)
      .join(" ");

  return {
    name:
      optionalEnvironmentValue(
        "INVOICE_ISSUER_NAME",
      ) ??
      "Express-Führerschein",

    addressLines: [
      addressLine1,
      addressLine2,
      postalCity ||
        null,
      country,
    ].filter(
      (
        value,
      ): value is string =>
        Boolean(value),
    ),

    email:
      optionalEnvironmentValue(
        "INVOICE_ISSUER_EMAIL",
      ),

    website:
      optionalEnvironmentValue(
        "INVOICE_ISSUER_WEBSITE",
      ),

    taxNumber:
      optionalEnvironmentValue(
        "INVOICE_ISSUER_TAX_NUMBER",
      ),

    vatId:
      optionalEnvironmentValue(
        "INVOICE_ISSUER_VAT_ID",
      ),
  };
}

/* ==========================================================================
   DATE / MONEY
   ========================================================================== */

function formatGermanDate(
  value:
    Date,
): string {
  try {
    return new Intl.DateTimeFormat(
      "de-DE",
      {
        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric",

        timeZone:
          "Europe/Berlin",
      },
    ).format(
      value,
    );
  } catch {
    return [
      String(
        value.getUTCDate(),
      ).padStart(
        2,
        "0",
      ),

      String(
        value.getUTCMonth() +
          1,
      ).padStart(
        2,
        "0",
      ),

      String(
        value.getUTCFullYear(),
      ),
    ].join(".");
  }
}

function formatInvoiceMoney(
  amountCents:
    number,
  currency:
    string,
): string {
  const safeCurrency =
    normalizeText(
      currency,
    ).toUpperCase() ||
    "EUR";

  const amount =
    amountCents /
    100;

  try {
    return new Intl.NumberFormat(
      "de-DE",
      {
        style:
          "currency",

        currency:
          safeCurrency,

        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      },
    ).format(
      amount,
    );
  } catch {
    return `${amount.toFixed(
      2,
    )} ${safeCurrency}`;
  }
}

/* ==========================================================================
   INVOICE NUMBER
   ========================================================================== */

export function createPaymentInvoiceNumber(
  paymentId:
    string,
  paidAt:
    Date,
): string {
  const year =
    paidAt.getUTCFullYear();

  const normalizedPaymentId =
    paymentId
      .replace(
        /[^A-Za-z0-9]/g,
        "",
      )
      .toUpperCase();

  return [
    "EF",
    String(year),
    normalizedPaymentId,
  ].join("-");
}

function createInvoiceFilename(
  invoiceNumber:
    string,
): string {
  const safe =
    invoiceNumber
      .replace(
        /[^A-Za-z0-9._-]/g,
        "-",
      )
      .replace(
        /-+/g,
        "-",
      );

  return `rechnung-${safe}.pdf`;
}

/* ==========================================================================
   PAYMENT LABEL
   ========================================================================== */

function resolvePaymentStage(
  payment:
    Pick<
      PaymentInvoiceDatabaseRow,
      | "payment_stage"
      | "description"
    >,
): string {
  const stage =
    normalizeText(
      payment.payment_stage,
    );

  if (stage) {
    return stage;
  }

  const description =
    normalizeText(
      payment.description,
    );

  if (description) {
    return description;
  }

  return "Führerscheinzahlung";
}

/* ==========================================================================
   DATABASE
   ========================================================================== */

async function findPaymentForInvoice(
  paymentId:
    string,
  userId:
    string,
): Promise<
  PaymentInvoiceDatabaseRow | null
> {
  return prisma.payments.findFirst({
    where: {
      id:
        paymentId,

      user_id:
        userId,
    },

    select: {
      id:
        true,

      user_id:
        true,

      application_id:
        true,

      payment_stage:
        true,

      payment_reference:
        true,

      amount_cents:
        true,

      currency:
        true,

      status:
        true,

      description:
        true,

      paid_at:
        true,

      users: {
        select: {
          first_name:
            true,

          last_name:
            true,

          email:
            true,

          country_code:
            true,
        },
      },

      application: {
        select: {
          id:
            true,

          selected_classes:
            true,
        },
      },
    },
  });
}

/* ==========================================================================
   PAYMENT VALIDATION
   ========================================================================== */

function assertInvoiceAvailable(
  payment:
    PaymentInvoiceDatabaseRow,
): asserts payment is
  PaymentInvoiceDatabaseRow & {
    paid_at: Date;
  } {
  if (
    payment.status !==
    "paid"
  ) {
    throw new PaymentInvoiceError(
      "INVOICE_NOT_AVAILABLE",
      "Die Rechnung ist erst verfügbar, nachdem die Zahlung bestätigt wurde.",
      409,
    );
  }

  if (
    !payment.paid_at
  ) {
    throw new PaymentInvoiceError(
      "PAYMENT_DATE_MISSING",
      "Für diese bestätigte Zahlung fehlt das Zahlungsdatum.",
      409,
    );
  }

  if (
    !Number.isSafeInteger(
      payment.amount_cents,
    ) ||
    payment.amount_cents <=
      0
  ) {
    throw new PaymentInvoiceError(
      "INVALID_PAYMENT_AMOUNT",
      "Der gespeicherte Zahlungsbetrag ist ungültig.",
      500,
    );
  }
}

/* ==========================================================================
   DATA MAPPER
   ========================================================================== */

function buildInvoiceData(
  payment:
    PaymentInvoiceDatabaseRow & {
      paid_at:
        Date;
    },
): PaymentInvoiceData {
  const firstName =
    normalizeText(
      payment.users
        .first_name,
    );

  const lastName =
    normalizeText(
      payment.users
        .last_name,
    );

  const customerName =
    [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Kunde";

  const paymentReference =
    normalizeText(
      payment.payment_reference,
    ) ||
    payment.id;

  const currency =
    normalizeText(
      payment.currency,
    ).toUpperCase() ||
    "EUR";

  const invoiceNumber =
    createPaymentInvoiceNumber(
      payment.id,
      payment.paid_at,
    );

  return {
    invoiceNumber,

    invoiceDate:
      formatGermanDate(
        payment.paid_at,
      ),

    paymentDate:
      formatGermanDate(
        payment.paid_at,
      ),

    issuer:
      getPaymentInvoiceIssuer(),

    customer: {
      name:
        customerName,

      email:
        payment.users
          .email,

      countryCode:
        normalizeText(
          payment.users
            .country_code,
        ).toUpperCase(),
    },

    application: {
      id:
        payment.application
          ?.id ??
        null,

      licenseClasses:
        payment.application
          ?.selected_classes ??
        [],
    },

    payment: {
      id:
        payment.id,

      stage:
        resolvePaymentStage(
          payment,
        ),

      reference:
        paymentReference,

      description:
        payment.description,

      amountCents:
        payment.amount_cents,

      currency,

      paidAt:
        payment.paid_at,
    },
  };
}

/* ==========================================================================
   PDF STRING HELPERS
   ========================================================================== */

function normalizePdfText(
  value:
    string,
): string {
  return value
    .replace(
      /\u00A0/g,
      " ",
    )
    .replace(
      /[–—]/g,
      "-",
    )
    .replace(
      /[‘’]/g,
      "'",
    )
    .replace(
      /[“”]/g,
      '"',
    )
    .replace(
      /…/g,
      "...",
    )
    .replace(
      /€/g,
      "EUR",
    )
    .replace(
      /[^\x20-\x7E\xA0-\xFF]/g,
      "?",
    );
}

function escapePdfText(
  value:
    string,
): string {
  return normalizePdfText(
    value,
  )
    .replace(
      /\\/g,
      "\\\\",
    )
    .replace(
      /\(/g,
      "\\(",
    )
    .replace(
      /\)/g,
      "\\)",
    );
}

function wrapPdfText(
  value:
    string,
  maxCharacters:
    number,
): string[] {
  const normalized =
    normalizePdfText(
      value,
    ).trim();

  if (!normalized) {
    return [];
  }

  const words =
    normalized.split(
      /\s+/,
    );

  const lines:
    string[] = [];

  let currentLine =
    "";

  for (
    const word
    of words
  ) {
    const candidate =
      currentLine
        ? `${currentLine} ${word}`
        : word;

    if (
      candidate.length <=
      maxCharacters
    ) {
      currentLine =
        candidate;

      continue;
    }

    if (
      currentLine
    ) {
      lines.push(
        currentLine,
      );
    }

    /*
     * Very long unbroken values such as UUIDs are accepted
     * on their own line rather than being silently truncated.
     */
    currentLine =
      word;
  }

  if (
    currentLine
  ) {
    lines.push(
      currentLine,
    );
  }

  return lines;
}

/* ==========================================================================
   PDF DRAWING
   ========================================================================== */

type PdfRgb = readonly [
  number,
  number,
  number,
];

function drawText(
  commands:
    string[],
  options: {
    x:
      number;

    y:
      number;

    size:
      number;

    value:
      string;

    bold?:
      boolean;

    color?:
      PdfRgb;
  },
): void {
  const {
    x,
    y,
    size,
    value,
    bold = false,
    color = [
      0.04,
      0.08,
      0.14,
    ],
  } =
    options;

  const font =
    bold
      ? "F2"
      : "F1";

  commands.push(
    "BT",

    `${color[0]} ${color[1]} ${color[2]} rg`,

    `/${font} ${size} Tf`,

    `1 0 0 1 ${x} ${y} Tm`,

    `(${escapePdfText(
      value,
    )}) Tj`,

    "ET",
  );
}

function drawLine(
  commands:
    string[],
  options: {
    x1:
      number;

    y1:
      number;

    x2:
      number;

    y2:
      number;

    width?:
      number;

    color?:
      PdfRgb;
  },
): void {
  const {
    x1,
    y1,
    x2,
    y2,
    width = 0.7,
    color = [
      0.85,
      0.88,
      0.92,
    ],
  } =
    options;

  commands.push(
    `${color[0]} ${color[1]} ${color[2]} RG`,

    `${width} w`,

    `${x1} ${y1} m`,

    `${x2} ${y2} l`,

    "S",
  );
}

function drawRectangle(
  commands:
    string[],
  options: {
    x:
      number;

    y:
      number;

    width:
      number;

    height:
      number;

    color:
      PdfRgb;
  },
): void {
  const {
    x,
    y,
    width,
    height,
    color,
  } =
    options;

  commands.push(
    `${color[0]} ${color[1]} ${color[2]} rg`,

    `${x} ${y} ${width} ${height} re`,

    "f",
  );
}

/* ==========================================================================
   PDF DOCUMENT
   ========================================================================== */

export function generatePaymentInvoicePdf(
  invoice:
    PaymentInvoiceData,
): Buffer {
  const commands:
    string[] = [];

  /* ------------------------------------------------------------------------
     PAGE
     ---------------------------------------------------------------------- */

  drawRectangle(
    commands,
    {
      x: 0,
      y: 0,
      width:
        A4_WIDTH,
      height:
        A4_HEIGHT,
      color: [
        1,
        1,
        1,
      ],
    },
  );

  /* ------------------------------------------------------------------------
     BRAND STRIPE
     ---------------------------------------------------------------------- */

  drawRectangle(
    commands,
    {
      x: 0,
      y: 828,
      width:
        A4_WIDTH,
      height: 14,
      color: [
        0.02,
        0.28,
        0.92,
      ],
    },
  );

  /* ------------------------------------------------------------------------
     HEADER
     ---------------------------------------------------------------------- */

  drawText(
    commands,
    {
      x: 44,
      y: 786,
      size: 18,
      value:
        invoice.issuer
          .name,
      bold: true,
    },
  );

  drawText(
    commands,
    {
      x: 424,
      y: 786,
      size: 19,
      value:
        "RECHNUNG",
      bold: true,
      color: [
        0.02,
        0.35,
        0.95,
      ],
    },
  );

  drawText(
    commands,
    {
      x: 44,
      y: 765,
      size: 8.5,
      value:
        "Zahlungsbestätigung",
      color: [
        0.4,
        0.46,
        0.55,
      ],
    },
  );

  drawLine(
    commands,
    {
      x1: 44,
      y1: 744,
      x2: 551,
      y2: 744,
    },
  );

  /* ------------------------------------------------------------------------
     ISSUER
     ---------------------------------------------------------------------- */

  drawText(
    commands,
    {
      x: 44,
      y: 717,
      size: 8,
      value:
        "RECHNUNGSSTELLER",
      bold: true,
      color: [
        0.38,
        0.45,
        0.55,
      ],
    },
  );

  let issuerY =
    697;

  drawText(
    commands,
    {
      x: 44,
      y:
        issuerY,
      size: 10,
      value:
        invoice.issuer
          .name,
      bold: true,
    },
  );

  issuerY -= 15;

  for (
    const line
    of invoice.issuer
      .addressLines
  ) {
    drawText(
      commands,
      {
        x: 44,
        y:
          issuerY,
        size: 8.5,
        value:
          line,
      },
    );

    issuerY -= 13;
  }

  if (
    invoice.issuer
      .email
  ) {
    drawText(
      commands,
      {
        x: 44,
        y:
          issuerY,
        size: 8.5,
        value:
          invoice.issuer
            .email,
      },
    );

    issuerY -= 13;
  }

  if (
    invoice.issuer
      .website
  ) {
    drawText(
      commands,
      {
        x: 44,
        y:
          issuerY,
        size: 8.5,
        value:
          invoice.issuer
            .website,
      },
    );

    issuerY -= 13;
  }

  if (
    invoice.issuer
      .taxNumber
  ) {
    drawText(
      commands,
      {
        x: 44,
        y:
          issuerY,
        size: 8,
        value:
          `Steuernummer: ${invoice.issuer.taxNumber}`,
      },
    );

    issuerY -= 13;
  }

  if (
    invoice.issuer
      .vatId
  ) {
    drawText(
      commands,
      {
        x: 44,
        y:
          issuerY,
        size: 8,
        value:
          `USt-IdNr.: ${invoice.issuer.vatId}`,
      },
    );
  }

  /* ------------------------------------------------------------------------
     CUSTOMER
     ---------------------------------------------------------------------- */

  drawText(
    commands,
    {
      x: 316,
      y: 717,
      size: 8,
      value:
        "RECHNUNGSEMPFÄNGER",
      bold: true,
      color: [
        0.38,
        0.45,
        0.55,
      ],
    },
  );

  drawText(
    commands,
    {
      x: 316,
      y: 697,
      size: 10,
      value:
        invoice.customer
          .name,
      bold: true,
    },
  );

  drawText(
    commands,
    {
      x: 316,
      y: 682,
      size: 8.5,
      value:
        invoice.customer
          .email,
    },
  );

  if (
    invoice.customer
      .countryCode
  ) {
    drawText(
      commands,
      {
        x: 316,
        y: 667,
        size: 8.5,
        value:
          `Land: ${invoice.customer.countryCode}`,
      },
    );
  }

  /* ------------------------------------------------------------------------
     META BLOCK
     ---------------------------------------------------------------------- */

  drawRectangle(
    commands,
    {
      x: 44,
      y: 542,
      width: 507,
      height: 84,
      color: [
        0.965,
        0.975,
        0.99,
      ],
    },
  );

  drawText(
    commands,
    {
      x: 58,
      y: 602,
      size: 8,
      value:
        "Rechnungsnummer",
      bold: true,
      color: [
        0.38,
        0.45,
        0.55,
      ],
    },
  );

  drawText(
    commands,
    {
      x: 58,
      y: 585,
      size: 7.6,
      value:
        invoice.invoiceNumber,
      bold: true,
    },
  );

  drawText(
    commands,
    {
      x: 330,
      y: 602,
      size: 8,
      value:
        "Rechnungsdatum",
      bold: true,
      color: [
        0.38,
        0.45,
        0.55,
      ],
    },
  );

  drawText(
    commands,
    {
      x: 330,
      y: 585,
      size: 8.5,
      value:
        invoice.invoiceDate,
      bold: true,
    },
  );

  drawText(
    commands,
    {
      x: 58,
      y: 560,
      size: 8,
      value:
        "Zahlungsreferenz",
      bold: true,
      color: [
        0.38,
        0.45,
        0.55,
      ],
    },
  );

  const paymentReference =
    wrapPdfText(
      invoice.payment
        .reference,
      42,
    )[0] ??
    invoice.payment
      .reference;

  drawText(
    commands,
    {
      x: 168,
      y: 560,
      size: 7.5,
      value:
        paymentReference,
    },
  );

  drawText(
    commands,
    {
      x: 330,
      y: 560,
      size: 8,
      value:
        "Zahlungsdatum",
      bold: true,
      color: [
        0.38,
        0.45,
        0.55,
      ],
    },
  );

  drawText(
    commands,
    {
      x: 430,
      y: 560,
      size: 8,
      value:
        invoice.paymentDate,
    },
  );

  /* ------------------------------------------------------------------------
     APPLICATION
     ---------------------------------------------------------------------- */

  drawText(
    commands,
    {
      x: 44,
      y: 507,
      size: 8,
      value:
        "FÜHRERSCHEINANTRAG",
      bold: true,
      color: [
        0.02,
        0.35,
        0.95,
      ],
    },
  );

  const classLabel =
    invoice.application
      .licenseClasses.length >
    0
      ? invoice.application
          .licenseClasses
          .join(", ")
      : "-";

  drawText(
    commands,
    {
      x: 44,
      y: 486,
      size: 9,
      value:
        `Führerscheinklasse: ${classLabel}`,
      bold: true,
    },
  );

  /* ------------------------------------------------------------------------
     TABLE HEADER
     ---------------------------------------------------------------------- */

  drawRectangle(
    commands,
    {
      x: 44,
      y: 432,
      width: 507,
      height: 32,
      color: [
        0.025,
        0.085,
        0.16,
      ],
    },
  );

  drawText(
    commands,
    {
      x: 58,
      y: 443,
      size: 8,
      value:
        "Beschreibung",
      bold: true,
      color: [
        1,
        1,
        1,
      ],
    },
  );

  drawText(
    commands,
    {
      x: 443,
      y: 443,
      size: 8,
      value:
        "Betrag",
      bold: true,
      color: [
        1,
        1,
        1,
      ],
    },
  );

  /* ------------------------------------------------------------------------
     PAYMENT
     ---------------------------------------------------------------------- */

  const stageLines =
    wrapPdfText(
      invoice.payment
        .stage,
      48,
    );

  let stageY =
    405;

  for (
    const [
      index,
      line,
    ]
    of stageLines
      .slice(
        0,
        3,
      )
      .entries()
  ) {
    drawText(
      commands,
      {
        x: 58,
        y:
          stageY,
        size:
          index === 0
            ? 10
            : 8.2,
        value:
          line,
        bold:
          index === 0,
      },
    );

    stageY -= 14;
  }

  const description =
    normalizeText(
      invoice.payment
        .description,
    );

  if (
    description &&
    description !==
      normalizeText(
        invoice.payment
          .stage,
      )
  ) {
    const descriptionLines =
      wrapPdfText(
        description,
        55,
      );

    for (
      const line
      of descriptionLines.slice(
        0,
        2,
      )
    ) {
      drawText(
        commands,
        {
          x: 58,
          y:
            stageY,
          size: 7.5,
          value:
            line,
          color: [
            0.4,
            0.46,
            0.55,
          ],
        },
      );

      stageY -= 12;
    }
  }

  drawText(
    commands,
    {
      x: 425,
      y: 405,
      size: 10,
      value:
        formatInvoiceMoney(
          invoice.payment
            .amountCents,
          invoice.payment
            .currency,
        ),
      bold: true,
    },
  );

  drawLine(
    commands,
    {
      x1: 44,
      y1: 356,
      x2: 551,
      y2: 356,
    },
  );

  /* ------------------------------------------------------------------------
     TOTAL
     ---------------------------------------------------------------------- */

  drawText(
    commands,
    {
      x: 345,
      y: 325,
      size: 10,
      value:
        "Gesamtbetrag",
      bold: true,
    },
  );

  drawText(
    commands,
    {
      x: 425,
      y: 325,
      size: 11,
      value:
        formatInvoiceMoney(
          invoice.payment
            .amountCents,
          invoice.payment
            .currency,
        ),
      bold: true,
      color: [
        0.02,
        0.35,
        0.95,
      ],
    },
  );

  /* ------------------------------------------------------------------------
     CONFIRMED PAYMENT BOX
     ---------------------------------------------------------------------- */

  drawRectangle(
    commands,
    {
      x: 44,
      y: 243,
      width: 507,
      height: 53,
      color: [
        0.94,
        0.985,
        0.955,
      ],
    },
  );

  drawText(
    commands,
    {
      x: 58,
      y: 275,
      size: 10,
      value:
        "Zahlung bestätigt",
      bold: true,
      color: [
        0.03,
        0.42,
        0.22,
      ],
    },
  );

  drawText(
    commands,
    {
      x: 58,
      y: 257,
      size: 8,
      value:
        `Der Zahlungseingang wurde am ${invoice.paymentDate} bestätigt.`,
      color: [
        0.18,
        0.3,
        0.23,
      ],
    },
  );

  /* ------------------------------------------------------------------------
     PAYMENT ID
     ---------------------------------------------------------------------- */

  drawText(
    commands,
    {
      x: 44,
      y: 203,
      size: 7,
      value:
        `Zahlungs-ID: ${invoice.payment.id}`,
      color: [
        0.45,
        0.5,
        0.58,
      ],
    },
  );

  /* ------------------------------------------------------------------------
     FOOTER
     ---------------------------------------------------------------------- */

  drawLine(
    commands,
    {
      x1: 44,
      y1: 100,
      x2: 551,
      y2: 100,
    },
  );

  drawText(
    commands,
    {
      x: 44,
      y: 78,
      size: 8,
      value:
        "Vielen Dank für deine Zahlung.",
      bold: true,
    },
  );

  drawText(
    commands,
    {
      x: 44,
      y: 60,
      size: 7,
      value:
        "Dieses Dokument wurde elektronisch erstellt.",
      color: [
        0.45,
        0.5,
        0.58,
      ],
    },
  );

  /* ------------------------------------------------------------------------
     STREAM
     ---------------------------------------------------------------------- */

  const contentStream =
    commands.join(
      "\n",
    );

  const contentBuffer =
    Buffer.from(
      contentStream,
      "latin1",
    );

  /* ------------------------------------------------------------------------
     PDF OBJECTS
     ---------------------------------------------------------------------- */

  const objects =
    new Map<
      number,
      Buffer
    >();

  objects.set(
    1,
    Buffer.from(
      [
        "1 0 obj",
        "<< /Type /Catalog /Pages 2 0 R >>",
        "endobj",
        "",
      ].join("\n"),
      "latin1",
    ),
  );

  objects.set(
    2,
    Buffer.from(
      [
        "2 0 obj",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "endobj",
        "",
      ].join("\n"),
      "latin1",
    ),
  );

  objects.set(
    3,
    Buffer.from(
      [
        "3 0 obj",
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_WIDTH} ${A4_HEIGHT}]`,
        "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >>",
        "/Contents 6 0 R >>",
        "endobj",
        "",
      ].join("\n"),
      "latin1",
    ),
  );

  objects.set(
    4,
    Buffer.from(
      [
        "4 0 obj",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
        "endobj",
        "",
      ].join("\n"),
      "latin1",
    ),
  );

  objects.set(
    5,
    Buffer.from(
      [
        "5 0 obj",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
        "endobj",
        "",
      ].join("\n"),
      "latin1",
    ),
  );

  objects.set(
    6,
    Buffer.concat([
      Buffer.from(
        [
          "6 0 obj",
          `<< /Length ${contentBuffer.length} >>`,
          "stream",
          "",
        ].join("\n"),
        "latin1",
      ),

      contentBuffer,

      Buffer.from(
        [
          "",
          "endstream",
          "endobj",
          "",
        ].join("\n"),
        "latin1",
      ),
    ]),
  );

  objects.set(
    7,
    Buffer.from(
      [
        "7 0 obj",
        "<<",
        `/Title (${escapePdfText(
          `Rechnung ${invoice.invoiceNumber}`,
        )})`,
        `/Author (${escapePdfText(
          invoice.issuer
            .name,
        )})`,
        `/Subject (${escapePdfText(
          "Express-Führerschein Rechnung",
        )})`,
        `/Creator (${escapePdfText(
          "Express-Führerschein",
        )})`,
        ">>",
        "endobj",
        "",
      ].join("\n"),
      "latin1",
    ),
  );

  /* ------------------------------------------------------------------------
     HEADER
     ---------------------------------------------------------------------- */

  const header =
    Buffer.from(
      "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n",
      "latin1",
    );

  const output:
    Buffer[] = [
      header,
    ];

  const offsets:
    number[] = [
      0,
    ];

  let offset =
    header.length;

  for (
    let objectId = 1;
    objectId <= 7;
    objectId += 1
  ) {
    const object =
      objects.get(
        objectId,
      );

    if (!object) {
      throw new PaymentInvoiceError(
        "INVOICE_GENERATION_FAILED",
        `PDF object ${objectId} is missing.`,
        500,
      );
    }

    offsets[
      objectId
    ] =
      offset;

    output.push(
      object,
    );

    offset +=
      object.length;
  }

  /* ------------------------------------------------------------------------
     CROSS REFERENCE TABLE
     ---------------------------------------------------------------------- */

  const xrefOffset =
    offset;

  const xrefLines:
    string[] = [
      "xref",
      "0 8",
      "0000000000 65535 f ",
    ];

  for (
    let objectId = 1;
    objectId <= 7;
    objectId += 1
  ) {
    xrefLines.push(
      `${String(
        offsets[
          objectId
        ],
      ).padStart(
        10,
        "0",
      )} 00000 n `,
    );
  }

  const trailer =
    Buffer.from(
      [
        ...xrefLines,

        "trailer",

        "<< /Size 8 /Root 1 0 R /Info 7 0 R >>",

        "startxref",

        String(
          xrefOffset,
        ),

        "%%EOF",

        "",
      ].join("\n"),
      "latin1",
    );

  output.push(
    trailer,
  );

  return Buffer.concat(
    output,
  );
}

/* ==========================================================================
   GENERATE INVOICE FOR A SPECIFIC USER
   ========================================================================== */

/**
 * Internal/server-safe function.
 *
 * `userId` must come from trusted server-side code.
 * Never pass a userId supplied by the browser.
 */
export async function generatePaymentInvoiceForUser(
  input: {
    paymentId:
      string;

    userId:
      string;
  },
): Promise<GeneratedPaymentInvoice> {
  const paymentId =
    assertPaymentId(
      input.paymentId,
    );

  const userId =
    normalizeText(
      input.userId,
    );

  if (!userId) {
    throw new PaymentInvoiceError(
      "UNAUTHENTICATED",
      "Die Kundensitzung ist ungültig.",
      401,
    );
  }

  const payment =
    await findPaymentForInvoice(
      paymentId,
      userId,
    );

  if (!payment) {
    throw new PaymentInvoiceError(
      "PAYMENT_NOT_FOUND",
      "Die Zahlung wurde nicht gefunden.",
      404,
    );
  }

  assertInvoiceAvailable(
    payment,
  );

  const invoiceData =
    buildInvoiceData(
      payment,
    );

  let buffer:
    Buffer;

  try {
    buffer =
      generatePaymentInvoicePdf(
        invoiceData,
      );
  } catch (error) {
    if (
      error instanceof
      PaymentInvoiceError
    ) {
      throw error;
    }

    console.error(
      "[PAYMENT_INVOICE_PDF_GENERATION_ERROR]",
      {
        paymentId:
          payment.id,

        userId,

        error:
          error instanceof
          Error
            ? {
                name:
                  error.name,

                message:
                  error.message,

                stack:
                  process.env.NODE_ENV ===
                  "development"
                    ? error.stack
                    : undefined,
              }
            : error,
      },
    );

    throw new PaymentInvoiceError(
      "INVOICE_GENERATION_FAILED",
      "Die Rechnung konnte derzeit nicht erstellt werden.",
      500,
    );
  }

  const filename =
    createInvoiceFilename(
      invoiceData
        .invoiceNumber,
    );

  return {
    paymentId:
      payment.id,

    invoiceNumber:
      invoiceData
        .invoiceNumber,

    filename,

    mimeType:
      PDF_MIME_TYPE,

    buffer,

    paidAt:
      payment.paid_at,

    amountCents:
      payment.amount_cents,

    currency:
      payment.currency,
  };
}

/* ==========================================================================
   CURRENT CLIENT INVOICE
   ========================================================================== */

/**
 * Main function intended for:
 *
 * GET /api/payments/[paymentId]/invoice
 *
 * Security:
 * browser paymentId
 *        ↓
 * current authenticated client
 *        ↓
 * payments.id = paymentId
 * AND payments.user_id = session.user.id
 *        ↓
 * status must be "paid"
 *        ↓
 * PDF
 */
export async function generateCurrentClientPaymentInvoice(
  paymentId:
    string,
): Promise<GeneratedPaymentInvoice> {
  let userId:
    string;

  try {
    const session =
      await requireClientSession();

    userId =
      session.user.id;
  } catch {
    throw new PaymentInvoiceError(
      "UNAUTHENTICATED",
      "Bitte melde dich an, um deine Rechnung herunterzuladen.",
      401,
    );
  }

  try {
    return await generatePaymentInvoiceForUser({
      paymentId,
      userId,
    });
  } catch (error) {
    if (
      error instanceof
      PaymentInvoiceError
    ) {
      throw error;
    }

    console.error(
      "[PAYMENT_INVOICE_SERVICE_ERROR]",
      {
        paymentId,
        userId,

        error:
          error instanceof
          Error
            ? {
                name:
                  error.name,

                message:
                  error.message,

                stack:
                  process.env.NODE_ENV ===
                  "development"
                    ? error.stack
                    : undefined,
              }
            : error,
      },
    );

    throw new PaymentInvoiceError(
      "INVOICE_GENERATION_FAILED",
      "Die Rechnung konnte derzeit nicht erstellt werden.",
      500,
    );
  }
}

/* ==========================================================================
   RESPONSE HELPERS
   ========================================================================== */

/**
 * Can be reused by the API route.
 */
export function getPaymentInvoiceDownloadHeaders(
  invoice:
    Pick<
      GeneratedPaymentInvoice,
      | "filename"
      | "mimeType"
      | "buffer"
    >,
): HeadersInit {
  return {
    "Content-Type":
      invoice.mimeType,

    "Content-Length":
      String(
        invoice.buffer
          .length,
      ),

    "Content-Disposition":
      `attachment; filename="${invoice.filename}"`,

    "Cache-Control":
      "private, no-store, no-cache, must-revalidate, max-age=0",

    Pragma:
      "no-cache",

    Expires:
      "0",

    "X-Content-Type-Options":
      "nosniff",

    "Content-Language":
      "de",

    "X-Robots-Tag":
      "noindex, nofollow, noarchive",
  };
}