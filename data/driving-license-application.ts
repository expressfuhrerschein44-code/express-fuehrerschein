/**
 * Express-Führerschein
 * Static configuration for the "Mein Führerschein" application page.
 *
 * All monetary values are integer euro cents.
 * The server imports this same configuration and recalculates totals itself.
 */

import type {
  DrivingLicenseApplicationDocumentType,
  DrivingLicenseApplicationSignatureType,
  DrivingLicenseClassCode,
  DrivingLicenseClassOption,
} from "@/types/driving-license-application";

export const DRIVING_LICENSE_APPLICATION_ROUTES = {
  page: "/mein-fuehrerschein",
  save: "/api/driving-license-application/save",
  document: "/api/driving-license-application/document",
  signature: "/api/driving-license-application/signature",
  submit: "/api/driving-license-application/submit",
} as const;

export const DRIVING_LICENSE_APPLICATION_STORAGE_BUCKET =
  "driving-license-documents";

export const DRIVING_LICENSE_CLASSES: readonly DrivingLicenseClassOption[] = [
  {
    code: "B",
    label: "Klasse B",
    vehicle: "PKW",
    description: "Personenkraftwagen",
    priceCents: 218900,
    image: "/images/home/license-classes/klasse-b.webp",
    sortOrder: 1,
  },
  {
    code: "A",
    label: "Klasse A",
    vehicle: "Motorrad",
    description: "Motorräder",
    priceCents: 169900,
    image: "/images/home/license-classes/klasse-a.webp",
    sortOrder: 2,
  },
  {
    code: "C",
    label: "Klasse C",
    vehicle: "LKW",
    description: "Lastkraftwagen",
    priceCents: 269900,
    image: "/images/home/license-classes/klasse-c.webp",
    sortOrder: 3,
  },
  {
    code: "D",
    label: "Klasse D",
    vehicle: "Bus",
    description: "Kraftomnibusse",
    priceCents: 489900,
    image: "/images/home/license-classes/klasse-d.webp",
    sortOrder: 4,
  },
  {
    code: "BE",
    label: "Klasse BE",
    vehicle: "Anhänger",
    description: "PKW mit Anhänger",
    priceCents: 85900,
    image: "/images/home/license-classes/klasse-be.webp",
    sortOrder: 5,
  },
  {
    code: "AM",
    label: "Klasse AM",
    vehicle: "Roller",
    description: "Kleinkrafträder",
    priceCents: 54900,
    image: "/images/home/license-classes/klasse-am.webp",
    sortOrder: 6,
  },
] as const;

export const APPLICATION_PROCESSING_FEES = {
  oneClassCents: 24900,
  twoClassesCents: 34900,
  threeOrMoreClassesCents: 49900,
} as const;

export const APPLICATION_DOCUMENTS: readonly {
  type: DrivingLicenseApplicationDocumentType;
  label: string;
  description: string;
  accept: string;
  allowedMimeTypes: readonly string[];
  maxBytes: number;
}[] = [
  {
    type: "id_front",
    label: "Ausweis Vorderseite",
    description: "Vorderseite deines Ausweisdokuments",
    accept: "image/jpeg,image/png,application/pdf",
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    maxBytes: 5 * 1024 * 1024,
  },
  {
    type: "id_back",
    label: "Ausweis Rückseite",
    description: "Rückseite deines Ausweisdokuments",
    accept: "image/jpeg,image/png,application/pdf",
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    maxBytes: 5 * 1024 * 1024,
  },
  {
    type: "portrait_photo",
    label: "Passfoto",
    description: "Aktuelles biometrisches Foto",
    accept: "image/jpeg,image/png",
    allowedMimeTypes: ["image/jpeg", "image/png"],
    maxBytes: 5 * 1024 * 1024,
  },
] as const;

export const APPLICATION_SIGNATURES: Record<
  DrivingLicenseApplicationSignatureType,
  {
    label: string;
    allowedMimeTypes: readonly string[];
    accept: string;
    maxBytes: number;
  }
> = {
  drawn: {
    label: "Unterschrift zeichnen",
    allowedMimeTypes: ["image/png"],
    accept: "image/png",
    maxBytes: 2 * 1024 * 1024,
  },
  uploaded: {
    label: "Unterschrift hochladen",
    allowedMimeTypes: ["image/jpeg", "image/png", "application/pdf"],
    accept: "image/jpeg,image/png,application/pdf",
    maxBytes: 5 * 1024 * 1024,
  },
};

export const DRIVING_LICENSE_CLASS_CODES =
  DRIVING_LICENSE_CLASSES.map((item) => item.code) as DrivingLicenseClassCode[];

export const REQUIRED_APPLICATION_DOCUMENT_TYPES:
  readonly DrivingLicenseApplicationDocumentType[] = [
    "id_front",
    "id_back",
    "portrait_photo",
  ];

export function getDrivingLicenseClass(code: DrivingLicenseClassCode) {
  return DRIVING_LICENSE_CLASSES.find((item) => item.code === code) ?? null;
}

export function calculateApplicationPricing(
  selectedClasses: readonly DrivingLicenseClassCode[],
) {
  const uniqueClasses = Array.from(new Set(selectedClasses));

  const classesSubtotalCents = uniqueClasses.reduce((total, code) => {
    const item = getDrivingLicenseClass(code);
    return total + (item?.priceCents ?? 0);
  }, 0);

  const processingFeeCents =
    uniqueClasses.length === 0
      ? 0
      : uniqueClasses.length === 1
        ? APPLICATION_PROCESSING_FEES.oneClassCents
        : uniqueClasses.length === 2
          ? APPLICATION_PROCESSING_FEES.twoClassesCents
          : APPLICATION_PROCESSING_FEES.threeOrMoreClassesCents;

  return {
    classesSubtotalCents,
    processingFeeCents,
    totalCents: classesSubtotalCents + processingFeeCents,
    currency: "EUR" as const,
  };
}
