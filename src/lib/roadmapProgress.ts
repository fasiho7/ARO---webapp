import type {
  CareerRoadmap,
  RoadmapProgressRecord,
  RoadmapProgressStatus,
  StageUnlockState,
} from "@/data/roadmaps/types";

export type RoadmapProgressStore = {
  records: RoadmapProgressRecord[];
};

export const ROADMAP_PROGRESS_KEY = "aro.roadmap.progress.v1";

export function roadmapProgressStorageKey(userId?: string | null): string {
  return userId ? `${ROADMAP_PROGRESS_KEY}.${userId}` : ROADMAP_PROGRESS_KEY;
}

export function emptyRoadmapProgress(): RoadmapProgressStore {
  return { records: [] };
}

function completedIds(
  store: RoadmapProgressStore,
  careerId: string,
  field: "stageId" | "topicId" | "projectId" | "milestoneId",
): Set<string> {
  return new Set(
    store.records
      .filter(
        (record) =>
          record.careerId === careerId &&
          record.status === "completed" &&
          record[field],
      )
      .map((record) => record[field] as string),
  );
}

function statusOf(
  store: RoadmapProgressStore,
  careerId: string,
  field: "stageId" | "topicId" | "projectId" | "milestoneId",
  id: string,
): RoadmapProgressStatus | undefined {
  const matches = store.records.filter(
    (record) => record.careerId === careerId && record[field] === id,
  );
  if (matches.some((record) => record.status === "completed")) {
    return "completed";
  }
  if (matches.some((record) => record.status === "in_progress")) {
    return "in_progress";
  }
  return matches[0]?.status;
}

export function getStageUnlockState(
  career: CareerRoadmap,
  stageId: string,
  store: RoadmapProgressStore = emptyRoadmapProgress(),
): StageUnlockState {
  const stage = career.stages.find((item) => item.id === stageId);
  if (!stage) {
    return "locked";
  }

  const doneStages = completedIds(store, career.id, "stageId");
  if (doneStages.has(stage.id)) {
    return "completed";
  }

  const prereqsMet = stage.prerequisites.every((id) => doneStages.has(id));
  if (!prereqsMet) {
    return "locked";
  }

  const inProgress =
    statusOf(store, career.id, "stageId", stage.id) === "in_progress" ||
    stage.topics.some(
      (topic) => statusOf(store, career.id, "topicId", topic.id) !== undefined,
    );
  if (inProgress) {
    return "in_progress";
  }
  return "available";
}

export function getTopicUnlockState(
  career: CareerRoadmap,
  topicId: string,
  store: RoadmapProgressStore = emptyRoadmapProgress(),
): StageUnlockState {
  const stage = career.stages.find((item) =>
    item.topics.some((topic) => topic.id === topicId),
  );
  const topic = stage?.topics.find((item) => item.id === topicId);
  if (!stage || !topic) {
    return "locked";
  }

  const stageState = getStageUnlockState(career, stage.id, store);
  if (stageState === "locked") {
    return "locked";
  }

  const doneTopics = completedIds(store, career.id, "topicId");
  if (doneTopics.has(topic.id)) {
    return "completed";
  }

  const doneStages = completedIds(store, career.id, "stageId");
  const prereqsMet = topic.prerequisites.every((id) => {
    if (id === stage.id) {
      return true;
    }
    if (career.stages.some((item) => item.id === id)) {
      return doneStages.has(id);
    }
    return doneTopics.has(id);
  });
  if (!prereqsMet && topic.prerequisites.length > 0) {
    return "locked";
  }

  const inProgress =
    statusOf(store, career.id, "topicId", topic.id) === "in_progress";
  if (inProgress) {
    return "in_progress";
  }
  return "available";
}

export function getProjectUnlockState(
  career: CareerRoadmap,
  projectId: string,
  store: RoadmapProgressStore = emptyRoadmapProgress(),
): StageUnlockState {
  const project = career.projects.find((item) => item.id === projectId);
  if (!project) {
    return "locked";
  }
  if (statusOf(store, career.id, "projectId", project.id) === "completed") {
    return "completed";
  }
  if (!project.stageId) {
    return "available";
  }
  const stageState = getStageUnlockState(career, project.stageId, store);
  if (stageState === "locked") {
    return "locked";
  }
  if (statusOf(store, career.id, "projectId", project.id) === "in_progress") {
    return "in_progress";
  }
  return stageState === "completed" ? "available" : stageState;
}

export function getMilestoneState(
  career: CareerRoadmap,
  milestoneId: string,
  store: RoadmapProgressStore = emptyRoadmapProgress(),
): StageUnlockState {
  const milestone = career.milestones.find((item) => item.id === milestoneId);
  if (!milestone) {
    return "locked";
  }
  const doneStages = completedIds(store, career.id, "stageId");
  if (milestone.stageIds.every((id) => doneStages.has(id))) {
    return "completed";
  }
  const anyAvailable = milestone.stageIds.some((id) => {
    const state = getStageUnlockState(career, id, store);
    return state !== "locked";
  });
  if (!anyAvailable) {
    return "locked";
  }
  if (milestone.stageIds.some((id) => doneStages.has(id))) {
    return "in_progress";
  }
  return "available";
}

export function countCompletedForCareer(
  store: RoadmapProgressStore,
  careerId: string,
): number {
  return completedIds(store, careerId, "topicId").size;
}

