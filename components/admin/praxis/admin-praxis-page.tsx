"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  AdminPraxisCreateDialog,
} from "@/components/admin/praxis/admin-praxis-create-dialog";

import {
  AdminPraxisFilters,
} from "@/components/admin/praxis/admin-praxis-filters";

import {
  AdminPraxisHeader,
} from "@/components/admin/praxis/admin-praxis-header";

import {
  AdminPraxisStats,
} from "@/components/admin/praxis/admin-praxis-stats";

import {
  AdminPraxisTable,
} from "@/components/admin/praxis/admin-praxis-table";

import type {
  AdminPraxisFilters as Filters,
  AdminPraxisPageData,
} from "@/types/admin-praxis";

export interface AdminPraxisPageProps {
  initialData:
    AdminPraxisPageData;
}

const INITIAL_FILTERS:
  Filters = {
    search:
      "",
    status:
      "all",
    licenseClass:
      "",
    period:
      "all",
  };

function berlinDayKey(
  value:
    string | Date,
): string {
  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone:
        "Europe/Berlin",
      year:
        "numeric",
      month:
        "2-digit",
      day:
        "2-digit",
    },
  ).format(
    value instanceof Date
      ? value
      : new Date(
          value,
        ),
  );
}

export function AdminPraxisPage({
  initialData,
}: AdminPraxisPageProps) {
  const router =
    useRouter();

  const [
    filters,
    setFilters,
  ] =
    useState<Filters>(
      INITIAL_FILTERS,
    );

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    refreshing,
    startRefresh,
  ] =
    useTransition();

  const licenseClasses =
    useMemo(
      () =>
        Array.from(
          new Set(
            initialData.appointments
              .map(
                (
                  appointment,
                ) =>
                  appointment
                    .licenseClass
                    ?.code ??
                  null,
              )
              .filter(
                (
                  value,
                ): value is string =>
                  Boolean(
                    value,
                  ),
              ),
          ),
        ).sort(
          (
            left,
            right,
          ) =>
            left.localeCompare(
              right,
              "de",
              {
                numeric:
                  true,
              },
            ),
        ),
      [
        initialData.appointments,
      ],
    );

  const filteredAppointments =
    useMemo(
      () => {
        const search =
          filters.search
            .trim()
            .toLowerCase();

        const now =
          Date.now();

        const today =
          berlinDayKey(
            new Date(),
          );

        return initialData.appointments.filter(
          (
            appointment,
          ) => {
            if (
              filters.status !==
                "all" &&
              appointment.status !==
                filters.status
            ) {
              return false;
            }

            if (
              filters.licenseClass &&
              appointment
                .licenseClass
                ?.code !==
                filters.licenseClass
            ) {
              return false;
            }

            const startsAt =
              new Date(
                appointment.startsAt,
              );

            if (
              filters.period ===
                "today" &&
              berlinDayKey(
                startsAt,
              ) !==
                today
            ) {
              return false;
            }

            if (
              filters.period ===
                "upcoming" &&
              startsAt.getTime() <
                now
            ) {
              return false;
            }

            if (
              filters.period ===
                "past" &&
              startsAt.getTime() >=
                now
            ) {
              return false;
            }

            if (
              !search
            ) {
              return true;
            }

            const haystack =
              [
                appointment.title,
                appointment.location,
                appointment
                  .customer
                  .fullName,
                appointment
                  .customer
                  .email,
                appointment
                  .customer
                  .phone,
                appointment
                  .licenseClass
                  ?.code,
                appointment
                  .managedBy
                  ?.fullName,
              ]
                .filter(Boolean)
                .join(
                  " ",
                )
                .toLowerCase();

            return haystack.includes(
              search,
            );
          },
        );
      },
      [
        filters,
        initialData.appointments,
      ],
    );

  function refresh() {
    startRefresh(
      () => {
        router.refresh();
      },
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-4 px-4 pb-12 pt-5 sm:px-5 lg:px-7 lg:pt-7">
      <AdminPraxisHeader
        onCreate={() =>
          setCreateOpen(
            true,
          )
        }
        onRefresh={
          refresh
        }
        refreshing={
          refreshing
        }
      />

      <AdminPraxisStats
        stats={
          initialData.stats
        }
      />

      <AdminPraxisFilters
        filters={
          filters
        }
        licenseClasses={
          licenseClasses
        }
        onChange={
          setFilters
        }
      />

      <AdminPraxisTable
        appointments={
          filteredAppointments
        }
      />

      <AdminPraxisCreateDialog
        open={
          createOpen
        }
        clients={
          initialData.clients
        }
        onClose={() =>
          setCreateOpen(
            false,
          )
        }
        onCreated={() => {
          setCreateOpen(
            false,
          );
          refresh();
        }}
      />
    </main>
  );
}

export default AdminPraxisPage;
