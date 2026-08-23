import Link from "next/link";
import type { CodingProblem } from "@/data/coding/types";
import { Badge, difficultyTone } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export function CodingProblemCard({
  href,
  problem,
  completed,
  locked = false,
}: {
  href: string;
  problem: CodingProblem;
  completed: boolean;
  locked?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex min-w-0 flex-col gap-2 rounded-xl border border-line bg-surface px-4 py-3.5 transition hover:border-white/20 sm:flex-row sm:items-center sm:gap-4 [data-theme=light]:hover:border-black/15"
    >
      <span className="w-8 shrink-0 font-mono text-sm text-muted">
        {problem.number}.
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink">{problem.title}</p>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted">{problem.summary}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge tone={difficultyTone(problem.difficulty)}>{problem.difficulty}</Badge>
        <span
          className={cn(
            "text-xs font-medium",
            completed ? "text-teal" : locked ? "text-gold" : "text-muted",
          )}
        >
          {locked ? "Pro" : completed ? "Solved" : "Not started"}
        </span>
      </div>
    </Link>
  );
}
