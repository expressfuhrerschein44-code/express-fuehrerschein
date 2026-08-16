import type {
  AdminPaymentStatus,
} from "@/types/admin-payments";

const STATUS_META: Record<
  AdminPaymentStatus,
  {
    label: string;
    className: string;
  }
> = {
  draft: {
    label: "Brouillon",
    className:
      "border-slate-200 bg-slate-50 text-slate-700",
  },
  awaiting_payment: {
    label: "En attente",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },
  proof_submitted: {
    label: "Preuve reçue",
    className:
      "border-amber-200 bg-amber-50 text-amber-800",
  },
  under_review: {
    label: "En vérification",
    className:
      "border-violet-200 bg-violet-50 text-violet-700",
  },
  paid: {
    label: "Payé",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Refusé",
    className:
      "border-red-200 bg-red-50 text-red-700",
  },
  cancelled: {
    label: "Annulé",
    className:
      "border-slate-200 bg-slate-100 text-slate-500",
  },
};

export function AdminPaymentStatusBadge({
  status,
}: {
  status: AdminPaymentStatus;
}) {
  const meta = STATUS_META[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}
