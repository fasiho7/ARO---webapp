import {
  Flame,
  Footprints,
  Map,
  Sparkles,
  Trophy,
  Upload,
  Lock,
} from "lucide-react";
import type { Achievement } from "@/data/mock/types";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const icons = {
  footprints: Footprints,
  flame: Flame,
  upload: Upload,
  sparkles: Sparkles,
  map: Map,
  trophy: Trophy,
} as const;

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = icons[achievement.icon];
  const locked = !achievement.earned;

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        locked && "opacity-60",
      )}
    >
      <div
        className={cn(
          "mb-4 flex size-12 items-center justify-center rounded-xl border",
          locked
            ? "border-line bg-surface-2 text-muted"
            : "border-gold/30 bg-gold/10 text-gold",
        )}
      >
        {locked ? <Lock className="size-5" /> : <Icon className="size-5" />}
      </div>
      <h3 className="display font-semibold">{achievement.title}</h3>
      <p className="mt-1.5 text-sm leading-6 text-muted">
        {achievement.description}
      </p>
      <p className="mt-4 font-mono text-[11px] text-muted">
        {achievement.earned
          ? `Earned ${achievement.earnedOn}`
          : "Locked"}
      </p>
    </Card>
  );
}
