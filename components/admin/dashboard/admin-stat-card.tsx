import type {
  LucideIcon,
} from "lucide-react";

export interface AdminStatCardProps {
  label:
    string;
  value:
    number;
  description:
    string;
  icon:
    LucideIcon;
}

export function AdminStatCard({
  label,
  value,
  description,
  icon: Icon,
}: AdminStatCardProps) {
  return (
    <article className="rounded-[17px] border border-[#E3E8F0] bg-white p-4 shadow-[0_8px_26px_rgba(17,40,70,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[8px] font-extrabold uppercase tracking-[0.06em] text-[#758399]">
            {label}
          </p>

          <p className="mt-2 text-[25px] font-black tracking-[-0.04em] text-[#081529]">
            {value}
          </p>
        </div>

        <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#EDF4FF] text-[#0B63F6]">
          <Icon
            className="h-4 w-4"
            aria-hidden="true"
          />
        </span>
      </div>

      <p className="mt-3 text-[8px] font-medium leading-4 text-[#7C899A]">
        {description}
      </p>
    </article>
  );
}
