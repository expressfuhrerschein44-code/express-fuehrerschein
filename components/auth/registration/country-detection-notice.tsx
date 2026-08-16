import {
  COUNTRY_DETECTION_COPY,
} from "@/data/registration";

import { cn } from "@/lib/utils";

import type {
  CountryDetectionMethod,
} from "@/types/registration";

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface CountryDetectionNoticeProps {
  /**
   * Méthode utilisée pour déterminer le pays.
   *
   * ip      → pays détecté automatiquement
   * manual  → pays choisi manuellement
   * default → pays par défaut
   */
  method: CountryDetectionMethod;

  /**
   * Classes complémentaires du conteneur.
   */
  className?: string;
}

/* ==========================================================================
   ICON
   ========================================================================== */

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="10"
        cy="10"
        r="8"
      />

      <path d="M10 9v5" />

      <path d="M10 6.5h.01" />
    </svg>
  );
}

/* ==========================================================================
   COUNTRY DETECTION NOTICE
   ========================================================================== */

export function CountryDetectionNotice({
  method,
  className,
}: CountryDetectionNoticeProps) {
  /* ------------------------------------------------------------------------
     DISPLAY ONLY FOR IP DETECTION
     ------------------------------------------------------------------------ */

  if (method !== "ip") {
    return null;
  }

  /* ------------------------------------------------------------------------
     COPY
     ------------------------------------------------------------------------ */

  const detectedText =
    COUNTRY_DETECTION_COPY.detected;

  /* ------------------------------------------------------------------------
     RENDER
     ------------------------------------------------------------------------ */

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex",
        "items-start",
        "gap-3",

        "rounded-[8px]",
        "border",
        "border-[#D3E5FB]",

        "bg-[#EEF6FF]",

        "px-3.5",
        "py-3",

        "text-[#35506E]",

        className,
      )}
    >
      {/* ================================================================
          ICON
         ================================================================ */}

      <span
        aria-hidden="true"
        className="
          mt-0.5
          shrink-0
          text-[#0878FF]
        "
      >
        <InfoIcon />
      </span>

      {/* ================================================================
          MESSAGE
         ================================================================ */}

      <p
        className="
          text-[10px]
          leading-5

          sm:text-[11px]
        "
      >
        {detectedText}
      </p>
    </div>
  );
}