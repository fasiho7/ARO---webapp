"use client";

import Link from "next/link";
import { TrailCard } from "@/components/trail/TrailStop";
import { useRoadmapProgress } from "@/components/roadmaps/useRoadmapProgress";
import { Button } from "@/components/ui/Button";
import { Coord, HeroTag } from "@/components/ui/Coord";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import type { CareerRoadmap } from "@/data/roadmaps/types";
import { getContinueLearning } from "@/lib/dashboard";
import {
  careerProgress,
  stageProgress,
} from "@/lib/roadmapProgress";
import {
  skillTrackForStage,
  skillTrackHref,
  skillTrackLabel,
} from "@/lib/skillTracks";
import { cn } from "@/lib/cn";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function stageEmphasis(index: number): "start" | "next" | "default" {
  if (index === 0) return "start";
  if (index === 1) return "next";
  return "default";
}

export function CareerRoadmapView({ career }: { career: CareerRoadmap }) {
  const { store } = useRoadmapProgress();
  const progress = careerProgress(career, store);
  const continueState = getContinueLearning(career, store);
  const currentStageId =
    continueState.kind === "start" || continueState.kind === "next"
      ? continueState.stage.id
      : undefined;
  const currentStageTitle =
    continueState.kind === "complete"
      ? "Career ready"
      : continueState.kind === "no-career"
        ? career.stages[0]?.title
        : continueState.stage.title;
  const continueHref =
    continueState.kind === "complete"
      ? `/roadmaps/${career.slug}`
      : continueState.kind === "no-career"
        ? `/roadmaps/${career.slug}`
        : `/roadmaps/${career.slug}/${continueState.stage.id}`;

  return (
    <div className="w-full">
      <p className="coord pt-2">
        <Link href="/roadmaps" className="hover:text-ink">
          ROADMAPS
        </Link>
        {"  ·  "}
        {career.title.toUpperCase()}
      </p>

      <PageHeader
        eyebrow={`${career.category} — ${career.difficulty}`}
        title={
          <>
            {career.title.split(" ").slice(0, -1).join(" ")}{" "}
            <em className="font-normal text-gold italic">
              {career.title.split(" ").slice(-1)}
            </em>
          </>
        }
        description={
          <>
            <p>{career.shortDescription}</p>
            <p className="mt-3">{career.estimatedTime}</p>
            <Coord className="mt-3.5">
              {progress.completed === progress.total && progress.total > 0
                ? "ROUTE COMPLETE ↓ / REVISIT ANY STAGE"
                : `YOU ARE HERE ↓ / ${(currentStageTitle ?? "START").toUpperCase()}`}
            </Coord>
          </>
        }
        actions={
          <>
            <Button href={continueHref}>
              {progress.completed > 0 ? "Continue here" : "Start this path"}
            </Button>
            <Button href="/roadmaps" variant="ghost">
              All careers
            </Button>
          </>
        }
      />

      <section className="pb-6">
        <HeroTag>The journey</HeroTag>
        <p className="mt-3 font-mono text-[11px] text-muted">
          {progress.percent}% complete · {progress.completed}/{progress.total} skills ·{" "}
          {career.stages.length} stages
        </p>
      </section>

      <section className="w-full max-w-none pb-6">
        <div className="mb-6 w-full max-w-sm">
          <p className="roadmap-stage-start-label">START</p>
          <div className="flex min-h-[100px] w-full max-w-none items-center justify-center rounded-[2px] border border-line bg-surface/50 px-4 py-6 text-center">
            <p className="font-mono text-[11px] tracking-wide text-muted uppercase">
              Begin here
            </p>
          </div>
        </div>

        <div className="roadmap-stages-grid grid w-full max-w-none grid-cols-1 gap-4 min-[768px]:grid-cols-2 min-[768px]:gap-5 min-[1200px]:grid-cols-4 min-[1200px]:gap-6">
          {career.stages.map((stage, index) => {
            const staged = stageProgress(career, stage.id, store);
            const complete =
              staged.total > 0 && staged.completed === staged.total;
            const current = stage.id === currentStageId;
            const emphasis = stageEmphasis(index);
            const track = skillTrackForStage(stage);
            const stageProjects = career.projects.filter(
              (project) =>
                project.stageId === stage.id ||
                stage.projectIds.includes(project.id),
            );

            return (
              <Reveal key={stage.id} className="h-full min-w-0">
                <div
                  id={stage.id}
                  className={cn(
                    "h-full scroll-mt-28",
                    emphasis === "start" && "roadmap-stage-prominent-start",
                    emphasis === "next" && "roadmap-stage-prominent-next",
                    emphasis === "default" && "roadmap-stage-subtle",
                  )}
                >
                  {emphasis === "start" ? (
                    <p className="roadmap-stage-start-label">STAGE 1 · START HERE</p>
                  ) : null}
                  {emphasis === "next" ? (
                    <p className="roadmap-stage-next-label">STAGE 2 · NEXT STEP</p>
                  ) : null}
                  <TrailCard
                    coord={`STAGE ${pad(stage.order + 1)} — ${stage.title.toUpperCase()}`}
                    title={stage.title}
                    className={cn(
                      "h-full w-full min-w-0 !max-w-none",
                      emphasis === "start" &&
                        "!border-gold !bg-gold/[0.08] shadow-[0_0_0_1px_rgb(212_160_84_/_0.15)]",
                      emphasis === "next" &&
                        "!border-gold/70 !bg-gold/[0.04]",
                      emphasis === "default" && "opacity-90",
                    )}
                    titleClassName={
                      emphasis === "start"
                        ? "text-gold"
                        : emphasis === "next"
                          ? "font-semibold"
                          : undefined
                    }
                    tag={
                      complete
                        ? "✓ completed"
                        : current
                          ? "● continue here"
                          : "upcoming"
                    }
                    tagTone={complete ? "sage" : current ? "gold" : "muted"}
                    footer={
                      <div className="flex flex-wrap gap-3">
                        <Button
                          size="sm"
                          href={`/roadmaps/${career.slug}/${stage.id}`}
                        >
                          {current ? "Continue here" : "Open stage"}
                        </Button>
                        {track ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            href={skillTrackHref(track)}
                          >
                            {skillTrackLabel(track)}
                          </Button>
                        ) : null}
                      </div>
                    }
                  >
                    <p>{stage.description}</p>
                    <p className="mt-3 font-mono text-[11px]">
                      {stage.estimatedTime} · {staged.completed}/{staged.total}{" "}
                      skills
                      {stageProjects.length > 0
                        ? ` · ${stageProjects.length} project${stageProjects.length === 1 ? "" : "s"}`
                        : ""}
                    </p>
                    {current ? (
                      <p className="mt-3 font-mono text-[11px] text-gold">
                        Continue here
                      </p>
                    ) : null}
                    <ul className="mt-4 space-y-1.5">
                      {stage.topics.slice(0, 4).map((topic) => {
                        const done = store.records.some(
                          (record) =>
                            record.careerId === career.id &&
                            record.topicId === topic.id &&
                            record.status === "completed",
                        );
                        return (
                          <li key={topic.id}>
                            <Link
                              href={`/roadmaps/${career.slug}/${stage.id}/${topic.id}`}
                              className="font-mono text-[12px] text-muted transition hover:text-ink"
                            >
                              {done ? "✓" : "○"} {topic.title}
                            </Link>
                          </li>
                        );
                      })}
                      {stage.topics.length > 4 ? (
                        <li className="font-mono text-[11px] text-muted">
                          +{stage.topics.length - 4} more topics
                        </li>
                      ) : null}
                    </ul>
                  </TrailCard>
                </div>
              </Reveal>
            );
          })}

          <Reveal className="h-full min-w-0">
            <div className="roadmap-stage-subtle h-full">
              <TrailCard
                coord="DESTINATION"
                title="Career ready"
                className="h-full w-full min-w-0 !max-w-none"
                tag={
                  progress.total > 0 && progress.completed === progress.total
                    ? "✓ trail ended"
                    : "keep walking"
                }
                tagTone={
                  progress.total > 0 && progress.completed === progress.total
                    ? "sage"
                    : "muted"
                }
              >
                <p>{career.outcomes[0]}</p>
                <p className="mt-4 font-mono text-[11px]">
                  Typical roles: {career.typicalRoles.slice(0, 3).join(" · ")}
                </p>
              </TrailCard>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
