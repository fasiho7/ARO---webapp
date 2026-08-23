import type { ReactNode } from "react";
import { Coord } from "@/components/ui/Coord";
import { cn } from "@/lib/cn";

export function TrailPin({
  n,
  state,
}: {
  n: string;
  state: "completed" | "current" | "locked";
}) {
  return (
    <div
      className={cn(
        "trail-pin",
        state === "current" && "is-current",
        state === "completed" && "is-done",
        state === "locked" && "is-locked",
      )}
      data-n={n}
    />
  );
}

export function TrailCard({
  coord,
  title,
  children,
  icon,
  tag,
  tagTone = "sage",
  footer,
  muted,
  className,
  titleClassName,
  coordClassName,
}: {
  coord: string;
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  tag?: string;
  tagTone?: "sage" | "gold" | "muted";
  footer?: ReactNode;
  muted?: boolean;
  className?: string;
  titleClassName?: string;
  coordClassName?: string;
}) {
  return (
    <div className={cn("trail-card", muted && "opacity-45", className)}>
      <Coord className={cn("mb-3", coordClassName)}>{coord}</Coord>
      {icon ? <div className="trail-icon text-gold">{icon}</div> : null}
      <h3 className={cn("display mb-2.5 text-[22px] font-medium", titleClassName)}>
        {title}
      </h3>
      <div className="text-[14.5px] leading-[1.65] text-muted">{children}</div>
      {tag ? (
        <span
          className={cn(
            "mt-4 inline-block rounded-[2px] border px-2.5 py-1 font-mono text-[11px]",
            tagTone === "sage" && "border-sage/35 text-sage",
            tagTone === "gold" && "border-gold/40 text-gold",
            tagTone === "muted" && "border-line text-muted",
          )}
        >
          {tag}
        </span>
      ) : null}
      {footer ? <div className="mt-5">{footer}</div> : null}
    </div>
  );
}

export function TrailStop({
  index,
  n,
  state,
  children,
  tight,
}: {
  index: number;
  n: string;
  state: "completed" | "current" | "locked";
  children: ReactNode;
  tight?: boolean;
}) {
  const left = index % 2 === 0;
  return (
    <div className={cn("trail-stop", tight && "trail-stop-tight")}>
      {left ? children : <div />}
      <TrailPin n={n} state={state} />
      {left ? <div /> : children}
    </div>
  );
}
