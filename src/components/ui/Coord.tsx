import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Coord({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("coord block", className)}>{children}</span>;
}

export function HeroTag({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn("hero-tag mb-[22px] inline-block", className)}>{children}</span>;
}
