import {
  dirname,
} from "path";

import {
  fileURLToPath,
} from "url";

import {
  FlatCompat,
} from "@eslint/eslintrc";

/* ==========================================================================
   EXPRESS-FÜHRERSCHEIN
   ESLINT CONFIGURATION
   Next.js 15.5.x
   ========================================================================== */

const __filename =
  fileURLToPath(
    import.meta.url,
  );

const __dirname =
  dirname(__filename);

const compat =
  new FlatCompat({
    baseDirectory:
      __dirname,
  });

const eslintConfig = [
  /* ------------------------------------------------------------------------
     NEXT.JS
     ------------------------------------------------------------------------ */

  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
  ),

  /* ------------------------------------------------------------------------
     PROJECT IGNORES
     ------------------------------------------------------------------------ */

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",

      "next-env.d.ts",

      "coverage/**",

      "*.config.js",
      "*.config.cjs",
    ],
  },
];

export default eslintConfig;