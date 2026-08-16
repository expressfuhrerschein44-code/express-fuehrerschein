/**
 * Express-Führerschein
 * Dashboard quick-access grid.
 */

import {
  DashboardCard,
} from "@/components/dashboard/shared/dashboard-card";

import {
  QuickAccessItem,
} from "@/components/dashboard/quick-access/quick-access-item";

import {
  cn,
} from "@/lib/utils";

import type {
  DashboardQuickAccessItem,
} from "@/types/dashboard";

export interface QuickAccessCardProps {
  items:
    readonly DashboardQuickAccessItem[];

  compact?:
    boolean;

  className?:
    string;
}

export function QuickAccessCard({
  items,
  compact =
    false,
  className,
}: QuickAccessCardProps) {
  return (
    <DashboardCard
      className={cn(
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <h2 className="text-[14px] font-extrabold text-[#111C2B]">
        Schnellzugriff
      </h2>

      <div
        className={cn(
          "mt-4 grid grid-cols-3",
          compact ? "gap-2" : "gap-3",
        )}
      >
        {items.map(
          (
            item,
          ) => (
            <QuickAccessItem
              key={item.id}
              item={item}
              compact={compact}
            />
          ),
        )}
      </div>
    </DashboardCard>
  );
}
