"use client";

import { CodingProblemCard } from "@/components/coding/CodingProblemCard";
import { ProgressIndicator } from "@/components/coding/ProgressIndicator";
import { useCodingProgress } from "@/components/coding/useCodingProgress";
import { usePlan } from "@/components/access/usePlan";
import type { CodingTopic, CodingTrack } from "@/data/coding/types";
import { canAccessProblem } from "@/lib/access";
import {
  countCompletedInTopic,
  isProblemComplete,
  problemProgressId,
} from "@/lib/codingProgress";

export function ProblemList({
  track,
  topic,
}: {
  track: CodingTrack;
  topic: CodingTopic;
}) {
  const { store } = useCodingProgress();
  const { plan } = usePlan();
  const completed = countCompletedInTopic(
    store,
    track.id,
    topic.slug,
    topic.problems.map((problem) => problem.slug),
  );

  return (
    <div>
      <div className="mb-6 max-w-md">
        <ProgressIndicator completed={completed} total={topic.problems.length} />
      </div>
      <div className="space-y-2">
        {topic.problems.map((problem) => {
          const id = problemProgressId(track.id, topic.slug, problem.slug);
          return (
            <CodingProblemCard
              key={problem.slug}
              problem={problem}
              completed={isProblemComplete(store, id)}
              locked={!canAccessProblem(plan, problem.difficulty)}
              href={`/coding/${track.slug}/${topic.slug}/${problem.slug}`}
            />
          );
        })}
      </div>
    </div>
  );
}
