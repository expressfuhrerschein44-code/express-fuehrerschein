import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Hash,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { AdminApplicationCustomerCard } from "@/components/admin/applications/admin-application-customer-card";
import { AdminApplicationDocumentsCard } from "@/components/admin/applications/admin-application-documents-card";
import { AdminApplicationExamCard } from "@/components/admin/applications/admin-application-exam-card";
import { AdminApplicationLicenseCard } from "@/components/admin/applications/admin-application-license-card";
import { AdminApplicationReviewCard } from "@/components/admin/applications/admin-application-review-card";
import { AdminApplicationSignatureCard } from "@/components/admin/applications/admin-application-signature-card";
import { AdminApplicationStatusBadge } from "@/components/admin/applications/admin-application-status-badge";
import { AdminApplicationTimeline } from "@/components/admin/applications/admin-application-timeline";
import type { AdminApplicationDetail } from "@/types/admin-applications";

interface AdminApplicationDetailPageProps {
  application: AdminApplicationDetail;
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function AdminApplicationDetailPage({ application }: AdminApplicationDetailPageProps) {
  const reviewerName = application.reviewer
    ? `${application.reviewer.firstName} ${application.reviewer.lastName}`.trim()
    : null;

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href="/admin/antraege"
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.03] px-3 text-xs font-extrabold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Zurück zu Anträge
      </Link>

      <section className="mt-4 rounded-2xl border border-white/[0.08] bg-[#0B1424] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.14)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.09em] text-blue-300">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Führerscheinantrag
              </span>
              <AdminApplicationStatusBadge status={application.status} />
            </div>

            <h1 className="mt-4 break-words text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
              {application.reference}
            </h1>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              {application.selectedClasses.length
                ? `Klasse ${application.selectedClasses.join(", ")}`
                : "Keine Führerscheinklasse gespeichert"}
            </p>
          </div>

          <div className="grid min-w-0 gap-2 text-xs sm:grid-cols-2 lg:min-w-[420px]">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
              <p className="flex items-center gap-1.5 font-bold uppercase tracking-[0.07em] text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Eingereicht
              </p>
              <p className="mt-2 font-extrabold text-slate-200">{formatDateTime(application.submittedAt)}</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
              <p className="flex items-center gap-1.5 font-bold uppercase tracking-[0.07em] text-slate-600">
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Bearbeiter
              </p>
              <p className="mt-2 truncate font-extrabold text-slate-200">{reviewerName || "Noch nicht zugewiesen"}</p>
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 sm:col-span-2">
              <p className="flex items-center gap-1.5 font-bold uppercase tracking-[0.07em] text-slate-600">
                <Hash className="h-3.5 w-3.5" aria-hidden="true" />
                System-ID / Rohstatus
              </p>
              <p className="mt-2 break-all font-mono text-[10px] font-semibold text-slate-400">
                {application.id} · {application.rawStatus}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
        <div className="space-y-4">
          <AdminApplicationCustomerCard customer={application.customer} />
          <AdminApplicationLicenseCard application={application} />
          <AdminApplicationDocumentsCard documents={application.documents} />
          <AdminApplicationSignatureCard signature={application.signature} />
        </div>

        <div className="space-y-4">
          <AdminApplicationExamCard
            theoryPassed={application.theoryPassed}
            practicalPassed={application.practicalPassed}
          />
          <AdminApplicationReviewCard
            applicationId={application.id}
            status={application.status}
            rejectionReason={application.rejectionReason}
            reviewerName={reviewerName}
          />
          <AdminApplicationTimeline items={application.timeline} />
        </div>
      </div>
    </main>
  );
}

export default AdminApplicationDetailPage;
