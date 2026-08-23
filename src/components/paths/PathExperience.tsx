"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TrailPath } from "@/components/trail/TrailPath";
import { TrailCard, TrailStop } from "@/components/trail/TrailStop";
import { useRoadmapProgress } from "@/components/roadmaps/useRoadmapProgress";
import { UpgradePrompt } from "@/components/access/UpgradePrompt";
import { usePlan } from "@/components/access/usePlan";
import { Button } from "@/components/ui/Button";
import { Coord, HeroTag } from "@/components/ui/Coord";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { practiceHref } from "@/data/paths";
import type { LearningPath, PathNodeStatus } from "@/data/paths/types";
import { cn } from "@/lib/cn";
import { ACCESS_COPY, canAccessRoadmapContent } from "@/lib/access";
import {
  getCurrentNode,
  getCurrentStage,
  getNodeStatus,
  getStageStatus,
  isPathComplete,
  pathProgress,
  stageProgress,
} from "@/lib/pathProgress";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function tagFor(status: PathNodeStatus): {
  label: string;
  tone: "sage" | "gold" | "muted";
} {
  if (status === "completed") {
    return { label: "✓ completed", tone: "sage" };
  }
  if (status === "current") {
    return { label: "● continue here", tone: "gold" };
  }
  return { label: "upcoming", tone: "muted" };
}

