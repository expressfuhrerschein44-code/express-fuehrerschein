import type { ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

export interface IconCircleProps {
  name: string;
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
  tone?: "blue" | "dark" | "white";
  label?: string;
}

type SvgIconProps = SVGProps<SVGSVGElement>;

const iconPaths: Record<string, ReactNode> = {
  check: <path d="m7.5 12.5 3 3 6-7" />,
  "graduation-cap": (
    <>
      <path d="m3 9 9-5 9 5-9 5-9-5Z" />
      <path d="M7 12v4.5c2.8 2 7.2 2 10 0V12M21 9v6" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 1.5M9 2h6M12 5V2" />
    </>
  ),
  "shield-check": (
    <>
      <path d="M12 3 5 6v5c0 4.7 2.7 8 7 10 4.3-2 7-5.3 7-10V6l-7-3Z" />
      <path d="m8.8 12.1 2.1 2.1 4.4-4.5" />
    </>
  ),
  headphones: (
    <>
      <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 13h3v6H5.5A1.5 1.5 0 0 1 4 17.5V13ZM20 13h-3v6h1.5a1.5 1.5 0 0 0 1.5-1.5V13Z" />
    </>
  ),
  monitor: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
  "badge-check": (
    <>
      <path d="M12 2.8 15 5l3.7.2.9 3.6 2.1 3-2.1 3 .1 3.7-3.6.9-3 2.1-3-2.1-3.6-.9.1-3.7-2.1-3 2.1-3 .9-3.6L9 5l3-2.2Z" />
      <path d="m8.8 12.1 2.1 2.1 4.4-4.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </>
  ),
  car: (
    <>
      <path d="M5 16h14l-1-6-2-3H8l-2 3-1 6Z" />
      <path d="M5 13H3M21 13h-2M7 16v2M17 16v2" />
      <circle cx="8" cy="14" r="1" />
      <circle cx="16" cy="14" r="1" />
    </>
  ),
  "user-plus": (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 20c.5-4 2.5-6 5.5-6s5 2 5.5 6M18 8v6M15 11h6" />
    </>
  ),
  "book-open": (
    <>
      <path d="M3 5.5c3.5-.8 6-.2 9 2v12c-3-2.2-5.5-2.8-9-2V5.5Z" />
      <path d="M21 5.5c-3.5-.8-6-.2-9 2v12c3-2.2 5.5-2.8 9-2V5.5Z" />
    </>
  ),
  "clipboard-check": (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3h6v1.5M8.5 13l2.2 2.2 4.8-5" />
    </>
  ),
  shield: <path d="M12 3 5 6v5c0 4.7 2.7 8 7 10 4.3-2 7-5.3 7-10V6l-7-3Z" />,
  "credit-card": (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18M7 15h4" />
    </>
  ),
  fingerprint: (
    <>
      <path d="M8.5 10.5a3.5 3.5 0 0 1 7 0c0 5-1 8-3.2 10" />
      <path d="M5.5 10.5a6.5 6.5 0 0 1 13 0c0 3.8-.5 7.3-2.1 10.2" />
      <path d="M3 10.5a9 9 0 0 1 18 0M9.5 14c-.1 2.6-.6 4.7-1.8 6.5M12 8a2.5 2.5 0 0 0-2.5 2.5" />
    </>
  ),
};

function Icon({
  name,
  className,
  ...props
}: SvgIconProps & { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {iconPaths[name] ?? <circle cx="12" cy="12" r="7" />}
    </svg>
  );
}

const sizes = {
  sm: {
    circle: "h-9 w-9",
    icon: "h-[18px] w-[18px]",
  },
  md: {
    circle: "h-11 w-11",
    icon: "h-5 w-5",
  },
  lg: {
    circle: "h-14 w-14",
    icon: "h-6 w-6",
  },
} as const;

const tones = {
  blue: "border-[#D7E9FF] bg-[#EFF6FF] text-[#0878FF]",
  dark: "border-[#12365E] bg-[#092442] text-[#0D83FF]",
  white: "border-white/10 bg-white/[0.06] text-[#2492FF]",
} as const;

export function IconCircle({
  name,
  className,
  iconClassName,
  size = "md",
  tone = "blue",
  label,
}: IconCircleProps) {
  return (
    <span
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border",
        sizes[size].circle,
        tones[tone],
        className,
      )}
    >
      <Icon
        name={name}
        className={cn(sizes[size].icon, iconClassName)}
      />
    </span>
  );
}
