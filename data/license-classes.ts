/**
 * Express-Führerschein
 * Featured driving licence classes shown on the Home.
 *
 * Important:
 * - These are Home presentation entries.
 * - Legal availability/rules must later come from the backend/admin.
 * - The architecture supports additional classes without changing the component.
 */

import { ASSETS, ROUTES } from "@/lib/constants";
import type { HomeLicenseClass } from "@/types/license-class";

export const HOME_LICENSE_CLASSES = [
  {
    id: "license-class-b",
    code: "B",
    name: "Klasse B",
    vehicleLabel: "PKW",
    vehicleType: "car",
    image: {
      src: ASSETS.licenseClasses.B,
      alt: "PKW für Führerscheinklasse B",
      width: 640,
      height: 360,
    },
    featured: true,
    selectedByDefault: true,
    status: "active",
    sortOrder: 10,
    href: `${ROUTES.licenseClasses}/b`,
  },
  {
    id: "license-class-a",
    code: "A",
    name: "Klasse A",
    vehicleLabel: "Motorrad",
    vehicleType: "motorcycle",
    image: {
      src: ASSETS.licenseClasses.A,
      alt: "Motorrad für Führerscheinklasse A",
      width: 640,
      height: 360,
    },
    featured: true,
    selectedByDefault: false,
    status: "active",
    sortOrder: 20,
    href: `${ROUTES.licenseClasses}/a`,
  },
  {
    id: "license-class-c",
    code: "C",
    name: "Klasse C",
    vehicleLabel: "LKW",
    vehicleType: "truck",
    image: {
      src: ASSETS.licenseClasses.C,
      alt: "LKW für Führerscheinklasse C",
      width: 640,
      height: 360,
    },
    featured: true,
    selectedByDefault: false,
    status: "active",
    sortOrder: 30,
    href: `${ROUTES.licenseClasses}/c`,
  },
  {
    id: "license-class-d",
    code: "D",
    name: "Klasse D",
    vehicleLabel: "Bus",
    vehicleType: "bus",
    image: {
      src: ASSETS.licenseClasses.D,
      alt: "Bus für Führerscheinklasse D",
      width: 640,
      height: 360,
    },
    featured: true,
    selectedByDefault: false,
    status: "active",
    sortOrder: 40,
    href: `${ROUTES.licenseClasses}/d`,
  },
  {
    id: "license-class-be",
    code: "BE",
    name: "Klasse BE",
    vehicleLabel: "Anhänger",
    vehicleType: "trailer",
    image: {
      src: ASSETS.licenseClasses.BE,
      alt: "PKW mit Anhänger für Führerscheinklasse BE",
      width: 640,
      height: 360,
    },
    featured: true,
    selectedByDefault: false,
    status: "active",
    sortOrder: 50,
    href: `${ROUTES.licenseClasses}/be`,
  },
  {
    id: "license-class-am",
    code: "AM",
    name: "Klasse AM",
    vehicleLabel: "Roller",
    vehicleType: "scooter",
    image: {
      src: ASSETS.licenseClasses.AM,
      alt: "Roller für Führerscheinklasse AM",
      width: 640,
      height: 360,
    },
    featured: true,
    selectedByDefault: false,
    status: "active",
    sortOrder: 60,
    href: `${ROUTES.licenseClasses}/am`,
  },
] as const satisfies readonly HomeLicenseClass[];

export const DEFAULT_HOME_LICENSE_CLASS_CODE = "B" as const;
