import { dsaTrack } from "./dsa";
import { oopTrack } from "./oop";
import { pfTrack } from "./pf";
import type { CodingProblem, CodingTopic, CodingTrack, CodingTrackId } from "./types";

export const codingTracks: CodingTrack[] = [pfTrack, oopTrack, dsaTrack];

export function getTrack(id: string): CodingTrack | undefined {
  return codingTracks.find((track) => track.id === id);
}

export function isTrackId(value: string): value is CodingTrackId {
  return value === "pf" || value === "oop" || value === "dsa";
}

export function getTopic(
  trackId: string,
  topicSlug: string,
): { track: CodingTrack; topic: CodingTopic } | undefined {
  const track = getTrack(trackId);
  if (!track) {
    return undefined;
  }
  const topic = track.topics.find((item) => item.slug === topicSlug);
  if (!topic) {
    return undefined;
  }
  return { track, topic };
}

export function getCodingProblem(
  trackId: string,
  topicSlug: string,
  problemSlug: string,
):
  | {
      track: CodingTrack;
      topic: CodingTopic;
      problem: CodingProblem;
    }
  | undefined {
  const found = getTopic(trackId, topicSlug);
  if (!found) {
    return undefined;
  }
  const problem = found.topic.problems.find((item) => item.slug === problemSlug);
  if (!problem) {
    return undefined;
  }
  return { ...found, problem };
}

export function parseProblemProgressId(id: string): {
  trackId: string;
  topicSlug: string;
  problemSlug: string;
} | null {
  const parts = id.split("/");
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    return null;
  }
  return {
    trackId: parts[0],
    topicSlug: parts[1],
    problemSlug: parts[2],
  };
}

export function getCodingProblemByProgressId(id: string) {
  const parsed = parseProblemProgressId(id);
  if (!parsed) {
    return undefined;
  }
  return getCodingProblem(parsed.trackId, parsed.topicSlug, parsed.problemSlug);
}

export { pfTrack, oopTrack, dsaTrack };
export type {
  CodingLanguage,
  CodingProblem,
  CodingTopic,
  CodingTrack,
  CodingTrackId,
} from "./types";
export { CODING_LANGUAGES } from "./types";
