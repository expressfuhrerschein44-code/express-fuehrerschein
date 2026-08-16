import Image, {
  type ImageProps,
} from "next/image";

import type {
  CSSProperties,
} from "react";

import { cn } from "@/lib/utils";

/* ==========================================================================
   TYPES
   ========================================================================== */

/**
 * Props Next/Image que ResponsiveImage peut recevoir.
 *
 * Les propriétés importantes gérées directement par ce composant
 * sont retirées afin d'éviter les conflits.
 */
type SharedImageProps = Omit<
  ImageProps,
  | "src"
  | "alt"
  | "fill"
  | "width"
  | "height"
  | "className"
  | "priority"
  | "sizes"
  | "style"
  | "loading"
>;

export type ResponsiveImageBreakpoint =
  | "sm"
  | "md"
  | "lg";

export type ResponsiveImagePosition =
  | "relative"
  | "absolute";

export type ResponsiveImageFit =
  | "cover"
  | "contain";

export interface ResponsiveImageProps
  extends SharedImageProps {
  /**
   * Image utilisée sur desktop.
   */
  desktopSrc: string;

  /**
   * Image mobile optionnelle.
   *
   * Sans mobileSrc, desktopSrc est utilisée
   * sur toutes les tailles d'écran.
   */
  mobileSrc?: string;

  /**
   * Texte alternatif de l'image.
   */
  alt: string;

  /**
   * Classe du wrapper.
   *
   * Exemple :
   * h-[400px] w-full
   */
  className?: string;

  /**
   * Classe commune appliquée aux images.
   */
  imageClassName?: string;

  /**
   * Classe uniquement appliquée à l'image desktop.
   */
  desktopImageClassName?: string;

  /**
   * Classe uniquement appliquée à l'image mobile.
   */
  mobileImageClassName?: string;

  /**
   * Breakpoint où l'on passe de mobileSrc à desktopSrc.
   *
   * md :
   * < 768px  → mobile
   * >= 768px → desktop
   */
  mobileBreakpoint?: ResponsiveImageBreakpoint;

  /**
   * Chargement prioritaire.
   *
   * À réserver aux images immédiatement visibles.
   */
  priority?: boolean;

  /**
   * cover :
   * remplit complètement le conteneur.
   *
   * contain :
   * affiche toute l'image sans découpe.
   */
  objectFit?: ResponsiveImageFit;

  /**
   * Position à l'intérieur du conteneur.
   *
   * Exemples :
   * center
   * center center
   * right center
   * 70% center
   */
  objectPosition?: string;

  /**
   * Positionnement CSS du wrapper.
   */
  position?: ResponsiveImagePosition;

  /**
   * sizes envoyé à Next/Image.
   */
  sizes?: string;

  /**
   * Style du wrapper.
   */
  wrapperStyle?: CSSProperties;

  /**
   * Style appliqué aux images.
   */
  imageStyle?: CSSProperties;
}

/* ==========================================================================
   RESPONSIVE IMAGE
   ========================================================================== */

export function ResponsiveImage({
  desktopSrc,
  mobileSrc,
  alt,

  className,
  imageClassName,
  desktopImageClassName,
  mobileImageClassName,

  mobileBreakpoint = "md",

  priority = false,

  objectFit = "cover",
  objectPosition = "center",

  position = "relative",

  sizes = "100vw",

  wrapperStyle,
  imageStyle,

  ...imageProps
}: ResponsiveImageProps) {
  /* ------------------------------------------------------------------------
     DISPLAY BREAKPOINTS
     ------------------------------------------------------------------------ */

  const breakpointDisplay = {
    sm: {
      mobile: "block sm:hidden",
      desktop: "hidden sm:block",
    },

    md: {
      mobile: "block md:hidden",
      desktop: "hidden md:block",
    },

    lg: {
      mobile: "block lg:hidden",
      desktop: "hidden lg:block",
    },
  } as const;

  const display =
    breakpointDisplay[mobileBreakpoint];

  /* ------------------------------------------------------------------------
     WRAPPER POSITION
     ------------------------------------------------------------------------ */

  const positionClass =
    position === "absolute"
      ? "absolute"
      : "relative";

  /* ------------------------------------------------------------------------
     OBJECT FIT
     ------------------------------------------------------------------------ */

  const fitClass =
    objectFit === "contain"
      ? "object-contain"
      : "object-cover";

  /* ------------------------------------------------------------------------
     IMAGE STYLE
     ------------------------------------------------------------------------ */

  const sharedImageStyle: CSSProperties = {
    ...imageStyle,
    objectPosition,
  };

  /* ------------------------------------------------------------------------
     SINGLE IMAGE MODE

     Si aucune image mobile particulière n'est fournie,
     on ne crée qu'une seule Next/Image.
     ------------------------------------------------------------------------ */

  if (!mobileSrc) {
    return (
      <div
        className={cn(
          positionClass,
          "overflow-hidden",
          className,
        )}
        style={wrapperStyle}
      >
        <Image
          src={desktopSrc}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(
            fitClass,
            "h-full w-full",
            imageClassName,
            desktopImageClassName,
          )}
          style={sharedImageStyle}
          {...imageProps}
        />
      </div>
    );
  }

  /* ------------------------------------------------------------------------
     DESKTOP + MOBILE MODE
     ------------------------------------------------------------------------ */

  return (
    <div
      className={cn(
        positionClass,
        "overflow-hidden",
        className,
      )}
      style={wrapperStyle}
    >
      {/* ================================================================
          MOBILE
         ================================================================ */}

      <Image
        src={mobileSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          display.mobile,
          fitClass,
          "h-full w-full",
          imageClassName,
          mobileImageClassName,
        )}
        style={sharedImageStyle}
        {...imageProps}
      />

      {/* ================================================================
          DESKTOP
         ================================================================ */}

      <Image
        src={desktopSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          display.desktop,
          fitClass,
          "h-full w-full",
          imageClassName,
          desktopImageClassName,
        )}
        style={sharedImageStyle}
        {...imageProps}
      />
    </div>
  );
}