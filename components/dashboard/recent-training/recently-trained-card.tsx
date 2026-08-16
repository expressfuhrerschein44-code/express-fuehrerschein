/**
 * Express-Führerschein
 * Recent training card.
 */

import {
  DashboardCard,
} from "@/components/dashboard/shared/dashboard-card";

import {
  DashboardSectionHeader,
} from "@/components/dashboard/shared/dashboard-section-header";

import {
  RecentlyTrainedItem,
} from "@/components/dashboard/recent-training/recently-trained-item";

import {
  CLIENT_ROUTES,
} from "@/data/client-navigation";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardRecentTraining,
} from "@/types/dashboard";

export interface RecentlyTrainedCardProps {
  items:
    readonly DashboardRecentTraining[];

  compact?:
    boolean;

  className?:
    string;
}

export function RecentlyTrainedCard({
  items,
  compact =
    false,
  className,
}: RecentlyTrainedCardProps) {
  return (
    <DashboardCard
      className={cn(
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <DashboardSectionHeader
        title="Zuletzt trainiert"
        actionLabel="Trainieren"
        actionHref={CLIENT_ROUTES.training}
      />

      {items.length > 0 ? (
        <div className="mt-4 space-y-2">
          {items.map(
            (
              item,
            ) => (
              <RecentlyTrainedItem
                key={item.id}
                item={item}
                compact={compact}
              />
            ),
          )}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-[#F7F9FC] px-4 py-5 text-center text-[11px] leading-5 text-[#6C7B8D]">
          Noch kein abgeschlossenes Training vorhanden.
        </p>
      )}
    </DashboardCard>
  );
}
