import { cn } from "@/lib/cn";

type LogoProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

export function Logo({ size = 26, withWordmark = true, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        aria-hidden="true"
      >
        <path d="M50 12 L82 78 L66 78 L50 44 L34 78 L18 78 Z" fill="currentColor" />
      </svg>
      {withWordmark ? (
        <span className="display text-[19px] font-semibold leading-none tracking-tight">
          Aro
        </span>
      ) : (
        <span className="sr-only">Aro</span>
      )}
    </span>
  );
}