export function careerProgress(
  career: CareerRoadmap,
  store: RoadmapProgressStore,
): { completed: number; total: number; percent: number } {
  const total = career.stages.reduce(
    (sum, stage) => sum + stage.topics.length,
    0,
  );
  const completed = countCompletedForCareer(store, career.id);
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function stageProgress(
  career: CareerRoadmap,
  stageId: string,
  store: RoadmapProgressStore,
): { completed: number; total: number; percent: number } {
  const stage = career.stages.find((item) => item.id === stageId);
  const total = stage?.topics.length ?? 0;
  const done = completedIds(store, career.id, "topicId");
  const completed =
    stage?.topics.filter((topic) => done.has(topic.id)).length ?? 0;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

function upsert(
  store: RoadmapProgressStore,
  next: RoadmapProgressRecord,
): RoadmapProgressStore {
  const key = (record: RoadmapProgressRecord) =>
    [
      record.careerId,
      record.stageId ?? "",
      record.topicId ?? "",
      record.projectId ?? "",
      record.milestoneId ?? "",
    ].join(":");

  const target = key(next);
  const records = store.records.filter((record) => key(record) !== target);
  if (next.status !== "not_started") {
    records.push(next);
  }
  return { records };
}

export function canCompleteStage(
  career: CareerRoadmap,
  stageId: string,
  store: RoadmapProgressStore,
): boolean {
  const stage = career.stages.find((item) => item.id === stageId);
  if (!stage) {
    return false;
  }
  const doneTopics = completedIds(store, career.id, "topicId");
  const topicsDone = stage.topics.every((topic) => doneTopics.has(topic.id));
  const doneProjects = completedIds(store, career.id, "projectId");
  const projectsDone = stage.projectIds.every((id) => doneProjects.has(id));
  return topicsDone && projectsDone;
}

function syncDerived(
  career: CareerRoadmap,
  store: RoadmapProgressStore,
): RoadmapProgressStore {
  let next = store;
  const now = new Date().toISOString();
  const doneStages = completedIds(next, career.id, "stageId");

  for (const milestone of career.milestones) {
    const complete = milestone.stageIds.every((id) => doneStages.has(id));
    const current = statusOf(next, career.id, "milestoneId", milestone.id);
    if (complete && current !== "completed") {
      next = upsert(next, {
        careerId: career.id,
        milestoneId: milestone.id,
        status: "completed",
        completionDate: now,
      });
    }
    if (!complete && current === "completed") {
      next = upsert(next, {
        careerId: career.id,
        milestoneId: milestone.id,
        status: "not_started",
      });
    }
  }

  return next;
}

export function setPathTopicStatus(
  store: RoadmapProgressStore,
  pathId: string,
  topicId: string,
  status: RoadmapProgressStatus,
): RoadmapProgressStore {
  return upsert(store, {
    careerId: pathId,
    topicId,
    status,
    completionDate: status === "completed" ? new Date().toISOString() : undefined,
  });
}

export function setEntityStatus(
  career: CareerRoadmap,
  store: RoadmapProgressStore,
  entity: {
    stageId?: string;
    topicId?: string;
    projectId?: string;
    milestoneId?: string;
  },
  status: RoadmapProgressStatus,
): RoadmapProgressStore {
  const next = upsert(store, {
    careerId: career.id,
    ...entity,
    status,
    completionDate: status === "completed" ? new Date().toISOString() : undefined,
  });
  return syncDerived(career, next);
}

export function parseRoadmapProgress(raw: string | null): RoadmapProgressStore {
  if (!raw) {
    return emptyRoadmapProgress();
  }
  try {
    const parsed = JSON.parse(raw) as RoadmapProgressStore;
    if (!Array.isArray(parsed.records)) {
      return emptyRoadmapProgress();
    }
    return {
      records: parsed.records.filter(
        (record) =>
          record &&
          typeof record.careerId === "string" &&
          typeof record.status === "string",
      ),
    };
  } catch {
    return emptyRoadmapProgress();
  }
}

export function readRoadmapProgress(
  userId?: string | null,
): RoadmapProgressStore {
  if (typeof window === "undefined") {
    return emptyRoadmapProgress();
  }
  try {
    return parseRoadmapProgress(
      window.localStorage.getItem(roadmapProgressStorageKey(userId)),
    );
  } catch {
    return emptyRoadmapProgress();
  }
}

export function writeRoadmapProgress(
  store: RoadmapProgressStore,
  userId?: string | null,
): void {
  window.localStorage.setItem(
    roadmapProgressStorageKey(userId),
    JSON.stringify(store),
  );
}

function recordKey(record: RoadmapProgressRecord): string {
  return [
    record.careerId,
    record.stageId ?? "",
    record.topicId ?? "",
    record.projectId ?? "",
    record.milestoneId ?? "",
  ].join(":");
}

function statusRank(status: RoadmapProgressStatus): number {
  if (status === "completed") {
    return 2;
  }
  if (status === "in_progress") {
    return 1;
  }
  return 0;
}

export function mergeRoadmapProgress(
  local: RoadmapProgressStore,
  remote: RoadmapProgressStore,
): RoadmapProgressStore {
  const byKey = new Map<string, RoadmapProgressRecord>();
  for (const record of [...remote.records, ...local.records]) {
    const key = recordKey(record);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, record);
      continue;
    }
    const nextRank = statusRank(record.status);
    const prevRank = statusRank(existing.status);
    if (nextRank > prevRank) {
      byKey.set(key, record);
      continue;
    }
    if (
      nextRank === prevRank &&
      (record.completionDate ?? "") > (existing.completionDate ?? "")
    ) {
      byKey.set(key, record);
    }
  }
  return { records: [...byKey.values()] };
}

export function roadmapProgressEquals(
  a: RoadmapProgressStore,
  b: RoadmapProgressStore,
): boolean {
  if (a.records.length !== b.records.length) {
    return false;
  }
  const remote = new Map(b.records.map((record) => [recordKey(record), record]));
  return a.records.every((record) => {
    const other = remote.get(recordKey(record));
    return other?.status === record.status;
  });
}

