import {
  LOGIN_COPY,
} from "@/data/login";

import { cn } from "@/lib/utils";

export interface LoginSecurityNoticeProps {
  className?: string;
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3 5 6v5c0 4.7 2.7 8 7 10 4.3-2 7-5.3 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function LoginSecurityNotice({
  className,
}: LoginSecurityNoticeProps) {
  const copy =
    LOGIN_COPY.security;

  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-4",
        "rounded-[10px] border border-[#D7E5F5]",
        "bg-[#EEF5FD] px-4 py-4",
        "text-[#43536A]",
        "sm:px-5",
        className,
      )}
    >
      <div
        className="
          inline-flex h-10 w-10 shrink-0 items-center justify-center
          rounded-full
          bg-[#DCEBFF]
          text-[#0878FF]
        "
      >
        <ShieldIcon />
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-medium leading-5 sm:text-[12px]">
          {copy.title}
        </p>

        <p className="mt-0.5 text-[10px] leading-5 text-[#66758A] sm:text-[11px]">
          {copy.description}
        </p>
      </div>
    </div>
  );
}
