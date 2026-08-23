import { cn } from "@/lib/cn";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "muted" | "teal" | "blue" | "purple" | "gold" | "success" | "danger" | "accent" | "sage";
  className?: string;
};

const tones = {
  muted: "border-line bg-surface-2 text-muted",
  teal: "border-accent/25 bg-accent-soft text-accent",
  blue: "border-accent/25 bg-accent-soft text-accent",
  purple: "border-accent/25 bg-accent-soft text-accent",
  gold: "border-gold/30 bg-gold/10 text-gold",
  success: "border-sage/30 bg-sage-soft text-sage",
  danger: "border-danger/30 bg-danger/10 text-danger",
  accent: "border-accent/25 bg-accent-soft text-accent",
  sage: "border-sage/30 bg-sage-soft text-sage",
} as const;

export function Badge({ children, tone = "muted", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[2px] border px-2.5 py-1 font-mono text-[11px] font-medium tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function difficultyTone(difficulty: string): BadgeProps["tone"] {
  if (difficulty === "Easy" || difficulty === "Beginner") {
    return "sage";
  }
  if (difficulty === "Medium" || difficulty === "Intermediate") {
    return "gold";
  }
  return "accent";
}
