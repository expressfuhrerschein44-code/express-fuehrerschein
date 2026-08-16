"use client";

/**
 * Express-Führerschein
 * Multi-selection grid for driving-license classes.
 */

import {
  CheckCircle2,
} from "lucide-react";

import {
  LicenseClassCard,
} from "@/components/driving-license-application/license-class-card";

import type {
  DrivingLicenseClassCode,
  DrivingLicenseClassOption,
} from "@/types/driving-license-application";

export interface LicenseClassSelectionProps {
  items:
    readonly DrivingLicenseClassOption[];

  selectedClasses:
    DrivingLicenseClassCode[];

  onToggle:
    (
      code:
        DrivingLicenseClassCode,
    ) =>
      void;

  compact?:
    boolean;
}

export function LicenseClassSelection({
  items,

  selectedClasses,

  onToggle,

  compact =
    false,
}: LicenseClassSelectionProps) {
  return (
    <div>
      <div
        className={
          compact
            ? "grid grid-cols-3 gap-2"
            : "grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
        }
      >
        {items.map(
          (
            item,
          ) => (
            <LicenseClassCard
              key={
                item.code
              }
              item={
                item
              }
              compact={
                compact
              }
              selected={
                selectedClasses.includes(
                  item.code,
                )
              }
              onToggle={
                () =>
                  onToggle(
                    item.code,
                  )
              }
            />
          ),
        )}
      </div>

      {selectedClasses.length >
      0 ? (
        <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-bold text-[#169B5E]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {
            selectedClasses.length
          }{" "}
          {selectedClasses.length ===
          1
            ? "Kategorie ausgewählt"
            : "Kategorien ausgewählt"}
        </div>
      ) : (
        <p className="mt-3 text-[10px] font-medium text-[#7A899A]">
          Wähle mindestens eine Kategorie.
        </p>
      )}
    </div>
  );
}
