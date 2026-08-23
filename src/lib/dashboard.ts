import {
  codingTracks,
  getCodingProblemByProgressId,
} from "@/data/coding";
import type { CodingTrackId } from "@/data/coding/types";
import type { CareerRoadmap, RoadmapStage, RoadmapTopic } from "@/data/roadmaps/types";
import type { CodingProgressStore } from "@/lib/codingProgress";
import { careers, getCareer } from "@/data/roadmaps";
import {
  careerProgress,
  stageProgress,
  type RoadmapProgressStore,
} from "@/lib/roadmapProgress";

export function resolveActiveCareer(
  selectedSlug: string | null | undefined,
  store: RoadmapProgressStore,
): CareerRoadmap | null {
  const selected = getCareer(selectedSlug ?? "");
  if (selected) {
    return selected;
  }
  return (
    careers.find((career) => {
      const progress = careerProgress(career, store);
      return progress.completed > 0 && progress.completed < progress.total;
    }) ?? null
  );
}

export type CodingTrackDashboardProgress = {
  id: CodingTrackId;
  shortName: string;
  title: string;
  solved: number;
  total: number;
  percent: number;
};

export type CodingActivityItem = {
  id: string;
  title: string;
  href: string;
  difficulty: "Easy" | "Medium" | "Hard";
  trackId: CodingTrackId;
  trackLabel: string;
  status: "Solved";
};

export type CodingDashboardStats = {
  total: number;
  catalogTotal: number;
  easy: number;
  medium: number;
  hard: number;
  tracks: CodingTrackDashboardProgress[];
  recent: CodingActivityItem[];
  solved: CodingActivityItem[];
};

export type ContinueLearningState =
  | { kind: "no-career" }
  | {
      kind: "start";
      career: CareerRoadmap;
      stage: RoadmapStage;
      topic: RoadmapTopic;
      href: string;
    }
  | {
      kind: "next";
      career: CareerRoadmap;
      stage: RoadmapStage;
      topic: RoadmapTopic;
      href: string;
    }
  | { kind: "complete"; career: CareerRoadmap };

export type CurrentStageState = {
  stage: RoadmapStage;
  completed: number;
  total: number;
  percent: number;
  started: boolean;
};

export type RoadmapActivityItem = {
  id: string;
  title: string;
  href: string;
  completedAt: string;
};

function orderedStages(career: CareerRoadmap): RoadmapStage[] {
  return [...career.stages].sort((a, b) => a.order - b.order);
}

function topicHref(career: CareerRoadmap, stage: RoadmapStage, topic: RoadmapTopic) {
  return `/roadmaps/${career.slug}/${stage.id}/${topic.id}`;
}

export function countCompletedStages(
  career: CareerRoadmap,
  store: RoadmapProgressStore,
): { completed: number; total: number } {
  const stages = orderedStages(career);
  const completed = stages.filter((stage) => {
    const progress = stageProgress(career, stage.id, store);
    return progress.total > 0 && progress.completed === progress.total;
  }).length;
  return { completed, total: stages.length };
}

export function getCurrentStage(
  career: CareerRoadmap,
  store: RoadmapProgressStore,
): CurrentStageState | null {
  const stages = orderedStages(career);
  if (stages.length === 0) {
    return null;
  }
  const current =
    stages.find((stage) => {
      const progress = stageProgress(career, stage.id, store);
      return progress.completed < progress.total;
    }) ?? stages[stages.length - 1];
  if (!current) {
    return null;
  }
  const progress = stageProgress(career, current.id, store);
  return {
    stage: current,
    completed: progress.completed,
    total: progress.total,
    percent: progress.percent,
    started: progress.completed > 0,
  };
}

