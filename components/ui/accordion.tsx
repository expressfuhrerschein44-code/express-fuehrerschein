"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export interface AccordionItemData {
  id: string;
  question: string;
  answer: string;
}

export interface AccordionProps {
  items: readonly AccordionItemData[];
  className?: string;
  defaultOpenId?: string;
  allowCollapse?: boolean;
}

function PlusIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="relative block h-5 w-5 shrink-0"
    >
      <span className="absolute left-1/2 top-1/2 h-[1.5px] w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      <span
        className={cn(
          "absolute left-1/2 top-1/2 h-4 w-[1.5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-current transition-transform duration-200",
          open && "rotate-90 opacity-0",
        )}
      />
    </span>
  );
}

export function Accordion({
  items,
  className,
  defaultOpenId,
  allowCollapse = true,
}: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(
    defaultOpenId ?? null,
  );

  return (
    <div className={cn("divide-y divide-[#E5EBF2]", className)}>
      {items.map((item) => {
        const open = openId === item.id;
        const triggerId = `${item.id}-trigger`;
        const panelId = `${item.id}-panel`;

        return (
          <div key={item.id} className="py-1">
            <h3>
              <button
                id={triggerId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => {
                  setOpenId((current) => {
                    if (current === item.id && allowCollapse) {
                      return null;
                    }

                    return item.id;
                  });
                }}
                className="flex min-h-16 w-full items-center justify-between gap-6 py-4 text-left text-[15px] font-bold text-[#071426] outline-none transition-colors hover:text-[#0878FF] focus-visible:text-[#0878FF] sm:text-base"
              >
                <span>{item.question}</span>
                <span className="text-[#0878FF]">
                  <PlusIcon open={open} />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!open}
              className="pb-5 pr-10 text-sm leading-6 text-[#637287] sm:text-[15px]"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
