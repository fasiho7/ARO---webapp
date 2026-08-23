"use client";

import Link from "next/link";
import { RoadmapBreadcrumbs } from "@/components/roadmaps/RoadmapBreadcrumbs";
import { useRoadmapProgress } from "@/components/roadmaps/useRoadmapProgress";
import { UpgradePrompt } from "@/components/access/UpgradePrompt";
import { usePlan } from "@/components/access/usePlan";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type {
  CareerRoadmap,
  PracticeItem,
  RoadmapStage,
} from "@/data/roadmaps/types";
import { canCompleteStage, stageProgress } from "@/lib/roadmapProgress";
import { ACCESS_COPY, canAccessProject } from "@/lib/access";
import {
  codingHrefFromHint,
  skillTrackForStage,
  skillTrackHref,
  skillTrackLabel,
} from "@/lib/skillTracks";

function projectLevelLabel(level: string): string {
  if (level === "portfolio") {
    return "Portfolio";
  }
  return `${level.charAt(0).toUpperCase()}${level.slice(1)}`;
}

function PracticeBlock({ items }: { items: PracticeItem[] }) {
  return (
    <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
      {items.map((item) => (
        <li key={item.summary}>
          <span className="font-mono text-[11px] text-teal uppercase">
            {item.kind}
          </span>
          <p>{item.summary}</p>
          {item.codingHint?.track ? (
            <p className="mt-1">
              {codingHrefFromHint(item.codingHint) ? (
                <Button
                  size="sm"
                  variant="secondary"
                  href={codingHrefFromHint(item.codingHint) ?? "/coding"}
                >
                  Practice
                </Button>
              ) : null}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function StageDetailView({
  career,
  stage,
}: {
  career: CareerRoadmap;
  stage: RoadmapStage;
}) {
  const { store, setStatus } = useRoadmapProgress();
  const { plan } = usePlan();
  const progress = stageProgress(career, stage.id, store);
  const complete =
    progress.total > 0 && progress.completed === progress.total;
  const canFinish = canCompleteStage(career, stage.id, store);
  const stageProjects = career.projects.filter(
    (project) =>
      project.stageId === stage.id || stage.projectIds.includes(project.id),
  );
  const stageIndex = career.stages.findIndex((item) => item.id === stage.id);
  const prev = stageIndex > 0 ? career.stages[stageIndex - 1] : undefined;
  const next =
    stageIndex >= 0 && stageIndex < career.stages.length - 1
      ? career.stages[stageIndex + 1]
      : undefined;
  const track = skillTrackForStage(stage);

  return (
    <div>
      <RoadmapBreadcrumbs
        items={[
          { label: "Roadmaps", href: "/roadmaps" },
          { label: career.title, href: `/roadmaps/${career.slug}` },
          { label: stage.title },
        ]}
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-teal">Stage {stage.order}</p>
          <h1 className="display mt-2 text-3xl font-semibold">{stage.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {stage.description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
        <span>Estimated: {stage.estimatedTime}</span>
        <span>
          {progress.completed} / {progress.total} topics
        </span>
      </div>
      <ProgressBar className="mt-4 max-w-md" value={progress.percent} />
      {track ? (
        <Button
          className="mt-4"
          size="sm"
          variant="secondary"
          href={skillTrackHref(track)}
        >
          Open {skillTrackLabel(track)} trail
        </Button>
      ) : null}

      <section className="mt-8">
        <h2 className="display text-lg font-semibold">Why it matters</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          {stage.whyItMatters}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="display text-lg font-semibold">Topics</h2>
        <ol className="mt-4 space-y-3">
          {stage.topics.map((topic) => {
            return (
              <li key={topic.id}>
                <Link
                  href={`/roadmaps/${career.slug}/${stage.id}/${topic.id}`}
                  className="block rounded-xl border border-line bg-surface px-4 py-3 transition hover:border-white/20"
                >
                  <p className="text-sm font-medium text-ink">{topic.title}</p>
                  <p className="mt-1 text-sm text-muted">{topic.description}</p>
                  <p className="mt-2 font-mono text-[11px] text-muted">
                    {topic.estimatedTime} · {topic.difficulty}
                  </p>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="display text-lg font-semibold">Practice</h2>
        <PracticeBlock items={stage.practice} />
      </section>

      {stageProjects.length > 0 ? (
        <section className="mt-8">
          <h2 className="display text-lg font-semibold">Project</h2>
          <div className="mt-4 grid gap-3">
            {stageProjects.map((project) => {
              const projectComplete = store.records.some(
                (record) =>
                  record.careerId === career.id &&
                  record.projectId === project.id &&
                  record.status === "completed",
              );
              if (!canAccessProject(plan, project.level)) {
                return (
                  <UpgradePrompt
                    key={project.id}
                    title={project.title}
                    description={ACCESS_COPY.roadmap}
                  />
                );
              }
              return (
                <Card key={project.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="display text-sm font-semibold">
                      {project.title}
                    </h3>
                    <Badge>{projectLevelLabel(project.level)}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {project.description}
                  </p>
                  <p className="mt-3 text-xs font-medium text-ink">Requirements</p>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {project.requirements.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-muted">
                    <span className="text-ink">Expected outcome:</span>{" "}
                    {project.expectedOutcome}
                  </p>
                  <Button
                    className="mt-4"
                    size="sm"
                    variant={projectComplete ? "secondary" : "primary"}
                    onClick={() =>
                      setStatus(
                        career,
                        { projectId: project.id },
                        projectComplete ? "not_started" : "completed",
                      )
                    }
                  >
                    {projectComplete
                      ? "Mark project incomplete"
                      : "Mark project complete"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="display text-lg font-semibold">You are ready when</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          {stage.completionCriteria.map((item) => (
            <li key={item}>✓ {item}</li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href={`/roadmaps/${career.slug}`} variant="secondary">
          Back to career
        </Button>
        {prev ? (
          <Button
            href={`/roadmaps/${career.slug}/${prev.id}`}
            variant="ghost"
          >
            Previous stage
          </Button>
        ) : null}
        {next ? (
          <Button
            href={`/roadmaps/${career.slug}/${next.id}`}
            variant="ghost"
          >
            Next stage
          </Button>
        ) : null}
        <Button
          disabled={complete || !canFinish}
          onClick={() =>
            setStatus(career, { stageId: stage.id }, "completed")
          }
        >
          {complete ? "Stage completed" : "Mark stage complete"}
        </Button>
        {complete ? (
          <Button
            variant="ghost"
            onClick={() =>
              setStatus(career, { stageId: stage.id }, "not_started")
            }
          >
            Undo stage
          </Button>
        ) : null}
      </div>
      {!complete && !canFinish ? (
        <p className="mt-3 text-xs text-muted">
          Mark every topic complete
          {stage.projectIds.length > 0 ? " and the stage project" : ""} before
          completing this stage.
        </p>
      ) : null}
    </div>
  );
}
