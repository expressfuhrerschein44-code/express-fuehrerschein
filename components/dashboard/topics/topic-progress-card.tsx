/**
 * Express-Führerschein
 * Progress by theory topic.
 */

import {
  DashboardCard,
} from "@/components/dashboard/shared/dashboard-card";

import {
  DashboardSectionHeader,
} from "@/components/dashboard/shared/dashboard-section-header";

import {
  TopicProgressRow,
} from "@/components/dashboard/topics/topic-progress-row";

import {
  CLIENT_ROUTES,
} from "@/data/client-navigation";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardTopicProgress,
} from "@/types/dashboard";

export interface TopicProgressCardProps {
  topics:
    readonly DashboardTopicProgress[];

  compact?:
    boolean;

  className?:
    string;
}

export function TopicProgressCard({
  topics,
  compact =
    false,
  className,
}: TopicProgressCardProps) {
  return (
    <DashboardCard
      className={cn(
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <DashboardSectionHeader
        title="Fortschritt nach Themen"
        actionLabel="Alle anzeigen"
        actionHref={CLIENT_ROUTES.progress}
      />

      {topics.length > 0 ? (
        <div className="mt-5 space-y-3">
          {topics.map(
            (
              topic,
            ) => (
              <TopicProgressRow
                key={topic.id}
                topic={topic}
                compact={compact}
              />
            ),
          )}
        </div>
      ) : (
        <p className="mt-5 rounded-xl bg-[#F7F9FC] px-4 py-5 text-center text-[11px] leading-5 text-[#6C7B8D]">
          Noch keine Themenfortschritte vorhanden.
        </p>
      )}
    </DashboardCard>
  );
}