export function PathExperience({ path }: { path: LearningPath }) {
  const { store, setPathTopic } = useRoadmapProgress();
  const { plan } = usePlan();
  const progress = pathProgress(path, store);
  const current = getCurrentNode(path, store);
  const currentStage = getCurrentStage(path, store);
  const complete = isPathComplete(path, store);
  const remaining = Math.max(progress.total - progress.completed, 0);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) {
      return;
    }
    document.getElementById(hash)?.scrollIntoView({ block: "center" });
  }, []);

  return (
    <div>
      <p className="coord pt-2">
        <Link href="/roadmaps" className="hover:text-ink">
          ROADMAPS
        </Link>
        {"  ·  "}
        {path.shortName}
      </p>

      <PageHeader
        eyebrow={`Route ${path.shortName} — ${path.level}`}
        title={
          <>
            {path.title.split(" ").slice(0, -1).join(" ")}{" "}
            <em className="font-normal text-gold italic">
              {path.title.split(" ").slice(-1)}
            </em>
          </>
        }
        description={
          <>
            <p>{path.shortDescription}</p>
            <p className="mt-3">{path.arc}</p>
            <Coord className="mt-3.5">
              {complete
                ? "ROUTE COMPLETE ↓ / REVISIT ANY STOP"
                : current
                  ? `YOU ARE HERE ↓ / ${current.title.toUpperCase()}`
                  : "START HERE ↓"}
            </Coord>
          </>
        }
        actions={
          current ? (
            <Button href={`#${current.id}`}>Continue here → {current.title}</Button>
          ) : (
            <Button href="/roadmaps" variant="secondary">
              Back to the map
            </Button>
          )
        }
      />

      <div className="notes-strip">
        <div className="notes-cell">
          <div className="display text-[38px] font-medium text-gold">
            {progress.completed}
          </div>
          <div className="coord mt-2">STOPS PASSED</div>
        </div>
        <div className="notes-cell">
          <div className="display text-[38px] font-medium text-gold">{remaining}</div>
          <div className="coord mt-2">STOPS AHEAD</div>
        </div>
        <div className="notes-cell">
          <div className="display text-[38px] font-medium text-gold">
            {path.stages.length}
          </div>
          <div className="coord mt-2">STAGES</div>
        </div>
        <div className="notes-cell">
          <div className="display text-[38px] font-medium text-gold">
            {currentStage?.title ?? (complete ? "Complete" : "—")}
          </div>
          <div className="coord mt-2">CURRENT STAGE</div>
        </div>
      </div>

      <section className="pt-[80px] pb-4 text-center">
        <HeroTag>The journey</HeroTag>
        <h2 className="display mx-auto max-w-[640px] text-[clamp(26px,3.4vw,38px)] font-medium">
          START
          {path.stages.map((stage) => (
            <span key={stage.id}>
              <span className="mx-2 text-muted">↓</span>
              {stage.title}
            </span>
          ))}
          <span className="mx-2 text-muted">↓</span>
          COMPLETE
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted">
          {complete
            ? "Every stop on this route is behind you."
            : current
              ? `Next: ${current.title} in ${currentStage?.title ?? "this stage"}.`
              : "Start at the first stop."}
        </p>
      </section>

      <section className="trail pb-6">
        <TrailPath stops={path.nodes.length + 1} />

        <div className="py-8 text-center">
          <Coord>START</Coord>
        </div>

        {path.stages.map((stage) => {
          const stageState = getStageStatus(path, store, stage.id);
          const staged = stageProgress(stage, path.id, store);
          return (
            <div key={stage.id}>
              <div className="py-8 text-center">
                <p className="coord mb-2">↓</p>
                <HeroTag className="mb-2">
                  {stageState === "completed"
                    ? "✓ "
                    : stageState === "current"
                      ? "● "
                      : "🔒 "}
                  {stage.title}
                </HeroTag>
                <p className="mx-auto max-w-md text-sm text-muted">{stage.purpose}</p>
                <p className="coord mt-2">
                  {staged.completed}/{staged.total} STOPS
                  {stageState === "current" ? " · YOU ARE HERE" : ""}
                </p>
              </div>

              {stage.nodes.map((node, nodeIndex) => {
                const status = getNodeStatus(path, store, node.id);
                const tag = tagFor(status);
                const practice = practiceHref(path.id, node);
                const nodeAllowed = canAccessRoadmapContent(plan, node.difficulty);
                const index =
                  path.nodes.findIndex((item) => item.id === stage.nodes[0]?.id) +
                  nodeIndex;
                const prereqTitles = node.prerequisites
                  .map((id) => path.nodes.find((item) => item.id === id)?.title)
                  .filter(Boolean);

                return (
                  <Reveal key={node.id}>
                    <div id={node.id} className="scroll-mt-28">
                      <TrailStop index={index} n={pad(index + 1)} state={status} tight>
                        <TrailCard
                          coord={`STOP ${pad(index + 1)} — ${node.title.toUpperCase()}`}
                          title={node.title}
                          tag={tag.label}
                          tagTone={tag.tone}
                          muted={false}
                          footer={
                            nodeAllowed ? (
                            <div className="flex flex-wrap gap-3">
                                {practice ? (
                                  <Button size="sm" href={practice}>
                                    Practice
                                  </Button>
                                ) : null}
                                {status !== "completed" ? (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                      setPathTopic(path.id, node.id, "completed");
                                    }}
                                  >
                                    Mark passed
                                  </Button>
                                ) : null}
                                {status === "completed" ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      setPathTopic(path.id, node.id, "not_started")
                                    }
                                  >
                                    Reopen
                                  </Button>
                                ) : null}
                              </div>
                            ) : undefined
                          }
                        >
                          {nodeAllowed ? (
                            <>
                          <p>{node.purpose}</p>
                          <p className="mt-3 font-mono text-[11px]">
                            {node.estimatedTime}
                            {prereqTitles.length > 0
                              ? ` · after ${prereqTitles.join(", ")}`
                              : ""}
                          </p>
                          {status === "current" ? (
                            <p className={cn("mt-3 font-mono text-[11px] text-gold")}>
                              Continue here
                            </p>
                          ) : null}
                            </>
                          ) : (
                            <div className="mt-2">
                              <UpgradePrompt
                                title="Pro stop"
                                description={ACCESS_COPY.roadmap}
                              />
                            </div>
                          )}
                        </TrailCard>
                      </TrailStop>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          );
        })}

        <div className="py-6 text-center">
          <p className="coord mb-2">↓</p>
        </div>

        <Reveal>
          <TrailStop
            index={path.nodes.length}
            n={pad(path.nodes.length + 1)}
            state={complete ? "completed" : "locked"}
            tight
          >
            <TrailCard
              coord="DESTINATION"
              title="Complete"
              tag={complete ? "✓ trail ended" : "🔒 keep walking"}
              tagTone={complete ? "sage" : "muted"}
            >
              {complete
                ? "This route is done. Practice stays open if you want to walk a stop again."
                : "Finish every stop above to close this path."}
            </TrailCard>
          </TrailStop>
        </Reveal>
      </section>
    </div>
  );
}
