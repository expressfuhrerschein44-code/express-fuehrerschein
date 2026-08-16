import { cn } from "@/lib/utils";
import type { HeroBenefit } from "@/types/home";

export interface HeroBenefitsProps {
  items: readonly HeroBenefit[];
  className?: string;
}

function CheckIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-[#0878FF] text-white shadow-[0_0_0_3px_rgba(8,120,255,0.08)]"
    >
      <svg
        viewBox="0 0 18 18"
        className="h-[11px] w-[11px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m4.3 9.3 2.7 2.7 6.2-6.3" />
      </svg>
    </span>
  );
}

export function HeroBenefits({
  items,
  className,
}: HeroBenefitsProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-x-7 sm:gap-y-3",
        className,
      )}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="flex min-w-0 items-center gap-2 text-[12px] font-medium text-white/95 sm:text-[13px]"
        >
          <CheckIcon />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
