"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { CodingProblem } from "@/data/coding/types";
import { cn } from "@/lib/cn";

export function HintSection({ hints }: { hints: CodingProblem["hints"] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});

  if (hints.length === 0) {
    return null;
  }

  return (
    <section className="mt-7">
      <h2 className="display text-sm font-semibold tracking-wide text-ink">
        Hints
      </h2>
      <p className="mt-1 text-xs text-muted">
        Optional. These are local hints, not AI.
      </p>
      <ul className="mt-3 space-y-2">
        {hints.map((hint, index) => {
          const expanded = Boolean(open[index]);
          return (
            <li key={`${index}-${hint}`}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() =>
                  setOpen((current) => ({
                    ...current,
                    [index]: !current[index],
                  }))
                }
                className="flex w-full items-center justify-between rounded-xl border border-line bg-surface-2/60 px-3 py-2.5 text-left text-sm hover:border-white/20 [data-theme=light]:hover:border-black/15"
              >
                <span className="font-medium text-teal">Hint {index + 1}</span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted transition",
                    expanded && "rotate-180",
                  )}
                />
              </button>
              {expanded ? (
                <p className="border-x border-b border-line bg-void px-3 py-2.5 text-sm leading-6 text-ink">
                  {hint}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
