import Image from "next/image";

import { REGISTRATION_TRUST_ITEMS } from "@/data/registration";
import { cn } from "@/lib/utils";
import type { RegistrationTrustItem } from "@/types/registration";

export interface RegistrationTrustBarProps {
  className?: string;
  items?: readonly RegistrationTrustItem[];
}

function SecurityIcon({
  name,
}: {
  name: "lock" | "shield";
}) {
  if (name === "lock") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 5 6v5c0 4.7 2.7 8 7 10 4.3-2 7-5.3 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function TrustItem({
  item,
}: {
  item: RegistrationTrustItem;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {item.logoSrc ? (
        <div className="relative h-[28px] w-[72px] shrink-0">
          <Image
            src={item.logoSrc}
            alt={item.name}
            fill
            sizes="72px"
            className="object-contain object-left"
          />
        </div>
      ) : (
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[#15426F] bg-[#092442] text-[#1684FF]">
          <SecurityIcon
            name={item.icon ?? "shield"}
          />
        </div>
      )}

      <div className="min-w-0">
        <p className="text-[11px] font-extrabold leading-4 text-white">
          {item.name}
        </p>

        <p className="mt-0.5 text-[9px] leading-4 text-white/55">
          {item.label}
        </p>
      </div>
    </div>
  );
}

export function RegistrationTrustBar({
  className,
  items = REGISTRATION_TRUST_ITEMS,
}: RegistrationTrustBarProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-5 gap-y-5 rounded-[16px] border border-white/[0.09] bg-[#041426]/82 px-5 py-5 backdrop-blur-sm xl:grid-cols-5 xl:gap-x-4",
        className,
      )}
    >
      {items.map((item) => (
        <TrustItem
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
}
