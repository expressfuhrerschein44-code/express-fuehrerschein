import { clamp, cn } from "@/lib/utils";

export interface ProgressLineProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
  trackClassName?: string;
  indicatorClassName?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-2.5",
} as const;

export function ProgressLine({
  value,
  max = 100,
  label,
  showValue = false,
  className,
  trackClassName,
  indicatorClassName,
  size = "md",
}: ProgressLineProps) {
  const safeMax = max > 0 ? max : 100;
  const percent = clamp((value / safeMax) * 100, 0, 100);
  const roundedPercent = Math.round(percent);

  return (
    <div className={cn("w-full", className)}>
      {label || showValue ? (
        <div className="mb-2 flex items-center justify-between gap-4 text-xs font-semibold text-[#66758A]">
          {label ? <span>{label}</span> : <span />}
          {showValue ? <span>{roundedPercent}%</span> : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={clamp(value, 0, safeMax)}
        className={cn(
          "w-full overflow-hidden rounded-full bg-[#E5EDF7]",
          sizes[size],
          trackClassName,
        )}
      >
        <div
          className={cn(
            "h-full rounded-full bg-[#0878FF] transition-[width] duration-300 ease-out",
            indicatorClassName,
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
