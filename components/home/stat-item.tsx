import { IconCircle } from "@/components/ui/icon-circle";
import type { HomeStat } from "@/types/home";

export interface StatItemProps {
  item: HomeStat;
}

export function StatItem({
  item,
}: StatItemProps) {
  return (
    <article className="flex min-w-0 flex-col items-center justify-center gap-2 px-3 py-5 text-center sm:flex-row sm:justify-start sm:gap-4 sm:px-5 sm:py-6 sm:text-left lg:px-7">
      <IconCircle
        name={item.icon?.name ?? "check"}
        size="lg"
        tone="blue"
        className="h-11 w-11 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
      />

      <div className="min-w-0">
        <p className="whitespace-nowrap text-[15px] font-extrabold tracking-[-0.025em] text-[#0878FF] sm:text-[17px] lg:text-[20px]">
          {item.value}
        </p>

        <p className="mt-0.5 text-[10px] leading-4 text-[#66758A] sm:text-[11px] lg:text-[12px]">
          {item.label}
        </p>
      </div>
    </article>
  );
}
