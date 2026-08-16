import type {
  MetadataRoute,
} from "next";

import {
  APP_NAME,
} from "@/lib/constants";

export default function manifest():
  MetadataRoute.Manifest {
  return {
    name:
      APP_NAME,

    short_name:
      "Express",

    description:
      "Express-Führerschein – dein digitaler Kundenbereich für Theorie, Praxis, Prüfungen, Fortschritt, Dokumente und Zahlungen.",

    start_url:
      "/",

    scope:
      "/",

    display:
      "standalone",

    orientation:
      "portrait-primary",

    background_color:
      "#020914",

    theme_color:
      "#020914",

    categories: [
      "education",
      "productivity",
    ],

    icons: [
      {
        src:
          "/icons/app-icon-192.png",
        sizes:
          "192x192",
        type:
          "image/png",
        purpose:
          "any",
      },
      {
        src:
          "/icons/app-icon-512.png",
        sizes:
          "512x512",
        type:
          "image/png",
        purpose:
          "any",
      },
      {
        src:
          "/icons/app-icon-maskable-512.png",
        sizes:
          "512x512",
        type:
          "image/png",
        purpose:
          "maskable",
      },
    ],
  };
}
