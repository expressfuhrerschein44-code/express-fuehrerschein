import {
  Archive,
  CheckCircle2,
  CircleDot,
  FileEdit,
  ShieldAlert,
} from "lucide-react";

export interface AdminTheoryStatusBadgeProps {
  status: string;
}

export function AdminTheoryStatusBadge({
  status,
}: AdminTheoryStatusBadgeProps) {
  const normalized =
    status.trim().toLowerCase();

  const config =
    normalized === "published" ||
    normalized === "resolved" ||
    normalized === "active"
      ? {
          label:
            normalized === "resolved"
              ? "Erledigt"
              : normalized === "active"
                ? "Aktiv"
                : "Veröffentlicht",
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          icon: CheckCircle2,
        }
      : normalized === "draft" ||
          normalized === "open" ||
          normalized === "in_progress"
        ? {
            label:
              normalized === "open"
                ? "Offen"
                : normalized === "in_progress"
                  ? "In Bearbeitung"
                  : "Entwurf",
            className:
              "border-amber-200 bg-amber-50 text-amber-700",
            icon: FileEdit,
          }
        : normalized === "archived" ||
            normalized === "inactive" ||
            normalized === "closed"
          ? {
              label:
                normalized === "closed"
                  ? "Geschlossen"
                  : "Archiviert",
              className:
                "border-slate-200 bg-slate-50 text-slate-600",
              icon: Archive,
            }
          : normalized === "rejected" ||
              normalized === "invalid"
            ? {
                label: status,
                className:
                  "border-red-200 bg-red-50 text-red-700",
                icon: ShieldAlert,
              }
            : {
                label: status || "Unbekannt",
                className:
                  "border-blue-200 bg-blue-50 text-blue-700",
                icon: CircleDot,
              };

  const Icon = config.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold",
        config.className,
      ].join(" ")}
    >
      <Icon
        className="h-3.5 w-3.5"
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

export default AdminTheoryStatusBadge;
