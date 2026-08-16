import { IconCircle } from "@/components/ui/icon-circle";
import type { HomeAdvantage } from "@/types/home";

export interface AdvantageItemProps {
  item: HomeAdvantage;
}

export function AdvantageItem({
  item,
}: AdvantageItemProps) {
  return (
    <article className="flex min-w-0 items-start gap-3.5">
      <IconCircle
        name={item.icon.name}
        tone="dark"
        size="md"
        className="mt-0.5 h-11 w-11"
      />

      <div className="min-w-0">
        <h3 className="text-[13px] font-bold leading-5 text-white sm:text-[14px]">
          {item.title}
        </h3>

        <p className="mt-1 max-w-[180px] text-[10px] leading-[1.55] text-white/68 sm:text-[11px]">
          {item.description}
        </p>
      </div>
    </article>
  );
}
