"use client";

import { TopicCard } from "@/components/coding/TopicCard";
import { useCodingProgress } from "@/components/coding/useCodingProgress";
import type { CodingTrack } from "@/data/coding/types";
import { countCompletedInTopic } from "@/lib/codingProgress";

export function TopicGrid({ track }: { track: CodingTrack }) {
  const { store } = useCodingProgress();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {track.topics.map((topic) => {
        const completed = countCompletedInTopic(
          store,
          track.id,
          topic.slug,
          topic.problems.map((problem) => problem.slug),
        );
        return (
          <TopicCard
            key={topic.slug}
            topic={topic}
            completed={completed}
            href={`/coding/${track.slug}/${topic.slug}`}
          />
        );
      })}
    </div>
  );
}
