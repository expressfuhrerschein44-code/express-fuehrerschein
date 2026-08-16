"use client";

import Link from "next/link";

import {
  ArrowLeft,
  CarFront,
  PencilLine,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  AdminPraxisActions,
} from "@/components/admin/praxis/admin-praxis-actions";

import {
  AdminPraxisAppointmentCard,
} from "@/components/admin/praxis/admin-praxis-appointment-card";

import {
  AdminPraxisCustomerCard,
} from "@/components/admin/praxis/admin-praxis-customer-card";

import {
  AdminPraxisForm,
} from "@/components/admin/praxis/admin-praxis-form";

import {
  AdminPraxisLicenseCard,
} from "@/components/admin/praxis/admin-praxis-license-card";

import {
  AdminPraxisNotesCard,
} from "@/components/admin/praxis/admin-praxis-notes-card";

import {
  AdminPraxisStatusBadge,
} from "@/components/admin/praxis/admin-praxis-status-badge";

import {
  AdminPraxisTimeline,
} from "@/components/admin/praxis/admin-praxis-timeline";

import type {
  AdminPraxisAppointmentDetailView,
  AdminPraxisClientOption,
} from "@/types/admin-praxis";

export interface AdminPraxisDetailPageProps {
  appointment:
    AdminPraxisAppointmentDetailView;
  clients:
    AdminPraxisClientOption[];
}

export function AdminPraxisDetailPage({
  appointment,
  clients,
}: AdminPraxisDetailPageProps) {
  const router =
    useRouter();

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-4 px-4 pb-12 pt-5 sm:px-5 lg:px-7 lg:pt-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/admin/praxis"
          className="inline-flex min-h-10 w-fit items-center gap-2 rounded-[11px] border border-[#DCE5EF] bg-white px-3 text-[10px] font-black text-[#53647A] transition hover:bg-[#F8FAFC]"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-3.5 w-3.5"
          />
          Zurück zu Praxis
        </Link>

        <AdminPraxisStatusBadge
          status={
            appointment.status
          }
        />
      </div>

      <section className="rounded-[22px] border border-[#E1E8F1] bg-white p-5 shadow-[0_12px_40px_rgba(15,23,42,0.045)] sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EAF2FF] text-[#0B63F6]">
            <CarFront
              aria-hidden="true"
              className="h-5 w-5"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#0B63F6]">
              Praxistermin
            </p>

            <h1 className="mt-1 text-[23px] font-black tracking-[-0.035em] text-[#071426]">
              {
                appointment.customer.fullName
              }
            </h1>

            <p className="mt-1 font-mono text-[9px] font-semibold text-[#8A97A8]">
              {
                appointment.id
              }
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <AdminPraxisAppointmentCard
            appointment={
              appointment
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            <AdminPraxisCustomerCard
              customer={
                appointment.customer
              }
            />

            <AdminPraxisLicenseCard
              licenseClass={
                appointment.licenseClass
              }
            />
          </div>

          <AdminPraxisNotesCard
            appointment={
              appointment
            }
          />

          {appointment
            .capabilities
            .canEdit ? (
            <section className="rounded-[18px] border border-[#E3E9F2] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.03)] sm:p-6">
              <div className="mb-5 flex items-center gap-3 border-b border-[#EDF1F6] pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#EEF5FF] text-[#0B63F6]">
                  <PencilLine
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#7A899C]">
                    Bearbeiten
                  </p>
                  <h2 className="mt-1 text-[14px] font-black text-[#0A172A]">
                    Termindaten ändern
                  </h2>
                </div>
              </div>

              <AdminPraxisForm
                mode="edit"
                clients={
                  clients
                }
                appointment={
                  appointment
                }
                onSuccess={() =>
                  router.refresh()
                }
              />
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <AdminPraxisActions
            appointment={
              appointment
            }
          />

          <AdminPraxisTimeline
            items={
              appointment.timeline
            }
          />
        </aside>
      </div>
    </main>
  );
}

export default AdminPraxisDetailPage;
