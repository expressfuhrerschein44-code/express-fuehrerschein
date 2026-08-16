import Link from "next/link";

import {
  ArrowRight,
} from "lucide-react";

import type {
  LucideIcon,
} from "lucide-react";

export interface TrainingModeCardProps {
  title:
    string;
  description:
    string;
  meta:
    string;
  href:
    string;
  icon:
    LucideIcon;
  disabled?:
    boolean;
}

export function TrainingModeCard({
  title,
  description,
  meta,
  href,
  icon: Icon,
  disabled = false,
}: TrainingModeCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF5FF] text-[#0B63F6]">
          <Icon
            className="h-4.5 w-4.5"
            aria-hidden="true"
          />
        </span>

        <span className="rounded-full bg-[#F5F7FA] px-2.5 py-1 text-[8px] font-extrabold text-[#6B7B90]">
          {meta}
        </span>
      </div>

      <h3 className="mt-4 text-[14px] font-black tracking-[-0.02em] text-[#081529]">
        {title}
      </h3>

      <p className="mt-1.5 min-h-[40px] text-[10px] font-medium leading-5 text-[#718096]">
        {description}
      </p>

      <div className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-extrabold text-[#0B63F6]">
        Starten
        <ArrowRight
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
      </div>
    </>
  );

  if (disabled) {
    return (
      <div
        aria-disabled="true"
        className="rounded-[18px] border border-[#E5EAF2] bg-white p-5 opacity-55"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group rounded-[18px] border border-[#E5EAF2] bg-white p-5 shadow-[0_8px_24px_rgba(17,40,70,0.035)] transition hover:-translate-y-0.5 hover:border-[#C9D9F2] hover:shadow-[0_14px_32px_rgba(17,40,70,0.07)]"
    >
      {content}
    </Link>
  );
}
