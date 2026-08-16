import {
  Ban,
  CheckCircle2,
  CircleDot,
  PencilLine,
} from "lucide-react";

import type {
  AdminPraxisTimelineItem,
} from "@/types/admin-praxis";

export interface AdminPraxisTimelineProps {
  items:
    AdminPraxisTimelineItem[];
}

function formatDateTime(
  value:
    string,
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
      timeZone:
        "Europe/Berlin",
    },
  ).format(
    new Date(
      value,
    ),
  );
}

function iconFor(
  type:
    AdminPraxisTimelineItem["type"],
) {
  switch (
    type
  ) {
    case "confirmed":
      return CheckCircle2;

    case "cancelled":
      return Ban;

    case "updated":
      return PencilLine;

    default:
      return CircleDot;
  }
}

export function AdminPraxisTimeline({
  items,
}: AdminPraxisTimelineProps) {
  return (
    <section className="rounded-[18px] border border-[#E3E9F2] bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.03)] sm:p-6">
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#7A899C]">
        Verlauf
      </p>

      <h2 className="mt-1 text-[15px] font-black text-[#0A172A]">
        Terminverlauf
      </h2>

      <ol className="mt-5 space-y-1">
        {items.map(
          (
            item,
            index,
          ) => {
            const Icon =
              iconFor(
                item.type,
              );

            return (
              <li
                key={
                  item.id
                }
                className="relative flex gap-3 pb-5 last:pb-0"
              >
                {index <
                items.length -
                  1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[15px] top-8 h-[calc(100%-20px)] w-px bg-[#E2E8F0]"
                  />
                ) : null}

                <span className="relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DCE6F2] bg-[#F7FAFE] text-[#0B63F6]">
                  <Icon
                    aria-hidden="true"
                    className="h-3.5 w-3.5"
                  />
                </span>

                <div className="min-w-0 pt-0.5">
                  <p className="text-[10px] font-black text-[#2A394F]">
                    {
                      item.title
                    }
                  </p>

                  <p className="mt-1 text-[9px] font-semibold text-[#8290A2]">
                    {formatDateTime(
                      item.occurredAt,
                    )}
                  </p>

                  {item.description ? (
                    <p className="mt-1.5 text-[9px] font-medium leading-4 text-[#69788D]">
                      {
                        item.description
                      }
                    </p>
                  ) : null}
                </div>
              </li>
            );
          },
        )}
      </ol>
    </section>
  );
}

export default AdminPraxisTimeline;