export function getContinueLearning(
  career: CareerRoadmap | null,
  store: RoadmapProgressStore,
): ContinueLearningState {
  if (!career) {
    return { kind: "no-career" };
  }
  for (const stage of orderedStages(career)) {
    const orderedTopics = [...stage.topics].sort((a, b) => a.order - b.order);
    for (const topic of orderedTopics) {
      const done = store.records.some(
        (record) =>
          record.careerId === career.id &&
          record.topicId === topic.id &&
          record.status === "completed",
      );
      if (!done) {
        const progress = careerProgress(career, store);
        return {
          kind: progress.completed === 0 ? "start" : "next",
          career,
          stage,
          topic,
          href: topicHref(career, stage, topic),
        };
      }
    }
  }
  return { kind: "complete", career };
}

export function getRecentRoadmapActivity(
  career: CareerRoadmap,
  store: RoadmapProgressStore,
  limit = 6,
): RoadmapActivityItem[] {
  const topicById = new Map<string, { stage: RoadmapStage; topic: RoadmapTopic }>();
  for (const stage of career.stages) {
    for (const topic of stage.topics) {
      topicById.set(topic.id, { stage, topic });
    }
  }

  return store.records
    .filter(
      (record) =>
        record.careerId === career.id &&
        record.status === "completed" &&
        record.topicId &&
        record.completionDate,
    )
    .map((record) => {
      const found = topicById.get(record.topicId as string);
      if (!found || !record.completionDate) {
        return null;
      }
      return {
        id: record.topicId as string,
        title: found.topic.title,
        href: topicHref(career, found.stage, found.topic),
        completedAt: record.completionDate,
      };
    })
    .filter((item): item is RoadmapActivityItem => item !== null)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, limit);
}

function trackProblemCount(trackId: CodingTrackId): number {
  const track = codingTracks.find((item) => item.id === trackId);
  if (!track) {
    return 0;
  }
  return track.topics.reduce((sum, topic) => sum + topic.problems.length, 0);
}

export function getCodingDashboardStats(
  store: CodingProgressStore,
): CodingDashboardStats {
  const tracks: CodingTrackDashboardProgress[] = codingTracks.map((track) => ({
    id: track.id,
    shortName: track.shortName,
    title: track.title,
    solved: 0,
    total: trackProblemCount(track.id),
    percent: 0,
  }));
  const trackById = new Map(tracks.map((track) => [track.id, track]));

  const stats: CodingDashboardStats = {
    total: store.completedIds.length,
    catalogTotal: tracks.reduce((sum, track) => sum + track.total, 0),
    easy: 0,
    medium: 0,
    hard: 0,
    tracks,
    recent: [],
    solved: [],
  };

  for (const id of store.completedIds) {
    const found = getCodingProblemByProgressId(id);
    if (!found) {
      continue;
    }
    const track = trackById.get(found.track.id);
    if (track) {
      track.solved += 1;
    }
    if (found.problem.difficulty === "Easy") {
      stats.easy += 1;
    } else if (found.problem.difficulty === "Medium") {
      stats.medium += 1;
    } else {
      stats.hard += 1;
    }
    stats.solved.push({
      id,
      title: found.problem.title,
      href: `/coding/${found.track.id}/${found.topic.slug}/${found.problem.slug}`,
      difficulty: found.problem.difficulty,
      trackId: found.track.id,
      trackLabel: found.track.shortName,
      status: "Solved",
    });
  }

  for (const track of tracks) {
    track.percent =
      track.total === 0 ? 0 : Math.round((track.solved / track.total) * 100);
  }
  stats.recent = [...stats.solved].reverse().slice(0, 6);

  return stats;
}

export function getNextUnsolvedProblem(store: CodingProgressStore): {
  title: string;
  href: string;
  difficulty: "Easy" | "Medium" | "Hard";
} | null {
  const done = new Set(store.completedIds);
  for (const track of codingTracks) {
    for (const topic of track.topics) {
      for (const problem of topic.problems) {
        const id = `${track.id}/${topic.slug}/${problem.slug}`;
        if (!done.has(id)) {
          return {
            title: problem.title,
            href: `/coding/${track.id}/${topic.slug}/${problem.slug}`,
            difficulty: problem.difficulty,
          };
        }
      }
    }
  }
  return null;
}

export function formatActivityDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}
