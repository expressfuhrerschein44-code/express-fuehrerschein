import "server-only";

import {
  NextResponse,
} from "next/server";

import {
  requireClientSession,
} from "@/lib/server/client-session";

import {
  prisma,
} from "@/lib/server/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/* ==========================================================================
   TYPES
   ========================================================================== */

type RouteContext = {
  params: Promise<{
    paymentId: string;
  }>;
};

type InvoiceIssuer = {
  name: string;
  addressLines: string[];
  email: string | null;
  website: string | null;
  taxNumber: string | null;
  vatId: string | null;
};

type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  paymentDate: string;

  issuer: InvoiceIssuer;

  customer: {
    name: string;
    email: string;
    countryCode: string;
  };

  application: {
    id: string | null;
    licenseClasses: string[];
  };

  payment: {
    id: string;
    stage: string;
    reference: string;
    description: string | null;
    amountCents: number;
    currency: string;
  };
};

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

const RESPONSE_HEADERS = {
  "Cache-Control":
    "private, no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
} satisfies HeadersInit;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const A4_WIDTH = 595;
const A4_HEIGHT = 842;

/* ==========================================================================
   GENERIC HELPERS
   ========================================================================== */

function normalizeText(
  value:
    | string
    | null
    | undefined,
): string {
  return value?.trim() ?? "";
}

function optionalEnv(
  name: string,
): string | null {
  const value =
    process.env[name]?.trim();

  return value
    ? value
    : null;
}

function jsonError(
  status: number,
  code: string,
  message: string,
) {
  return NextResponse.json(
    {
      success: false,
      code,
      message,
    },
    {
      status,
      headers:
        RESPONSE_HEADERS,
    },
  );
}

/* ==========================================================================
   INVOICE ISSUER
   ========================================================================== */

/**
 * Les informations juridiques de l'entreprise ne sont PAS codées
 * en dur dans la facture.
 *
 * Elles peuvent être configurées dans .env.local :
 *
 * INVOICE_ISSUER_NAME
 * INVOICE_ISSUER_ADDRESS_LINE_1
 * INVOICE_ISSUER_ADDRESS_LINE_2
 * INVOICE_ISSUER_POSTAL_CODE
 * INVOICE_ISSUER_CITY
 * INVOICE_ISSUER_COUNTRY
 * INVOICE_ISSUER_EMAIL
 * INVOICE_ISSUER_WEBSITE
 * INVOICE_ISSUER_TAX_NUMBER
 * INVOICE_ISSUER_VAT_ID
 */
function getInvoiceIssuer():
  InvoiceIssuer {
  const addressLine1 =
    optionalEnv(
      "INVOICE_ISSUER_ADDRESS_LINE_1",
    );

  const addressLine2 =
    optionalEnv(
      "INVOICE_ISSUER_ADDRESS_LINE_2",
    );

  const postalCode =
    optionalEnv(
      "INVOICE_ISSUER_POSTAL_CODE",
    );

  const city =
    optionalEnv(
      "INVOICE_ISSUER_CITY",
    );

  const country =
    optionalEnv(
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
      optionalEnv(
        "INVOICE_ISSUER_NAME",
      ) ??
      "Express-Führerschein",

    addressLines: [
      addressLine1,
      addressLine2,
      postalCity || null,
      country,
    ].filter(
      (
        value,
      ): value is string =>
        Boolean(value),
    ),

    email:
      optionalEnv(
        "INVOICE_ISSUER_EMAIL",
      ),

    website:
      optionalEnv(
        "INVOICE_ISSUER_WEBSITE",
      ),

    taxNumber:
      optionalEnv(
        "INVOICE_ISSUER_TAX_NUMBER",
      ),

    vatId:
      optionalEnv(
        "INVOICE_ISSUER_VAT_ID",
      ),
  };
}

/* ==========================================================================
   FORMATTING
   ========================================================================== */

function formatDate(
  value: Date,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(value);
}

