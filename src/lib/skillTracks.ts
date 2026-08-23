import { getTopic } from "@/data/coding";
import type { LearningPathId } from "@/data/paths";
import type { PracticeItem, RoadmapStage } from "@/data/roadmaps/types";

export function skillTrackForStage(
  stage: Pick<RoadmapStage, "id" | "title">,
): LearningPathId | null {
  const id = stage.id.toLowerCase();
  const title = stage.title.toLowerCase();
  if (
    title.includes("programming fundamental") ||
    /(^|-)pf($|-)/.test(id)
  ) {
    return "pf";
  }
  if (
    title.includes("object-oriented") ||
    /(^|-)oop($|-)/.test(id) ||
    title.includes(" oop")
  ) {
    return "oop";
  }
  if (
    title.includes("data structure") ||
    /(^|-)dsa($|-)/.test(id) ||
    title.includes("complexity")
  ) {
    return "dsa";
  }
  return null;
}

export function skillTrackHref(track: LearningPathId): string {
  return `/roadmaps/${track}`;
}

export function codingHrefFromHint(
  hint?: PracticeItem["codingHint"],
): string | null {
  if (!hint?.track) {
    return null;
  }
  if (hint.topic && getTopic(hint.track, hint.topic)) {
    return `/coding/${hint.track}/${hint.topic}`;
  }
  return `/coding/${hint.track}`;
}

export function skillTrackLabel(track: LearningPathId): string {
  if (track === "pf") {
    return "Programming Fundamentals";
  }
  if (track === "oop") {
    return "Object-Oriented Programming";
  }
  return "Data Structures & Algorithms";
}
