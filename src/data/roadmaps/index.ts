import { validateRoadmaps } from "./validate";
import { aiMlEngineer } from "./careers/aiMl";
import { backendDeveloper } from "./careers/backend";
import { cybersecurityEngineer } from "./careers/cybersecurity";
import { dataAnalyst } from "./careers/dataAnalyst";
import { dataEngineer } from "./careers/dataEngineer";
import { dataScientist } from "./careers/dataScientist";
import { devopsCloudEngineer } from "./careers/devops";
import { frontendDeveloper } from "./careers/frontend";
import { fullstackDeveloper } from "./careers/fullstack";
import { mobileAppDeveloper } from "./careers/mobile";
import { qaEngineer } from "./careers/qa";
import { softwareEngineer } from "./careers/softwareEngineer";
import type { CareerRoadmap, RoadmapStage, RoadmapTopic } from "./types";

export const careers: CareerRoadmap[] = [
  frontendDeveloper,
  backendDeveloper,
  fullstackDeveloper,
  mobileAppDeveloper,
  aiMlEngineer,
  dataScientist,
  dataAnalyst,
  cybersecurityEngineer,
  devopsCloudEngineer,
  dataEngineer,
  softwareEngineer,
  qaEngineer,
];

const validation = validateRoadmaps(careers);

export const roadmapStats = validation.stats;

if (!validation.ok) {
  console.error(
    "Roadmap validation issues:",
    validation.issues
      .map((issue) => `[${issue.careerId ?? "global"}] ${issue.message}`)
      .join("\n"),
  );
}

const bySlug = new Map(careers.map((career) => [career.slug, career]));
const byId = new Map(careers.map((career) => [career.id, career]));

export function listCareers(): CareerRoadmap[] {
  return careers;
}

export function getCareer(slug: string): CareerRoadmap | undefined {
  return bySlug.get(slug) ?? byId.get(slug);
}

export function getStage(
  career: CareerRoadmap,
  stageId: string,
): RoadmapStage | undefined {
  return career.stages.find((stage) => stage.id === stageId);
}

export function getTopic(
  career: CareerRoadmap,
  topicId: string,
): { stage: RoadmapStage; topic: RoadmapTopic } | undefined {
  for (const stage of career.stages) {
    const topic = stage.topics.find((item) => item.id === topicId);
    if (topic) {
      return { stage, topic };
    }
  }
  return undefined;
}

export function getStageByParam(
  career: CareerRoadmap,
  stageParam: string,
): RoadmapStage | undefined {
  return (
    getStage(career, stageParam) ??
    career.stages.find((stage) => String(stage.order) === stageParam)
  );
}

export function topicCount(career: CareerRoadmap): number {
  return career.stages.reduce((sum, stage) => sum + stage.topics.length, 0);
}

export type CareerSummary = {
  id: string;
  slug: string;
  title: string;
  category: CareerRoadmap["category"];
  icon: CareerRoadmap["icon"];
  shortDescription: string;
  difficulty: CareerRoadmap["difficulty"];
  estimatedTime: string;
  coreSkills: string[];
  tools: string[];
  stageCount: number;
  topicCount: number;
};

export function toCareerSummary(career: CareerRoadmap): CareerSummary {
  return {
    id: career.id,
    slug: career.slug,
    title: career.title,
    category: career.category,
    icon: career.icon,
    shortDescription: career.shortDescription,
    difficulty: career.difficulty,
    estimatedTime: career.estimatedTime,
    coreSkills: career.skills.core,
    tools: career.tools,
    stageCount: career.stages.length,
    topicCount: topicCount(career),
  };
}

export function listCareerSummaries(): CareerSummary[] {
  return careers.map(toCareerSummary);
}

export function projectsForStage(career: CareerRoadmap, stageId: string) {
  return career.projects.filter(
    (project) =>
      project.stageId === stageId ||
      career.stages
        .find((stage) => stage.id === stageId)
        ?.projectIds.includes(project.id),
  );
}

export type {
  CareerRoadmap,
  RoadmapStage,
  RoadmapTopic,
  RoadmapProject,
  RoadmapMilestone,
  StageUnlockState,
} from "./types";
