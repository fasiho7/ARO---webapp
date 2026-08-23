import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-gold text-[var(--void)] hover:translate-x-0.5",
  secondary:
    "border border-gold text-gold hover:bg-gold hover:text-[var(--void)]",
  ghost:
    "border-b border-line text-ink rounded-none px-0 hover:border-gold",
  danger: "border border-danger/30 text-danger hover:bg-danger/10",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-[11px]",
  md: "px-[18px] py-[11px] text-[13px]",
  lg: "px-6 py-3.5 text-[14.5px]",
} as const;

type ButtonProps = {
  children: ReactNode;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className,
  disabled,
  type = "button",
  onClick,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-[2px] font-mono font-medium tracking-[0.03em] transition duration-200",
    variants[variant],
    sizes[size],
    variant === "ghost" && "px-0",
    disabled && "pointer-events-none opacity-40",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-disabled={disabled} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
}
