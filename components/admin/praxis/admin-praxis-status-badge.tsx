import {
  Ban,
  CheckCircle2,
  CircleDot,
  CircleEllipsis,
  Clock3,
  Inbox,
} from "lucide-react";

import type {
  AdminPraxisStatusView,
} from "@/types/admin-praxis";

export interface AdminPraxisStatusBadgeProps {
  status:
    | AdminPraxisStatusView
    | "requested";

  compact?:
    boolean;
}

const STATUS_CONFIG = {
  requested: {
    label:
      "Angefragt",
    className:
      "border-sky-200 bg-sky-50 text-sky-700",
    icon:
      Inbox,
  },

  scheduled: {
    label:
      "Geplant",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    icon:
      Clock3,
  },

  confirmed: {
    label:
      "Bestätigt",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon:
      CheckCircle2,
  },

  cancelled: {
    label:
      "Abgesagt",
    className:
      "border-red-200 bg-red-50 text-red-700",
    icon:
      Ban,
  },

  completed: {
    label:
      "Abgeschlossen",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
    icon:
      CircleDot,
  },

  other: {
    label:
      "Sonstiger Status",
    className:
      "border-slate-200 bg-slate-50 text-slate-600",
    icon:
      CircleEllipsis,
  },
} as const;

type SupportedPraxisBadgeStatus =
  keyof typeof STATUS_CONFIG;

function normalizeStatus(
  status:
    | AdminPraxisStatusView
    | "requested",
): SupportedPraxisBadgeStatus {
  if (
    status ===
      "requested" ||
    status ===
      "scheduled" ||
    status ===
      "confirmed" ||
    status ===
      "cancelled" ||
    status ===
      "completed" ||
    status ===
      "other"
  ) {
    return status;
  }

  return "other";
}

export function AdminPraxisStatusBadge({
  status,
  compact = false,
}: AdminPraxisStatusBadgeProps) {
  const normalizedStatus =
    normalizeStatus(
      status,
    );

  const config =
    STATUS_CONFIG[
      normalizedStatus
    ];

  const Icon =
    config.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border font-extrabold",
        config.className,

        compact
          ? "px-2 py-1 text-[9px]"
          : "px-2.5 py-1.5 text-[10px]",
      ].join(
        " ",
      )}
    >
      <Icon
        aria-hidden="true"
        className={
          compact
            ? "h-3 w-3"
            : "h-3.5 w-3.5"
        }
      />

      {config.label}
    </span>
  );
}

export default AdminPraxisStatusBadge;