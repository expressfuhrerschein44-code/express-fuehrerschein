/**
 * Express-Führerschein
 * Clear price breakdown.
 */

import {
  Info,
} from "lucide-react";

import type {
  DrivingLicenseApplicationPricing,
} from "@/types/driving-license-application";

export interface ApplicationPriceSummaryProps {
  pricing:
    DrivingLicenseApplicationPricing;

  compact?:
    boolean;
}

function formatMoney(
  cents:
    number,
): string {
  return new Intl.NumberFormat(
    "de-DE",
    {
      style:
        "currency",

      currency:
        "EUR",

      minimumFractionDigits:
        0,

      maximumFractionDigits:
        0,
    },
  ).format(
    cents /
    100,
  );
}

export function ApplicationPriceSummary({
  pricing,

  compact =
    false,
}: ApplicationPriceSummaryProps) {
  if (
    compact
  ) {
    return (
      <div className="rounded-xl border border-[#E4EAF1] bg-white p-3">
        <div className="space-y-2 text-[10px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[#58697D]">
              Zwischensumme
            </span>

            <strong className="text-[#15243A]">
              {
                formatMoney(
                  pricing
                    .classesSubtotalCents,
                )
              }
            </strong>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-[#58697D]">
              Bearbeitungsgebühr
            </span>

            <strong className="text-[#15243A]">
              {
                formatMoney(
                  pricing
                    .processingFeeCents,
                )
              }
            </strong>
          </div>

          <div className="border-t border-[#E7ECF2] pt-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-extrabold text-[#0B63F6]">
                Gesamtbetrag
              </span>

              <strong className="text-[17px] font-black text-[#075FEA]">
                {
                  formatMoney(
                    pricing
                      .totalCents,
                  )
                }
              </strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[#DDE7F3] bg-[#F9FBFE]">
      <div className="grid items-center lg:grid-cols-[1fr_auto_auto]">
        <div className="flex items-start gap-3 px-4 py-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#0B63F6]">
            <Info className="h-4 w-4" />
          </span>

          <p className="text-[10px] leading-5 text-[#506176]">
            Für die Bearbeitung deiner Anfrage fallen abhängig von der Anzahl der gewählten Kategorien Bearbeitungsgebühren an.
          </p>
        </div>

        <div className="border-t border-[#E2E8F0] px-5 py-3 text-right lg:border-l lg:border-t-0">
          <div className="text-[9px] text-[#66768A]">
            Bearbeitungsgebühr
          </div>

          <div className="mt-1 text-[14px] font-black text-[#18263B]">
            {
              formatMoney(
                pricing
                  .processingFeeCents,
              )
            }
          </div>
        </div>

        <div className="border-t border-[#CFE0FA] bg-[#EAF2FF] px-5 py-3 text-right lg:border-l lg:border-t-0">
          <div className="text-[9px] font-bold text-[#0B63F6]">
            Gesamtbetrag
          </div>

          <div className="mt-1 text-[21px] font-black text-[#075FEA]">
            {
              formatMoney(
                pricing
                  .totalCents,
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
