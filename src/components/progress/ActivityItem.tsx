import {
  Award,
  Code2,
  Map,
  Sparkles,
} from "lucide-react";
import type { Activity } from "@/data/mock/types";

const icons = {
  coding: Code2,
  tutor: Sparkles,
  roadmap: Map,
  award: Award,
} as const;

export function ActivityItem({ activity }: { activity: Activity }) {
  const Icon = icons[activity.kind];

  return (
    <li className="flex gap-3 py-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 text-muted">
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{activity.title}</p>
        <p className="text-xs text-muted">{activity.detail}</p>
      </div>
      <p className="shrink-0 text-xs text-muted">{activity.time}</p>
    </li>
  );
}
