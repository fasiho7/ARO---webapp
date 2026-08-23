"use client";

import Link from "next/link";
import { TrailPath } from "@/components/trail/TrailPath";
import { TrailCard, TrailStop } from "@/components/trail/TrailStop";
import { useRoadmapProgress } from "@/components/roadmaps/useRoadmapProgress";
import { Button } from "@/components/ui/Button";
import { Coord, HeroTag } from "@/components/ui/Coord";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { learningPaths } from "@/data/paths";
import { getContinuePath, getCurrentNode, getCurrentStage, pathProgress } from "@/lib/pathProgress";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function PathsIndex() {
  const { store } = useRoadmapProgress();
  const totals = learningPaths.reduce(
    (sum, path) => {
      const progress = pathProgress(path, store);
      return {
        topics: sum.topics + progress.total,
        done: sum.done + progress.completed,
      };
    },
    { topics: 0, done: 0 },
  );
  const continueState = getContinuePath(learningPaths, store);
  const currentPath = continueState?.path ?? learningPaths[0];
  const continueHref = continueState?.href ?? "/roadmaps/pf";

  return (
    <div>
      <PageHeader
        eyebrow="Field guide — roadmaps"
        title={
          <>
            Nobody learns CS
            <br />
            from a list of topics.
            <br />
            <em className="font-normal text-gold italic">They walk a trail.</em>
          </>
        }
        description={
          <>
            <p>
              Three routes only: Programming Fundamentals, Object-Oriented
              Programming, and Data Structures & Algorithms. Each one is a
              sequence of stops — not a course catalog.
            </p>
            <Coord className="mt-3.5">
              START HERE ↓ / {learningPaths.length} ROUTES
            </Coord>
          </>
        }
        actions={
          <>
            <Button href={continueHref}>
              {continueState?.kind === "complete"
                ? "Review routes"
                : continueState?.kind === "next"
                  ? "Continue"
                  : "Start the route"}
            </Button>
            <Button href="#routes" variant="ghost">
              See the map ↓
            </Button>
          </>
        }
      />

      <Reveal>
        <div className="notes-strip">
          <div className="notes-cell">
            <div className="display text-[38px] font-medium text-gold">
              {learningPaths.length}
            </div>
            <div className="coord mt-2">ROUTES ON THE TRAIL</div>
          </div>
          <div className="notes-cell">
            <div className="display text-[38px] font-medium text-gold">
              {totals.topics}
            </div>
            <div className="coord mt-2">STOPS TO WALK</div>
          </div>
          <div className="notes-cell">
            <div className="display text-[38px] font-medium text-gold">
              {totals.done}
            </div>
            <div className="coord mt-2">STOPS COMPLETED</div>
          </div>
          <div className="notes-cell">
            <div className="display text-[38px] font-medium text-gold">
              {currentPath?.stages.length ?? "—"}
            </div>
            <div className="coord mt-2">
              STAGES ON {currentPath?.shortName ?? "ROUTE"}
            </div>
          </div>
        </div>
      </Reveal>

      <section className="pt-[100px] pb-10 text-center" id="routes">
        <HeroTag>The route</HeroTag>
        <h2 className="display mx-auto max-w-[600px] text-[clamp(26px,3.4vw,38px)] font-medium">
          Three destinations. Same trail. No detours back to a syllabus.
        </h2>
      </section>

      <section className="trail pb-10">
        <TrailPath stops={learningPaths.length} />
        {learningPaths.map((path, index) => {
          const progress = pathProgress(path, store);
          const current = getCurrentNode(path, store);
          const complete =
            progress.total > 0 && progress.completed === progress.total;
          const href = current
            ? `/roadmaps/${path.slug}#${current.id}`
            : `/roadmaps/${path.slug}`;
          const tag = complete
            ? "route complete"
            : current
              ? `next: ${current.title}`
              : `${path.nodes.length} stops`;
          const pinState = complete
            ? "completed"
            : currentPath?.id === path.id
              ? "current"
              : "locked";

          return (
            <Reveal key={path.id}>
              <TrailStop index={index} n={pad(index + 1)} state={pinState}>
                <TrailCard
                  coord={`STOP ${pad(index + 1)} — ${path.stopLabel}`}
                  title={path.title}
                  tag={tag}
                  tagTone={complete ? "sage" : current ? "gold" : "muted"}
                  footer={
                    <Button href={href} size="sm" variant={complete ? "secondary" : "primary"}>
                      {complete ? "Review route →" : progress.completed === 0 ? "Enter route →" : "Continue →"}
                    </Button>
                  }
                >
                  <p>{path.shortDescription}</p>
                  <p className="mt-2 text-[13px]">{path.arc}</p>
                  <p className="mt-3 font-mono text-[11px] tracking-wide">
                    {path.difficulty} · {path.stages.length} stages ·{" "}
                    {progress.completed}/{progress.total} stops
                    {getCurrentStage(path, store)
                      ? ` · now: ${getCurrentStage(path, store)?.title}`
                      : ""}
                  </p>
                </TrailCard>
              </TrailStop>
            </Reveal>
          );
        })}
      </section>

      <section className="pt-10 pb-4">
        <div className="mb-[50px] flex flex-wrap items-end justify-between gap-5">
          <div>
            <HeroTag>What you’ll actually walk</HeroTag>
            <h2 className="display max-w-[480px] text-[clamp(26px,3.2vw,36px)] font-medium">
              Not “learn to code.”{" "}
              <em className="font-normal text-gold italic">This</em>, specifically.
            </h2>
          </div>
        </div>
        <div className="border-t border-line">
          {learningPaths.map((path, index) => (
            <Link
              key={path.id}
              href={`/roadmaps/${path.slug}`}
              className="grid grid-cols-[70px_1fr] items-center border-b border-line py-6 transition hover:bg-ink/[0.02] sm:grid-cols-[70px_1fr_140px]"
            >
              <div className="font-mono text-[13px] text-muted">{pad(index + 1)}</div>
              <div>
                <h4 className="display text-[19px] font-medium">{path.title}</h4>
                <p className="mt-1 text-[13.5px] text-muted">{path.shortDescription}</p>
              </div>
              <div className="mt-2 font-mono text-[11px] tracking-wide text-accent uppercase sm:mt-0 sm:text-right">
                {path.level}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
