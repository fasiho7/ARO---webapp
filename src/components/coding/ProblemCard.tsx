import Link from "next/link";
import { codingTracks } from "@/data/coding";
import type { Problem } from "@/data/mock/types";
import { Badge, difficultyTone } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

function problemHref(slug: string): string {
  for (const track of codingTracks) {
    for (const topic of track.topics) {
      if (topic.problems.some((problem) => problem.slug === slug)) {
        return `/coding/${track.id}/${topic.slug}/${slug}`;
      }
    }
  }
  return "/coding";
}

export function ProblemCard({ problem }: { problem: Problem }) {
  return (
    <Link
      href={problemHref(problem.slug)}
      className="grid grid-cols-1 items-center gap-2 rounded-xl border border-line bg-surface px-4 py-3.5 transition hover:border-white/20 sm:grid-cols-[1fr_auto_auto_auto] sm:gap-4 [data-theme=light]:hover:border-black/15"
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">{problem.title}</p>
        <p className="mt-0.5 text-xs text-muted">{problem.topic}</p>
      </div>
      <Badge tone={difficultyTone(problem.difficulty)}>{problem.difficulty}</Badge>
      <span className="hidden text-xs text-muted sm:inline">
        {problem.acceptance}
      </span>
      <span
        className={cn(
          "text-xs font-medium",
          problem.solved
            ? "text-teal"
            : problem.attempted
              ? "text-gold"
              : "text-muted",
        )}
      >
        {problem.solved ? "Solved" : problem.attempted ? "Attempted" : "Todo"}
      </span>
    </Link>
  );
}
