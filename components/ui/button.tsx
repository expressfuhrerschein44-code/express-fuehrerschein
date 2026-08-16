import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "dark";

export type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  iconRight?: ReactNode;
  iconLeft?: ReactNode;
}

type ButtonAsButtonProps = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type ButtonAsLinkProps = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-[#0878FF] bg-[#0878FF] text-white shadow-[0_8px_24px_rgba(8,120,255,0.22)] hover:border-[#006BEA] hover:bg-[#006BEA]",
  secondary:
    "border border-white/25 bg-transparent text-white hover:border-white/45 hover:bg-white/[0.05]",
  outline:
    "border border-[#CCD6E3] bg-white text-[#071426] hover:border-[#AEBCCC] hover:bg-[#F8FAFC]",
  ghost:
    "border border-transparent bg-transparent text-current hover:bg-black/[0.04]",
  dark:
    "border border-[#102D50] bg-[#07182B] text-white hover:bg-[#0B213B]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-10 gap-2 rounded-lg px-4 text-sm",
  md: "min-h-11 gap-2.5 rounded-[10px] px-5 text-sm",
  lg: "min-h-12 gap-3 rounded-[10px] px-6 text-[15px]",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconRight,
  iconLeft,
  ...props
}: ButtonProps) {
  const classes = cn(
    "ef-interactive inline-flex select-none items-center justify-center whitespace-nowrap font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#1684FF] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );

  const content = (
    <>
      {iconLeft ? (
        <span className="inline-flex shrink-0 items-center">{iconLeft}</span>
      ) : null}

      <span>{children}</span>

      {iconRight ? (
        <span className="inline-flex shrink-0 items-center">{iconRight}</span>
      ) : null}
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props;

    return (
      <Link href={href} className={classes} {...linkProps}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  );
}