function formatMoney(
  cents: number,
  currency: string,
): string {
  const safeCents =
    Number.isFinite(cents)
      ? cents
      : 0;

  const amount =
    safeCents / 100;

  try {
    const formatted =
      new Intl.NumberFormat(
        "de-DE",
        {
          minimumFractionDigits:
            2,
          maximumFractionDigits:
            2,
        },
      ).format(amount);

    return `${formatted} ${currency}`;
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function createInvoiceNumber(
  paymentId: string,
  paidAt: Date,
): string {
  const year =
    paidAt.getUTCFullYear();

  /*
   * Le payment UUID rend le numéro stable et unique
   * sans créer une nouvelle table ni modifier Prisma.
   */
  return `EF-${year}-${paymentId.toUpperCase()}`;
}

function resolvePaymentStage(
  stage:
    | string
    | null,
  description:
    | string
    | null,
): string {
  const normalizedStage =
    normalizeText(stage);

  if (normalizedStage) {
    return normalizedStage;
  }

  const normalizedDescription =
    normalizeText(
      description,
    );

  if (normalizedDescription) {
    return normalizedDescription;
  }

  return "Führerscheinzahlung";
}

/* ==========================================================================
   PDF TEXT HELPERS
   ========================================================================== */

/**
 * Le PDF utilise Helvetica / WinAnsi.
 *
 * On conserve les caractères allemands compatibles (ä, ö, ü, ß)
 * et on normalise les caractères Unicode qui ne sont pas
 * directement supportés par la police PDF standard.
 */
function normalizePdfText(
  value: string,
): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[–—]/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, "...")
    .replace(/€/g, "EUR")
    .replace(
      /[^\x20-\x7E\xA0-\xFF]/g,
      "?",
    );
}

function escapePdfText(
  value: string,
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

function wrapText(
  value: string,
  maxCharacters = 72,
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

  let current = "";

  for (
    const word
    of words
  ) {
    const candidate =
      current
        ? `${current} ${word}`
        : word;

    if (
      candidate.length <=
      maxCharacters
    ) {
      current =
        candidate;

      continue;
    }

    if (current) {
      lines.push(
        current,
      );
    }

    current =
      word;
  }

  if (current) {
    lines.push(
      current,
    );
  }

  return lines;
}

/* ==========================================================================
   PDF DRAWING HELPERS
   ========================================================================== */

function pdfText(
  commands: string[],
  options: {
    x: number;
    y: number;
    size: number;
    value: string;
    bold?: boolean;
    color?: [
      number,
      number,
      number,
    ];
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
  } = options;

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

function pdfLine(
  commands: string[],
  options: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    width?: number;
    color?: [
      number,
      number,
      number,
    ];
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
  } = options;

  commands.push(
    `${color[0]} ${color[1]} ${color[2]} RG`,
    `${width} w`,
    `${x1} ${y1} m`,
    `${x2} ${y2} l`,
    "S",
  );
}

function pdfFilledRectangle(
  commands: string[],
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: [
      number,
      number,
      number,
    ];
  },
): void {
  const {
    x,
    y,
    width,
    height,
    color,
  } = options;

  commands.push(
    `${color[0]} ${color[1]} ${color[2]} rg`,
    `${x} ${y} ${width} ${height} re`,
    "f",
  );
}

/* ==========================================================================
   RAW PDF BUILDER
   ========================================================================== */

/**
 * Construction PDF sans dépendance externe.
 *
 * Cela évite d'ajouter pdf-lib, pdfkit ou autre package
 * uniquement pour cette route.
 */
