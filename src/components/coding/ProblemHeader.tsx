"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";
import type { CodingProblem } from "@/data/coding/types";
import { Badge, difficultyTone } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export function ProblemHeader({
  problem,
  topicTitle,
  solved = false,
}: {
  problem: CodingProblem;
  topicTitle: string;
  solved?: boolean;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <header>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="display text-2xl font-semibold tracking-tight">
              {problem.title}
            </h1>
            {solved ? <Badge tone="success">Solved</Badge> : null}
            <Badge tone={difficultyTone(problem.difficulty)}>
              {problem.difficulty}
            </Badge>
            <Badge>{topicTitle}</Badge>
          </div>
        </div>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Remove bookmark" : "Bookmark problem"}
          onClick={() => setSaved((value) => !value)}
          className={cn(
            "rounded-lg border border-line p-2 text-muted hover:text-ink",
            saved && "border-gold/40 bg-gold/10 text-gold",
          )}
        >
          <Bookmark className={cn("size-4", saved && "fill-current")} />
        </button>
      </div>
    </header>
  );
}
