import {
  CheckCircle2,
  CircleDot,
  Clock3,
  FileEdit,
  HelpCircle,
  XCircle,
} from "lucide-react";

import type { AdminApplicationViewStatus } from "@/types/admin-applications";

interface AdminApplicationStatusBadgeProps {
  status: AdminApplicationViewStatus;
  compact?: boolean;
}

const statusConfig = {
  draft: {
    label: "Entwurf",
    icon: FileEdit,
    className: "border-slate-500/20 bg-slate-500/10 text-slate-300",
  },
  submitted: {
    label: "Neu eingereicht",
    icon: CircleDot,
    className: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  },
  under_review: {
    label: "In Prüfung",
    icon: Clock3,
    className: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  },
  approved: {
    label: "Bestätigt",
    icon: CheckCircle2,
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  },
  rejected: {
    label: "Abgelehnt",
    icon: XCircle,
    className: "border-rose-500/20 bg-rose-500/10 text-rose-300",
  },
  other: {
    label: "Sonstiger Status",
    icon: HelpCircle,
    className: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  },
} satisfies Record<
  AdminApplicationViewStatus,
  { label: string; icon: typeof Clock3; className: string }
>;

export function AdminApplicationStatusBadge({
  status,
  compact = false,
}: AdminApplicationStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-extrabold ${config.className} ${
        compact ? "px-2 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]"
      }`}
    >
      <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export default AdminApplicationStatusBadge;
