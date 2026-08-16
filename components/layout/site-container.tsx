import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SiteContainerProps<T extends ElementType = "div"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  /**
   * full = uses the 1440px project container
   * content = slightly narrower for text-heavy sections
   */
  size?: "full" | "content";
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function SiteContainer<T extends ElementType = "div">({
  as,
  children,
  className,
  size = "full",
  ...props
}: SiteContainerProps<T>) {
  const Component = as ?? "div";

  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10",
        size === "full" ? "max-w-[1440px]" : "max-w-[1180px]",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
