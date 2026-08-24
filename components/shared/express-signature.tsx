import type {
  SVGProps,
} from "react";

import {
  cn,
} from "@/lib/utils";

interface ExpressSignatureProps
  extends Omit<
    SVGProps<SVGSVGElement>,
    "children"
  > {
  className?: string;
  title?: string;
}

export function ExpressSignature({
  className,
  title = "Express-Führerschein",
  ...props
}: ExpressSignatureProps) {
  return (
    <svg
      viewBox="0 0 920 250"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
      className={cn(
        "block h-auto w-full",
        className,
      )}
      {...props}
    >
      <title>{title}</title>

      <defs>
        <linearGradient
          id="expressSignatureGradient"
          x1="70"
          y1="40"
          x2="850"
          y2="215"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0"
            stopColor="#075CFF"
          />

          <stop
            offset="0.42"
            stopColor="#073DA8"
          />

          <stop
            offset="0.78"
            stopColor="#061F63"
          />

          <stop
            offset="1"
            stopColor="#008CFF"
          />
        </linearGradient>

        <linearGradient
          id="expressSignatureAccent"
          x1="170"
          y1="215"
          x2="870"
          y2="160"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0"
            stopColor="#073B9C"
          />

          <stop
            offset="0.52"
            stopColor="#087BFF"
          />

          <stop
            offset="1"
            stopColor="#063A9E"
          />
        </linearGradient>
      </defs>

      {/* Decorative handwritten E */}
      <path
        d="
          M260 52
          C205 28 130 40 91 78
          C61 108 75 136 121 136
          C164 136 204 119 229 103

          M222 103
          C177 124 122 148 85 177
          C48 206 52 225 92 222
          C135 219 176 194 208 168
        "
        fill="none"
        stroke="url(#expressSignatureGradient)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Main signature */}
      <text
        x="175"
        y="166"
        fill="url(#expressSignatureGradient)"
        fontFamily="'Segoe Script', 'Brush Script MT', 'URW Chancery L', cursive"
        fontSize="83"
        fontWeight="600"
        fontStyle="italic"
        letterSpacing="-3"
      >
        Express-Führerschein
      </text>

      {/* Umlaut reinforcement */}
      <circle
        cx="568"
        cy="93"
        r="5.5"
        fill="#075CFF"
      />

      <circle
        cx="585"
        cy="91"
        r="5.5"
        fill="#075CFF"
      />

      {/* Long handwritten underline */}
      <path
        d="
          M115 211
          C250 192 398 187 535 188
          C654 189 755 188 838 176
          C873 171 892 175 899 185

          C842 178 783 188 738 201
        "
        fill="none"
        stroke="url(#expressSignatureAccent)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Second subtle flourish */}
      <path
        d="
          M206 221
          C373 200 532 201 680 204
          C744 205 804 207 854 199
        "
        fill="none"
        stroke="url(#expressSignatureGradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.78"
      />

      {/* Small final flourish */}
      <path
        d="
          M806 193
          C842 174 879 175 904 194
          C883 188 862 191 844 204
        "
        fill="none"
        stroke="#087BFF"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}