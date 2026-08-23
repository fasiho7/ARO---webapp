import { Check, Circle, ArrowRight } from "lucide-react";
import type { RoadmapNode } from "@/data/mock/types";
import { cn } from "@/lib/cn";

export function RoadmapNodeItem({
  node,
  isLast,
}: {
  node: RoadmapNode;
  isLast: boolean;
}) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast ? (
        <span className="absolute top-8 left-[15px] h-[calc(100%-16px)] w-px bg-line" />
      ) : null}
      <span
        className={cn(
          "relative z-10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border",
          node.status === "completed" &&
            "border-teal/40 bg-teal/15 text-teal",
          node.status === "current" &&
            "border-blue/50 bg-blue/15 text-blue shadow-[0_0_0_4px_rgb(59_124_246/0.15)]",
          node.status === "upcoming" && "border-line bg-surface text-muted",
        )}
      >
        {node.status === "completed" ? (
          <Check className="size-3.5" strokeWidth={2.5} />
        ) : node.status === "current" ? (
          <ArrowRight className="size-3.5" />
        ) : (
          <Circle className="size-2.5 fill-current" />
        )}
      </span>
      <div
        className={cn(
          "min-w-0 flex-1 rounded-xl border px-4 py-3 transition",
          node.status === "current"
            ? "border-blue/30 bg-blue/8"
            : "border-line bg-surface",
          node.status === "upcoming" && "opacity-70",
        )}
      >
        <p
          className={cn(
            "text-sm font-medium",
            node.status === "upcoming" ? "text-muted" : "text-ink",
          )}
        >
          {node.title}
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-muted">
          {node.status === "completed"
            ? "Completed"
            : node.status === "current"
              ? "Current"
              : "Up next"}
        </p>
      </div>
    </li>
  );
}
