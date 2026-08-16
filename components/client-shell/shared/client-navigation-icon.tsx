/**
 * Express-Führerschein
 * Centralized navigation icons.
 *
 * No external icon dependency is required.
 */

import {
  cn,
} from "@/lib/utils";

import type {
  ClientNavigationIcon as ClientNavigationIconName,
} from "@/types/client-navigation";

export interface ClientNavigationIconProps {
  name:
    ClientNavigationIconName;

  className?:
    string;
}

const commonProps = {
  viewBox:
    "0 0 24 24",

  fill:
    "none",

  stroke:
    "currentColor",

  strokeWidth:
    1.8,

  strokeLinecap:
    "round" as const,

  strokeLinejoin:
    "round" as const,

  "aria-hidden":
    true,
};

export function ClientNavigationIcon({
  name,
  className,
}: ClientNavigationIconProps) {
  const classes =
    cn(
      "h-5 w-5 shrink-0",
      className,
    );

  switch (
    name
  ) {
    case "home":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9.5 21v-6h5v6" />
        </svg>
      );

    case "book":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
          <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
        </svg>
      );

    case "car":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <path d="m5 16-1-2 2-5h12l2 5-1 2" />
          <path d="M5 16h14v3H5z" />
          <path d="M7 19v2M17 19v2" />
          <path d="M7.5 13h.01M16.5 13h.01" />
        </svg>
      );

    case "user":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <circle
            cx="12"
            cy="8"
            r="3.2"
          />
          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
        </svg>
      );

    case "chart":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <path d="M4 20V10" />
          <path d="M10 20V4" />
          <path d="M16 20v-7" />
          <path d="M22 20H2" />
        </svg>
      );

    case "sparkles":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z" />
          <path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
          <path d="m5 13 .8 2.2 2.2.8-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13Z" />
        </svg>
      );

    case "clipboard-check":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <rect
            x="5"
            y="4"
            width="14"
            height="17"
            rx="2"
          />
          <path d="M9 4.5V3h6v1.5" />
          <path d="m9 13 2 2 4-4" />
        </svg>
      );

    case "alert-circle":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="M12 7v6" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "calendar":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
          />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      );

    case "file":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <path d="M6 2h8l4 4v16H6z" />
          <path d="M14 2v5h5" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      );

    case "message":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <path d="M4 5h16v12H8l-4 4V5Z" />
          <path d="M8 10h8M8 13h5" />
        </svg>
      );

    case "credit-card":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
          />
          <path d="M3 10h18M7 15h3" />
        </svg>
      );

    case "settings":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <circle
            cx="12"
            cy="12"
            r="3"
          />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-4v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v4H21a1.7 1.7 0 0 0-1.6 1Z" />
        </svg>
      );

    case "help-circle":
      return (
        <svg
          {...commonProps}
          className={
            classes
          }
        >
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="M9.6 9.4a2.6 2.6 0 1 1 3.5 2.4c-.7.3-1.1.8-1.1 1.7" />
          <path d="M12 17h.01" />
        </svg>
      );

    default:
      return null;
  }
}
