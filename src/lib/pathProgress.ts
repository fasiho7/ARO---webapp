import type {
  LearningPath,
  LearningPathNode,
  LearningPathStage,
  PathNodeStatus,
  PathStageStatus,
} from "@/data/paths/types";
import { pathHref } from "@/data/paths";
import type { RoadmapProgressStore } from "@/lib/roadmapProgress";

function completedTopicIds(store: RoadmapProgressStore, pathId: string): Set<string> {
  return new Set(
    store.records
      .filter(
        (record) =>
          record.careerId === pathId &&
          record.status === "completed" &&
          record.topicId,
      )
      .map((record) => record.topicId as string),
  );
}

function prereqsMet(
  node: LearningPathNode,
  done: Set<string>,
): boolean {
  return node.prerequisites.every((id) => done.has(id));
}

export function pathProgress(
  path: LearningPath,
  store: RoadmapProgressStore,
): { completed: number; total: number; percent: number } {
  const total = path.nodes.length;
  const done = completedTopicIds(store, path.id);
  const completed = path.nodes.filter((node) => done.has(node.id)).length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function stageProgress(
  stage: LearningPathStage,
  pathId: string,
  store: RoadmapProgressStore,
): { completed: number; total: number; percent: number } {
  const done = completedTopicIds(store, pathId);
  const total = stage.nodes.length;
  const completed = stage.nodes.filter((node) => done.has(node.id)).length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function getCurrentNode(
  path: LearningPath,
  store: RoadmapProgressStore,
): LearningPathNode | null {
  const done = completedTopicIds(store, path.id);
  return (
    path.nodes.find((node) => !done.has(node.id) && prereqsMet(node, done)) ??
    path.nodes.find((node) => !done.has(node.id)) ??
    null
  );
}

export function getCurrentStage(
  path: LearningPath,
  store: RoadmapProgressStore,
): LearningPathStage | null {
  const current = getCurrentNode(path, store);
  if (!current) {
    return path.stages[path.stages.length - 1] ?? null;
  }
  return path.stages.find((stage) => stage.nodes.some((node) => node.id === current.id)) ?? null;
}

export function getNodeStatus(
  path: LearningPath,
  store: RoadmapProgressStore,
  nodeId: string,
): PathNodeStatus {
  const done = completedTopicIds(store, path.id);
  if (done.has(nodeId)) {
    return "completed";
  }
  const current = getCurrentNode(path, store);
  if (current?.id === nodeId) {
    return "current";
  }
  return "locked";
}

export function getStageStatus(
  path: LearningPath,
  store: RoadmapProgressStore,
  stageId: string,
): PathStageStatus {
  const stage = path.stages.find((item) => item.id === stageId);
  if (!stage) {
    return "locked";
  }
  const progress = stageProgress(stage, path.id, store);
  if (progress.total > 0 && progress.completed === progress.total) {
    return "completed";
  }
  const current = getCurrentStage(path, store);
  if (current?.id === stage.id) {
    return "current";
  }
  if (current && stage.order > current.order) {
    return "locked";
  }
  return progress.completed > 0 ? "current" : "locked";
}

export function isPathComplete(
  path: LearningPath,
  store: RoadmapProgressStore,
): boolean {
  return getCurrentNode(path, store) === null && path.nodes.length > 0;
}

export type PathActivityItem = {
  id: string;
  title: string;
  href: string;
  completedAt: string;
};

export function getRecentPathActivity(
  paths: LearningPath[],
  store: RoadmapProgressStore,
  limit = 6,
): PathActivityItem[] {
  const nodeByKey = new Map<string, { path: LearningPath; node: LearningPathNode }>();
  for (const path of paths) {
    for (const node of path.nodes) {
      nodeByKey.set(`${path.id}:${node.id}`, { path, node });
    }
  }

  return store.records
    .filter(
      (record) =>
        record.status === "completed" &&
        record.topicId &&
        record.completionDate,
    )
    .map((record) => {
      const found = nodeByKey.get(`${record.careerId}:${record.topicId}`);
      if (!found || !record.completionDate) {
        return null;
      }
      return {
        id: `${record.careerId}-${record.topicId}`,
        title: found.node.title,
        href: pathHref(found.path.id, found.node.id),
        completedAt: record.completionDate,
      };
    })
    .filter((item): item is PathActivityItem => item !== null)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, limit);
}

export function overallPathProgress(
  paths: LearningPath[],
  store: RoadmapProgressStore,
): { completed: number; total: number; percent: number } {
  const totals = paths.reduce(
    (sum, path) => {
      const progress = pathProgress(path, store);
      return {
        completed: sum.completed + progress.completed,
        total: sum.total + progress.total,
      };
    },
    { completed: 0, total: 0 },
  );
  return {
    ...totals,
    percent: totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100),
  };
}

export function getContinuePath(
  paths: LearningPath[],
  store: RoadmapProgressStore,
): {
  path: LearningPath;
  node: LearningPathNode | null;
  stage: LearningPathStage | null;
  href: string;
  kind: "start" | "next" | "complete";
} | null {
  const inProgress = paths.find((item) => {
    const progress = pathProgress(item, store);
    return progress.completed > 0 && progress.completed < progress.total;
  });
  const untouched = paths.find((item) => pathProgress(item, store).completed === 0);
  const path = inProgress ?? untouched ?? paths[paths.length - 1];
  if (!path) {
    return null;
  }
  if (isPathComplete(path, store) && !inProgress && !untouched) {
    const allDone = paths.every((item) => isPathComplete(item, store));
    if (allDone) {
      return {
        path,
        node: null,
        stage: getCurrentStage(path, store),
        href: pathHref(path.id),
        kind: "complete",
      };
    }
  }
  const node = getCurrentNode(path, store);
  const progress = pathProgress(path, store);
  return {
    path,
    node,
    stage: getCurrentStage(path, store),
    href: pathHref(path.id, node?.id),
    kind: progress.completed === 0 ? "start" : node ? "next" : "complete",
  };
}
