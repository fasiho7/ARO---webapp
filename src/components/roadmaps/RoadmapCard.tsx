"use client";

import {
  Brain,
  Bug,
  ChartColumn,
  Cloud,
  Cpu,
  Database,
  Layers,
  Layout,
  Server,
  Shield,
  Smartphone,
} from "lucide-react";
import type { CareerSummary } from "@/data/roadmaps";
import type { RoadmapIcon } from "@/data/roadmaps/types";
import { Badge, difficultyTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

const icons: Record<RoadmapIcon, typeof Cpu> = {
  cpu: Cpu,
  brain: Brain,
  layout: Layout,
  server: Server,
  layers: Layers,
  smartphone: Smartphone,
  shield: Shield,
  chart: ChartColumn,
  cloud: Cloud,
  database: Database,
  bug: Bug,
};

export function RoadmapCard({
  career,
  completed = 0,
}: {
  career: CareerSummary;
  completed?: number;
}) {
  const Icon = icons[career.icon];
  const percent =
    career.topicCount > 0
      ? Math.round((completed / career.topicCount) * 100)
      : 0;

  return (
    <Card hover className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-teal">
          <Icon className="size-5" />
        </div>
        <Badge tone={difficultyTone(career.difficulty)}>
          {career.difficulty}
        </Badge>
      </div>
      <h3 className="display mt-4 text-lg font-semibold">{career.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted">
        {career.shortDescription}
      </p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span>{career.estimatedTime}</span>
        <span>{career.coreSkills.length} core skills</span>
        <span>{career.category}</span>
      </div>
      {percent > 0 ? (
        <div className="mt-4">
          <ProgressBar value={percent} />
          <p className="mt-2 text-xs text-muted">
            {completed} of {career.topicCount} topics
          </p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-muted">
          {career.stageCount} stages · {career.topicCount} topics
        </p>
      )}
      <Button
        href={`/roadmaps/${career.slug}`}
        variant="secondary"
        className="mt-5 w-full"
      >
        View Roadmap
      </Button>
    </Card>
  );
}
