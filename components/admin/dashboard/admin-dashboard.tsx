import Link from "next/link";

import {
  BookOpenCheck,
  CalendarDays,
  CreditCard,
  FileCheck2,
  Files,
  MessagesSquare,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  AdminStatCard,
} from "@/components/admin/dashboard/admin-stat-card";

import type {
  AdminDashboardData,
  AdminIdentity,
} from "@/types/admin";

export interface AdminDashboardProps {
  admin:
    AdminIdentity;
  data:
    AdminDashboardData;
}

function formatDateTime(
  value:
    Date,
): string {
  return new Intl.DateTimeFormat(
    "de-DE",
    {
      day:
        "2-digit",
      month:
        "2-digit",
      year:
        "numeric",
      hour:
        "2-digit",
      minute:
        "2-digit",
    },
  ).format(
    value,
  );
}

export function AdminDashboard({
  admin,
  data,
}: AdminDashboardProps) {
  const stats =
    [
      {
        label:
          "Benutzerkonten",
        value:
          data.stats.users,
        description:
          "Alle registrierten Konten der Plattform.",
        icon:
          Users,
      },
      {
        label:
          "Führerscheinanträge",
        value:
          data.stats
            .submittedApplications,
        description:
          "Bereits eingereichte Anträge.",
        icon:
          FileCheck2,
      },
      {
        label:
          "Zahlungen prüfen",
        value:
          data.stats
            .paymentsToReview,
        description:
          "Zahlungsnachweise warten auf Kontrolle.",
        icon:
          CreditCard,
      },
      {
        label:
          "Dokumente prüfen",
        value:
          data.stats
            .documentsToReview,
        description:
          "Neue oder noch nicht geprüfte Dokumente.",
        icon:
          Files,
      },
      {
        label:
          "Offene Nachrichten",
        value:
          data.stats
            .openConversations,
        description:
          "Offene Support-Konversationen.",
        icon:
          MessagesSquare,
      },
      {
        label:
          "Kommende Termine",
        value:
          data.stats
            .upcomingAppointments,
        description:
          "Zukünftige nicht stornierte Termine.",
        icon:
          CalendarDays,
      },
      {
        label:
          "Theorie-Meldungen",
        value:
          data.stats
            .openTheoryReports,
        description:
          "Offene Meldungen zu Theoriefragen.",
        icon:
          BookOpenCheck,
      },
    ];

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-5 lg:px-7 lg:py-7">
      <section className="rounded-[20px] border border-[#E3E8F0] bg-white p-5 shadow-[0_10px_30px_rgba(17,40,70,0.04)] sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EAF2FF] px-3 py-1.5 text-[8px] font-extrabold uppercase tracking-[0.07em] text-[#0B63F6]">
              <ShieldCheck
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              Administration
            </span>

            <h1 className="mt-3 text-[24px] font-black tracking-[-0.035em] text-[#081529]">
              Willkommen,{" "}
              {admin.firstName}
            </h1>

            <p className="mt-1.5 text-[9px] font-medium leading-4 text-[#718096]">
              Hier siehst du den aktuellen Zustand der Express-Führerschein Plattform.
            </p>
          </div>

          <div className="rounded-[14px] border border-[#DFE7F1] bg-[#F8FAFD] px-4 py-3">
            <p className="text-[7px] font-extrabold uppercase tracking-[0.06em] text-[#8290A2]">
              Admin-Benachrichtigungen
            </p>

            <p className="mt-1 text-[18px] font-black text-[#081529]">
              {data.stats
                .unreadAdminNotifications}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(
          (
            stat,
          ) => (
            <AdminStatCard
              key={
                stat.label
              }
              {...stat}
            />
          ),
        )}
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-[18px] border border-[#E3E8F0] bg-white p-5">
          <div>
            <p className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#0B63F6]">
              Letzte Aktivitäten
            </p>

            <h2 className="mt-1 text-[15px] font-black text-[#081529]">
              Admin-Protokoll
            </h2>
          </div>

          {data.recentAudit.length ===
          0 ? (
            <div className="mt-4 rounded-[13px] border border-dashed border-[#DDE4ED] bg-[#FAFBFD] px-4 py-8 text-center">
              <p className="text-[9px] font-bold text-[#718096]">
                Noch keine Admin-Aktivität vorhanden.
              </p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[#EEF1F5]">
              {data.recentAudit.map(
                (
                  item,
                ) => (
                  <div
                    key={
                      item.id
                    }
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[9px] font-extrabold text-[#24354B]">
                        {item.action}
                      </p>

                      <p className="mt-0.5 truncate text-[7px] font-medium text-[#8794A5]">
                        {item.entityType}
                        {item.entityId
                          ? ` · ${item.entityId}`
                          : ""}
                      </p>
                    </div>

                    <span className="shrink-0 text-[7px] font-semibold text-[#8A97A7]">
                      {formatDateTime(
                        item.createdAt,
                      )}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        <section className="rounded-[18px] border border-[#E3E8F0] bg-white p-5">
          <p className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#0B63F6]">
            Schnellzugriff
          </p>

          <h2 className="mt-1 text-[15px] font-black text-[#081529]">
            Wichtige Bereiche
          </h2>

          <div className="mt-4 space-y-2">
            {[
              [
                "/admin/antraege",
                "Führerscheinanträge prüfen",
              ],
              [
                "/admin/zahlungen",
                "Zahlungsnachweise prüfen",
              ],
              [
                "/admin/dokumente",
                "Dokumente kontrollieren",
              ],
              [
                "/admin/nachrichten",
                "Nachrichten beantworten",
              ],
            ].map(
              (
                [
                  href,
                  label,
                ],
              ) => (
                <Link
                  key={
                    href
                  }
                  href={
                    href
                  }
                  className="flex min-h-10 items-center justify-between rounded-[11px] border border-[#E6EBF2] bg-[#FAFBFD] px-3 text-[8px] font-extrabold text-[#34455A] transition hover:border-[#BCD0ED] hover:bg-[#F4F8FF] hover:text-[#0B63F6]"
                >
                  {label}
                  <span aria-hidden="true">
                    →
                  </span>
                </Link>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
