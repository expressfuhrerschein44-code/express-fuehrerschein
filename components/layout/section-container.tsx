import type {
  ComponentPropsWithoutRef,
  ElementType,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";
import { SiteContainer } from "@/components/layout/site-container";

type SectionTone = "white" | "light" | "dark" | "transparent";

type SectionContainerProps<T extends ElementType = "section"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  id?: string;
  tone?: SectionTone;
  spacing?: "none" | "compact" | "default" | "large";
  containerSize?: "full" | "content";
} & Omit<
  ComponentPropsWithoutRef<T>,
  "as" | "children" | "className" | "id"
>;

const toneClasses: Record<SectionTone, string> = {
  white: "bg-white text-[#071426]",
  light: "bg-[#F6F8FB] text-[#071426]",
  dark: "bg-[#030B17] text-white",
  transparent: "bg-transparent",
};

const spacingClasses = {
  none: "",
  compact: "py-10 md:py-14",
  default: "py-14 md:py-20 lg:py-24",
  large: "py-16 md:py-24 lg:py-28",
} as const;

export function SectionContainer<T extends ElementType = "section">({
  as,
  children,
  className,
  contentClassName,
  id,
  tone = "white",
  spacing = "default",
  containerSize = "full",
  ...props
}: SectionContainerProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      id={id}
      className={cn(
        "relative w-full",
        toneClasses[tone],
        spacingClasses[spacing],
        className,
      )}
      {...props}
    >
      <SiteContainer size={containerSize} className={contentClassName}>
        {children}
      </SiteContainer>
    </Component>
  );
}
