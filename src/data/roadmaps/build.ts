import type {
  CareerRoadmap,
  InterviewPrep,
  PracticeItem,
  PracticeKind,
  ProjectLevel,
  RoadmapMilestone,
  RoadmapProject,
  RoadmapStage,
  RoadmapTopic,
  SkillGroups,
  TopicDifficulty,
} from "./types";

export const DEFAULT_TIME_NOTE =
  "Time ranges assume consistent weekly study. Prior knowledge, weekly hours, and whether you already program will move you faster or slower. This is a learning path, not a 30-day job guarantee.";

export function practice(
  kind: PracticeItem["kind"],
  summary: string,
  codingHint?: PracticeItem["codingHint"],
): PracticeItem {
  return { kind, summary, codingHint };
}

export type TopicDraft = Omit<RoadmapTopic, "stageId" | "order"> & {
  order?: number;
};

export function t(
  id: string,
  title: string,
  description: string,
  options?: {
    time?: string;
    difficulty?: TopicDifficulty;
    skills?: string[];
    practice?: string | PracticeItem;
    kind?: PracticeKind;
    criteria?: string[];
    prerequisites?: string[];
    codingHint?: PracticeItem["codingHint"];
  },
): TopicDraft {
  const practiceItem =
    typeof options?.practice === "object"
      ? options.practice
      : practice(
          options?.kind ?? "exercise",
          options?.practice ??
            `Practice ${title.toLowerCase()} until you can do it without copying a tutorial.`,
          options?.codingHint,
        );

  return {
    id,
    title,
    description,
    difficulty: options?.difficulty ?? "Beginner",
    estimatedTime: options?.time ?? "2–4 hours",
    prerequisites: options?.prerequisites ?? [],
    skills: options?.skills ?? [title],
    practice: practiceItem,
    completionCriteria: options?.criteria ?? [
      `Explain ${title.toLowerCase()} in your own words.`,
      `Apply ${title.toLowerCase()} in a small task you design yourself.`,
    ],
  };
}

export function stage(
  order: number,
  id: string,
  title: string,
  description: string,
  whyItMatters: string,
  topics: TopicDraft[],
  options?: {
    estimatedTime?: string;
    prerequisites?: string[];
    practice?: PracticeItem[];
    projectIds?: string[];
    milestoneId?: string;
    completionCriteria?: string[];
  },
): Omit<RoadmapStage, "careerId"> {
  return {
    id,
    order,
    title,
    description,
    whyItMatters,
    estimatedTime: options?.estimatedTime ?? "1–2 weeks",
    prerequisites: options?.prerequisites ?? [],
    topics: topics.map((item, index, list) => ({
      ...item,
      stageId: id,
      order: item.order ?? index + 1,
      prerequisites:
        item.prerequisites.length > 0
          ? item.prerequisites
          : (() => {
              const previous = list[index - 1];
              return previous ? [previous.id] : [];
            })(),
    })),
    practice: options?.practice ?? [
      practice(
        "exercise",
        "Finish the topic exercises in order, then rebuild one of them from memory.",
      ),
    ],
    projectIds: options?.projectIds ?? [],
    milestoneId: options?.milestoneId,
    completionCriteria: options?.completionCriteria ?? [
      "Finish every topic in this stage.",
      "Complete the stage practice without following a tutorial line by line.",
      "Meet the 'you are ready when' criteria before moving on.",
    ],
  };
}

export function project(
  id: string,
  title: string,
  level: ProjectLevel,
  description: string,
  options?: {
    stageId?: string;
    skills?: string[];
    requirements?: string[];
    expectedOutcome?: string;
  },
): Omit<RoadmapProject, "careerId"> {
  return {
    id,
    stageId: options?.stageId,
    title,
    level,
    description,
    skills: options?.skills ?? [],
    requirements: options?.requirements ?? [
      "Build it yourself after studying the related stage.",
      "Keep the work in Git with a clear README that explains the problem, approach, and how to run it.",
    ],
    expectedOutcome:
      options?.expectedOutcome ??
      "A finished project you can demo and explain end to end.",
  };
}

export function milestone(
  order: number,
  id: string,
  title: string,
  description: string,
  stageIds: string[],
  competence: string[],
): Omit<RoadmapMilestone, "careerId"> {
  return {
    id,
    order,
    title,
    description,
    stageIds,
    competence,
  };
}

export function career(
  spec: Omit<CareerRoadmap, "stages" | "projects" | "milestones"> & {
    stages: Array<Omit<RoadmapStage, "careerId">>;
    projects: Array<Omit<RoadmapProject, "careerId">>;
    milestones: Array<Omit<RoadmapMilestone, "careerId">>;
    interviewPrep: InterviewPrep;
    skills: SkillGroups;
  },
): CareerRoadmap {
  const stages = spec.stages.map((item, index, list) => ({
    ...item,
    careerId: spec.id,
    prerequisites:
      item.prerequisites.length > 0
        ? item.prerequisites
        : (() => {
            const previous = list[index - 1];
            return previous ? [previous.id] : [];
          })(),
  }));

  return {
    ...spec,
    timeNote: spec.timeNote || DEFAULT_TIME_NOTE,
    stages,
    projects: spec.projects.map((item) => ({ ...item, careerId: spec.id })),
    milestones: spec.milestones.map((item) => ({
      ...item,
      careerId: spec.id,
    })),
  };
}
