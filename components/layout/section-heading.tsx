import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "dark",
  className,
  titleClassName,
  subtitleClassName,
}: SectionHeadingProps) {
  const isCentered = align === "center";
  const isLight = tone === "light";

  return (
    <div
      className={cn(
        "flex flex-col",
        isCentered ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "mb-3 text-[11px] font-bold uppercase tracking-[0.16em] sm:text-xs",
            isLight ? "text-[#56A5FF]" : "text-[#0878FF]",
          )}
        >
          {eyebrow}
        </span>
      ) : null}

      <h2
        className={cn(
          "max-w-4xl text-balance text-2xl font-extrabold tracking-[-0.035em] sm:text-3xl lg:text-[38px] lg:leading-[1.08]",
          isLight ? "text-white" : "text-[#071426]",
          titleClassName,
        )}
      >
        {title}
      </h2>

      {subtitle ? (
        <p
          className={cn(
            "mt-3 max-w-2xl text-pretty text-sm leading-6 sm:text-base",
            isLight ? "text-white/70" : "text-[#66758A]",
            subtitleClassName,
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
