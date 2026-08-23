import { cn } from "@/lib/cn";

type ProgressBarProps = {
  value: number;
  className?: string;
  barClassName?: string;
};

export function ProgressBar({ value, className, barClassName }: ProgressBarProps) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn("h-px overflow-hidden rounded-[2px] bg-ink/10", className)}
      role="progressbar"
      aria-valuenow={width}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-[2px] bg-gold transition-all duration-700", barClassName)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
