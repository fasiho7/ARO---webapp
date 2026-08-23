"use client";

import { useMemo, useState } from "react";
import { TrailCard } from "@/components/trail/TrailStop";
import { useRoadmapProgress } from "@/components/roadmaps/useRoadmapProgress";
import { Button } from "@/components/ui/Button";
import { HeroTag } from "@/components/ui/Coord";
import { Reveal } from "@/components/ui/Reveal";
import { careers } from "@/data/roadmaps";
import type { CareerRoadmap, RoadmapCategory } from "@/data/roadmaps/types";
import { careerProgress, countCompletedForCareer } from "@/lib/roadmapProgress";
import { cn } from "@/lib/cn";

const CATEGORY_ORDER: RoadmapCategory[] = [
  "Development",
  "AI",
  "Data",
  "Security",
  "Cloud",
];

const CATEGORY_LABEL: Record<RoadmapCategory, string> = {
  Development: "DEVELOPMENT",
  AI: "AI",
  Data: "DATA",
  Security: "SECURITY",
  Cloud: "CLOUD",
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function CareersIndex() {
  const { store } = useRoadmapProgress();
  const [selectedCategory, setSelectedCategory] =
    useState<RoadmapCategory>("Development");

  const inProgress = careers.find((career) => {
    const progress = careerProgress(career, store);
    return progress.completed > 0 && progress.completed < progress.total;
  });

  const visibleCareers = useMemo(
    () => careers.filter((career) => career.category === selectedCategory),
    [selectedCategory],
  );

  const continueHref = inProgress
    ? `/roadmaps/${inProgress.slug}`
    : visibleCareers[0]
      ? `/roadmaps/${visibleCareers[0].slug}`
      : "/roadmaps";

  return (
    <div className="w-full pb-8">
      <section className="max-w-2xl pt-6 pb-10 sm:pt-8">
        <HeroTag>Aro Roadmaps</HeroTag>
        <p className="display mt-4 text-[clamp(22px,4vw,32px)] font-medium leading-snug text-ink">
          Aro helps CS students turn confusion into a clear path toward the career
          they want.
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-[15px]">
          Choose a career path, follow a structured roadmap, build real skills, and
          track your progress.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={continueHref} size="sm">
            {inProgress ? "Continue your path" : "Start a career path"}
          </Button>
        </div>
      </section>

      <section className="w-full pb-8 text-center" id="routes">
        <HeroTag>Choose your career</HeroTag>
        <h2 className="display mt-4 text-[clamp(28px,5vw,44px)] font-semibold tracking-tight text-gold">
          {CATEGORY_LABEL[selectedCategory]}
        </h2>

        <div className="mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-2 sm:gap-3">
          {CATEGORY_ORDER.map((category) => {
            const active = category === selectedCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "rounded-[2px] border px-4 py-2 font-mono text-[11px] tracking-wide uppercase transition duration-200",
                  active
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-line bg-surface text-muted hover:border-gold/40 hover:text-ink",
                )}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      <section className="roadmap-careers-grid w-full pb-10">
        {visibleCareers.map((career, index) => (
          <CareerRouteCard
            key={career.id}
            career={career}
            index={index}
            inProgress={inProgress?.id === career.id}
            store={store}
          />
        ))}
      </section>
    </div>
  );
}

function CareerRouteCard({
  career,
  index,
  inProgress,
  store,
}: {
  career: CareerRoadmap;
  index: number;
  inProgress: boolean;
  store: ReturnType<typeof useRoadmapProgress>["store"];
}) {
  const progress = careerProgress(career, store);
  const completed = countCompletedForCareer(store, career.id);
  const complete = progress.total > 0 && progress.completed === progress.total;
  const startedPath = progress.completed > 0;
  const tag = complete
    ? "✓ completed"
    : inProgress
      ? "● continue here"
      : startedPath
        ? `${progress.percent}% complete`
        : "upcoming";

  return (
    <Reveal className="h-full min-w-0">
      <TrailCard
        className="roadmap-career-card h-full w-full max-w-none"
        coord={`ROUTE ${pad(index + 1)} — ${career.category.toUpperCase()}`}
        title={career.title}
        tag={tag}
        tagTone={
          complete ? "sage" : inProgress || startedPath ? "gold" : "muted"
        }
        footer={
          <Button
            href={`/roadmaps/${career.slug}`}
            size="sm"
            variant={complete ? "secondary" : "primary"}
          >
            {complete
              ? "Review path →"
              : startedPath
                ? "Continue →"
                : "Explore →"}
          </Button>
        }
      >
        <p>{career.shortDescription}</p>
        <p className="mt-3 font-mono text-[11px] tracking-wide">
          {career.difficulty} · {career.estimatedTime} · {career.stages.length}{" "}
          stages · {progress.total} skills
          {startedPath ? ` · ${completed}/${progress.total} done` : ""}
        </p>
      </TrailCard>
    </Reveal>
  );
}
