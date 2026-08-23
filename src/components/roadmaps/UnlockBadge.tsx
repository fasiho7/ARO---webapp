import type { ComponentProps } from "react";
import type { StageUnlockState } from "@/data/roadmaps/types";
import { Badge } from "@/components/ui/Badge";

const labels: Record<StageUnlockState, string> = {
  locked: "Locked",
  available: "Available",
  in_progress: "In progress",
  completed: "Completed",
};

const tones: Record<StageUnlockState, ComponentProps<typeof Badge>["tone"]> = {
  locked: "muted",
  available: "blue",
  in_progress: "gold",
  completed: "success",
};

export function UnlockBadge({ state }: { state: StageUnlockState }) {
  return <Badge tone={tones[state]}>{labels[state]}</Badge>;
}

export function unlockLabel(state: StageUnlockState): string {
  return labels[state];
}
