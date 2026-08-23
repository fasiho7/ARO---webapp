import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-8",
  lg: "p-8",
} as const;

export function Card({
  children,
  className,
  hover = false,
  padding = "md",
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[2px] border border-line bg-surface",
        paddings[padding],
        hover && "transition duration-200 hover:bg-ink/[0.02]",
        className,
      )}
    >
      {children}
    </div>
  );
}