function buildInvoicePdf(
  data: InvoiceData,
): Buffer {
  const commands:
    string[] = [];

  /* ------------------------------------------------------------------------
     PAGE BACKGROUND
     ---------------------------------------------------------------------- */

  pdfFilledRectangle(
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
     TOP BRAND LINE
     ---------------------------------------------------------------------- */

  pdfFilledRectangle(
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

  pdfText(
    commands,
    {
      x: 44,
      y: 785,
      size: 18,
      value:
        data.issuer.name,
      bold: true,
    },
  );

  pdfText(
    commands,
    {
      x: 424,
      y: 785,
      size: 20,
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

  pdfText(
    commands,
    {
      x: 44,
      y: 764,
      size: 8.5,
      value:
        "Express-Führerschein Zahlungsbestätigung",
      color: [
        0.4,
        0.46,
        0.55,
      ],
    },
  );

  pdfLine(
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

  let issuerY = 719;

  pdfText(
    commands,
    {
      x: 44,
      y:
        issuerY,
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

  issuerY -= 18;

  pdfText(
    commands,
    {
      x: 44,
      y:
        issuerY,
      size: 10,
      value:
        data.issuer.name,
      bold: true,
    },
  );

  issuerY -= 15;

  for (
    const line
    of data.issuer
      .addressLines
  ) {
    pdfText(
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
    data.issuer.email
  ) {
    pdfText(
      commands,
      {
        x: 44,
        y:
          issuerY,
        size: 8.5,
        value:
          data.issuer
            .email,
      },
    );

    issuerY -= 13;
  }

  if (
    data.issuer.website
  ) {
    pdfText(
      commands,
      {
        x: 44,
        y:
          issuerY,
        size: 8.5,
        value:
          data.issuer
            .website,
      },
    );

    issuerY -= 13;
  }

  if (
    data.issuer.taxNumber
  ) {
    pdfText(
      commands,
      {
        x: 44,
        y:
          issuerY,
        size: 8.5,
        value:
          `Steuernummer: ${data.issuer.taxNumber}`,
      },
    );

    issuerY -= 13;
  }

  if (
    data.issuer.vatId
  ) {
    pdfText(
      commands,
      {
        x: 44,
        y:
          issuerY,
        size: 8.5,
        value:
          `USt-IdNr.: ${data.issuer.vatId}`,
      },
    );
  }

  /* ------------------------------------------------------------------------
     CUSTOMER
     ---------------------------------------------------------------------- */

  let customerY = 719;

  pdfText(
    commands,
    {
      x: 316,
      y:
        customerY,
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

  customerY -= 18;

  pdfText(
    commands,
    {
      x: 316,
      y:
        customerY,
      size: 10,
      value:
        data.customer
          .name,
      bold: true,
    },
  );

  customerY -= 15;

  pdfText(
    commands,
    {
      x: 316,
      y:
        customerY,
      size: 8.5,
      value:
        data.customer
          .email,
    },
  );

  customerY -= 15;

  if (
    data.customer
      .countryCode
  ) {
    pdfText(
      commands,
      {
        x: 316,
        y:
          customerY,
        size: 8.5,
        value:
          `Land: ${data.customer.countryCode.toUpperCase()}`,
      },
    );
  }

  /* ------------------------------------------------------------------------
     META INFORMATION
     ---------------------------------------------------------------------- */

  pdfFilledRectangle(
    commands,
    {
      x: 44,
      y: 545,
      width: 507,
      height: 82,
      color: [
        0.965,
        0.975,
        0.99,
      ],
    },
  );

  pdfText(
    commands,
    {
      x: 58,
      y: 604,
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

  pdfText(
    commands,
    {
      x: 58,
      y: 587,
      size: 8.5,
      value:
        data.invoiceNumber,
      bold: true,
    },
  );

  pdfText(
    commands,
    {
      x: 330,
      y: 604,
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

  pdfText(
    commands,
    {
      x: 330,
      y: 587,
      size: 8.5,
      value:
        data.invoiceDate,
      bold: true,
    },
  );

  pdfText(
    commands,
    {
      x: 58,
      y: 563,
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

  pdfText(
    commands,
    {
      x: 168,
      y: 563,
      size: 8,
      value:
        data.payment
          .reference,
    },
  );

  pdfText(
    commands,
    {
      x: 330,
      y: 563,
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

  pdfText(
    commands,
    {
      x: 430,
      y: 563,
      size: 8,
      value:
        data.paymentDate,
    },
  );

  /* ------------------------------------------------------------------------
     APPLICATION
     ---------------------------------------------------------------------- */

  pdfText(
    commands,
    {
      x: 44,
      y: 508,
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

  pdfText(
    commands,
    {
      x: 44,
      y: 488,
      size: 9,
      value:
        data.application
          .licenseClasses
          .length > 0
          ? `Führerscheinklasse: ${data.application.licenseClasses.join(", ")}`
          : "Führerscheinklasse: -",
      bold: true,
    },
  );

  if (
    data.application.id
  ) {
    pdfText(
      commands,
      {
        x: 316,
        y: 488,
        size: 7.5,
        value:
          `Antrag: ${data.application.id}`,
        color: [
          0.4,
          0.46,
          0.55,
        ],
      },
    );
  }

  /* ------------------------------------------------------------------------
     PAYMENT TABLE HEADER
     ---------------------------------------------------------------------- */

  pdfFilledRectangle(
    commands,
    {
      x: 44,
      y: 435,
      width: 507,
      height: 31,
      color: [
        0.025,
        0.085,
        0.16,
      ],
    },
  );

  pdfText(
    commands,
    {
      x: 58,
      y: 446,
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

  pdfText(
    commands,
    {
      x: 441,
      y: 446,
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
     PAYMENT LINE
     ---------------------------------------------------------------------- */

  const stageLines =
    wrapText(
      data.payment
        .stage,
      48,
    );

  let stageY = 408;

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
    pdfText(
      commands,
      {
        x: 58,
        y:
          stageY,
        size:
          index === 0
            ? 10
            : 8,
        value:
          line,
        bold:
          index === 0,
      },
    );

    stageY -= 14;
  }

  if (
    data.payment
      .description &&
    normalizeText(
      data.payment
        .description,
    ) !==
      normalizeText(
        data.payment
          .stage,
      )
  ) {
    const descriptionLines =
      wrapText(
        data.payment
          .description,
        55,
      );

    for (
      const line
      of descriptionLines.slice(
        0,
        2,
      )
    ) {
      pdfText(
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

  pdfText(
    commands,
    {
      x: 432,
      y: 408,
      size: 10,
      value:
        formatMoney(
          data.payment
            .amountCents,
          data.payment
            .currency,
        ),
      bold: true,
    },
  );

  pdfLine(
    commands,
    {
      x1: 44,
      y1: 358,
      x2: 551,
      y2: 358,
    },
  );

  /* ------------------------------------------------------------------------
     TOTAL
     ---------------------------------------------------------------------- */

  pdfText(
    commands,
    {
      x: 348,
      y: 326,
      size: 10,
      value:
        "Gesamtbetrag",
      bold: true,
    },
  );

  pdfText(
    commands,
    {
      x: 432,
      y: 326,
      size: 12,
      value:
        formatMoney(
          data.payment
            .amountCents,
          data.payment
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
     PAYMENT CONFIRMATION
     ---------------------------------------------------------------------- */

  pdfFilledRectangle(
    commands,
    {
      x: 44,
      y: 244,
      width: 507,
      height: 52,
      color: [
        0.94,
        0.985,
        0.955,
      ],
    },
  );

  pdfText(
    commands,
    {
      x: 58,
      y: 276,
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

  pdfText(
    commands,
    {
      x: 58,
      y: 258,
      size: 8,
      value:
        `Der Zahlungseingang wurde am ${data.paymentDate} bestätigt.`,
      color: [
        0.18,
        0.30,
        0.23,
      ],
    },
  );

  /* ------------------------------------------------------------------------
     REFERENCES
     ---------------------------------------------------------------------- */

  pdfText(
    commands,
    {
      x: 44,
      y: 205,
      size: 7.5,
      value:
        `Zahlungs-ID: ${data.payment.id}`,
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

  pdfLine(
    commands,
    {
      x1: 44,
      y1: 100,
      x2: 551,
      y2: 100,
    },
  );

  pdfText(
    commands,
    {
      x: 44,
      y: 78,
      size: 8,
      value:
        "Vielen Dank für Ihre Zahlung.",
      bold: true,
    },
  );

  pdfText(
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

  const stream =
    commands.join("\n");

  const streamBuffer =
    Buffer.from(
      stream,
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
          `<< /Length ${streamBuffer.length} >>`,
          "stream",
          "",
        ].join("\n"),
        "latin1",
      ),

      streamBuffer,

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
        [
          "<<",
          `/Title (${escapePdfText(
            `Rechnung ${data.invoiceNumber}`,
          )})`,
          `/Author (${escapePdfText(
            data.issuer.name,
          )})`,
          `/Subject (${escapePdfText(
            "Express-Führerschein Rechnung",
          )})`,
          `/Creator (${escapePdfText(
            "Express-Führerschein",
          )})`,
          ">>",
        ].join(" "),
        "endobj",
        "",
      ].join("\n"),
      "latin1",
    ),
  );

  /* ------------------------------------------------------------------------
     PDF HEADER + XREF
     ---------------------------------------------------------------------- */

  const header =
    Buffer.from(
      "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n",
      "latin1",
    );

  const parts:
    Buffer[] = [
      header,
    ];

  const offsets:
    number[] = [
      0,
    ];

  let currentOffset =
    header.length;

  for (
    let id = 1;
    id <= 7;
    id += 1
  ) {
    const object =
      objects.get(
        id,
      );

    if (!object) {
      throw new Error(
        `[Express-Führerschein] PDF object ${id} is missing.`,
      );
    }

    offsets[id] =
      currentOffset;

    parts.push(
      object,
    );

    currentOffset +=
      object.length;
  }

  const xrefOffset =
    currentOffset;

  const xrefLines = [
    "xref",
    "0 8",
    "0000000000 65535 f ",
  ];

  for (
    let id = 1;
    id <= 7;
    id += 1
  ) {
    xrefLines.push(
      `${String(
        offsets[id],
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

  parts.push(
    trailer,
  );

  return Buffer.concat(
    parts,
  );
}

/* ==========================================================================
   GET /api/payments/[paymentId]/invoice
   ========================================================================== */

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  /* ------------------------------------------------------------------------
     PAYMENT ID
     ---------------------------------------------------------------------- */

  const {
    paymentId:
      rawPaymentId,
  } =
    await context.params;

  const paymentId =
    normalizeText(
      rawPaymentId,
    );

  if (
    !paymentId ||
    !UUID_PATTERN.test(
      paymentId,
    )
  ) {
    return jsonError(
      400,
      "INVALID_PAYMENT_ID",
      "Die Zahlungs-ID ist ungültig.",
    );
  }

  /* ------------------------------------------------------------------------
     CLIENT SESSION
     ---------------------------------------------------------------------- */

  let userId:
    string;

  try {
    const session =
      await requireClientSession();

    userId =
      session.user.id;
  } catch {
    return jsonError(
      401,
      "UNAUTHENTICATED",
      "Bitte melde dich an, um deine Rechnung herunterzuladen.",
    );
  }

  /* ------------------------------------------------------------------------
     DATABASE
     ---------------------------------------------------------------------- */

  try {
    /*
     * IMPORTANT :
     *
     * On cherche le paiement avec :
     *
     * id = paymentId
     * ET
     * user_id = session.user.id
     *
     * Le navigateur ne peut donc jamais demander la facture
     * appartenant à un autre client.
     */
    const payment =
      await prisma.payments.findFirst({
        where: {
          id:
            paymentId,

          user_id:
            userId,
        },

        select: {
          id: true,

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

          reviewed_at:
            true,

          created_at:
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

    /* ----------------------------------------------------------------------
       PAYMENT OWNERSHIP / EXISTENCE
       -------------------------------------------------------------------- */

    if (!payment) {
      return jsonError(
        404,
        "PAYMENT_NOT_FOUND",
        "Die Zahlung wurde nicht gefunden.",
      );
    }

    /* ----------------------------------------------------------------------
       INVOICE ONLY AFTER ADMIN CONFIRMATION
       -------------------------------------------------------------------- */

    if (
      payment.status !==
      "paid"
    ) {
      return jsonError(
        409,
        "INVOICE_NOT_AVAILABLE",
        "Die Rechnung ist erst verfügbar, nachdem die Zahlung bestätigt wurde.",
      );
    }

    if (
      !payment.paid_at
    ) {
      console.error(
        "[PAYMENT_INVOICE_MISSING_PAID_AT]",
        {
          paymentId:
            payment.id,

          status:
            payment.status,

          userId,
        },
      );

      return jsonError(
        409,
        "INVOICE_PAYMENT_DATE_MISSING",
        "Die Rechnung kann für diese Zahlung derzeit nicht erstellt werden.",
      );
    }

    /* ----------------------------------------------------------------------
       CUSTOMER
       -------------------------------------------------------------------- */

    const customerName =
      [
        normalizeText(
          payment.users
            .first_name,
        ),

        normalizeText(
          payment.users
            .last_name,
        ),
      ]
        .filter(Boolean)
        .join(" ") ||
      "Kunde";

    /* ----------------------------------------------------------------------
       PAYMENT REFERENCE
       -------------------------------------------------------------------- */

    const paymentReference =
      normalizeText(
        payment
          .payment_reference,
      ) ||
      payment.id;

    /* ----------------------------------------------------------------------
       INVOICE
       -------------------------------------------------------------------- */

    const invoiceNumber =
      createInvoiceNumber(
        payment.id,
        payment.paid_at,
      );

    const invoiceData:
      InvoiceData = {
      invoiceNumber,

      invoiceDate:
        formatDate(
          payment.paid_at,
        ),

      paymentDate:
        formatDate(
          payment.paid_at,
        ),

      issuer:
        getInvoiceIssuer(),

      customer: {
        name:
          customerName,

        email:
          payment.users
            .email,

        countryCode:
          payment.users
            .country_code,
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
            payment
              .payment_stage,

            payment
              .description,
          ),

        reference:
          paymentReference,

        description:
          payment
            .description,

        amountCents:
          payment
            .amount_cents,

        currency:
          payment
            .currency,

      },
    };

    const pdfBuffer =
      buildInvoicePdf(
        invoiceData,
      );

    /*
     * Création d'un ArrayBuffer propre pour Response.
     * Cela évite les incompatibilités Buffer / BodyInit
     * selon les versions TypeScript / Next.js.
     */
    const pdfArrayBuffer =
      Uint8Array.from(
        pdfBuffer,
      ).buffer;

    const safeFilename =
      `rechnung-${invoiceNumber
        .replace(
          /[^A-Za-z0-9._-]/g,
          "-",
        )}.pdf`;

    /* ----------------------------------------------------------------------
       PDF RESPONSE
       -------------------------------------------------------------------- */

    return new Response(
      pdfArrayBuffer,
      {
        status: 200,

        headers: {
          ...RESPONSE_HEADERS,

          "Content-Type":
            "application/pdf",

          "Content-Length":
            String(
              pdfBuffer.length,
            ),

          "Content-Disposition":
            `attachment; filename="${safeFilename}"`,

          "Content-Language":
            "de",

          "X-Robots-Tag":
            "noindex, nofollow, noarchive",
        },
      },
    );
  } catch (error) {
    console.error(
      "[PAYMENT_INVOICE_ERROR]",
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
                  process.env
                    .NODE_ENV ===
                  "development"
                    ? error.stack
                    : undefined,
              }
            : error,
      },
    );

    return jsonError(
      500,
      "INVOICE_GENERATION_FAILED",
      "Die Rechnung konnte derzeit nicht erstellt werden.",
    );
  }
}